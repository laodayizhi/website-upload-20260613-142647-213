(function() {
  var navToggle = document.querySelector(".nav-toggle");
  var siteNav = document.querySelector(".site-nav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function() {
      siteNav.classList.toggle("is-open");
    });
  }

  var carousel = document.querySelector("[data-hero-carousel]");

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    var showSlide = function(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, position) {
        slide.classList.toggle("is-active", position === current);
      });
      dots.forEach(function(dot, position) {
        dot.classList.toggle("is-active", position === current);
      });
    };

    dots.forEach(function(dot, position) {
      dot.addEventListener("click", function() {
        showSlide(position);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function() {
        showSlide(current + 1);
      }, 5600);
    }
  }

  document.querySelectorAll("[data-filter-scope]").forEach(function(scope) {
    var search = scope.querySelector("[data-filter-search]");
    var year = scope.querySelector("[data-filter-year]");
    var region = scope.querySelector("[data-filter-region]");
    var type = scope.querySelector("[data-filter-type]");
    var empty = scope.querySelector("[data-empty]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-card]"));

    var applyFilters = function() {
      var keyword = search ? search.value.trim().toLowerCase() : "";
      var yearValue = year ? year.value : "";
      var regionValue = region ? region.value : "";
      var typeValue = type ? type.value : "";
      var visible = 0;

      cards.forEach(function(card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var ok = true;

        if (keyword && text.indexOf(keyword) === -1) {
          ok = false;
        }
        if (yearValue && card.getAttribute("data-year") !== yearValue) {
          ok = false;
        }
        if (regionValue && card.getAttribute("data-region") !== regionValue) {
          ok = false;
        }
        if (typeValue && card.getAttribute("data-type") !== typeValue) {
          ok = false;
        }

        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    };

    [search, year, region, type].forEach(function(control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });
  });
})();
