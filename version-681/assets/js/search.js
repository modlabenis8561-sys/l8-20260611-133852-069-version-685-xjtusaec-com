(function () {
  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name) || '';
  }

  var input = document.querySelector('.search-input');
  var typeSelect = document.querySelector('.search-type');
  var regionSelect = document.querySelector('.search-region');
  var form = document.querySelector('.search-panel');
  var results = document.querySelector('.search-results');
  var note = document.querySelector('.search-note');
  var movies = window.SEARCH_MOVIES || [];

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + '</span>';
    }).join('');
    return '' +
      '<article class="movie-card">' +
        '<a class="poster-wrap" href="' + escapeHtml(movie.url) + '">' +
          '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="poster-badge">' + escapeHtml(movie.year || '热播') + '</span>' +
        '</a>' +
        '<div class="movie-info">' +
          '<h3 class="movie-title"><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
          '<div class="movie-meta"><span>' + escapeHtml([movie.year, movie.region, movie.type].filter(Boolean).join(' · ')) + '</span></div>' +
          '<p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
      '</article>';
  }

  function apply() {
    var keyword = (input.value || '').trim().toLowerCase();
    var type = typeSelect.value;
    var region = regionSelect.value;
    var matched = movies.filter(function (movie) {
      var haystack = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.oneLine, (movie.tags || []).join(' ')].join(' ').toLowerCase();
      if (keyword && haystack.indexOf(keyword) === -1) {
        return false;
      }
      if (type && movie.type !== type) {
        return false;
      }
      if (region && movie.region !== region) {
        return false;
      }
      return true;
    }).slice(0, 120);
    results.innerHTML = matched.map(card).join('') || '<p class="result-note">未找到匹配影片，可尝试更换关键词。</p>';
    note.textContent = '当前显示 ' + matched.length + ' 部影片';
  }

  if (input) {
    input.value = getParam('q');
  }
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    apply();
  });
  [input, typeSelect, regionSelect].forEach(function (node) {
    node.addEventListener('input', apply);
    node.addEventListener('change', apply);
  });
  apply();
})();
