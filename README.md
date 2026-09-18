# 简单讲讲

个人博客与知识库，基于 Docusaurus，托管于 GitHub Pages。

## 1.0 目录结构

只需要关心两处：

1. content 文件夹：所有文章都放这里
2. site.config.js：网站名称、每页条数、占位颜色、各知识库是否显示左侧目录、Google Analytics 等设置

其余文件是网站代码，正常情况下不用碰。

## 2.0 content 文件夹的规则

```
content/
  读书笔记/
    2026/
      01. 黄金时代 ★★★☆☆.md
      02. 黑铁时代 ★★★☆☆.md
    2020/
      ...
  投资之路/
    2024/
      03 玫瑰色回忆 Rosy Retrospection.md
  杂文随笔/
    2022/
      05 副业日记 五.md
  浴室沉思/
    2026-05-05 想法.md
  关于.md
```

### 2.1 文件名

1. 开头的数字是排序号，只用于左侧目录树的排序，页面上不显示。「01. 」「01 」「01-」都可以
2. 末尾的星星只在读书笔记网格里显示，实心几颗就亮几颗，其他地方自动去掉
3. 浴室沉思的文件名以日期开头，后面的文字随意，页面上只显示日期。同一天第二条可以叫「2026-05-05 2.md」
4. 文件名也可以用日期开头，比如「2020-05-14 指数基金投资 ★★★☆☆.md」，这样日期会直接从文件名读取

### 2.2 文章日期

日期决定首页和列表页的先后顺序，以及页面上显示的日期。来源按优先级：

1. 文件开头有一行「date: 2025-07-27」，用这个
2. 文件名以日期开头，用文件名里的日期
3. 都没有，用这个文件第一次提交到 GitHub 的日期

注意：文件改名后，Git 会当成新文件，第 3 种日期会重新计算。重要的文章建议加 date 行。

### 2.3 文件内容

1. 文件第一行的 H1 标题会被自动去掉，页面标题从文件名取
2. 图片只渲染 http 开头的链接，Bear 导出的本地图片引用会被忽略
3. 读书笔记的封面取正文第一张云端图片，没有则用纯色占位
4. Bear 的高亮语法「==文字==」正常渲染
5. 嵌入 YouTube：直接把 YouTube 分享里的嵌入代码贴进正文即可，形如「<iframe src="https://www.youtube.com/embed/xxxx" ...></iframe>」

### 2.4 新增知识库

在 content 下新建文件夹，然后在 site.config.js 的 knowledgeBases 里加一行，数组顺序就是顶部导航栏的顺序。

想做一个「私密分区」（不进顶部导航栏、没有列表页、首页日期旁的分类名不可点击、文章只能从首页进入），在那一行加上 `hidden: true`，参考「自我」的写法。

文件夹里一篇文章都没有的知识库会被自动跳过，导航栏也不显示，放进第一篇文章后自动出现。

注意：本地预览（npm start）运行期间改了 knowledgeBases（新增、删除、改 id），必须停掉 npm start 再重新启动，否则新知识库的文章页会报错「Cannot read properties of undefined」。另外不要在 npm start 运行期间跑 npm run build，两者共用缓存目录，会互相干扰。

### 2.5 读书笔记封面

封面原图往往是几 MB 的大截图，构建时会自动下载、按 site.config.js 里的 coverRatio 和 coverZoom 裁出书封区域、缩到 480 px 宽、转成 WebP 存进 static/covers，页面用这些本地小图（每张十几 KB）。

1. 处理结果随仓库一起提交，已经处理过的封面不会重复下载
2. 想重新处理某张封面（比如换了图但链接没变），删掉 static/covers 里对应的文件再构建
3. 下载失败时页面退回原链接，构建不会中断，控制台会有提示

## 3.0 日常发布

1. 在 Bear 里导出 Markdown，导出时不勾选 base64 Images 和 Export attachments
2. 把文件放进 content 对应文件夹
3. 打开 GitHub Desktop，填一句说明，点 Commit to main，再点 Push origin
4. 等两三分钟，网站自动更新。进度可以在仓库的 Actions 页面看

## 4.0 首次部署

1. 用 GitHub Desktop 把仓库 courserye.github.io 克隆到本地
2. 删掉仓库里原来的所有文件，把本压缩包里的所有文件复制进去，注意包含以「.」开头的隐藏文件和文件夹，比如 .github 和 .gitignore
3. 在 GitHub Desktop 里 Commit 并 Push
4. 打开 GitHub 网页，进入仓库的 Settings，左侧点 Pages，Build and deployment 下的 Source 选 GitHub Actions
5. 回到仓库的 Actions 页面，等第一次构建完成，访问 https://courserye.github.io

## 5.0 本地预览

可选。需要安装 Node.js 20 或更新版本。

```
npm install
npm start
```

浏览器打开 http://localhost:3000 即可，改动 content 后需要重新运行 npm start。

## 6.0 多语言预留

默认语言是简体中文。将来要加其他语言时，在 docusaurus.config.js 的 i18n.locales 里加语言代码，翻译文件放到 i18n 文件夹下对应路径，文件夹结构与 content 保持一致。
