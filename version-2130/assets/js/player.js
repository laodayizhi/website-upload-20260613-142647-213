import { H as Hls } from './hls-dru42stk.js';

(function () {
  var shell = document.querySelector('[data-player-shell]');
  var video = document.querySelector('[data-player]');
  var button = document.querySelector('[data-player-button]');
  var status = document.querySelector('[data-player-status]');

  if (!shell || !video || !button) {
    return;
  }

  var source = video.getAttribute('data-src');
  var hlsInstance = null;
  var initialized = false;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function attachSource() {
    if (initialized) {
      return Promise.resolve();
    }

    initialized = true;
    setStatus('正在初始化播放源...');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setStatus('已绑定 HLS 播放源，可直接播放。');
      return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });

      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus('HLS 播放源加载完成，点击后开始播放。');
      });
      hlsInstance.on(Hls.Events.ERROR, function (_event, data) {
        if (data && data.fatal) {
          setStatus('播放源加载出现问题，请检查网络或播放地址。');
        }
      });
      return Promise.resolve();
    }

    video.src = source;
    setStatus('当前浏览器可能不支持 HLS，已尝试使用原生播放。');
    return Promise.resolve();
  }

  function playVideo() {
    attachSource().then(function () {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(function () {
          shell.classList.add('is-playing');
          setStatus('正在播放。');
        }).catch(function () {
          setStatus('浏览器阻止了自动播放，请再次点击播放按钮。');
        });
      }
    });
  }

  button.addEventListener('click', playVideo);
  video.addEventListener('play', function () {
    shell.classList.add('is-playing');
  });
  video.addEventListener('pause', function () {
    shell.classList.remove('is-playing');
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
