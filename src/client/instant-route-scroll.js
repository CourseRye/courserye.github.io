// 切换页面时直接跳到顶部，不做平滑滚动。
// motion.css 给 html 开了 scroll-behavior: smooth（为了锚点跳转），而 Docusaurus 在每次路由切换后会调用
// window.scrollTo(0, 0)，两者叠加就变成了「新页面先停在上一页的滚动位置，再慢慢滚回顶部」。
// 这里在路由开始切换时临时把 scroll-behavior 改成 auto，切换完成（Docusaurus 已经滚到顶部）后再还原。
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

export function onRouteUpdate({ location, previousLocation }) {
  if (!ExecutionEnvironment.canUseDOM || !previousLocation) return undefined;
  if (location.pathname === previousLocation.pathname) return undefined;
  document.documentElement.style.scrollBehavior = 'auto';
  return undefined;
}

export function onRouteDidUpdate() {
  if (!ExecutionEnvironment.canUseDOM) return;
  document.documentElement.style.scrollBehavior = '';
}
