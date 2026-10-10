import React from 'react';
import Link from '@docusaurus/Link';

// 列表里指向文章的链接：首页、列表页、读书笔记网格等都用它，统一在新标签页打开
// 以后新增别的列表样式，链到文章时也用这个组件
export default function PostLink(props) {
  return <Link target="_blank" rel="noopener" {...props} />;
}
