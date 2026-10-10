import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// 文章页顶部的阅读进度条：正文末尾滚到底部渐隐区上沿时算读完
// 直接改 transform，不走 React 渲染，滚动时不卡
// 挂到 body 下：文章行有进入动画，会形成层叠上下文，放在里面会被顶部渐隐区盖住
export default function ReadingProgress() {
  const barRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return undefined;
    const bar = barRef.current;
    const article = document.querySelector('.theme-doc-markdown');
    if (!bar || !article) return undefined;

    let frame = 0;
    const update = () => {
      frame = 0;
      const root = document.documentElement;
      const fade = parseFloat(getComputedStyle(root).getPropertyValue('--fade')) || 0;
      const scrollY = window.scrollY;
      const maxScroll = root.scrollHeight - window.innerHeight;
      const end = Math.min(article.getBoundingClientRect().bottom + scrollY - (window.innerHeight - fade), maxScroll);
      const p = end > 0 ? Math.min(Math.max(scrollY / end, 0), 1) : 1;
      bar.style.transform = `translateX(${(p - 1) * 100}%)`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    // 图片加载、目录展开等会改变页面高度
    const ro = new ResizeObserver(schedule);
    ro.observe(article);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      ro.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [mounted]);

  if (!mounted) return null;
  return createPortal(
    <div className="reading-progress" aria-hidden="true">
      <div ref={barRef} className="reading-progress__bar" />
    </div>,
    document.body
  );
}
