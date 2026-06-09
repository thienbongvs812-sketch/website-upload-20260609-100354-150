(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileNavigation() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHeroCarousel() {
        var root = document.querySelector('[data-hero-carousel]');
        if (!root) {
            return;
        }
        var slides = all('.hero-slide', root);
        var dots = all('.hero-dot', root);
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        all('[data-filter-area]').forEach(function (form) {
            var section = form.closest('.content-section') || document;
            var cards = all('.movie-card', section);
            var search = form.querySelector('[data-search-input]');
            var year = form.querySelector('[data-year-select]');
            var type = form.querySelector('[data-type-select]');
            var region = form.querySelector('[data-region-select]');

            function apply() {
                var query = search ? search.value.trim().toLowerCase() : '';
                var yearValue = year ? year.value : '';
                var typeValue = type ? type.value : '';
                var regionValue = region ? region.value : '';

                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-title') || '').toLowerCase();
                    var tags = (card.getAttribute('data-tags') || '').toLowerCase();
                    var matchedQuery = !query || text.indexOf(query) >= 0 || tags.indexOf(query) >= 0;
                    var matchedYear = !yearValue || card.getAttribute('data-year') === yearValue;
                    var matchedType = !typeValue || card.getAttribute('data-type') === typeValue;
                    var matchedRegion = !regionValue || card.getAttribute('data-region') === regionValue;
                    card.hidden = !(matchedQuery && matchedYear && matchedType && matchedRegion);
                });
            }

            if (search && window.URLSearchParams) {
                var queryValue = new URLSearchParams(window.location.search).get('q');
                if (queryValue) {
                    search.value = queryValue;
                }
            }

            apply();

            ['input', 'change'].forEach(function (eventName) {
                form.addEventListener(eventName, apply);
            });
        });
    }

    window.setupMoviePlayer = function (videoUrl, rootId) {
        var root = document.getElementById(rootId);
        if (!root) {
            return;
        }
        var video = root.querySelector('video');
        var overlay = root.querySelector('[data-player-button]');
        var message = root.querySelector('[data-player-message]');
        var hls = null;
        var ready = false;

        function setMessage(text) {
            if (message) {
                message.textContent = text || '';
            }
        }

        function bindSource() {
            if (ready || !video) {
                return;
            }
            ready = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(videoUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setMessage('播放暂时不可用');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = videoUrl;
            } else {
                setMessage('播放暂时不可用');
            }
        }

        function play() {
            bindSource();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    setMessage('点击视频继续播放');
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileNavigation();
        setupHeroCarousel();
        setupFilters();
    });
}());
