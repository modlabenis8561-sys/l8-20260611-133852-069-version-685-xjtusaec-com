
(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-menu-button]');
        var links = document.querySelector('[data-nav-links]');
        if (!button || !links) {
            return;
        }

        button.addEventListener('click', function () {
            links.classList.toggle('open');
        });
    }

    function setupImageFallbacks() {
        document.querySelectorAll('img[data-fallback-title]').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('is-hidden');
                var parent = image.parentElement;
                if (parent) {
                    parent.classList.add('missing-image');
                    parent.setAttribute('data-title', image.getAttribute('data-fallback-title') || image.alt || '影片封面');
                }
            }, { once: true });
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            if (slides.length <= 1) {
                return;
            }
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function setupCardFilters() {
        document.querySelectorAll('[data-card-filter]').forEach(function (input) {
            var selector = input.getAttribute('data-card-filter') || 'body';
            var scope = document.querySelector(selector) || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
            var count = document.querySelector('[data-filter-count]');

            function filterCards() {
                var query = input.value.trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute('data-search-text') || card.textContent || '').toLowerCase();
                    var matched = !query || haystack.indexOf(query) !== -1;
                    card.classList.toggle('is-hidden', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = query ? '匹配到 ' + visible + ' 部影片' : '正在显示全部影片';
                }
            }

            input.addEventListener('input', filterCards);
            filterCards();
        });
    }

    function setupSorting() {
        document.querySelectorAll('[data-sort-select]').forEach(function (select) {
            var gridSelector = select.getAttribute('data-sort-grid');
            var grid = document.querySelector(gridSelector);
            if (!grid) {
                return;
            }
            var originalCards = Array.prototype.slice.call(grid.children);

            select.addEventListener('change', function () {
                var mode = select.value;
                var cards = Array.prototype.slice.call(grid.children);

                cards.sort(function (a, b) {
                    if (mode === 'views') {
                        return numberAttr(b, 'data-views') - numberAttr(a, 'data-views');
                    }
                    if (mode === 'likes') {
                        return numberAttr(b, 'data-likes') - numberAttr(a, 'data-likes');
                    }
                    if (mode === 'year') {
                        return numberAttr(b, 'data-year') - numberAttr(a, 'data-year');
                    }
                    if (mode === 'title') {
                        return textOf(a).localeCompare(textOf(b), 'zh-CN');
                    }
                    return originalCards.indexOf(a) - originalCards.indexOf(b);
                });

                cards.forEach(function (card) {
                    grid.appendChild(card);
                });
            });
        });
    }

    function numberAttr(element, name) {
        return parseInt(element.getAttribute(name), 10) || 0;
    }

    function textOf(element) {
        var heading = element.querySelector('h3');
        return heading ? heading.textContent.trim() : element.textContent.trim();
    }

    function setupShareButtons() {
        document.querySelectorAll('[data-copy-link]').forEach(function (button) {
            button.addEventListener('click', function () {
                var url = window.location.href;
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(url).then(function () {
                        button.textContent = '链接已复制';
                    });
                }
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupImageFallbacks();
        setupHero();
        setupCardFilters();
        setupSorting();
        setupShareButtons();
    });
}());
