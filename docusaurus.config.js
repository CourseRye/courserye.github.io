// @ts-check
// Docusaurus 配置。日常改动请去 site.config.js，这个文件一般不用动。

const fs = require('fs');
const path = require('path');
const site = require('./site.config');

// 文件夹里一篇 .md 都没有的知识库会让 Docusaurus 报错，这里直接跳过
function hasDocs(dir) {
  if (!fs.existsSync(dir)) return false;
  return fs.readdirSync(dir, { withFileTypes: true }).some((e) => {
    if (e.name.startsWith('.') || e.name.startsWith('_')) return false;
    return e.isDirectory() ? hasDocs(path.join(dir, e.name)) : /\.md$/i.test(e.name);
  });
}

const docKbs = site.knowledgeBases.filter(
  (kb) => kb.type !== 'feed' && hasDocs(path.join(__dirname, '.generated', 'docs', kb.id))
);
const feedKb = site.knowledgeBases.find((kb) => kb.type === 'feed');
// 顶部导航栏：跳过 hidden 的知识库和没有文章的知识库
const navKbs = site.knowledgeBases.filter(
  (kb) => !kb.hidden && (kb.type === 'feed' || docKbs.includes(kb))
);

// 页脚图标：线条风格，与导航栏文字同色，hover 变红
const svgAttrs =
  'viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
const aboutIcon =
  `<svg ${svgAttrs}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
const rssIcon =
  `<svg ${svgAttrs}><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>`;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: site.siteName,
  tagline: site.siteDescription,
  favicon: 'img/favicon.png',

  url: site.url,
  baseUrl: '/',
  trailingSlash: false,

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  markdown: {
    format: 'detect',
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  future: {
    v4: true,
    faster: true,
  },

  // 滚动后给导航栏加阴影；切换页面时直接跳到顶部而不是平滑滚动
  clientModules: ['./src/client/navbar-shadow.js', './src/client/instant-route-scroll.js'],

  plugins: [
    ...docKbs.map((kb) => [
      '@docusaurus/plugin-content-docs',
      {
        id: kb.id,
        path: `.generated/docs/${kb.id}`,
        routeBasePath: kb.id,
        // sidebar 为 false 的知识库不生成左侧目录树，文章底部也没有上一篇下一篇
        sidebarPath: kb.sidebar === false ? false : './sidebars.js',
        numberPrefixParser: false,
        breadcrumbs: false,
        showLastUpdateTime: false,
        sidebarCollapsible: true,
        sidebarCollapsed: true,
      },
    ]),
    ['@docusaurus/plugin-content-pages', { path: '.generated/pages' }],
    './plugins/site-data',
    ...(site.googleAnalyticsId
      ? [['@docusaurus/plugin-google-gtag', { trackingID: site.googleAnalyticsId, anonymizeIP: true }]]
      : []),
    // sitemap.xml：hidden 的知识库不收录
    [
      '@docusaurus/plugin-sitemap',
      {
        ignorePatterns: site.knowledgeBases.filter((kb) => kb.hidden).map((kb) => `/${kb.id}/**`),
        changefreq: 'weekly',
        priority: 0.5,
      },
    ],
  ],

  // RSS 自动发现：阅读器粘贴网址就能找到订阅源
  headTags: [
    {
      tagName: 'link',
      attributes: { rel: 'alternate', type: 'application/rss+xml', title: site.siteName, href: '/rss.xml' },
    },
  ],

  themes: [
    [
      '@docusaurus/theme-classic',
      {
        // motion.css 是全站微动效，想关掉时删掉下面这一行即可
        customCss: [
          // 引用用的霞鹜文楷，按字符区间切片，页面只下载用到的部分
          require.resolve('lxgw-wenkai-lite-webfont/lxgwwenkailite-regular.css'),
          './src/css/custom.css',
          './src/css/motion.css',
        ],
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // 默认社交分享卡片（og:image），源文件在 scripts/assets/social-card.html
      image: 'img/social-card.png',
      colorMode: {
        defaultMode: 'light',
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
      docs: {
        sidebar: {
          hideable: false,
          autoCollapseCategories: false,
        },
      },
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 4,
      },
      navbar: {
        title: site.siteName,
        hideOnScroll: false,
        logo: {
          alt: site.siteName,
          src: 'img/logo.png',
        },
        items: [
          { to: '/', label: '首页', position: 'left', activeBaseRegex: '^/(page/\\d+)?$' },
          ...navKbs.map((kb) => ({
            to: `/${kb.id}`,
            label: kb.label,
            position: 'left',
            activeBaseRegex: `^/${kb.id}(/|$)`,
          })),
        ],
      },
      footer: {
        style: 'light',
        copyright:
          `<span class="footer-brand">© ${site.siteName}</span>` +
          '<span class="footer-tab">\t</span>' +
          `<a class="footer-icon" href="/about" aria-label="关于" title="关于">${aboutIcon}</a>` +
          '<span class="footer-tab">\t</span>' +
          `<a class="footer-icon" href="/rss.xml" target="_blank" rel="noopener" aria-label="RSS" title="RSS">${rssIcon}</a>`,
      },
      prism: {
        theme: require('prism-react-renderer').themes.github,
        additionalLanguages: ['bash', 'json'],
      },
    }),

  customFields: {
    site,
    feedId: feedKb ? feedKb.id : 'thoughts',
  },
};

module.exports = config;
