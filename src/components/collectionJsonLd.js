// 列表页的结构化数据：CollectionPage 加 ItemList，告诉搜索引擎和 AI 这一页是哪个分区的文章合集
// offset 是翻页时前面几页的条数，让序号在各页之间连续
export default function collectionJsonLd({ siteConfig, title, path, posts, offset = 0 }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    url: siteConfig.url + path,
    inLanguage: 'zh-Hans',
    isPartOf: { '@type': 'WebSite', name: siteConfig.title, url: siteConfig.url + '/' },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: posts.map((p, i) => ({
        '@type': 'ListItem',
        position: offset + i + 1,
        url: siteConfig.url + p.url,
        name: p.title,
      })),
    },
  };
}
