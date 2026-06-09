(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupMobileNav() {
    var toggle = qs('[data-nav-toggle]');
    var mobileNav = qs('[data-mobile-nav]');
    if (!toggle || !mobileNav) {
      return;
    }

    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', mobileNav.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
        dot.setAttribute('aria-current', dotIndex === current ? 'true' : 'false');
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupImageFallback() {
    qsa('img').forEach(function (img) {
      img.addEventListener('error', function () {
        var box = img.closest('.poster-wrap, .hero-poster, .hero-backdrop, .detail-cover, .detail-hero-bg, .rank-cover');
        if (box) {
          box.classList.add('is-missing');
        }
        img.remove();
      }, { once: true });
    });
  }

  function setupFilters() {
    var panel = qs('[data-filter-panel]');
    var grid = qs('[data-filter-grid]');
    if (!panel || !grid) {
      return;
    }

    var input = qs('[data-filter-keyword]', panel);
    var year = qs('[data-filter-year]', panel);
    var type = qs('[data-filter-type]', panel);
    var region = qs('[data-filter-region]', panel);
    var cards = qsa('[data-card]', grid);
    var count = qs('[data-result-count]');
    var empty = qs('[data-empty-state]');

    function apply() {
      var keyword = normalize(input && input.value);
      var yearValue = normalize(year && year.value);
      var typeValue = normalize(type && type.value);
      var regionValue = normalize(region && region.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var ok = true;
        ok = ok && (!keyword || haystack.indexOf(keyword) !== -1);
        ok = ok && (!yearValue || normalize(card.getAttribute('data-year')) === yearValue);
        ok = ok && (!typeValue || normalize(card.getAttribute('data-type')).indexOf(typeValue) !== -1);
        ok = ok && (!regionValue || normalize(card.getAttribute('data-region')).indexOf(regionValue) !== -1);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' 部影片';
      }
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, year, type, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  function setupSearchPage() {
    var root = qs('[data-search-page]');
    if (!root || !window.SEARCH_MOVIES) {
      return;
    }

    var input = qs('[data-search-input]', root);
    var year = qs('[data-search-year]', root);
    var type = qs('[data-search-type]', root);
    var region = qs('[data-search-region]', root);
    var results = qs('[data-search-results]', root);
    var count = qs('[data-search-count]', root);
    var empty = qs('[data-empty-state]', root);
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    function cardTemplate(movie) {
      return '' +
        '<a class="movie-card" href="movie/' + escapeHtml(movie.id) + '.html">' +
          '<div class="poster-wrap">' +
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 封面" loading="lazy">' +
            '<div class="poster-fallback">' + escapeHtml(movie.title) + '</div>' +
            '<span class="card-badge">' + escapeHtml(movie.category) + '</span>' +
            '<span class="card-rating">' + escapeHtml(movie.rating) + '</span>' +
          '</div>' +
          '<div class="card-body">' +
            '<h3 class="card-title">' + escapeHtml(movie.title) + '</h3>' +
            '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.year) + '</span></div>' +
            '<p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>' +
          '</div>' +
        '</a>';
    }

    function apply() {
      var keyword = normalize(input && input.value);
      var yearValue = normalize(year && year.value);
      var typeValue = normalize(type && type.value);
      var regionValue = normalize(region && region.value);
      var matched = window.SEARCH_MOVIES.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.oneLine,
          movie.category
        ].join(' '));
        var ok = true;
        ok = ok && (!keyword || haystack.indexOf(keyword) !== -1);
        ok = ok && (!yearValue || normalize(movie.year) === yearValue);
        ok = ok && (!typeValue || normalize(movie.type).indexOf(typeValue) !== -1);
        ok = ok && (!regionValue || normalize(movie.region).indexOf(regionValue) !== -1);
        return ok;
      }).slice(0, 240);

      results.innerHTML = matched.map(cardTemplate).join('');
      setupImageFallback();
      if (count) {
        var suffix = matched.length >= 240 ? '，已展示前 240 条结果' : '';
        count.textContent = '找到 ' + matched.length + ' 条匹配内容' + suffix;
      }
      if (empty) {
        empty.classList.toggle('is-visible', matched.length === 0);
      }
    }

    [input, year, type, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  function attachHls(video, source, status) {
    if (!source) {
      if (status) {
        status.textContent = '当前页面没有可用播放源。';
      }
      return;
    }

    if (source.indexOf('.m3u8') !== -1) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hlsInstance = hls;
      } else {
        video.src = source;
      }
    } else {
      video.src = source;
    }
  }

  function setupPlayers() {
    qsa('[data-player]').forEach(function (shell) {
      var video = qs('video', shell);
      var start = qs('[data-player-start]', shell);
      var status = qs('[data-player-status]') || qs('.player-status');
      var source = shell.getAttribute('data-video-url') || (video && video.getAttribute('data-src'));
      var initialized = false;

      function play() {
        if (!video) {
          return;
        }
        if (!initialized) {
          attachHls(video, source, status);
          initialized = true;
        }
        video.controls = true;
        var playPromise = video.play();
        shell.classList.add('is-playing');
        if (status) {
          status.textContent = '播放器已连接播放源，正在加载视频。';
        }
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            if (status) {
              status.textContent = '浏览器已阻止自动播放，请再次点击播放器开始播放。';
            }
            shell.classList.remove('is-playing');
          });
        }
      }

      if (start) {
        start.addEventListener('click', play);
      }
      shell.addEventListener('dblclick', play);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupHero();
    setupImageFallback();
    setupFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
