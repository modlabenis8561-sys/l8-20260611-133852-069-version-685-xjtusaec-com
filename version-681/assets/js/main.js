(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var navToggle = qs('.nav-toggle');
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
    });
  }

  var slides = qsa('.hero-slide');
  var dots = qsa('.hero-dot');
  if (slides.length > 1) {
    var activeIndex = 0;
    var showSlide = function (index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });
    setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  qsa('.js-filter-area').forEach(function (area) {
    var cards = qsa('.movie-card', area);
    var input = qs('.js-filter-input', area);
    var selects = qsa('.js-filter-select', area);
    var countNode = qs('.js-result-count', area);
    var apply = function () {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var filters = {};
      selects.forEach(function (select) {
        filters[select.getAttribute('data-filter')] = select.value;
      });
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var matched = !keyword || text.indexOf(keyword) !== -1;
        Object.keys(filters).forEach(function (name) {
          if (filters[name] && card.getAttribute('data-' + name) !== filters[name]) {
            matched = false;
          }
        });
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (countNode) {
        countNode.textContent = '当前显示 ' + visible + ' 部影片';
      }
    };
    if (input) {
      input.addEventListener('input', apply);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });
    apply();
  });
})();
