// @ts-check
// Docusaurus 配置。日常改动请去 site.config.js，这个文件一般不用动。

const site = require('./site.config');

const docKbs = site.knowledgeBases.filter((kb) => kb.type !== 'feed');
const feedKb = site.knowledgeBases.find((kb) => kb.type === 'feed');

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
  ],

  themes: [
    [
      '@docusaurus/theme-classic',
      {
        // motion.css 是全站微动效，想关掉时删掉下面这一行即可
        customCss: ['./src/css/custom.css', './src/css/motion.css'],
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
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
          ...site.knowledgeBases.map((kb) => ({
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
          `<span class="footer-brand">${site.siteName}</span>` +
          `<a class="footer-icon" href="/about" aria-label="关于" title="关于">${aboutIcon}</a>` +
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
