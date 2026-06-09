(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        var toggle = document.querySelector('[data-menu-toggle]');
        var mobileNav = document.querySelector('[data-mobile-nav]');

        if (toggle && mobileNav) {
            toggle.addEventListener('click', function () {
                mobileNav.classList.toggle('open');
            });
        }

        document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
            var prev = carousel.querySelector('[data-hero-prev]');
            var next = carousel.querySelector('[data-hero-next]');
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('active', i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('active', i === current);
                });
            }

            function nextSlide() {
                show(current + 1);
            }

            function start() {
                stop();
                timer = window.setInterval(nextSlide, 5000);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(Number(dot.getAttribute('data-hero-dot')) || 0);
                    start();
                });
            });

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

            carousel.addEventListener('mouseenter', stop);
            carousel.addEventListener('mouseleave', start);
            show(0);
            start();
        });

        var searchInput = document.querySelector('[data-filter-input]');
        var filterSelect = document.querySelector('[data-filter-select]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-list .movie-card'));
        var count = document.querySelector('[data-result-count]');

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilter() {
            var keyword = normalize(searchInput && searchInput.value);
            var selected = normalize(filterSelect && filterSelect.value);
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.textContent
                ].join(' '));
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchSelected = !selected || text.indexOf(selected) !== -1;
                var show = matchKeyword && matchSelected;

                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = visible + ' 部影片';
            }
        }

        if (searchInput || filterSelect) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q') || params.get('year') || '';
            if (searchInput && query) {
                searchInput.value = query;
            }
            if (searchInput) {
                searchInput.addEventListener('input', applyFilter);
            }
            if (filterSelect) {
                filterSelect.addEventListener('change', applyFilter);
            }
            applyFilter();
        }

        document.querySelectorAll('[data-player]').forEach(function (shell) {
            var video = shell.querySelector('video');
            var button = shell.querySelector('[data-play-button]');

            function startPlayer() {
                if (!video) {
                    return;
                }
                var src = video.getAttribute('data-video-src');
                if (!src) {
                    return;
                }
                if (!video.getAttribute('data-ready')) {
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = src;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls();
                        hls.loadSource(src);
                        hls.attachMedia(video);
                        video.hlsInstance = hls;
                    } else {
                        video.src = src;
                    }
                    video.setAttribute('data-ready', 'true');
                }
                shell.classList.add('is-playing');
                video.play().catch(function () {});
            }

            if (button) {
                button.addEventListener('click', startPlayer);
            }

            video.addEventListener('click', function () {
                if (!video.getAttribute('data-ready')) {
                    startPlayer();
                }
            });

            var scrollPlay = document.querySelector('[data-scroll-play]');
            if (scrollPlay) {
                scrollPlay.addEventListener('click', function () {
                    window.setTimeout(startPlayer, 120);
                });
            }
        });
    });
})();
