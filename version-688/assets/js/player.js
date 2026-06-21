(function () {
    function getHls(callback) {
        if (window.Hls) {
            callback(window.Hls);
            return;
        }
        if (typeof import === "function") {
            import("./assets/js/hls-vendor-dru42stk.js")
                .then(function (module) {
                    callback(module.H || null);
                })
                .catch(function () {
                    callback(null);
                });
        } else {
            callback(null);
        }
    }

    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        document.querySelectorAll(".movie-player").forEach(function (shell) {
            var video = shell.querySelector("video");
            var button = shell.querySelector(".play-layer");
            var source = shell.getAttribute("data-stream");
            var loaded = false;
            var hlsInstance = null;

            function begin() {
                if (!video || !source) {
                    return;
                }

                function playNow() {
                    if (button) {
                        button.classList.add("is-hidden");
                    }
                    video.controls = true;
                    var promise = video.play();
                    if (promise && typeof promise.catch === "function") {
                        promise.catch(function () {});
                    }
                }

                if (loaded) {
                    playNow();
                    return;
                }

                loaded = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.addEventListener("loadedmetadata", playNow, { once: true });
                    video.load();
                    playNow();
                    return;
                }

                getHls(function (Hls) {
                    if (Hls && Hls.isSupported()) {
                        hlsInstance = new Hls({ enableWorker: true });
                        hlsInstance.loadSource(source);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(Hls.Events.MANIFEST_PARSED, playNow);
                        shell._hls = hlsInstance;
                    } else {
                        video.src = source;
                        video.load();
                        playNow();
                    }
                });
            }

            if (button) {
                button.addEventListener("click", begin);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (!loaded) {
                        begin();
                    }
                });
            }
        });
    });
})();
