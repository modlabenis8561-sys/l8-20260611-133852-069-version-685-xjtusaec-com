const searchIndex = window.searchIndex || [];

const normalize = (value) => String(value || '').trim().toLowerCase();

function initMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const panel = document.querySelector('.mobile-panel');
  if (!toggle || !panel) {
    return;
  }
  toggle.addEventListener('click', () => {
    panel.classList.toggle('open');
    toggle.textContent = panel.classList.contains('open') ? '×' : '☰';
  });
}

function initHeroSlider() {
  const root = document.querySelector('[data-hero-slider]');
  if (!root) {
    return;
  }
  const slides = Array.from(root.querySelectorAll('.hero-slide'));
  const dots = Array.from(root.querySelectorAll('.hero-dot'));
  const prev = root.querySelector('.hero-prev');
  const next = root.querySelector('.hero-next');
  let current = 0;
  let timer = null;

  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, idx) => slide.classList.toggle('active', idx === current));
    dots.forEach((dot, idx) => dot.classList.toggle('active', idx === current));
  };

  const start = () => {
    timer = window.setInterval(() => show(current + 1), 5200);
  };

  const restart = () => {
    if (timer) {
      window.clearInterval(timer);
    }
    start();
  };

  prev?.addEventListener('click', () => {
    show(current - 1);
    restart();
  });
  next?.addEventListener('click', () => {
    show(current + 1);
    restart();
  });
  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      show(idx);
      restart();
    });
  });

  if (slides.length > 1) {
    start();
  }
}

function initFilters() {
  const panel = document.querySelector('.filter-panel');
  const list = document.querySelector('.filter-list');
  if (!panel || !list) {
    return;
  }
  const keyword = panel.querySelector('.filter-keyword');
  const year = panel.querySelector('.filter-year');
  const type = panel.querySelector('.filter-type');
  const sort = panel.querySelector('.filter-sort');
  const empty = document.querySelector('.empty-state');
  const original = Array.from(list.children);

  const apply = () => {
    const q = normalize(keyword?.value);
    const y = normalize(year?.value);
    const t = normalize(type?.value);
    let items = original.filter((item) => {
      const text = normalize(item.dataset.title + ' ' + item.dataset.region + ' ' + item.dataset.type);
      const yearOk = !y || normalize(item.dataset.year) === y;
      const typeOk = !t || normalize(item.dataset.type) === t;
      const queryOk = !q || text.includes(q);
      return yearOk && typeOk && queryOk;
    });

    const mode = sort?.value;
    if (mode === 'year-desc') {
      items.sort((a, b) => Number(b.dataset.year || 0) - Number(a.dataset.year || 0));
    }
    if (mode === 'views-desc') {
      items.sort((a, b) => Number(b.dataset.views || 0) - Number(a.dataset.views || 0));
    }
    if (mode === 'rating-desc') {
      items.sort((a, b) => Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0));
    }

    list.innerHTML = '';
    items.forEach((item) => list.appendChild(item));
    if (empty) {
      empty.classList.toggle('show', items.length === 0);
    }
  };

  [keyword, year, type, sort].forEach((control) => control?.addEventListener('input', apply));
  [year, type, sort].forEach((control) => control?.addEventListener('change', apply));
}

function cardTemplate(item) {
  const tags = Array.isArray(item.tags) ? item.tags.slice(0, 3) : [];
  return `<article class="movie-card" data-title="${escapeHtml(item.title)}" data-year="${item.year}" data-type="${escapeHtml(item.type)}" data-region="${escapeHtml(item.region)}" data-views="${item.views}" data-rating="${item.rating}">
    <a class="poster-link" href="${item.url}">
      <img src="${item.cover}" alt="${escapeHtml(item.title)}" loading="lazy">
      <span class="poster-badge">${item.year}</span>
    </a>
    <div class="card-body">
      <a class="card-title" href="${item.url}">${escapeHtml(item.title)}</a>
      <div class="card-meta">${escapeHtml(item.region)} · ${escapeHtml(item.type)} · ${escapeHtml(item.genre)} · ${escapeHtml(item.rating)}分</div>
      <p>${escapeHtml(item.summary)}</p>
      <div class="tag-row">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
    </div>
  </article>`;
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function initSearchPage() {
  const input = document.querySelector('.search-page-input');
  const results = document.querySelector('.search-results');
  if (!input || !results) {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q') || '';
  input.value = query;

  const render = (q) => {
    const key = normalize(q);
    if (!key) {
      return;
    }
    const matched = searchIndex.filter((item) => {
      const haystack = normalize([
        item.title,
        item.year,
        item.region,
        item.type,
        item.genre,
        item.summary,
        ...(item.tags || [])
      ].join(' '));
      return haystack.includes(key);
    }).slice(0, 120);
    results.innerHTML = matched.map(cardTemplate).join('');
    const empty = document.querySelector('.empty-state');
    if (empty) {
      empty.classList.toggle('show', matched.length === 0);
    }
  };

  render(query);
}

function initMoviePlayers() {
  document.querySelectorAll('.movie-player').forEach((player) => {
    const video = player.querySelector('video');
    const cover = player.querySelector('.player-cover');
    const stream = player.dataset.stream;
    let hlsInstance = null;
    let ready = false;

    const play = async () => {
      if (!video || !stream) {
        return;
      }
      cover?.classList.add('is-hidden');
      if (!ready) {
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.addEventListener('loadedmetadata', () => video.play().catch(() => {}), { once: true });
        } else {
          const Hls = window.Hls;
          if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
            hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
              if (!data || !data.fatal) {
                return;
              }
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                hlsInstance.startLoad();
              } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                hlsInstance.recoverMediaError();
              } else {
                hlsInstance.destroy();
              }
            });
          } else {
            video.src = stream;
          }
        }
      }
      video.play().catch(() => {});
    };

    cover?.addEventListener('click', play);
    video?.addEventListener('click', () => {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener('beforeunload', () => hlsInstance?.destroy());
  });
}

initMenu();
initHeroSlider();
initFilters();
initSearchPage();
initMoviePlayers();
