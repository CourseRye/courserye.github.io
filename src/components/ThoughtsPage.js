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
  const [target, setTarget] = useState(null);
  // 页面打开时这一条还没渲染，CSS 的 :target 不生效，用类名补上
  const [highlight, setHighlight] = useState(null);

  // 每条想法都有自己的锚点（/thoughts#id），AI 和搜索引擎引用时能指到具体某一条。
  // 打开这样的链接时，先把列表加载到那一条，再滚过去
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const i = id ? items.findIndex((t) => t.id === id) : -1;
    if (i < 0) return;
    setShown((n) => Math.max(n, Math.ceil((i + 1) / pageSize) * pageSize));
    setTarget(id);
    setHighlight(id);
  }, [items, pageSize]);

  useEffect(() => {
    if (!target) return;
    const el = document.getElementById(target);
    if (el) {
      el.scrollIntoView();
      setTarget(null);
    }
  }, [target, shown]);

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
    <Layout title={title} description={`${siteConfig.title}的${title}`}>
      <main className={`page-col ${styles.main}`}>
        {items.length === 0 && <p className={styles.empty}>这里还没有想法。</p>}
        <ul className={styles.list}>
          {items.slice(0, shown).map((t) => (
            <li
              key={t.id}
              id={t.id}
              className={`${styles.item} thought-item${t.id === highlight ? ` ${styles.targeted}` : ''}`}
            >
              <div className={`${styles.card} thought-card`}>
                <div className={`markdown prose ${styles.body}`} dangerouslySetInnerHTML={{ __html: t.html }} />
                <p className={`${styles.meta} thought-meta`}>
                  <a href={`#${t.id}`} className={styles.permalink} title="这条想法的链接">
                    <time dateTime={t.date}>{t.date}</time>
                  </a>
                </p>
              </div>
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
