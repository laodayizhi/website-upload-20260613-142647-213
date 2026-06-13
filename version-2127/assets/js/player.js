(function() {
  window.initMoviePlayer = function(streamUrl, videoId, coverId) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var hlsInstance = null;
    var prepared = false;

    if (!video || !cover || !streamUrl) {
      return;
    }

    var prepareVideo = function() {
      if (prepared) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      video.controls = true;
      prepared = true;
    };

    var playVideo = function() {
      prepareVideo();
      cover.classList.add("is-hidden");
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function() {
          cover.classList.remove("is-hidden");
        });
      }
    };

    cover.addEventListener("click", playVideo);

    video.addEventListener("click", function() {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener("play", function() {
      cover.classList.add("is-hidden");
    });

    window.addEventListener("beforeunload", function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
