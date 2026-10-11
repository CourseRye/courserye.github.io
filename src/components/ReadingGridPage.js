import React, { useEffect, useRef, useState } from 'react';
import Layout from '@theme/Layout';
import PostLink from './PostLink';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useIsBrowser from '@docusaurus/useIsBrowser';
import { useHistory } from '@docusaurus/router';
import Head from '@docusaurus/Head';
import Stars from './Stars';
import collectionJsonLd from './collectionJsonLd';
import styles from './ReadingGridPage.module.css';

function BookCard({ post, index, colors, ratio, zoom }) {
  const color = colors[index % colors.length];
  const [broken, setBroken] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);
  const showImg = post.cover && !broken;
  // 本地封面在构建时已经裁好，不再放大；只有仍是远程链接的封面才按 coverZoom 放大
  const coverZoom = showImg && /^https?:\/\//.test(post.cover) ? zoom : 1;

  // 图片在脚本接管前就已经加载完成时，onLoad 不会再触发，这里补一次
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) setLoaded(true);
  }, []);

  return (
    <li className={`${styles.card} book-card`}>
      <PostLink to={post.url} className={styles.cardLink}>
        <div
          className={`${styles.cover} book-cover`}
          style={{ aspectRatio: ratio, backgroundColor: showImg ? '#f2f2f2' : color, '--cover-zoom': coverZoom }}
        >
          {showImg && (
            <img
              ref={imgRef}
              src={post.cover}
              alt=""
              loading="lazy"
              decoding="async"
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
      </PostLink>
    </li>
  );
}

// 记住「已展开到第几年」，从文章返回时先把这些年份渲染出来，滚动位置才能精确恢复，图片也走缓存不重复请求
const SHOWN_KEY = 'reading-shown';
function loadShown(max) {
  try {
    const n = parseInt(sessionStorage.getItem(SHOWN_KEY), 10);
    return n >= 1 ? Math.min(n, max) : 1;
  } catch (e) {
    return 1;
  }
}

export default function ReadingGridPage({ data }) {
  const { siteConfig } = useDocusaurusContext();
  const site = siteConfig.customFields.site;
  const { title, years } = data;
  // 首次整页加载时 isBrowser 为 false，保持和服务端渲染一致；站内跳转过来时直接用记住的值
  const isBrowser = useIsBrowser();
  const [shown, setShown] = useState(() => (isBrowser ? loadShown(years.length) : 1));
  const sentinel = useRef(null);
  const mainRef = useRef(null);
  // 整页打开或从别处点进来时播放入场动画；浏览器后退回来要恢复滚动位置，不播
  const history = useHistory();
  const reveal = useRef(!isBrowser || history.action !== 'POP');

  useEffect(() => {
    try {
      sessionStorage.setItem(SHOWN_KEY, String(shown));
    } catch (e) {}
  }, [shown]);

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

  // 入场：书本进入视口时淡入上移，同一批进入的按从上到下、从左到右依次错开（样式在 motion.css）
  useEffect(() => {
    if (!reveal.current || !mainRef.current) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    // 新渲染出来的书先藏起来；上一轮还没进入视口的书继续等着
    mainRef.current
      .querySelectorAll('.book-card:not(.is-pending):not(.is-revealed)')
      .forEach((el) => el.classList.add('is-pending'));
    const cards = mainRef.current.querySelectorAll('.book-card.is-pending');
    if (cards.length === 0) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        const hits = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target)
          .sort((a, b) => a.offsetTop - b.offsetTop || a.offsetLeft - b.offsetLeft);
        hits.forEach((el, i) => {
          io.unobserve(el);
          el.style.setProperty('--reveal-delay', `${Math.min(i, 8) * 50}ms`);
          el.classList.replace('is-pending', 'is-revealed');
        });
      },
      { rootMargin: '0px 0px -40px 0px' }
    );
    cards.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [shown]);

  // 合集结构化数据列出全部年份的书，页面上虽然按年份分批渲染，爬虫一次就能拿到完整书单
  const collection = collectionJsonLd({ siteConfig, title, path: `/${data.kbId}`, posts: years.flatMap((y) => y.posts) });

  let counter = 0;

  return (
    <Layout title={title} description={`${siteConfig.title}的${title}`}>
      <Head>
        <script type="application/ld+json">{JSON.stringify(collection)}</script>
      </Head>
      <main ref={mainRef} className={`page-col ${styles.main}`}>
        {years.length === 0 && <p className={styles.empty}>这里还没有读书笔记。</p>}
        {years.slice(0, shown).map((y) => (
          <section key={y.year} className={styles.yearSection}>
            {/* 年份和本数同一行，中间一个 tab */}
            <h2 className={styles.year}>
              {y.year}
              {'\t'}
              <span className={styles.count}>{y.posts.length}</span>
            </h2>
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
