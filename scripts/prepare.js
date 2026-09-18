/* eslint-disable */
// 构建前处理脚本：读取 content 目录，生成 Docusaurus 需要的文件。
// 你不需要改这个文件。

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');
const { pinyin } = require('pinyin-pro');
const MarkdownIt = require('markdown-it');
const config = require('../site.config');

const ROOT = path.resolve(__dirname, '..');
const CONTENT = path.join(ROOT, 'content');
const GEN = path.join(ROOT, '.generated');
const md = new MarkdownIt({ html: true, linkify: true, breaks: true });

// ---------- 工具 ----------

function rmrf(p) {
  fs.rmSync(p, { recursive: true, force: true });
}
function mkdirp(p) {
  fs.mkdirSync(p, { recursive: true });
}
function isDir(p) {
  return fs.existsSync(p) && fs.statSync(p).isDirectory();
}
function listDir(p) {
  return fs.readdirSync(p).filter((n) => !n.startsWith('.') && !n.startsWith('_'));
}

// 文件名解析：可选日期前缀、可选序号前缀、末尾可选星星
function parseName(name) {
  let base = name.replace(/\.md$/i, '').trim();
  let date = null;
  let order = null;
  let m = base.match(/^(\d{4}-\d{2}-\d{2})[\s._-]*/);
  if (m) {
    date = m[1];
    base = base.slice(m[0].length);
  }
  m = base.match(/^(\d+)[.\s_-]+/);
  if (m) {
    order = parseInt(m[1], 10);
    base = base.slice(m[0].length);
  }
  let stars = null;
  m = base.match(/\s*([★☆]+)\s*$/);
  if (m) {
    stars = (m[1].match(/★/g) || []).length;
    base = base.slice(0, m.index);
  }
  return { title: base.trim(), date, order, stars };
}

// 文件第一次提交到 Git 的日期，没有提交记录时用文件修改时间
function gitDate(file) {
  try {
    const out = execSync(
      `git log --diff-filter=A --follow --format=%aI -- "${file.replace(/"/g, '\\"')}"`,
      { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }
    )
      .toString()
      .trim()
      .split('\n')
      .filter(Boolean);
    if (out.length) return out[out.length - 1].slice(0, 10);
  } catch (e) {}
  return fs.statSync(file).mtime.toISOString().slice(0, 10);
}

function toSlug(text) {
  const py = pinyin(text, { toneType: 'none', type: 'array', nonZh: 'consecutive' });
  return py
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

// 读取正文：去掉开头的 H1、抽出 date 覆盖行、处理 Bear 语法、丢弃本地图片
function readBody(file) {
  let text = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  let dateOverride = null;
  let frontMatter = {};

  // 标准 front matter
  const fm = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (fm) {
    fm[1].split('\n').forEach((line) => {
      const kv = line.match(/^([\w-]+):\s*(.*)$/);
      if (kv) frontMatter[kv[1]] = kv[2].trim().replace(/^['"]|['"]$/g, '');
    });
    text = text.slice(fm[0].length);
  }
  if (frontMatter.date && /^\d{4}-\d{2}-\d{2}/.test(frontMatter.date)) {
    dateOverride = frontMatter.date.slice(0, 10);
  }

  // 前几行里的「date: 2025-07-27」也算覆盖
  const lines = text.split('\n');
  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    const m = lines[i].match(/^\s*date:\s*(\d{4}-\d{2}-\d{2})\s*$/i);
    if (m) {
      dateOverride = m[1];
      lines.splice(i, 1);
      break;
    }
  }
  text = lines.join('\n');

  // 去掉第一个 H1
  text = text.replace(/^\s*#\s[^\n]*\n?/, '');

  // Bear 导出链接预览时会在链接两侧带上单个波浪号，去掉
  text = text.replace(/~(\[[^\]]*\]\([^)]*\))~/g, '$1');

  // Bear 高亮
  text = text.replace(/==([^\n=]+?)==/g, '<mark>$1</mark>');

  // 丢弃非 http 图片
  text = text.replace(/!\[[^\]]*\]\((?!https?:\/\/)[^)]*\)/g, '');
  text = text.replace(/<img\b[^>]*\bsrc=["'](?!https?:\/\/)[^"']*["'][^>]*>/gi, '');

  text = hardBreaks(text.replace(/\n{3,}/g, '\n\n').trim());
  return { body: text, dateOverride, frontMatter };
}

// Bear 里单个回车就是换行，标准 Markdown 会把它合并成一行，这里补成硬换行
function hardBreaks(text) {
  const lines = text.split('\n');
  let inFence = false;
  const isBlockStart = (l) =>
    /^\s*(#{1,6}\s|[-*+]\s|\d+[.)]\s|>|\||```|~~~|---|\*\*\*|<)/.test(l);
  return lines
    .map((line, i) => {
      if (/^\s*(```|~~~)/.test(line)) {
        inFence = !inFence;
        return line;
      }
      if (inFence) return line;
      const next = lines[i + 1];
      // 引用内部相邻的两行（都以 > 开头）也补硬换行，否则会被合并成一段
      if (/^\s*>/.test(line) && next !== undefined && /^\s*>\s*\S/.test(next) && !/( {2,}|\\)$/.test(line)) {
        return line + '  ';
      }
      if (
        line.trim() &&
        next !== undefined &&
        next.trim() &&
        !isBlockStart(next) &&
        !/^\s*(#{1,6}\s|\||---|\*\*\*|<)/.test(line) &&
        !/( {2,}|\\)$/.test(line)
      ) {
        return line + '  ';
      }
      return line;
    })
    .join('\n');
}

function firstCover(body) {
  const m = body.match(/!\[[^\]]*\]\((https?:\/\/[^)\s]+)/);
  if (m) return m[1];
  const h = body.match(/<img\b[^>]*\bsrc=["'](https?:\/\/[^"']+)["']/i);
  return h ? h[1] : null;
}

function plainText(mdText) {
  return mdText
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/^\s*#{1,6}\s+.*$/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__|~~|~|`)/g, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+[.、]\s+/gm, '');
}

function paragraphs(body) {
  return plainText(body)
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter((p) => p.length > 0);
}

// 搜索引擎和 RSS 用的摘要：第一段，超过 limit 截断
function excerpt(body, limit) {
  const first = paragraphs(body)[0] || '';
  return first.length > limit ? first.slice(0, limit) + '…' : first;
}

// 列表页用的简介：固定占两行，第一段不够两行（按每行约 45 字算）就接上后面的段落，段落之间用制表符隔开
// 页面上超出两行的部分由 CSS 裁掉
const LIST_EXCERPT_CHARS = 90;
function listExcerpt(body) {
  const paras = paragraphs(body);
  const parts = [];
  let len = 0;
  for (const p of paras) {
    parts.push(p);
    len += p.length;
    if (len >= LIST_EXCERPT_CHARS) break;
  }
  return parts.join('\t');
}

function yaml(v) {
  return JSON.stringify(String(v));
}

// ---------- 主流程 ----------

rmrf(GEN);
mkdirp(path.join(GEN, 'docs'));
mkdirp(path.join(GEN, 'data'));
mkdirp(path.join(GEN, 'pages'));

const posts = [];
const thoughts = [];
const usedUrls = new Set();

for (const kb of config.knowledgeBases) {
  const kbDir = path.join(CONTENT, kb.folder);
  if (!isDir(kbDir)) {
    console.warn(`[prepare] 找不到知识库文件夹：content/${kb.folder}`);
    continue;
  }

  if (kb.type === 'feed') {
    walk(kbDir, (file) => {
      const info = parseName(path.basename(file));
      const { body, dateOverride } = readBody(file);
      const date = dateOverride || info.date || gitDate(file);
      thoughts.push({
        id: toSlug(path.basename(file, '.md')),
        date,
        time: '23:59:59',
        html: md.render(body),
        text: plainText(body).replace(/\s+/g, ' ').trim(),
      });
    });
    walkHtml(kbDir, (file) => {
      for (const memo of parseFlomo(fs.readFileSync(file, 'utf8'))) thoughts.push(memo);
    });
    continue;
  }

  const outDir = path.join(GEN, 'docs', kb.id);
  mkdirp(outDir);
  processFolder(kbDir, outDir, kb, null);
}

// flomo 导出的 html：每条笔记是一个 .memo，里面有时间、正文、附件。
// 正文里的 #标签 全部去掉，只保留段落、列表、加粗、斜体、链接，图片沿用全站规则只保留 http 开头的。
function parseFlomo(html) {
  const memos = [];
  const parts = html.split('<div class="memo">').slice(1);
  for (const part of parts) {
    const t = part.match(/<div class="time">\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s*<\/div>/);
    const c = part.match(/<div class="content">([\s\S]*?)<\/div>\s*<div class="files">([\s\S]*?)<\/div>\s*<\/div>/);
    if (!t || !c) continue;
    const [, date, time] = t;
    let body = c[1] + c[2];
    // 去掉标签
    body = body.replace(/#[^\s<#]+/g, '');
    // 只保留允许的标签：p ul ol li br strong b em i a img
    body = body.replace(/<(\/?)(\w+)([^>]*)>/g, (m, close, tag, attrs) => {
      tag = tag.toLowerCase();
      if (['p', 'ul', 'ol', 'li', 'br', 'strong', 'b', 'em', 'i'].includes(tag)) return `<${close}${tag}>`;
      if (tag === 'a') {
        if (close) return '</a>';
        const href = attrs.match(/href="([^"]*)"/);
        return href ? `<a href="${href[1]}" target="_blank" rel="noopener">` : '<a>';
      }
      if (tag === 'img') {
        const src = attrs.match(/src="([^"]*)"/);
        return src && /^https?:\/\//.test(src[1]) ? `<img src="${src[1]}" alt="">` : '';
      }
      return '';
    });
    // flomo 里每行是一个 <p>，空 <p> 才是段落间隔；和 Bear 的规则对齐：相邻的行合成一段用 <br> 换行，空行分段
    body = body.replace(/<p>\s*<\/p>/g, '<!--sep-->');
    body = body.replace(/<\/p>\s*<p>/g, '<br>');
    body = body.replace(/<!--sep-->/g, '');
    // 去掉开头因为删标签而空出来的内容
    body = body.replace(/^\s*(<p>\s*(<br>\s*)*<\/p>\s*|<br>\s*)+/, '').replace(/<p>\s*(<br>\s*)+/g, '<p>').trim();
    const text = body
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
    if (!text && !/<img/.test(body)) continue;
    memos.push({ id: `${date}-${time.replace(/:/g, '')}`, date, time, html: body, text });
  }
  return memos;
}

function walkHtml(dir, fn) {
  for (const name of listDir(dir)) {
    const p = path.join(dir, name);
    if (isDir(p)) walkHtml(p, fn);
    else if (/\.html?$/i.test(name)) fn(p);
  }
}

function walk(dir, fn) {
  for (const name of listDir(dir)) {
    const p = path.join(dir, name);
    if (isDir(p)) walk(p, fn);
    else if (/\.md$/i.test(name)) fn(p);
  }
}

function folderPosition(name) {
  if (/^\d{4}$/.test(name)) {
    const y = parseInt(name, 10);
    return config.sidebarYearOrder === 'asc' ? y : 100000 - y;
  }
  const m = name.match(/^(\d+)/);
  return m ? parseInt(m[1], 10) : 99999;
}

function processFolder(srcDir, outDir, kb, year) {
  for (const name of listDir(srcDir)) {
    const p = path.join(srcDir, name);
    if (isDir(p)) {
      const info = parseName(name);
      const sub = path.join(outDir, name);
      mkdirp(sub);
      fs.writeFileSync(
        path.join(sub, '_category_.json'),
        JSON.stringify({ label: info.title, position: folderPosition(name), collapsed: true }, null, 2)
      );
      processFolder(p, sub, kb, /^\d{4}$/.test(name) ? name : year);
    } else if (/\.md$/i.test(name)) {
      processDoc(p, outDir, kb, year);
    }
  }
}

function processDoc(file, outDir, kb, year) {
  const info = parseName(path.basename(file));
  const { body, dateOverride } = readBody(file);
  const date = dateOverride || info.date || gitDate(file);
  const slug = `${date}-${toSlug(info.title)}`;
  const url = `/${kb.id}/${slug}`;
  if (usedUrls.has(url)) {
    throw new Error(`[prepare] 两篇文章生成了相同的链接：${url}\n请修改其中一篇的标题或日期。\n文件：${file}`);
  }
  usedUrls.add(url);

  const desc = excerpt(body, 120);
  const fm = [
    '---',
    `title: ${yaml(info.title)}`,
    `sidebar_label: ${yaml(info.title)}`,
    `sidebar_position: ${info.order == null ? 99999 : info.order}`,
    `slug: ${yaml('/' + slug)}`,
    `description: ${yaml(desc)}`,
    `date: ${date}`,
    'hide_title: false',
    // 不显示左侧目录树的知识库，也不显示上一篇下一篇
    ...(kb.sidebar === false ? ['pagination_prev: null', 'pagination_next: null'] : []),
    // 私密分区不让搜索引擎收录，src/theme/DocItem/Metadata 据此输出 noindex
    ...(kb.hidden ? ['noindex: true'] : []),
    '---',
    '',
  ].join('\n');

  // 正文以封面图开头时，标题放在封面图之后（Docusaurus 识别到正文里的一级标题后就不再另外渲染顶部标题）
  let docBody = body;
  const coverLine = body.match(/^(!\[[^\]]*\]\(https?:\/\/[^)]*\)|<img\b[^>]*>)\s*\n/);
  if (coverLine) {
    docBody = coverLine[0].trimEnd() + '\n\n# ' + info.title.replace(/#/g, '') + '\n\n' + body.slice(coverLine[0].length);
  }

  const outName = path.basename(file).replace(/[★☆]/g, '').replace(/\s+\.md$/, '.md');
  const outFile = path.join(outDir, outName);
  fs.writeFileSync(outFile, fm + docBody + '\n');

  posts.push({
    outFile,
    kb: kb.id,
    kbLabel: kb.label,
    title: info.title,
    stars: info.stars,
    order: info.order == null ? 0 : info.order,
    date,
    year: year || date.slice(0, 4),
    url,
    excerpt: listExcerpt(body),
    desc,
    cover: firstCover(body),
  });
}

// ---------- 封面图本地化 ----------
// 读书网格的封面原图通常是几 MB 的大截图，页面上只显示 160 px 宽。
// 这里在构建时把封面下载下来，裁出网格里实际可见的区域（按 coverRatio 和 coverZoom），缩到 480 px 宽，
// 转成 WebP 存到 static/covers，页面改用本地小图。文件按链接哈希命名，已存在的不再重复处理，处理结果随仓库提交。
// 想重新处理某张图，删掉 static/covers 里对应的文件再构建即可。下载或处理失败时保持原链接。
const COVERS_DIR = path.join(ROOT, 'static', 'covers');
const COVER_WIDTH = 480;

async function localizeCovers() {
  const gridKbs = new Set(config.knowledgeBases.filter((kb) => kb.type === 'grid').map((kb) => kb.id));
  const targets = posts.filter((p) => gridKbs.has(p.kb) && p.cover && /^https?:\/\//.test(p.cover));
  if (targets.length === 0) return;
  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.warn('[prepare] 没有安装 sharp，封面图保持原链接');
    return;
  }
  mkdirp(COVERS_DIR);
  const [rw, rh] = String(config.coverRatio || '3 / 4').split('/').map((n) => parseFloat(n));
  const ratio = rw / rh;
  const zoom = config.coverZoom || 1;

  for (const p of targets) {
    const hash = crypto.createHash('md5').update(p.cover).digest('hex').slice(0, 12);
    const file = path.join(COVERS_DIR, `${hash}.webp`);
    if (!fs.existsSync(file)) {
      try {
        const res = await fetch(p.cover);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());
        const { width: W, height: H } = await sharp(buf).metadata();
        // 网格里可见的区域：源图内最大的 coverRatio 框，再按 coverZoom 缩小，居中
        const cw = Math.round(Math.min(W, H * ratio) / zoom);
        const ch = Math.round(cw / ratio);
        const left = Math.round((W - cw) / 2);
        const top = Math.round((H - ch) / 2);
        await sharp(buf)
          .extract({ left, top, width: cw, height: ch })
          .resize({ width: COVER_WIDTH })
          .webp({ quality: 80 })
          .toFile(file);
        console.log(`[prepare] 封面已处理：${p.title} → covers/${hash}.webp`);
      } catch (e) {
        console.warn(`[prepare] 封面处理失败，保持原链接：${p.title}（${e.message}）`);
        continue;
      }
    }
    p.cover = `/covers/${hash}.webp`;
  }
}

async function finish() {
// 封面处理完后，把封面写进文章的 image 字段，作为分享卡片（og:image）
for (const p of posts) {
  if (p.cover) {
    const text = fs.readFileSync(p.outFile, 'utf8');
    const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (m) fs.writeFileSync(p.outFile, `---\n${m[1]}\nimage: ${yaml(p.cover)}\n---\n${m[2]}`);
  }
  delete p.outFile;
}

// ---------- 排序与输出 ----------

function byDateDesc(a, b) {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return b.order - a.order;
}
posts.sort(byDateDesc);
// 按日期加时间倒序；md 想法只有日期，视作当天最晚
thoughts.sort((a, b) => {
  const ka = `${a.date} ${a.time || '23:59:59'}`;
  const kb = `${b.date} ${b.time || '23:59:59'}`;
  return ka < kb ? 1 : ka > kb ? -1 : 0;
});

fs.writeFileSync(path.join(GEN, 'data', 'posts.json'), JSON.stringify(posts, null, 2));
fs.writeFileSync(path.join(GEN, 'data', 'thoughts.json'), JSON.stringify(thoughts, null, 2));

// 关于页
const aboutSrc = path.join(CONTENT, config.aboutFile);
if (fs.existsSync(aboutSrc)) {
  const { body } = readBody(aboutSrc);
  fs.writeFileSync(
    path.join(GEN, 'pages', 'about.md'),
    `---\ntitle: 关于\nhide_table_of_contents: true\nwrapperClassName: about-page\n---\n\n${body}\n`
  );
}

// RSS
const rssItems = [];
for (const p of posts) {
  if (config.rssIncludes.includes(p.kb)) {
    rssItems.push({ title: p.title, url: config.url + p.url, date: p.date, desc: p.desc });
  }
}
if (config.rssIncludes.includes('thoughts')) {
  for (const t of thoughts) {
    rssItems.push({
      title: `${t.date} ${config.thoughtTitleSuffix}`,
      url: `${config.url}/thoughts#${t.id}`,
      date: t.date,
      desc: t.text.slice(0, 200),
    });
  }
}
rssItems.sort((a, b) => (a.date < b.date ? 1 : -1));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const rss = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
  '<channel>',
  `<title>${esc(config.siteName)}</title>`,
  `<link>${esc(config.url)}</link>`,
  `<description>${esc(config.siteDescription)}</description>`,
  '<language>zh-cn</language>',
  `<atom:link href="${esc(config.url)}/rss.xml" rel="self" type="application/rss+xml" />`,
  ...rssItems.map(
    (i) =>
      `<item><title>${esc(i.title)}</title><link>${esc(i.url)}</link><guid>${esc(i.url)}</guid>` +
      `<pubDate>${new Date(i.date + 'T00:00:00Z').toUTCString()}</pubDate>` +
      `<description>${esc(i.desc)}</description></item>`
  ),
  '</channel>',
  '</rss>',
  '',
].join('\n');
mkdirp(path.join(ROOT, 'static'));
fs.writeFileSync(path.join(ROOT, 'static', 'rss.xml'), rss);

// robots.txt：全部放行（包括 AI 爬虫），私密分区除外，并指明 sitemap
const hiddenKbs = config.knowledgeBases.filter((kb) => kb.hidden);
const robots = [
  'User-agent: *',
  'Allow: /',
  ...hiddenKbs.map((kb) => `Disallow: /${kb.id}/`),
  '',
  `Sitemap: ${config.url}/sitemap.xml`,
  '',
].join('\n');
fs.writeFileSync(path.join(ROOT, 'static', 'robots.txt'), robots);

// llms.txt：给 AI 搜索引擎读的站点索引，纯文本，不含私密分区
const visibleKbs = config.knowledgeBases.filter((kb) => !kb.hidden);
const llms = [
  `# ${config.siteName}`,
  '',
  `> ${config.siteDescription}`,
  '',
  `个人博客，内容分为${visibleKbs.map((kb) => kb.label).join('、')}。语言：简体中文。`,
  '',
  `- 关于作者：${config.url}/about`,
  `- RSS 订阅：${config.url}/rss.xml`,
  '',
  ...visibleKbs.flatMap((kb) => {
    if (kb.type === 'feed') {
      return [`## ${kb.label}`, '', `- 短想法的时间流：${config.url}/${kb.id}`, ''];
    }
    const items = posts.filter((p) => p.kb === kb.id);
    return [
      `## ${kb.label}`,
      '',
      `列表：${config.url}/${kb.id}`,
      '',
      ...items.map((p) => `- [${p.title}](${config.url}${p.url})${p.desc ? `：${p.desc}` : ''}`),
      '',
    ];
  }),
].join('\n');
fs.writeFileSync(path.join(ROOT, 'static', 'llms.txt'), llms);

console.log(`[prepare] 文章 ${posts.length} 篇，想法 ${thoughts.length} 条，RSS ${rssItems.length} 条`);
}

localizeCovers().then(finish).catch((e) => {
  console.error(e);
  process.exit(1);
});
