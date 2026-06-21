(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    ready(function () {
        var toggle = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-nav-menu]");

        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }

        var inputs = document.querySelectorAll("[data-search-input]");
        inputs.forEach(function (input) {
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("keyword");
            if (initial && !input.value) {
                input.value = initial;
            }

            function filterCards() {
                var query = normalize(input.value);
                var cards = document.querySelectorAll("[data-card]");
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.year,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.genre,
                        card.dataset.tags,
                        card.textContent
                    ].join(" "));
                    card.classList.toggle("is-hidden", query && haystack.indexOf(query) === -1);
                });
            }

            input.addEventListener("input", filterCards);
            if (input.value) {
                filterCards();
            }
        });

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var index = 0;

            function show(next) {
                index = (next + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    show(dotIndex);
                });
            });

            if (slides.length > 1) {
                setInterval(function () {
                    show(index + 1);
                }, 5200);
            }
        }
    });
})();
