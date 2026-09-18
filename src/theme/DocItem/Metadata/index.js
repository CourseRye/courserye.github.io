import React from 'react';
import Head from '@docusaurus/Head';
import Metadata from '@theme-original/DocItem/Metadata';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';

// 文章页的 SEO 补充：
// 1. 私密分区（front matter 里 noindex: true）输出 noindex，不让搜索引擎收录
// 2. 其他文章输出 JSON-LD 结构化数据：Article 加面包屑，搜索引擎和 AI 搜索能直接读出标题、日期、作者、配图
export default function MetadataWrapper(props) {
  const { metadata, frontMatter } = useDoc();
  const { siteConfig } = useDocusaurusContext();
  const site = siteConfig.customFields.site;
  const kb = site.knowledgeBases.find((k) => k.id === metadata.permalink.split('/')[1]);
  const pageUrl = siteConfig.url + metadata.permalink;
  const image = useBaseUrl(frontMatter.image || siteConfig.themeConfig.image, { absolute: true });
  const logo = useBaseUrl('img/logo.png', { absolute: true });
  const date = frontMatter.date ? new Date(frontMatter.date).toISOString().slice(0, 10) : undefined;

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

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: metadata.title,
      description: metadata.description,
      url: pageUrl,
      mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
      image: [image],
      datePublished: date,
      dateModified: date,
      inLanguage: 'zh-Hans',
      articleSection: kb ? kb.label : undefined,
      author: { '@type': 'Person', name: site.siteName, url: `${siteConfig.url}/about` },
      publisher: { '@type': 'Organization', name: site.siteName, logo: { '@type': 'ImageObject', url: logo } },
    },
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
      </Head>
    </>
  );
}
