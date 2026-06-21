(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var links = document.querySelector("[data-nav-links]");
    if (toggle && links) {
      toggle.addEventListener("click", function() {
        links.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var heroIndex = 0;

    function showHero(index) {
      if (!slides.length) {
        return;
      }
      heroIndex = (index + slides.length) % slides.length;
      slides.forEach(function(slide, current) {
        slide.classList.toggle("is-active", current === heroIndex);
      });
      dots.forEach(function(dot, current) {
        dot.classList.toggle("is-active", current === heroIndex);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        showHero(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function() {
        showHero(heroIndex + 1);
      }, 5200);
    }

    var searchInput = document.getElementById("site-search");
    var searchResults = document.getElementById("search-results");
    var searchStatus = document.getElementById("search-status");

    if (searchInput && searchResults) {
      var cards = Array.prototype.slice.call(searchResults.querySelectorAll(".video-card"));
      searchInput.addEventListener("input", function() {
        var keyword = searchInput.value.trim().toLowerCase();
        var shown = 0;
        cards.forEach(function(card) {
          var haystack = card.getAttribute("data-search") || "";
          var matched = !keyword || haystack.indexOf(keyword) !== -1;
          card.hidden = !matched;
          if (matched) {
            shown += 1;
          }
        });
        if (searchStatus) {
          searchStatus.textContent = keyword ? "找到 " + shown + " 个相关视频" : "输入关键词查找您喜欢的视频";
        }
      });
    }

    var config = window.__PLAY_CONFIG;
    var video = document.getElementById("movie-player");
    var overlay = document.getElementById("player-overlay");

    if (!config || !video) {
      return;
    }

    var hlsInstance = null;
    var initialized = false;
    var hlsLoading = false;
    var source = config.source;

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function showOverlay() {
      if (overlay && video.paused) {
        overlay.classList.remove("is-hidden");
      }
    }

    function attachWithHls() {
      if (initialized) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        initialized = true;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        initialized = true;
      }
    }

    function loadHlsLibrary(callback) {
      if (window.Hls) {
        callback();
        return;
      }
      if (hlsLoading) {
        var timer = window.setInterval(function() {
          if (window.Hls) {
            window.clearInterval(timer);
            callback();
          }
        }, 100);
        return;
      }
      hlsLoading = true;
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
      script.async = true;
      script.onload = function() {
        callback();
      };
      script.onerror = function() {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          initialized = true;
        }
      };
      document.head.appendChild(script);
    }

    function ensurePlayer(callback) {
      if (initialized) {
        callback();
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        attachWithHls();
        callback();
        return;
      }
      loadHlsLibrary(function() {
        attachWithHls();
        callback();
      });
    }

    function startPlayback() {
      ensurePlayer(function() {
        var playTask = video.play();
        hideOverlay();
        if (playTask && typeof playTask.catch === "function") {
          playTask.catch(function() {
            showOverlay();
          });
        }
      });
    }

    function togglePlayback() {
      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    }

    loadHlsLibrary(attachWithHls);

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }

    video.addEventListener("play", hideOverlay);
    video.addEventListener("pause", showOverlay);
    video.addEventListener("ended", showOverlay);
    video.addEventListener("click", function(event) {
      if (event.target === video) {
        togglePlayback();
      }
    });

    window.addEventListener("pagehide", function() {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  });
})();
