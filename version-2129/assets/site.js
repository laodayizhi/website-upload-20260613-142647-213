import { H as Hls } from "./hls-dru42stk.js";

const menuButton = document.querySelector("[data-menu-toggle]");
const menu = document.querySelector("[data-menu]");

if (menuButton && menu) {
    menuButton.addEventListener("click", () => {
        menu.classList.toggle("is-open");
    });
}

const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
const prevButton = document.querySelector("[data-hero-prev]");
const nextButton = document.querySelector("[data-hero-next]");
let currentSlide = 0;
let heroTimer = null;

function setHeroSlide(index) {
    if (!slides.length) {
        return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === currentSlide);
    });

    dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === currentSlide);
    });
}

function startHeroTimer() {
    if (heroTimer || slides.length < 2) {
        return;
    }

    heroTimer = window.setInterval(() => {
        setHeroSlide(currentSlide + 1);
    }, 5600);
}

function resetHeroTimer() {
    if (heroTimer) {
        window.clearInterval(heroTimer);
        heroTimer = null;
    }

    startHeroTimer();
}

if (slides.length) {
    prevButton?.addEventListener("click", () => {
        setHeroSlide(currentSlide - 1);
        resetHeroTimer();
    });

    nextButton?.addEventListener("click", () => {
        setHeroSlide(currentSlide + 1);
        resetHeroTimer();
    });

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            setHeroSlide(index);
            resetHeroTimer();
        });
    });

    startHeroTimer();
}

const filterInput = document.querySelector("[data-filter-input]");
const filterItems = Array.from(document.querySelectorAll("[data-filter-item]"));

function normalizeText(value) {
    return String(value || "").trim().toLowerCase();
}

function applyFilter(value) {
    const query = normalizeText(value);

    filterItems.forEach((item) => {
        const text = normalizeText(`${item.dataset.title || ""} ${item.dataset.tags || ""} ${item.textContent || ""}`);
        item.classList.toggle("is-hidden", query && !text.includes(query));
    });
}

if (filterInput && filterItems.length) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";

    if (query) {
        filterInput.value = query;
        applyFilter(query);
    }

    filterInput.addEventListener("input", () => {
        applyFilter(filterInput.value);
    });
}

const playerStore = [];

function loadVideo(video, source) {
    if (!source) {
        return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
    }

    if (Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        playerStore.push(hls);
        return;
    }

    video.src = source;
}

function setupPlayer(player) {
    const video = player.querySelector("video");
    const playButton = player.querySelector("[data-play]");

    if (!video || !playButton) {
        return;
    }

    const source = video.dataset.source;

    const startPlayback = () => {
        if (player.dataset.ready !== "true") {
            loadVideo(video, source);
            player.dataset.ready = "true";
        }

        player.classList.add("is-playing");
        video.controls = true;
        const playTask = video.play();

        if (playTask && typeof playTask.catch === "function") {
            playTask.catch(() => {});
        }
    };

    playButton.addEventListener("click", (event) => {
        event.stopPropagation();
        startPlayback();
    });

    player.addEventListener("click", (event) => {
        if (event.target === video) {
            return;
        }

        startPlayback();
    });
}

document.querySelectorAll("[data-player]").forEach(setupPlayer);
