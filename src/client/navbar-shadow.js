// 页面滚动离开顶部后给 html 加上 is-scrolled，导航栏据此显示阴影
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
  const update = () => {
    document.documentElement.classList.toggle('is-scrolled', window.scrollY > 0);
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

export function onRouteDidUpdate() {
  if (ExecutionEnvironment.canUseDOM) {
    document.documentElement.classList.toggle('is-scrolled', window.scrollY > 0);
  }
}
