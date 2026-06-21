(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }

        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
        script.onload = callback;
        document.head.appendChild(script);
    }

    function attachSource(video, source, callback) {
        if (video.dataset.ready === "true") {
            callback();
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.dataset.ready = "true";
            callback();
            return;
        }

        loadHls(function () {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.dataset.ready = "true";
                    callback();
                });
            } else {
                video.src = source;
                video.dataset.ready = "true";
                callback();
            }
        });
    }

    function startPlayer(shell) {
        var video = shell.querySelector("video");
        var overlay = shell.querySelector(".play-overlay");
        var source = video ? video.dataset.src : "";

        if (!video || !source) {
            return;
        }

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        }

        function play() {
            hideOverlay();
            attachSource(video, source, function () {
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        video.controls = true;
                    });
                }
            });
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });

        video.addEventListener("play", hideOverlay);
    }

    ready(function () {
        document.querySelectorAll("[data-player]").forEach(startPlayer);
    });
})();
