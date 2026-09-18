import React, { useEffect, useRef, useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Stars from './Stars';
import styles from './ReadingGridPage.module.css';

function BookCard({ post, index, colors, ratio, zoom }) {
  const color = colors[index % colors.length];
  const [broken, setBroken] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);
  const showImg = post.cover && !broken;

  // 图片在脚本接管前就已经加载完成时，onLoad 不会再触发，这里补一次
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) setLoaded(true);
  }, []);

  return (
    <li className={`${styles.card} book-card`}>
      <Link to={post.url} className={styles.cardLink}>
        <div
          className={`${styles.cover} book-cover`}
          style={{ aspectRatio: ratio, backgroundColor: showImg ? '#f2f2f2' : color, '--cover-zoom': zoom }}
        >
          {showImg && (
            <img
              ref={imgRef}
              src={post.cover}
              alt=""
              loading="lazy"
              className={loaded ? 'is-loaded' : undefined}
              onLoad={() => setLoaded(true)}
              onError={() => setBroken(true)}
            />
          )}
        </div>
        <div className={styles.title}>{post.title}</div>
        <div className={styles.rating}>
          <Stars count={post.stars} />
        </div>
        {post.hover && (
          <div className={styles.tooltip} role="tooltip">
            <div className={styles.tooltipTitle}>{post.title}</div>
            <div className={styles.tooltipBody}>{post.hover}</div>
          </div>
        )}
      </Link>
    </li>
  );
}

export default function ReadingGridPage({ data }) {
  const { siteConfig } = useDocusaurusContext();
  const site = siteConfig.customFields.site;
  const { title, years } = data;
  const [shown, setShown] = useState(1);
  const sentinel = useRef(null);

  useEffect(() => {
    if (!sentinel.current || shown >= years.length) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setShown((n) => Math.min(n + 1, years.length));
      },
      { rootMargin: '400px 0px' }
    );
    io.observe(sentinel.current);
    return () => io.disconnect();
  }, [shown, years.length]);

  let counter = 0;

  return (
    <Layout title={title} description={siteConfig.tagline}>
      <main className={`page-col ${styles.main}`}>
        <h1 className={styles.kbTitle}>{title}</h1>
        {years.length === 0 && <p className={styles.empty}>这里还没有读书笔记。</p>}
        {years.slice(0, shown).map((y) => (
          <section key={y.year} className={styles.yearSection}>
            <h2 className={styles.year}>{y.year}</h2>
            <ul className={styles.grid}>
              {y.posts.map((post) => (
                <BookCard
                  key={post.url}
                  post={post}
                  index={counter++}
                  colors={site.placeholderColors}
                  ratio={site.coverRatio}
                  zoom={site.coverZoom || 1}
                />
              ))}
            </ul>
          </section>
        ))}
        {shown < years.length && (
          <div ref={sentinel} className={styles.more}>
            <button type="button" onClick={() => setShown((n) => n + 1)}>
              加载 {years[shown].year} 年
            </button>
          </div>
        )}
      </main>
    </Layout>
  );
}
