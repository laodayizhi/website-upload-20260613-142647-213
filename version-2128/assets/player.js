(function () {
  var video = document.getElementById('moviePlayer');
  var playButton = document.querySelector('[data-play]');
  var status = document.querySelector('[data-player-status]');
  var hls = null;
  var prepared = false;

  if (!video) {
    return;
  }

  function setStatus(text) {
    if (status) {
      status.textContent = text || '';
    }
  }

  function prepare() {
    if (prepared) {
      return;
    }

    prepared = true;
    var url = video.getAttribute('data-video') || '';

    if (!url) {
      setStatus('播放暂时不可用');
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setStatus('');
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          setStatus('正在重新连接');
          hls.startLoad();
          return;
        }

        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          setStatus('正在恢复播放');
          hls.recoverMediaError();
          return;
        }

        setStatus('播放暂时不可用');
      });
      return;
    }

    video.src = url;
  }

  function play() {
    prepare();
    if (playButton) {
      playButton.classList.add('is-hidden');
    }
    setStatus('');
    var attempt = video.play();

    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {
        if (playButton) {
          playButton.classList.remove('is-hidden');
        }
      });
    }
  }

  if (playButton) {
    playButton.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (!prepared) {
      play();
    }
  });

  video.addEventListener('play', function () {
    if (playButton) {
      playButton.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (!video.ended && video.currentTime === 0 && playButton) {
      playButton.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
})();
