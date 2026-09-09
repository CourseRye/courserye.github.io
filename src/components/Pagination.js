import React from 'react';
import Link from '@docusaurus/Link';
import styles from './Pagination.module.css';

export default function Pagination({ basePath, page, totalPages }) {
  if (totalPages <= 1) return null;
  const href = (p) => (p === 1 ? basePath : `${basePath === '/' ? '' : basePath}/page/${p}`);
  return (
    <nav className={styles.pagination} aria-label="分页">
      {page > 1 ? <Link to={href(page - 1)}>上一页</Link> : <span className={styles.disabled}>上一页</span>}
      <span className={styles.info}>
        {page} / {totalPages}
      </span>
      {page < totalPages ? <Link to={href(page + 1)}>下一页</Link> : <span className={styles.disabled}>下一页</span>}
    </nav>
  );
}
