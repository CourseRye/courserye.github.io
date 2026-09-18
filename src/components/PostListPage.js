import React from 'react';
import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Pagination from './Pagination';
import styles from './PostListPage.module.css';

export default function PostListPage({ data }) {
  const { siteConfig } = useDocusaurusContext();
  const { title, basePath, page, totalPages, posts } = data;
  // 第 2 页起标题带页码，避免各页标题重复；列表页描述按分区生成
  // 首页的标题就是站名，Docusaurus 会自动补上「| 站名」，所以首页翻页只写页码
  const pageTitle = title ? `${title}${page > 1 ? `（第 ${page} 页）` : ''}` : page > 1 ? `第 ${page} 页` : siteConfig.title;
  const description = title ? `${siteConfig.title}的${title}` : siteConfig.tagline;
  const isHome = basePath === '/' && page === 1;
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.title,
    description: siteConfig.tagline,
    url: siteConfig.url + '/',
    inLanguage: 'zh-Hans',
  };
  // hidden 的知识库没有列表页，日期旁的分类名显示为普通文字，不可点击
  const hiddenKbs = new Set(
    (siteConfig.customFields.site.knowledgeBases || []).filter((kb) => kb.hidden).map((kb) => kb.id)
  );

  return (
    <Layout title={pageTitle} description={description}>
      {isHome && (
        <Head>
          <script type="application/ld+json">{JSON.stringify(websiteJsonLd)}</script>
        </Head>
      )}
      <main className={`page-col ${styles.main}`}>
        {posts.length === 0 && <p className={styles.empty}>这里还没有文章。</p>}
        <ul className={styles.list}>
          {posts.map((post) => (
            <li key={post.url} className={styles.item}>
              <h2 className={styles.title}>
                <Link to={post.url}>{post.title}</Link>
              </h2>
              {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}
              <p className={styles.meta}>
                <time dateTime={post.date}>{post.date}</time>
                <span className={styles.sep}>{'\t'}</span>
                {hiddenKbs.has(post.kb) ? (
                  <span className={styles.kbStatic}>{post.kbLabel}</span>
                ) : (
                  <Link to={`/${post.kb}`} className={styles.kb}>
                    {post.kbLabel}
                  </Link>
                )}
              </p>
            </li>
          ))}
        </ul>
        <Pagination basePath={basePath} page={page} totalPages={totalPages} />
      </main>
    </Layout>
  );
}
