import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Pagination from './Pagination';
import styles from './PostListPage.module.css';

export default function PostListPage({ data }) {
  const { siteConfig } = useDocusaurusContext();
  const { title, basePath, page, totalPages, posts } = data;
  const pageTitle = title ? `${title}` : siteConfig.title;
  // hidden 的知识库没有列表页，日期旁的分类名显示为普通文字，不可点击
  const hiddenKbs = new Set(
    (siteConfig.customFields.site.knowledgeBases || []).filter((kb) => kb.hidden).map((kb) => kb.id)
  );

  return (
    <Layout title={pageTitle} description={siteConfig.tagline}>
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
