/* eslint-disable */
// IndexNow：部署前算出这次改动过的网址，写成 .generated/indexnow.json，部署完成后由 GitHub Actions 推给 IndexNow。
// 用法：node scripts/indexnow.js <上一次部署的 commit>
// 能拿到上一次的 commit 时只推改动过的文章和它所在的列表页；拿不到（手动触发、首次部署）时推全站。
// 你不需要改这个文件，也不需要手动运行。

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const config = require('../site.config');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, '.generated', 'indexnow.json');

if (!config.indexNowKey) {
  console.log('[indexnow] 没有配置 indexNowKey，跳过');
  process.exit(0);
}

const urlMap = JSON.parse(fs.readFileSync(path.join(ROOT, '.generated', 'data', 'url-map.json'), 'utf8'));
const visibleKbs = config.knowledgeBases.filter((kb) => !kb.hidden);
const allUrls = ['/', '/about', ...visibleKbs.map((kb) => `/${kb.id}`), ...Object.values(urlMap)];

function changedFiles(before) {
  if (!before || /^0+$/.test(before)) return null;
  try {
    execSync(`git cat-file -e ${before}^{commit}`, { cwd: ROOT, stdio: 'ignore' });
    return execSync(`git -c core.quotepath=false diff --name-only ${before} HEAD -- content`, { cwd: ROOT })
      .toString()
      .split('\n')
      .filter(Boolean);
  } catch (e) {
    return null;
  }
}

const changed = changedFiles(process.argv[2]);
let urls;
if (changed == null) {
  urls = allUrls;
} else {
  const set = new Set();
  for (const file of changed) {
    if (file === `content/${config.aboutFile}`) set.add('/about');
    const kb = visibleKbs.find((k) => file.startsWith(`content/${k.folder}/`));
    if (!kb) continue;
    set.add(`/${kb.id}`);
    set.add('/');
    if (urlMap[file]) set.add(urlMap[file]);
  }
  urls = [...set];
}

if (urls.length === 0) {
  console.log('[indexnow] 没有改动的网址');
  process.exit(0);
}

const host = new URL(config.url).host;
fs.writeFileSync(
  OUT,
  JSON.stringify({
    host,
    key: config.indexNowKey,
    keyLocation: `${config.url}/${config.indexNowKey}.txt`,
    urlList: urls.map((u) => config.url + u),
  })
);
console.log(`[indexnow] 待推送 ${urls.length} 个网址`);
