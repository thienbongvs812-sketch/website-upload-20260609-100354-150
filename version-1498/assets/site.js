(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      toggle.textContent = nav.classList.contains('open') ? '×' : '☰';
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener('click', function () {
        show(current);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupSearch() {
    var inputs = selectAll('[data-movie-search]');
    inputs.forEach(function (input) {
      var section = input.closest('section') || document;
      var regionFilter = section.querySelector('[data-filter-region]');
      var yearFilter = section.querySelector('[data-filter-year]');
      var cards = selectAll('[data-movie-card]', section);

      function apply() {
        var keyword = input.value.trim().toLowerCase();
        var region = regionFilter ? regionFilter.value : '';
        var year = yearFilter ? parseInt(yearFilter.value, 10) : 0;
        cards.forEach(function (card) {
          var text = [
            card.dataset.title,
            card.dataset.genre,
            card.dataset.region,
            card.dataset.year,
            card.dataset.tags
          ].join(' ').toLowerCase();
          var regionMatch = !region || (card.dataset.region || '').indexOf(region) !== -1;
          var yearMatch = !year || parseInt(card.dataset.year || '0', 10) >= year;
          card.hidden = !(text.indexOf(keyword) !== -1 && regionMatch && yearMatch);
        });
      }

      input.addEventListener('input', apply);
      if (regionFilter) {
        regionFilter.addEventListener('change', apply);
      }
      if (yearFilter) {
        yearFilter.addEventListener('change', apply);
      }
    });
  }

  function setupScrollTop() {
    var button = document.createElement('button');
    button.className = 'scroll-top';
    button.type = 'button';
    button.setAttribute('aria-label', '返回顶部');
    button.textContent = '↑';
    document.body.appendChild(button);

    function update() {
      button.classList.toggle('visible', window.scrollY > 360);
    }

    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = document.querySelector('[data-player-video]');
    var overlay = document.querySelector('[data-player-overlay]');
    var button = document.querySelector('[data-player-button]');
    if (!video || !streamUrl) {
      return;
    }

    function attach() {
      if (video.dataset.ready === '1') {
        return;
      }
      video.dataset.ready = '1';
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function start(event) {
      if (event) {
        event.preventDefault();
      }
      attach();
      if (overlay) {
        overlay.classList.add('hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }
    if (button) {
      button.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (video.dataset.ready !== '1') {
        start();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupScrollTop();
  });
})();
