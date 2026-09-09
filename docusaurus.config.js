// @ts-check
// Docusaurus 配置。日常改动请去 site.config.js，这个文件一般不用动。

const site = require('./site.config');

const docKbs = site.knowledgeBases.filter((kb) => kb.type !== 'feed');
const feedKb = site.knowledgeBases.find((kb) => kb.type === 'feed');

const rssIcon =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">' +
  '<path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20 5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z"/></svg>';

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
        sidebarPath: './sidebars.js',
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
    ['@docusaurus/theme-classic', { customCss: './src/css/custom.css' }],
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['zh', 'en'],
        docsRouteBasePath: docKbs.map((kb) => kb.id),
        docsDir: docKbs.map((kb) => `.generated/docs/${kb.id}`),
        indexBlog: false,
        indexPages: true,
        highlightSearchTermsOnTargetPage: false,
        searchResultLimits: 10,
        searchBarShortcutHint: false,
        explicitSearchResultPath: true,
        docsPluginIdForPreferredVersion: docKbs[0].id,
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
          { to: '/about', label: '关于', position: 'left' },
          {
            type: 'html',
            position: 'right',
            value: `<a class="navbar-rss" href="/rss.xml" target="_blank" rel="noopener" aria-label="RSS" title="RSS">${rssIcon}</a>`,
          },
        ],
      },
      footer: {
        style: 'light',
        copyright: `© ${new Date().getFullYear()} ${site.siteName}`,
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
