// 自定义插件：根据 .generated/data 生成首页、列表页、读书网格页、想法页的路由
const fs = require('fs');
const path = require('path');

module.exports = function siteDataPlugin(context) {
  const site = context.siteConfig.customFields.site;
  const gen = path.join(context.siteDir, '.generated', 'data');

  return {
    name: 'site-data',

    async loadContent() {
      const posts = JSON.parse(fs.readFileSync(path.join(gen, 'posts.json'), 'utf8'));
      const thoughts = JSON.parse(fs.readFileSync(path.join(gen, 'thoughts.json'), 'utf8'));
      return { posts, thoughts };
    },

    async contentLoaded({ content, actions }) {
      const { addRoute, createData } = actions;
      const pageSize = site.pageSize || 10;

      async function addListRoutes(basePath, title, kbId, items) {
        const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
        for (let page = 1; page <= totalPages; page++) {
          const slice = items.slice((page - 1) * pageSize, page * pageSize);
          const routePath = page === 1 ? basePath : `${basePath === '/' ? '' : basePath}/page/${page}`;
          const dataPath = await createData(
            `list-${kbId}-${page}.json`,
            JSON.stringify({ title, kbId, basePath, page, totalPages, posts: slice })
          );
          addRoute({
            path: routePath,
            component: '@site/src/components/PostListPage.js',
            exact: true,
            modules: { data: dataPath },
          });
        }
      }

      // 首页
      const homePosts = content.posts.filter((p) => site.homeIncludes.includes(p.kb));
      await addListRoutes('/', null, 'home', homePosts);

      for (const kb of site.knowledgeBases) {
        if (kb.type === 'list') {
          await addListRoutes(`/${kb.id}`, kb.label, kb.id, content.posts.filter((p) => p.kb === kb.id));
        } else if (kb.type === 'grid') {
          const items = content.posts.filter((p) => p.kb === kb.id);
          const years = {};
          for (const p of items) (years[p.year] = years[p.year] || []).push(p);
          const yearList = Object.keys(years)
            .sort((a, b) => b.localeCompare(a))
            .map((y) => ({ year: y, posts: years[y] }));
          const dataPath = await createData(`grid-${kb.id}.json`, JSON.stringify({ title: kb.label, years: yearList }));
          addRoute({
            path: `/${kb.id}`,
            component: '@site/src/components/ReadingGridPage.js',
            exact: true,
            modules: { data: dataPath },
          });
        } else if (kb.type === 'feed') {
          const dataPath = await createData(
            `feed-${kb.id}.json`,
            JSON.stringify({ title: kb.label, items: content.thoughts })
          );
          addRoute({
            path: `/${kb.id}`,
            component: '@site/src/components/ThoughtsPage.js',
            exact: true,
            modules: { data: dataPath },
          });
        }
      }
    },
  };
};
