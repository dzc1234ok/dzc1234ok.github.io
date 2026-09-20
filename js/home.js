(function () {
  'use strict';

  var root = document.documentElement;
  var themeButton = document.querySelector('.theme-toggle');
  var menuButton = document.querySelector('.menu-toggle');
  var navigation = document.querySelector('.site-nav');
  var year = document.querySelector('#current-year');
  var languageButtons = document.querySelectorAll('[data-language]');

  var translations = {
    'zh-CN': {
      'meta.title': '落地生根 · 技术博客', 'meta.description': '记录工程实践、开发工具与技术思考的个人技术博客。',
      'site.name': '落地生根',
      'accessibility.skip': '跳到正文', 'accessibility.home': '落地生根首页', 'accessibility.language': '选择语言', 'accessibility.navigation': '主导航', 'accessibility.stats': '博客数据',
      'nav.home': '首页', 'nav.articles': '文章', 'nav.topics': '专题', 'nav.archive': '归档', 'nav.about': '关于',
      'hero.eyebrow': '你好，世界！', 'hero.title': '探索技术，', 'hero.highlight': '记录成长。', 'hero.lead': '这里记录我的工程实践、踩坑笔记与技术思考。把复杂的问题讲清楚，把有价值的经验留下来。', 'hero.read': '开始阅读', 'hero.about': '了解博主',
      'stats.articles': '篇文章', 'stats.topics': '个专题', 'stats.curious': '保持好奇',
      'articles.kicker': '最新文章', 'articles.title': '最近文章', 'articles.all': '查看全部文章', 'articles.read': '阅读文章',
      'post1.tag': '工程实践', 'post1.title': '从零开始搭建个人技术博客', 'post1.summary': '为什么要写技术博客？从内容规划到发布上线，记录一次完整的建站过程与思考。', 'post1.label': '阅读文章：从零开始搭建个人技术博客',
      'post2.tag': '开发随笔', 'post2.title': 'Hello World：写在开始之前', 'post2.summary': '每一段旅程都需要一个起点。关于这个博客，以及我希望在这里持续记录的内容。', 'post2.label': '阅读文章：Hello World',
      'post3.tag': '效率工具', 'post3.soon': '即将发布', 'post3.title': '我的开发环境与效率工具箱', 'post3.summary': '从终端到编辑器，分享我每天都在使用的工具、配置与工作流。', 'post3.writing': '正在写作中…',
      'topics.kicker': '按专题探索', 'topics.title': '探索专题', 'topics.frontend': '前端开发', 'topics.backend': '后端与架构', 'topics.tools': '工具与效率', 'topics.thoughts': '思考与复盘',
      'about.kicker': '关于我', 'about.title': '嗨，我是 dzc1234ok。', 'about.copy': '一名热爱创造与分享的开发者。我相信最好的学习方式是输出，也相信清晰的文字能让技术走得更远。',
      'footer.tagline': '用代码解决问题，用文字记录成长。', 'theme.dark': '切换深色模式', 'theme.light': '切换浅色模式', 'menu.open': '打开导航'
    },
    'zh-TW': {
      'meta.title': '落地生根 · 技術部落格', 'meta.description': '記錄工程實踐、開發工具與技術思考的個人技術部落格。',
      'site.name': '落地生根',
      'accessibility.skip': '跳到正文', 'accessibility.home': '落地生根首頁', 'accessibility.language': '選擇語言', 'accessibility.navigation': '主導覽', 'accessibility.stats': '部落格數據',
      'nav.home': '首頁', 'nav.articles': '文章', 'nav.topics': '專題', 'nav.archive': '歸檔', 'nav.about': '關於',
      'hero.eyebrow': '你好，世界！', 'hero.title': '探索技術，', 'hero.highlight': '記錄成長。', 'hero.lead': '這裡記錄我的工程實踐、踩坑筆記與技術思考。把複雜的問題說清楚，把有價值的經驗留下來。', 'hero.read': '開始閱讀', 'hero.about': '瞭解作者',
      'stats.articles': '篇文章', 'stats.topics': '個專題', 'stats.curious': '保持好奇',
      'articles.kicker': '最新文章', 'articles.title': '最近文章', 'articles.all': '查看全部文章', 'articles.read': '閱讀文章',
      'post1.tag': '工程實踐', 'post1.title': '從零開始搭建個人技術部落格', 'post1.summary': '為什麼要寫技術部落格？從內容規劃到發佈上線，記錄一次完整的建站過程與思考。', 'post1.label': '閱讀文章：從零開始搭建個人技術部落格',
      'post2.tag': '開發隨筆', 'post2.title': 'Hello World：寫在開始之前', 'post2.summary': '每一段旅程都需要一個起點。關於這個部落格，以及我希望在這裡持續記錄的內容。', 'post2.label': '閱讀文章：Hello World',
      'post3.tag': '效率工具', 'post3.soon': '即將發佈', 'post3.title': '我的開發環境與效率工具箱', 'post3.summary': '從終端到編輯器，分享我每天都在使用的工具、設定與工作流程。', 'post3.writing': '正在寫作中…',
      'topics.kicker': '按專題探索', 'topics.title': '探索專題', 'topics.frontend': '前端開發', 'topics.backend': '後端與架構', 'topics.tools': '工具與效率', 'topics.thoughts': '思考與覆盤',
      'about.kicker': '關於我', 'about.title': '嗨，我是 dzc1234ok。', 'about.copy': '一名熱愛創造與分享的開發者。我相信最好的學習方式是輸出，也相信清晰的文字能讓技術走得更遠。',
      'footer.tagline': '用程式碼解決問題，用文字記錄成長。', 'theme.dark': '切換深色模式', 'theme.light': '切換淺色模式', 'menu.open': '開啟導覽'
    },
    en: {
      'meta.title': 'Take Root · Tech Blog', 'meta.description': 'A personal blog about software engineering, developer tools, and technical ideas.',
      'site.name': 'Take Root',
      'accessibility.skip': 'Skip to content', 'accessibility.home': 'Take Root home', 'accessibility.language': 'Choose language', 'accessibility.navigation': 'Main navigation', 'accessibility.stats': 'Blog statistics',
      'nav.home': 'Home', 'nav.articles': 'Articles', 'nav.topics': 'Topics', 'nav.archive': 'Archive', 'nav.about': 'About',
      'hero.eyebrow': 'HELLO, WORLD!', 'hero.title': 'Explore tech,', 'hero.highlight': 'document growth.', 'hero.lead': 'A home for my engineering practice, lessons learned, and technical ideas—making complex problems clear and preserving experience worth sharing.', 'hero.read': 'Start reading', 'hero.about': 'About me',
      'stats.articles': 'articles', 'stats.topics': 'topics', 'stats.curious': 'stay curious',
      'articles.kicker': 'LATEST WRITING', 'articles.title': 'Latest writing', 'articles.all': 'View all articles', 'articles.read': 'Read article',
      'post1.tag': 'Engineering', 'post1.title': 'Building a Personal Tech Blog from Scratch', 'post1.summary': 'Why write a tech blog? A look at the complete journey, from content planning to launching the site.', 'post1.label': 'Read article: Building a Personal Tech Blog from Scratch',
      'post2.tag': 'Dev Notes', 'post2.title': 'Hello World: Before We Begin', 'post2.summary': 'Every journey needs a starting point. A note about this blog and what I hope to document here.', 'post2.label': 'Read article: Hello World',
      'post3.tag': 'Productivity', 'post3.soon': 'Coming soon', 'post3.title': 'My Development Environment and Toolkit', 'post3.summary': 'From terminal to editor, the tools, settings, and workflows I use every day.', 'post3.writing': 'Work in progress…',
      'topics.kicker': 'EXPLORE BY TOPIC', 'topics.title': 'Explore topics', 'topics.frontend': 'Frontend Development', 'topics.backend': 'Backend & Architecture', 'topics.tools': 'Tools & Productivity', 'topics.thoughts': 'Reflections & Reviews',
      'about.kicker': 'ABOUT ME', 'about.title': "Hi, I'm dzc1234ok.", 'about.copy': 'A developer who loves creating and sharing. I believe the best way to learn is to teach—and that clear writing helps technology go further.',
      'footer.tagline': 'Solve problems with code. Document growth with words.', 'theme.dark': 'Switch to dark mode', 'theme.light': 'Switch to light mode', 'menu.open': 'Open navigation'
    }
  };

  var currentLanguage = 'zh-CN';

  function applyLanguage(language) {
    var dictionary = translations[language] || translations['zh-CN'];
    currentLanguage = translations[language] ? language : 'zh-CN';
    root.lang = currentLanguage;
    document.querySelectorAll('[data-i18n]').forEach(function (element) {
      var value = dictionary[element.dataset.i18n];
      if (value) element.textContent = value;
    });
    document.querySelectorAll('[data-i18n-content]').forEach(function (element) {
      var value = dictionary[element.dataset.i18nContent];
      if (value) element.setAttribute('content', value);
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach(function (element) {
      var value = dictionary[element.dataset.i18nAriaLabel];
      if (value) element.setAttribute('aria-label', value);
    });
    languageButtons.forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.language === currentLanguage));
    });
    document.querySelector('.menu-toggle .sr-only').textContent = dictionary['menu.open'];
    localStorage.setItem('language', currentLanguage);
    updateThemeLabel();
  }

  function updateThemeLabel() {
    var dark = root.dataset.theme === 'dark';
    var dictionary = translations[currentLanguage];
    var label = dark ? dictionary['theme.light'] : dictionary['theme.dark'];
    themeButton.setAttribute('aria-label', label);
    themeButton.setAttribute('title', label);
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

  languageButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      applyLanguage(button.dataset.language);
    });
  });

  year.textContent = new Date().getFullYear();
  var savedLanguage = localStorage.getItem('language');
  var browserLanguage = navigator.language === 'zh-TW' || navigator.language === 'zh-HK' ? 'zh-TW' : (navigator.language.indexOf('zh') === 0 ? 'zh-CN' : 'en');
  applyLanguage(savedLanguage || browserLanguage);
}());
