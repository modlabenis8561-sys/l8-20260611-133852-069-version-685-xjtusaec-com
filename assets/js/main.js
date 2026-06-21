(function() {
    function queryAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = document.querySelector('[data-mobile-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');
    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function() {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var slides = queryAll('[data-hero-slide]');
    if (slides.length > 0) {
        var dots = queryAll('[data-hero-dot]');
        var thumbs = queryAll('[data-hero-thumb]');
        var prev = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function activate(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
            thumbs.forEach(function(thumb, thumbIndex) {
                thumb.classList.toggle('is-active', thumbIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function() {
                activate(current + 1);
            }, 5200);
        }

        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                activate(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function() {
                activate(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function() {
                activate(current + 1);
                restart();
            });
        }

        restart();
    }

    var filterPanel = document.querySelector('[data-filter-panel]');
    if (filterPanel) {
        var textInput = filterPanel.querySelector('[data-local-filter]');
        var yearSelect = filterPanel.querySelector('[data-year-filter]');
        var regionSelect = filterPanel.querySelector('[data-region-filter]');
        var cards = queryAll('[data-filter-card]');
        var empty = document.querySelector('[data-filter-empty]');

        function applyFilter() {
            var keyword = textInput ? textInput.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';
            var region = regionSelect ? regionSelect.value : '';
            var visible = 0;
            cards.forEach(function(card) {
                var text = card.getAttribute('data-title') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var cardRegion = card.getAttribute('data-region') || '';
                var matched = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (year && cardYear !== year) {
                    matched = false;
                }
                if (region && cardRegion !== region) {
                    matched = false;
                }
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [textInput, yearSelect, regionSelect].forEach(function(control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    }

    var searchResults = document.querySelector('[data-search-results]');
    if (searchResults && window.SEARCH_MOVIES) {
        var params = new URLSearchParams(window.location.search);
        var keyword = (params.get('q') || '').trim();
        var searchInput = document.querySelector('[data-search-input]');
        var searchTitle = document.querySelector('[data-search-title]');
        var searchEmpty = document.querySelector('[data-search-empty]');
        if (searchInput) {
            searchInput.value = keyword;
        }

        function createCard(movie) {
            var tags = [movie.region, movie.year, movie.type].filter(Boolean).map(function(item) {
                return '<span>' + escapeHtml(item) + '</span>';
            }).join('');
            return [
                '<article class="movie-card">',
                '    <a class="movie-card-link" href="' + escapeHtml(movie.link) + '">',
                '        <span class="card-media">',
                '            <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '            <span class="card-badge">' + escapeHtml(movie.categoryName) + '</span>',
                '        </span>',
                '        <span class="card-content">',
                '            <strong class="card-title">' + escapeHtml(movie.title) + '</strong>',
                '            <span class="card-desc">' + escapeHtml(movie.oneLine) + '</span>',
                '            <span class="card-meta">' + tags + '</span>',
                '        </span>',
                '    </a>',
                '</article>'
            ].join('');
        }

        function escapeHtml(value) {
            return String(value || '').replace(/[&<>"]/g, function(mark) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;'
                }[mark];
            });
        }

        function render() {
            var q = keyword.toLowerCase();
            var list = window.SEARCH_MOVIES;
            if (q) {
                list = list.filter(function(movie) {
                    return movie.text.indexOf(q) !== -1;
                });
                if (searchTitle) {
                    searchTitle.textContent = '“' + keyword + '”的搜索结果';
                }
            }
            if (!q) {
                list = list.slice(0, 24);
            } else {
                list = list.slice(0, 80);
            }
            searchResults.innerHTML = list.map(createCard).join('');
            if (searchEmpty) {
                searchEmpty.hidden = list.length !== 0;
            }
        }

        render();
    }
}());
