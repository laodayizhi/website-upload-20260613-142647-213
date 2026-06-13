(function () {
  var body = document.body;
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
      body.classList.toggle('menu-open', mobilePanel.classList.contains('open'));
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer;

    var setSlide = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('is-active', thumbIndex === current);
      });
    };

    var start = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        setSlide(current + 1);
      }, 5200);
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('mouseenter', function () {
        setSlide(Number(thumb.getAttribute('data-hero-thumb')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        setSlide(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setSlide(current + 1);
        start();
      });
    }

    setSlide(0);
    start();
  }

  var params = new URLSearchParams(window.location.search);
  var query = (params.get('q') || '').trim();
  var pageSearch = document.querySelector('[data-page-search]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var emptyState = document.querySelector('[data-empty-state]');
  var activeType = '';

  var normalize = function (value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  };

  var applyFilter = function () {
    if (!cards.length) {
      return;
    }

    var keyword = pageSearch ? pageSearch.value.trim() : query;
    var key = normalize(keyword);
    var typeKey = normalize(activeType);
    var shown = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' '));
      var typeValue = normalize(card.getAttribute('data-type'));
      var matchKeyword = !key || haystack.indexOf(key) !== -1;
      var matchType = !typeKey || typeValue.indexOf(typeKey) !== -1 || haystack.indexOf(typeKey) !== -1;
      var visible = matchKeyword && matchType;
      card.style.display = visible ? '' : 'none';
      if (visible) {
        shown += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('show', shown === 0);
    }
  };

  if (pageSearch) {
    pageSearch.value = query;
    pageSearch.addEventListener('input', applyFilter);
    applyFilter();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]')).forEach(function (button) {
    button.addEventListener('click', function () {
      Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]')).forEach(function (item) {
        item.classList.remove('active');
      });
      button.classList.add('active');
      activeType = button.getAttribute('data-filter-value') || '';
      applyFilter();
    });
  });

  var video = document.getElementById('movie-player');
  var playerButton = document.querySelector('[data-player-start]');
  var playerMessage = document.querySelector('[data-player-message]');
  var initialized = false;

  var setPlayerMessage = function (message) {
    if (playerMessage) {
      playerMessage.textContent = message || '';
    }
  };

  var startPlayer = function () {
    if (!video) {
      return;
    }

    var source = video.getAttribute('data-src');
    if (!source) {
      setPlayerMessage('播放源暂不可用');
      return;
    }

    var frame = video.closest('.player-frame');
    if (frame) {
      frame.classList.add('is-playing');
    }

    var playVideo = function () {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          setPlayerMessage('请再次点击播放按钮开始播放');
          if (frame) {
            frame.classList.remove('is-playing');
          }
        });
      }
    };

    if (initialized) {
      playVideo();
      return;
    }

    initialized = true;
    setPlayerMessage('正在加载高清播放源');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
      video.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setPlayerMessage('');
        playVideo();
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setPlayerMessage('播放加载失败，请刷新后重试');
        }
      });
      return;
    }

    setPlayerMessage('当前浏览器暂不支持该播放格式');
  };

  if (playerButton) {
    playerButton.addEventListener('click', startPlayer);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!initialized) {
        startPlayer();
      }
    });
  }
})();
