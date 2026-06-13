(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var header = document.querySelector("[data-site-header]");
        var nav = document.querySelector("[data-site-nav]");
        var toggle = document.querySelector("[data-nav-toggle]");

        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        if (header) {
            var updateHeader = function () {
                header.classList.toggle("is-scrolled", window.scrollY > 12);
            };
            updateHeader();
            window.addEventListener("scroll", updateHeader, { passive: true });
        }

        document.querySelectorAll("[data-hero]").forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var previous = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            if (!slides.length) {
                return;
            }

            function show(nextIndex) {
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }

            function move(step) {
                show(index + step);
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    move(1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            if (previous) {
                previous.addEventListener("click", function () {
                    move(-1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    move(1);
                    start();
                });
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    show(dotIndex);
                    start();
                });
            });

            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        });

        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-search-field]");
            var filters = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-field]"));
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));

            function normalize(value) {
                return String(value || "").toLowerCase().trim();
            }

            function update() {
                var query = normalize(input ? input.value : "");
                var shown = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-tags")
                    ].join(" "));

                    var matched = !query || haystack.indexOf(query) !== -1;

                    filters.forEach(function (filter) {
                        var key = filter.getAttribute("data-filter-field");
                        var value = normalize(filter.value);
                        var target = normalize(card.getAttribute("data-" + key));
                        if (value && target.indexOf(value) === -1) {
                            matched = false;
                        }
                    });

                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        shown += 1;
                    }
                });

                scope.classList.toggle("is-empty", shown === 0);
            }

            if (input) {
                input.addEventListener("input", update);
            }

            filters.forEach(function (filter) {
                filter.addEventListener("change", update);
            });

            update();
        });
    });
})();
