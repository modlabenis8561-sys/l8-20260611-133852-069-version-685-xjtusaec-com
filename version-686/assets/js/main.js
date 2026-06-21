(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initNavigation() {
        var nav = document.querySelector('.site-nav');
        var toggle = document.querySelector('.nav-toggle');
        if (!nav || !toggle) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            toggle.textContent = open ? '×' : '☰';
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        function activate(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                activate(i);
            });
        });
        window.setInterval(function () {
            activate(index + 1);
        }, 5200);
    }

    function initImageFallback() {
        document.querySelectorAll('img').forEach(function (img) {
            img.addEventListener('error', function () {
                img.classList.add('is-missing');
            }, { once: true });
        });
    }

    function initFilters() {
        document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
            var container = panel.parentElement.querySelector('[data-filter-list]');
            if (!container) {
                return;
            }
            var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card'));
            var keyword = panel.querySelector('[data-filter-keyword]');
            var yearSelect = panel.querySelector('[data-filter-year]');
            var typeSelect = panel.querySelector('[data-filter-type]');
            var years = Array.from(new Set(cards.map(function (card) { return card.dataset.year; }).filter(Boolean))).sort().reverse();
            var types = Array.from(new Set(cards.map(function (card) { return card.dataset.type; }).filter(Boolean))).sort();
            years.forEach(function (year) {
                var option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearSelect.appendChild(option);
            });
            types.forEach(function (type) {
                var option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                typeSelect.appendChild(option);
            });
            function apply() {
                var q = (keyword.value || '').trim().toLowerCase();
                var year = yearSelect.value;
                var type = typeSelect.value;
                cards.forEach(function (card) {
                    var text = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.year].join(' ').toLowerCase();
                    var match = (!q || text.indexOf(q) !== -1) && (!year || card.dataset.year === year) && (!type || card.dataset.type === type);
                    card.style.display = match ? '' : 'none';
                });
            }
            keyword.addEventListener('input', apply);
            yearSelect.addEventListener('change', apply);
            typeSelect.addEventListener('change', apply);
        });
    }

    function initSearchForms() {
        document.querySelectorAll('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (input && input.value.trim()) {
                    return;
                }
                if (form.classList.contains('search-large')) {
                    event.preventDefault();
                }
            });
        });
    }

    function createSearchCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card">',
            '<a href="' + escapeHtml(movie.url) + '" class="card-cover poster-cover">',
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="play-badge">▶</span>',
            '<span class="year-badge">' + escapeHtml(movie.year) + '</span>',
            '</a>',
            '<div class="card-body">',
            '<div class="meta-row"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
            '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '<p>' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="tag-row">' + tags + '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }

    function initSearchPage() {
        var results = document.querySelector('[data-search-results]');
        if (!results) {
            return;
        }
        var source = typeof MOVIE_INDEX !== 'undefined' ? MOVIE_INDEX : window.MOVIE_INDEX;
        if (!Array.isArray(source)) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        var input = document.querySelector('.search-large input[name="q"]');
        var summary = document.querySelector('[data-search-summary]');
        if (input) {
            input.value = query;
        }
        var matches = source.filter(function (movie) {
            if (!query) {
                return true;
            }
            var text = [movie.title, movie.year, movie.region, movie.type, movie.genre, (movie.tags || []).join(' '), movie.oneLine].join(' ').toLowerCase();
            return text.indexOf(query.toLowerCase()) !== -1;
        }).slice(0, 120);
        results.innerHTML = matches.map(createSearchCard).join('');
        if (summary) {
            summary.textContent = query ? '搜索结果：' + query : '热门内容';
        }
        initImageFallback();
    }

    function initPlayers() {
        document.querySelectorAll('[data-player]').forEach(function (player) {
            var video = player.querySelector('.video-player');
            var button = player.querySelector('.play-trigger');
            var status = player.querySelector('[data-player-status]');
            if (!video || !button) {
                return;
            }
            var source = video.getAttribute('data-video') || '';
            var started = false;
            function setStatus(text) {
                if (status) {
                    status.textContent = text;
                }
            }
            function start() {
                if (!source) {
                    setStatus('播放暂不可用');
                    return;
                }
                player.classList.add('is-playing');
                setStatus('正在播放');
                if (started) {
                    video.play().catch(function () {
                        setStatus('请再次点击播放');
                    });
                    return;
                }
                started = true;
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        maxBufferLength: 30
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {
                            setStatus('请再次点击播放');
                        });
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            try {
                                hls.destroy();
                            } catch (error) {}
                            video.src = source;
                            video.play().catch(function () {
                                setStatus('播放暂不可用');
                            });
                        }
                    });
                } else {
                    video.src = source;
                    video.play().catch(function () {
                        setStatus('请再次点击播放');
                    });
                }
            }
            button.addEventListener('click', start);
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                } else {
                    video.pause();
                    setStatus('已暂停');
                }
            });
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
                setStatus('正在播放');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    setStatus('已暂停');
                }
            });
        });
    }

    ready(function () {
        initNavigation();
        initHero();
        initImageFallback();
        initFilters();
        initSearchForms();
        initSearchPage();
        initPlayers();
    });
}());
