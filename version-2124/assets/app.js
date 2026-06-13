(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (toggle && mobileMenu) {
      toggle.addEventListener("click", function () {
        mobileMenu.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function activateSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === current);
      });
    }

    function startHero() {
      if (timer || slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        activateSlide(current + 1);
      }, 5200);
    }

    function restartHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
      startHero();
    }

    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");

    if (prev) {
      prev.addEventListener("click", function () {
        activateSlide(current - 1);
        restartHero();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        activateSlide(current + 1);
        restartHero();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        activateSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        restartHero();
      });
    });

    activateSlide(0);
    startHero();

    Array.prototype.slice.call(document.querySelectorAll("[data-search-form]")).forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input) {
          return;
        }
        var query = input.value.trim();
        if (!query) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });

    var filterForm = document.querySelector("[data-local-filter]");
    var filterList = document.querySelector("[data-filter-list]");

    if (filterForm && filterList) {
      var input = filterForm.querySelector("[data-filter-input]");
      var category = filterForm.querySelector("[data-filter-category]");
      var type = filterForm.querySelector("[data-filter-type]");
      var cards = Array.prototype.slice.call(filterList.querySelectorAll("[data-card]"));
      var params = new URLSearchParams(window.location.search);
      var urlQuery = params.get("q") || "";

      if (input && urlQuery) {
        input.value = urlQuery;
      }

      function normalize(value) {
        return String(value || "").toLowerCase().trim();
      }

      function applyFilter() {
        var query = normalize(input ? input.value : "");
        var wantedCategory = category ? category.value : "";
        var wantedType = type ? type.value : "";

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var cardCategory = card.getAttribute("data-category") || "";
          var cardType = card.getAttribute("data-type") || "";
          var matchedQuery = !query || text.indexOf(query) !== -1;
          var matchedCategory = !wantedCategory || cardCategory === wantedCategory;
          var matchedType = !wantedType || cardType.indexOf(wantedType) !== -1;
          card.classList.toggle("is-hidden", !(matchedQuery && matchedCategory && matchedType));
        });
      }

      filterForm.addEventListener("submit", function (event) {
        event.preventDefault();
        applyFilter();
      });

      [input, category, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });

      applyFilter();
    }
  });
})();
