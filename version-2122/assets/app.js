(function () {
  var navButton = document.querySelector("[data-nav-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (navButton && mobileNav) {
    navButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(
      hero.querySelectorAll("[data-hero-slide]"),
    );
    var dots = Array.prototype.slice.call(
      hero.querySelectorAll("[data-hero-dot]"),
    );
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    startTimer();
  }

  var panels = Array.prototype.slice.call(
    document.querySelectorAll("[data-filter-panel]"),
  );

  panels.forEach(function (panel) {
    var section = panel.closest("section") || document;
    var grid =
      section.querySelector("[data-filter-grid]") ||
      section.querySelector(".movie-grid");
    var cards = grid
      ? Array.prototype.slice.call(grid.querySelectorAll(".movie-card"))
      : [];
    var search = panel.querySelector("[data-search]");
    var selects = Array.prototype.slice.call(
      panel.querySelectorAll("[data-filter]"),
    );

    function valueOf(card, key) {
      return (card.getAttribute("data-" + key) || "").toLowerCase();
    }

    function applyFilter() {
      var keyword = search ? search.value.trim().toLowerCase() : "";
      var filters = {};

      selects.forEach(function (select) {
        filters[select.getAttribute("data-filter")] = select.value
          .trim()
          .toLowerCase();
      });

      cards.forEach(function (card) {
        var haystack = [
          valueOf(card, "title"),
          valueOf(card, "region"),
          valueOf(card, "type"),
          valueOf(card, "year"),
          valueOf(card, "genre"),
          valueOf(card, "tags"),
          valueOf(card, "category"),
        ].join(" ");
        var matched = keyword === "" || haystack.indexOf(keyword) !== -1;

        Object.keys(filters).forEach(function (key) {
          var expected = filters[key];
          if (expected && valueOf(card, key).indexOf(expected) === -1) {
            matched = false;
          }
        });

        card.classList.toggle("is-hidden", !matched);
      });
    }

    if (search) {
      search.addEventListener("input", applyFilter);
    }

    selects.forEach(function (select) {
      select.addEventListener("change", applyFilter);
    });
  });
})();

function initMoviePlayer(sourceUrl) {
  var video = document.getElementById("movie-video");
  var cover = document.getElementById("player-cover");
  var started = false;
  var hls = null;

  if (!video || !sourceUrl) {
    return;
  }

  function attachSource() {
    if (started) {
      return;
    }

    started = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  }

  function beginPlay() {
    attachSource();

    if (cover) {
      cover.classList.add("is-hidden");
    }

    var playResult = video.play();

    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(function () {
        if (cover) {
          cover.classList.remove("is-hidden");
        }
      });
    }
  }

  if (cover) {
    cover.addEventListener("click", beginPlay);
  }

  video.addEventListener("click", function () {
    if (!started) {
      beginPlay();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
