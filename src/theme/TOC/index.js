import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import TOCItems from '@theme/TOCItems';
import styles from './styles.module.css';

// 文章页右侧目录：默认只显示每个标题的一条短线，鼠标移入展开，图钉可固定
// 固定状态记在浏览器本地，下次打开文章仍然固定
const STORAGE_KEY = 'toc-pinned';
const LINK_CLASS_NAME = 'table-of-contents__link toc-highlight';
const LINK_ACTIVE_CLASS_NAME = 'table-of-contents__link--active';

const pinIcon = (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 16v6" />
    <path d="M8 3h8" />
    <path d="M9.5 3v6l-3 4h11l-3-4V3" />
  </svg>
);

export default function TOC({ className, ...props }) {
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === '1') setPinned(true);
    } catch (e) {
      // 无痕模式等情况下读不到本地存储，按未固定处理
    }
  }, []);

  const toggle = (e) => {
    // 点击后把焦点移走，否则按钮保持聚焦会让目录一直展开
    e.currentTarget.blur();
    const next = !pinned;
    setPinned(next);
    try {
      if (next) window.localStorage.setItem(STORAGE_KEY, '1');
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // 忽略
    }
  };

  return (
    <div className={clsx(styles.tableOfContents, 'toc-panel', pinned && 'toc-panel--pinned', 'thin-scrollbar', className)}>
      <button
        type="button"
        className="toc-pin"
        onClick={toggle}
        aria-pressed={pinned}
        aria-label={pinned ? '取消固定目录' : '固定目录'}
        title={pinned ? '取消固定' : '固定目录'}
      >
        {pinIcon}
      </button>
      <TOCItems {...props} linkClassName={LINK_CLASS_NAME} linkActiveClassName={LINK_ACTIVE_CLASS_NAME} />
    </div>
  );
}
