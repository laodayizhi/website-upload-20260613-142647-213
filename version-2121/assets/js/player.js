(function () {
    window.setupMoviePlayer = function (streamUrl) {
        var video = document.querySelector("[data-player-video]");
        var gate = document.querySelector("[data-player-gate]");
        var button = document.querySelector("[data-player-button]");
        var started = false;
        var hls = null;

        function bind() {
            if (!video || started) {
                return;
            }

            started = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function play() {
            if (!video) {
                return;
            }

            bind();
            video.controls = true;

            if (gate) {
                gate.classList.add("is-hidden");
            }

            var request = video.play();
            if (request && typeof request.catch === "function") {
                request.catch(function () {});
            }
        }

        if (gate) {
            gate.addEventListener("click", play);
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                play();
            });
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
        }

        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };
})();
