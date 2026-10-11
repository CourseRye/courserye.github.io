import React from 'react';
import Head from '@docusaurus/Head';
import MDXPage from '@theme-original/MDXPage';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

// 关于页输出 ProfilePage 结构化数据，告诉搜索引擎和 AI 这是作者的个人主页
export default function MDXPageWrapper(props) {
  const { siteConfig } = useDocusaurusContext();
  const site = siteConfig.customFields.site;
  const { permalink, description } = props.content.metadata;
  if (permalink !== '/about') return <MDXPage {...props} />;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: siteConfig.url + permalink,
    inLanguage: 'zh-Hans',
    mainEntity: {
      '@type': 'Person',
      name: site.author || site.siteName,
      description: description || undefined,
      url: siteConfig.url + permalink,
      mainEntityOfPage: siteConfig.url + '/',
    },
  };
  return (
    <>
      <Head>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Head>
      <MDXPage {...props} />
    </>
  );
}
