(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = qs('[data-menu-button]');
  var navLinks = qs('[data-nav-links]');

  if (menuButton && navLinks) {
    menuButton.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
  }

  var hero = qs('[data-hero-slider]');

  if (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dotsWrap = qs('[data-hero-dots]', hero);
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      qsa('button', dotsWrap).forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (slides.length && dotsWrap) {
      slides.forEach(function (_slide, index) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', '切换第 ' + (index + 1) + ' 张焦点影片');
        dot.addEventListener('click', function () {
          showSlide(index);
          startTimer();
        });
        dotsWrap.appendChild(dot);
      });
      showSlide(0);
      startTimer();
    }
  }

  qsa('[data-filter-panel]').forEach(function (panel) {
    var searchInput = qs('[data-filter-search]', panel);
    var categorySelect = qs('[data-filter-category]', panel);
    var typeSelect = qs('[data-filter-type]', panel);
    var yearSelect = qs('[data-filter-year]', panel);
    var sortSelect = qs('[data-sort-select]', panel);
    var countEl = qs('[data-filter-count]', panel);
    var grid = panel.nextElementSibling;

    while (grid && !grid.matches('[data-card-grid]')) {
      grid = grid.nextElementSibling;
    }

    if (!grid) {
      return;
    }

    var cards = qsa('[data-card]', grid);
    var empty = grid.parentElement.querySelector('[data-empty-filter]');

    function matchesYear(card, value) {
      if (!value) {
        return true;
      }
      var year = parseInt(card.getAttribute('data-year'), 10) || 0;
      if (value === 'older') {
        return year > 0 && year <= 2020;
      }
      return String(year) === value;
    }

    function applyFilters() {
      var keyword = (searchInput && searchInput.value || '').trim().toLowerCase();
      var category = categorySelect && categorySelect.value || '';
      var type = typeSelect && typeSelect.value || '';
      var year = yearSelect && yearSelect.value || '';
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var ok = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          ok = false;
        }
        if (category && card.getAttribute('data-category') !== category) {
          ok = false;
        }
        if (type && card.getAttribute('data-type') !== type) {
          ok = false;
        }
        if (!matchesYear(card, year)) {
          ok = false;
        }

        card.style.display = ok ? '' : 'none';
        if (ok) {
          visibleCount += 1;
        }
      });

      if (countEl) {
        countEl.textContent = String(visibleCount);
      }
      if (empty) {
        empty.classList.toggle('show', visibleCount === 0);
      }
    }

    function applySort() {
      var value = sortSelect && sortSelect.value || 'default';
      var sorted = cards.slice();

      if (value === 'year-desc') {
        sorted.sort(function (a, b) {
          return (parseInt(b.getAttribute('data-year'), 10) || 0) - (parseInt(a.getAttribute('data-year'), 10) || 0);
        });
      } else if (value === 'rating-desc') {
        sorted.sort(function (a, b) {
          return (parseFloat(b.getAttribute('data-rating')) || 0) - (parseFloat(a.getAttribute('data-rating')) || 0);
        });
      } else if (value === 'title-asc') {
        sorted.sort(function (a, b) {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        });
      } else {
        sorted.sort(function (a, b) {
          return cards.indexOf(a) - cards.indexOf(b);
        });
      }

      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      applyFilters();
    }

    [searchInput, categorySelect, typeSelect, yearSelect].forEach(function (input) {
      if (input) {
        input.addEventListener('input', applyFilters);
        input.addEventListener('change', applyFilters);
      }
    });

    if (sortSelect) {
      sortSelect.addEventListener('change', applySort);
    }

    applyFilters();
  });
})();
