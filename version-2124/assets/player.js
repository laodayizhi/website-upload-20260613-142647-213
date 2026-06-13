import { H as Hls } from "./hls.js";

function setupPlayer(video) {
  var source = video.getAttribute("data-video-url");
  var shell = video.closest(".player-shell");
  var status = shell ? shell.querySelector("[data-player-status]") : null;
  var playButton = shell ? shell.querySelector("[data-play-target='" + video.id + "']") : null;

  function setStatus(message) {
    if (status) {
      status.textContent = message || "";
    }
  }

  function bindSource() {
    if (!source) {
      setStatus("视频加载失败");
      return;
    }

    if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus("");
      });
      hls.on(Hls.Events.ERROR, function (eventName, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setStatus("视频加载中");
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setStatus("正在恢复播放");
          hls.recoverMediaError();
        } else {
          setStatus("视频加载失败");
          hls.destroy();
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else {
      video.src = source;
    }
  }

  function playVideo() {
    bindSourceOnce();
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        setStatus("点击视频继续播放");
      });
    }
  }

  var hasBound = false;

  function bindSourceOnce() {
    if (hasBound) {
      return;
    }
    hasBound = true;
    bindSource();
  }

  video.addEventListener("play", function () {
    if (shell) {
      shell.classList.add("is-playing");
    }
    setStatus("");
  });

  video.addEventListener("pause", function () {
    if (shell && video.currentTime === 0) {
      shell.classList.remove("is-playing");
    }
  });

  video.addEventListener("click", function () {
    bindSourceOnce();
  });

  video.addEventListener("loadedmetadata", function () {
    setStatus("");
  });

  video.addEventListener("error", function () {
    setStatus("视频加载失败");
  });

  if (playButton) {
    playButton.addEventListener("click", playVideo);
  }

  bindSourceOnce();
}

Array.prototype.slice.call(document.querySelectorAll("video[data-video-url]")).forEach(setupPlayer);
