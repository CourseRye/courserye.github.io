import React from 'react';
import styles from './Stars.module.css';

export default function Stars({ count, max = 5 }) {
  if (count == null) return null;
  return (
    <span className={styles.stars} aria-label={`${count} 星`}>
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" width="14" height="14" className={i < count ? styles.on : styles.off} aria-hidden="true">
          <path d="M12 2.5l2.95 6.1 6.7.9-4.9 4.7 1.2 6.7L12 17.7l-5.95 3.2 1.2-6.7-4.9-4.7 6.7-.9z" />
        </svg>
      ))}
    </span>
  );
}
