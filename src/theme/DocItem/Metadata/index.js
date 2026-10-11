import React from 'react';
import Head from '@docusaurus/Head';
import Metadata from '@theme-original/DocItem/Metadata';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';

// 文章页的 SEO 补充：
// 1. 私密分区（front matter 里 noindex: true）输出 noindex，不让搜索引擎收录
// 2. 其他文章输出 JSON-LD 结构化数据：Article 加面包屑，搜索引擎和 AI 搜索能直接读出标题、日期、作者、配图；
//    读书笔记输出书评（Review），被评对象是这本书，评分就是星级
// 3. 用 <link rel="alternate" type="text/markdown"> 标出文章的纯 Markdown 版本（scripts/prepare.js 生成）
export default function MetadataWrapper(props) {
  const { metadata, frontMatter } = useDoc();
  const { siteConfig } = useDocusaurusContext();
  const site = siteConfig.customFields.site;
  const kb = site.knowledgeBases.find((k) => k.id === metadata.permalink.split('/')[1]);
  const pageUrl = siteConfig.url + metadata.permalink;
  const image = useBaseUrl(frontMatter.image || siteConfig.themeConfig.image, { absolute: true });
  const logo = useBaseUrl('img/logo.png', { absolute: true });
  const day = (d) => (d ? new Date(d).toISOString().slice(0, 10) : undefined);
  const date = day(frontMatter.date);
  const modified = day(frontMatter.modified) || date;

  if (frontMatter.noindex) {
    return (
      <>
        <Metadata {...props} />
        <Head>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
      </>
    );
  }

  const crumbs = [{ name: '首页', item: siteConfig.url + '/' }];
  if (kb && !kb.hidden) crumbs.push({ name: kb.label, item: `${siteConfig.url}/${kb.id}` });
  crumbs.push({ name: metadata.title, item: pageUrl });

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: metadata.title,
    description: metadata.description,
    url: pageUrl,
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    image: [image],
    datePublished: date,
    dateModified: modified,
    inLanguage: 'zh-Hans',
    articleSection: kb ? kb.label : undefined,
    author: { '@type': 'Person', name: site.author || site.siteName, url: `${siteConfig.url}/about` },
    publisher: { '@type': 'Organization', name: site.siteName, logo: { '@type': 'ImageObject', url: logo } },
  };
  // 读书笔记：书评。笔记里没有书的作者信息，Book 只写书名和封面
  if (kb && kb.type === 'grid') {
    delete article.articleSection;
    Object.assign(article, {
      '@type': 'Review',
      name: metadata.title,
      itemReviewed: { '@type': 'Book', name: metadata.title, image },
      ...(frontMatter.stars >= 1
        ? { reviewRating: { '@type': 'Rating', ratingValue: frontMatter.stars, bestRating: 5, worstRating: 1 } }
        : {}),
    });
  }

  const jsonLd = [
    article,
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.item })),
    },
  ];

  return (
    <>
      <Metadata {...props} />
      <Head>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <link rel="alternate" type="text/markdown" href={`${metadata.permalink}.md`} />
      </Head>
    </>
  );
}
