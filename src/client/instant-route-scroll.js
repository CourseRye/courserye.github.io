// 页面切换时的滚动位置处理，两条规则：
// 1. 点进新页面：直接跳到顶部，不做平滑滚动
// 2. 返回上一页：直接回到离开时的位置（比如刚才点击的那条标题），不做平滑滚动
//
// 背景：motion.css 给 html 开了 scroll-behavior: smooth（为了目录锚点跳转顺滑），而 Docusaurus 每次切换路由都会
// 调用 window.scrollTo(0, 0)，浏览器返回时又会自己恢复滚动位置。三者叠加就变成了「先停在错误位置，再慢慢滚过去」。
// 这里接管了位置恢复：离开页面时记下滚动位置（按路由 key 存在 sessionStorage），返回时在渲染完成、绘制之前
// 一次性跳回去；切换期间临时把 scroll-behavior 改成 auto，切换完成后再还原，锚点跳转不受影响。
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

const STORAGE_KEY = 'scroll-positions';
let poppedBack = false;

function keyOf(location) {
  // 首次打开的那条历史记录没有 key，用路径代替
  return location.key || `init:${location.pathname}${location.search}`;
}
function loadPositions() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
  } catch (e) {
    return {};
  }
}
function savePosition(location, y) {
  try {
    const map = loadPositions();
    map[keyOf(location)] = y;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {}
}

if (ExecutionEnvironment.canUseDOM) {
  // 浏览器自己的位置恢复会和平滑滚动叠加成动画，关掉，由下面的逻辑负责
  if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
  window.addEventListener('popstate', () => {
    poppedBack = true;
  });
}

export function onRouteUpdate({ location, previousLocation }) {
  if (!ExecutionEnvironment.canUseDOM || !previousLocation) return undefined;
  savePosition(previousLocation, window.scrollY);
  // 同一页面内的锚点跳转保持平滑；换页面或前进后退时关掉平滑
  if (location.pathname !== previousLocation.pathname || poppedBack) {
    document.documentElement.style.scrollBehavior = 'auto';
  }
  return undefined;
}

export function onRouteDidUpdate({ location }) {
  if (!ExecutionEnvironment.canUseDOM) return;
  if (poppedBack) {
    poppedBack = false;
    const y = loadPositions()[keyOf(location)];
    if (typeof y === 'number' && !location.hash) window.scrollTo(0, y);
  }
  document.documentElement.style.scrollBehavior = '';
}
