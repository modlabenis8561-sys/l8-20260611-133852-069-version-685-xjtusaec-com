
(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var video = document.getElementById('moviePlayer');
        var startButton = document.querySelector('[data-player-start]');
        var message = document.querySelector('[data-player-message]');
        var config = window.moviePlaybackSource || {};
        var sources = config.sources || [];
        var activeIndex = 0;
        var hls = null;
        var initialized = false;

        if (!video || !sources.length) {
            setMessage('未找到可用播放源。');
            return;
        }

        function setMessage(text) {
            if (message) {
                message.textContent = text;
            }
        }

        function destroyHls() {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        }

        function loadSource(index) {
            var source = sources[index] || sources[0];
            if (!source || !source.url) {
                setMessage('播放源无效。');
                return Promise.reject(new Error('Invalid source'));
            }

            destroyHls();
            initialized = true;
            setMessage('正在加载：' + (source.label || '高清线路'));

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source.url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setMessage('播放源已就绪。');
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setMessage('视频加载失败，请刷新或稍后重试。');
                    }
                });
                return Promise.resolve();
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source.url;
                setMessage('播放源已就绪。');
                return Promise.resolve();
            }

            video.src = source.url;
            setMessage('当前浏览器未检测到 HLS 能力，已尝试直接播放。');
            return Promise.resolve();
        }

        function playActiveSource() {
            var promise = initialized ? Promise.resolve() : loadSource(activeIndex);
            promise.then(function () {
                if (startButton) {
                    startButton.classList.add('is-hidden');
                }
                return video.play();
            }).catch(function () {
                setMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
                if (startButton) {
                    startButton.classList.remove('is-hidden');
                }
            });
        }

        if (startButton) {
            startButton.addEventListener('click', playActiveSource);
        }

        document.querySelectorAll('[data-source-index]').forEach(function (button) {
            button.addEventListener('click', function () {
                activeIndex = parseInt(button.getAttribute('data-source-index'), 10) || 0;
                initialized = false;
                document.querySelectorAll('[data-source-index]').forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                loadSource(activeIndex).then(function () {
                    if (!video.paused) {
                        video.play();
                    }
                });
            });
        });

        video.addEventListener('play', function () {
            if (startButton) {
                startButton.classList.add('is-hidden');
            }
        });

        video.addEventListener('pause', function () {
            if (video.currentTime === 0 && startButton) {
                startButton.classList.remove('is-hidden');
            }
        });
    });
}());
