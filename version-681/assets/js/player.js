(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var message = player.querySelector('.player-message');
    var started = false;
    var hlsInstance = null;

    function setMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function loadVideo() {
      var stream = video.getAttribute('data-video');
      if (!stream || started) {
        return;
      }
      started = true;
      video.setAttribute('controls', 'controls');
      setMessage('正在加载影片');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        var nativePlay = video.play();
        if (nativePlay && nativePlay.catch) {
          nativePlay.catch(function () {
            setMessage('点击画面继续播放');
          });
        }
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          var playPromise = video.play();
          if (playPromise && playPromise.catch) {
            playPromise.catch(function () {
              setMessage('点击画面继续播放');
            });
          }
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('播放失败，请稍后重试');
            if (hlsInstance) {
              hlsInstance.destroy();
              hlsInstance = null;
            }
          }
        });
        return;
      }

      video.src = stream;
      var fallbackPlay = video.play();
      if (fallbackPlay && fallbackPlay.catch) {
        fallbackPlay.catch(function () {
          setMessage('点击画面继续播放');
        });
      }
    }

    function startPlayback() {
      if (cover) {
        cover.classList.add('is-hidden');
      }
      loadVideo();
    }

    if (cover) {
      cover.addEventListener('click', startPlayback);
    }
    video.addEventListener('click', function () {
      if (!started) {
        startPlayback();
      }
    });
    video.addEventListener('playing', function () {
      setMessage('');
    });
  });
})();
