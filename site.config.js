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
  googleAnalyticsId: 'G-P29E2CBXS2',

  // 每页显示多少条，首页、列表页、浴室沉思页共用
  pageSize: 10,

  // 读书笔记没有封面图时，轮流使用这些纯色作为占位
  placeholderColors: ['#DCE3EA', '#E7DFD3', '#D9E4DA', '#E6DDE8', '#E3E3DE'],

  // 读书笔记封面比例，宽比高
  coverRatio: '3 / 4',

  // 读书笔记封面裁剪：封面图是 1920×1080 的图、书封居中占 540×720 时填 1.5，网格里就只露出书封
  // 如果以后封面图本身就是一张书封，填 1
  // 构建时会按这个比例把封面裁小、压缩后存到 static/covers，页面用本地小图，详见 README 2.5
  coverZoom: 1.5,

  // 左侧目录树里年份文件夹的排列顺序：desc 最新年份在上，asc 最早年份在上
  sidebarYearOrder: 'desc',

  // 浴室沉思在 RSS 里的标题后缀，最终标题形如「2026-05-05 想法」
  thoughtTitleSuffix: '想法',

  // 知识库列表，顺序就是顶部导航栏的顺序。folder 是 content 目录下的文件夹名，改文件夹名时同步改这里
  // type 有三种：list 表示 Chalk 风格列表，grid 表示豆瓣风格网格，feed 表示想法流
  // sidebar 表示文章页是否显示左侧目录树：true 显示，false 不显示（不显示时也没有上一篇下一篇）
  // hidden: true 表示「私密分区」：不进顶部导航栏，不生成列表页，首页日期旁的分类名不可点击，文章只能从首页进入
  // 文件夹里一篇文章都没有的知识库会自动跳过，导航栏也不显示，放进第一篇文章后自动出现
  knowledgeBases: [
    { folder: '读书笔记', id: 'reading', label: '读书笔记', type: 'grid', sidebar: false },
    { folder: '投资之路', id: 'investing', label: '投资之路', type: 'list', sidebar: true },
    { folder: '杂文随笔', id: 'essays', label: '杂文随笔', type: 'list', sidebar: false },
    { folder: '好奇心万岁', id: 'curiosity', label: '好奇心万岁', type: 'list', sidebar: false },
    { folder: '浴室沉思', id: 'thoughts', label: '浴室沉思', type: 'feed' },
    { folder: '自我', id: 'self', label: '自我', type: 'list', sidebar: false, hidden: true },
  ],

  // 关于页对应的文件，放在 content 目录下
  aboutFile: '关于.md',

  // 首页收录哪些知识库，用上面的 id
  homeIncludes: ['reading', 'investing', 'essays', 'curiosity', 'self'],

  // RSS 收录哪些知识库
  rssIncludes: ['reading', 'investing', 'essays', 'curiosity', 'self', 'thoughts'],
};
