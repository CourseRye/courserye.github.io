// ============================================================
// 网站配置
// 这个文件是给你改的，改完提交即可，不需要碰其他代码文件。
// ============================================================

module.exports = {
  // 网站名称，显示在导航栏和浏览器标签页
  siteName: '简单讲讲',

  // 网站描述，用于 RSS 和搜索引擎
  siteDescription: '简单讲讲，说点简单的。',

  // 网站地址，GitHub Pages 的地址
  url: 'https://courserye.github.io',

  // Google Analytics 的衡量 ID，形如 G-XXXXXXXXXX，留空表示不启用
  googleAnalyticsId: '',

  // 每页显示多少条，首页、列表页、想法页共用
  pageSize: 10,

  // 读书笔记没有封面图时，轮流使用这些纯色作为占位
  placeholderColors: ['#DCE3EA', '#E7DFD3', '#D9E4DA', '#E6DDE8', '#E3E3DE'],

  // 读书笔记封面比例，宽比高
  coverRatio: '3 / 4',

  // 左侧目录树里年份文件夹的排列顺序：desc 最新年份在上，asc 最早年份在上
  sidebarYearOrder: 'desc',

  // 想法在 RSS 里的标题后缀，最终标题形如「2026-05-05 想法」
  thoughtTitleSuffix: '想法',

  // 四个知识库，folder 是 content 目录下的文件夹名，改文件夹名时同步改这里
  // type 有三种：list 表示 Chalk 风格列表，grid 表示豆瓣风格网格，feed 表示想法流
  knowledgeBases: [
    { folder: '读书笔记', id: 'reading', label: '读书笔记', type: 'grid' },
    { folder: '投资之路', id: 'investing', label: '投资之路', type: 'list' },
    { folder: '杂文随笔', id: 'essays', label: '杂文随笔', type: 'list' },
    { folder: '想法', id: 'thoughts', label: '想法', type: 'feed' },
  ],

  // 关于页对应的文件，放在 content 目录下
  aboutFile: '关于.md',

  // 首页收录哪些知识库，用上面的 id
  homeIncludes: ['reading', 'investing', 'essays'],

  // RSS 收录哪些知识库
  rssIncludes: ['reading', 'investing', 'essays', 'thoughts'],
};
