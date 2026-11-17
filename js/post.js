(function () {
  'use strict';
  var root = document.documentElement;
  var theme = document.querySelector('.theme-toggle');
  var menu = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.site-nav');
  function labelTheme() {
    var label = root.dataset.theme === 'dark' ? '切换浅色模式' : '切换深色模式';
    theme.setAttribute('aria-label', label);
    theme.setAttribute('title', label);
  }
  theme.addEventListener('click', function () {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (_) {}
    labelTheme();
  });
  menu.addEventListener('click', function () {
    var open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.querySelector('.sr-only').textContent = open ? '关闭导航' : '打开导航';
    nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', function (event) {
    if (event.target.closest('a')) {
      menu.setAttribute('aria-expanded', 'false');
      menu.querySelector('.sr-only').textContent = '打开导航';
      nav.classList.remove('is-open');
    }
  });
  document.getElementById('current-year').textContent = new Date().getFullYear();
  labelTheme();
}());
