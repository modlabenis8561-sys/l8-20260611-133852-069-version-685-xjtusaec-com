(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");

        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = "./search.html";
                }
            });
        });

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var hero = document.querySelector("[data-hero]");
        var active = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === active);
            });
        }

        function startHero() {
            stopHero();
            if (slides.length > 1) {
                timer = window.setInterval(function () {
                    showSlide(active + 1);
                }, 5200);
            }
        }

        function stopHero() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (slides.length) {
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    showSlide(i);
                    startHero();
                });
            });
            if (prev) {
                prev.addEventListener("click", function () {
                    showSlide(active - 1);
                    startHero();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    showSlide(active + 1);
                    startHero();
                });
            }
            if (hero) {
                hero.addEventListener("mouseenter", stopHero);
                hero.addEventListener("mouseleave", startHero);
            }
            startHero();
        }

        var searchInput = document.querySelector("[data-search-input]");
        var categoryFilter = document.querySelector("[data-category-filter]");
        var yearFilter = document.querySelector("[data-year-filter]");
        var typeFilter = document.querySelector("[data-type-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
        var emptyResult = document.querySelector("[data-empty-result]");

        function normalized(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilters() {
            if (!cards.length || !searchInput) {
                return;
            }
            var keyword = normalized(searchInput.value);
            var category = categoryFilter ? categoryFilter.value : "";
            var year = yearFilter ? yearFilter.value : "";
            var type = typeFilter ? typeFilter.value : "";
            var shown = 0;

            cards.forEach(function (card) {
                var text = normalized(card.getAttribute("data-search"));
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchCategory = !category || card.getAttribute("data-category") === category;
                var matchYear = !year || card.getAttribute("data-year") === year;
                var matchType = !type || card.getAttribute("data-type") === type;
                var visible = matchKeyword && matchCategory && matchYear && matchType;
                card.hidden = !visible;
                if (visible) {
                    shown += 1;
                }
            });

            if (emptyResult) {
                emptyResult.classList.toggle("is-visible", shown === 0);
            }
        }

        if (searchInput) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            searchInput.value = query;
            [searchInput, categoryFilter, yearFilter, typeFilter].forEach(function (field) {
                if (field) {
                    field.addEventListener("input", applyFilters);
                    field.addEventListener("change", applyFilters);
                }
            });
            applyFilters();
        }
    });
})();
