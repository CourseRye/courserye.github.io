import React from 'react';
import Layout from '@theme-original/DocItem/Layout';
import ReadingProgress from '@site/src/components/ReadingProgress';

// 文章页：在原布局外加一条顶部阅读进度条
export default function LayoutWrapper(props) {
  return (
    <>
      <ReadingProgress />
      <Layout {...props} />
    </>
  );
}
