import React from 'react';
import clsx from 'clsx';
import { ThemeClassNames } from '@docusaurus/theme-common';
import { useBackToTopButton } from '@docusaurus/theme-common/internal';

// 文章页回到顶部：小圆钮，底部居中放在渐隐区里，向上滚动时出现
export default function BackToTopButton() {
  const { shown, scrollToTop } = useBackToTopButton({ threshold: 300 });
  return (
    <button
      aria-label="回到顶部"
      title="回到顶部"
      className={clsx('clean-btn', ThemeClassNames.common.backToTopButton, 'back-to-top', shown && 'back-to-top--show')}
      type="button"
      onClick={scrollToTop}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
