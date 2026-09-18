(function () {
  'use strict';

  var root = document.documentElement;
  var themeButton = document.querySelector('.theme-toggle');
  var menuButton = document.querySelector('.menu-toggle');
  var navigation = document.querySelector('.site-nav');
  var year = document.querySelector('#current-year');

  function updateThemeLabel() {
    var dark = root.dataset.theme === 'dark';
    themeButton.setAttribute('aria-label', dark ? '切换浅色模式' : '切换深色模式');
    themeButton.setAttribute('title', dark ? '切换浅色模式' : '切换深色模式');
  }

  themeButton.addEventListener('click', function () {
    var nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = nextTheme;
    localStorage.setItem('theme', nextTheme);
    updateThemeLabel();
  });

  menuButton.addEventListener('click', function () {
    var open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    navigation.classList.toggle('is-open', !open);
  });

  navigation.addEventListener('click', function (event) {
    if (event.target.tagName === 'A') {
      menuButton.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('is-open');
    }
  });

  year.textContent = new Date().getFullYear();
  updateThemeLabel();
}());
