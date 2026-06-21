(function() {
    function startMoviePlayer(video, cover, streamUrl) {
        if (!video || !streamUrl) {
            return;
        }
        var loaded = false;
        var hls = null;

        function attachStream() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function playVideo() {
            attachStream();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            var playRequest = video.play();
            if (playRequest && typeof playRequest.catch === 'function') {
                playRequest.catch(function() {
                    if (cover && video.paused) {
                        cover.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (cover) {
            cover.addEventListener('click', playVideo);
        }

        video.addEventListener('click', function() {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener('play', function() {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });

        window.addEventListener('pagehide', function() {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    window.startMoviePlayer = startMoviePlayer;
}());
