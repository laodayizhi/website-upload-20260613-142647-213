(() => {
    const ready = (callback) => {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    };

    ready(() => {
        const mobileButton = document.querySelector(".mobile-menu-button");
        const mobileMenu = document.querySelector(".mobile-menu");

        if (mobileButton && mobileMenu) {
            mobileButton.addEventListener("click", () => {
                const expanded = mobileButton.getAttribute("aria-expanded") === "true";
                mobileButton.setAttribute("aria-expanded", String(!expanded));
                mobileMenu.classList.toggle("hidden");
                mobileButton.querySelector(".menu-open")?.classList.toggle("hidden");
                mobileButton.querySelector(".menu-close")?.classList.toggle("hidden");
            });
        }

        const searchPanel = document.querySelector(".global-search-panel");
        document.querySelectorAll(".search-toggle").forEach((button) => {
            button.addEventListener("click", () => {
                if (!searchPanel) {
                    return;
                }
                searchPanel.classList.toggle("hidden");
                const input = searchPanel.querySelector(".global-search-input");
                if (!searchPanel.classList.contains("hidden")) {
                    input?.focus();
                }
            });
        });

        const renderSearchResults = (input) => {
            const term = input.value.trim().toLowerCase();
            const scope = input.closest(".global-search-panel") || input.closest(".hero-search-card") || document;
            const results = scope.querySelector(".search-results") || document.querySelector(".global-search-panel .search-results");

            if (!results || !window.MOVIES) {
                return;
            }

            if (!term) {
                results.innerHTML = "";
                return;
            }

            const matches = window.MOVIES.filter((movie) => {
                return [movie.title, movie.year, movie.region, movie.type, movie.category, movie.genre, movie.oneLine]
                    .join(" ")
                    .toLowerCase()
                    .includes(term);
            }).slice(0, 12);

            results.innerHTML = matches.map((movie) => `
                <a href="${movie.url}" class="search-result-card group">
                    <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" class="search-result-cover">
                    <span class="search-result-body">
                        <span class="search-result-title group-hover:text-emerald-600">${escapeHtml(movie.title)}</span>
                        <span class="search-result-meta">${escapeHtml(movie.year)} · ${escapeHtml(movie.region)} · ${escapeHtml(movie.category)}</span>
                    </span>
                </a>
            `).join("");
        };

        document.querySelectorAll(".global-search-input").forEach((input) => {
            input.addEventListener("input", () => renderSearchResults(input));
        });

        const filterInput = document.querySelector(".movie-filter-input");
        if (filterInput) {
            filterInput.addEventListener("input", () => {
                const term = filterInput.value.trim().toLowerCase();
                document.querySelectorAll(".movie-card").forEach((card) => {
                    const haystack = (card.getAttribute("data-filter-text") || "").toLowerCase();
                    card.classList.toggle("is-hidden", term.length > 0 && !haystack.includes(term));
                });
            });
        }

        const carousel = document.querySelector(".hero-carousel");
        if (carousel) {
            const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
            const dots = Array.from(carousel.querySelectorAll(".hero-dot"));
            const prev = carousel.querySelector(".hero-prev");
            const next = carousel.querySelector(".hero-next");
            let current = 0;
            let timer = null;

            const show = (index) => {
                current = (index + slides.length) % slides.length;
                slides.forEach((slide, slideIndex) => {
                    const active = slideIndex === current;
                    slide.classList.toggle("active", active);
                    slide.setAttribute("aria-hidden", String(!active));
                });
                dots.forEach((dot, dotIndex) => {
                    dot.classList.toggle("active", dotIndex === current);
                });
            };

            const start = () => {
                stop();
                timer = window.setInterval(() => show(current + 1), 5000);
            };

            const stop = () => {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            };

            prev?.addEventListener("click", () => {
                show(current - 1);
                start();
            });

            next?.addEventListener("click", () => {
                show(current + 1);
                start();
            });

            dots.forEach((dot, index) => {
                dot.addEventListener("click", () => {
                    show(index);
                    start();
                });
            });

            carousel.addEventListener("mouseenter", stop);
            carousel.addEventListener("mouseleave", start);
            start();
        }

        const player = document.querySelector(".movie-player");
        const cover = document.querySelector(".player-cover");

        if (player && cover) {
            const stream = player.getAttribute("data-stream");
            let prepared = false;
            let hls = null;

            const prepare = () => {
                if (prepared || !stream) {
                    return Promise.resolve();
                }
                prepared = true;

                if (player.canPlayType("application/vnd.apple.mpegurl")) {
                    player.src = stream;
                    return Promise.resolve();
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(player);
                    return new Promise((resolve) => {
                        hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
                    });
                }

                player.src = stream;
                return Promise.resolve();
            };

            const play = () => {
                cover.classList.add("is-hidden");
                prepare().then(() => player.play()).catch(() => {
                    cover.classList.remove("is-hidden");
                });
            };

            cover.addEventListener("click", play);
            player.addEventListener("play", () => cover.classList.add("is-hidden"));
            window.addEventListener("beforeunload", () => {
                if (hls) {
                    hls.destroy();
                }
            });
        }
    });

    const escapeHtml = (value) => String(value || "").replace(/[&<>'"]/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        "\"": "&quot;"
    }[character]));
})();
