import React, { useEffect, useRef, useState } from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './ThoughtsPage.module.css';

export default function ThoughtsPage({ data }) {
  const { siteConfig } = useDocusaurusContext();
  const pageSize = siteConfig.customFields.site.pageSize || 10;
  const { title, items } = data;
  const [shown, setShown] = useState(pageSize);
  const sentinel = useRef(null);

  useEffect(() => {
    if (!sentinel.current || shown >= items.length) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setShown((n) => Math.min(n + pageSize, items.length));
      },
      { rootMargin: '400px 0px' }
    );
    io.observe(sentinel.current);
    return () => io.disconnect();
  }, [shown, items.length, pageSize]);

  return (
    <Layout title={title} description={siteConfig.tagline}>
      <main className={`page-narrow ${styles.main}`}>
        <h1 className={styles.kbTitle}>{title}</h1>
        {items.length === 0 && <p className={styles.empty}>这里还没有想法。</p>}
        <ul className={styles.list}>
          {items.slice(0, shown).map((t) => (
            <li key={t.id} id={t.id} className={styles.item}>
              <time className={styles.date} dateTime={t.date}>
                {t.date}
              </time>
              <div className={`markdown ${styles.body}`} dangerouslySetInnerHTML={{ __html: t.html }} />
            </li>
          ))}
        </ul>
        {shown < items.length && (
          <div ref={sentinel} className={styles.more}>
            <button type="button" onClick={() => setShown((n) => n + pageSize)}>
              加载更多
            </button>
          </div>
        )}
      </main>
    </Layout>
  );
}
