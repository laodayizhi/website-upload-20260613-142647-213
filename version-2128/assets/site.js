(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.menu-toggle');

  if (header && toggle) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function show(index) {
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
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = parseInt(dot.getAttribute('data-hero-dot'), 10) || 0;
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q');
  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    var searchInput = filterPanel.querySelector('[data-filter-search]');
    var typeSelect = filterPanel.querySelector('[data-filter-type]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var categorySelect = filterPanel.querySelector('[data-filter-category]');
    var resetButton = filterPanel.querySelector('[data-filter-reset]');
    var list = document.querySelector('[data-filter-list]');
    var emptyState = document.querySelector('[data-empty-state]');
    var items = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card-item')) : [];

    if (query && searchInput) {
      searchInput.value = query;
    }

    function textOf(item) {
      return [
        item.getAttribute('data-title') || '',
        item.getAttribute('data-region') || '',
        item.getAttribute('data-type') || '',
        item.getAttribute('data-year') || '',
        item.getAttribute('data-category') || '',
        item.getAttribute('data-tags') || ''
      ].join(' ').toLowerCase();
    }

    function applyFilters() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var category = categorySelect ? categorySelect.value : '';
      var visible = 0;

      items.forEach(function (item) {
        var content = textOf(item);
        var ok = true;

        if (keyword && content.indexOf(keyword) === -1) {
          ok = false;
        }

        if (type && (item.getAttribute('data-type') || '') !== type) {
          ok = false;
        }

        if (year && (item.getAttribute('data-year') || '') !== year) {
          ok = false;
        }

        if (category && (item.getAttribute('data-category') || '') !== category) {
          ok = false;
        }

        item.style.display = ok ? '' : 'none';

        if (ok) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    [searchInput, typeSelect, yearSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        if (categorySelect) {
          categorySelect.value = '';
        }
        applyFilters();
      });
    }

    applyFilters();
  }
})();
