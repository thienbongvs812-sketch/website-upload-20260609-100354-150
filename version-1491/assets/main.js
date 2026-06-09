(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    ready(function () {
        var toggle = document.querySelector('[data-nav-toggle]');
        if (toggle) {
            toggle.addEventListener('click', function () {
                document.body.classList.toggle('nav-open');
            });
        }

        document.querySelectorAll('.site-nav a').forEach(function (link) {
            link.addEventListener('click', function () {
                document.body.classList.remove('nav-open');
            });
        });

        document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
            var input = scope.querySelector('[data-movie-search]');
            var selects = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-filter]'));
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

            function normalize(value) {
                return String(value || '').trim().toLowerCase();
            }

            function applyFilters() {
                var keyword = normalize(input ? input.value : '');
                var filters = selects.map(function (select) {
                    return {
                        key: select.getAttribute('data-movie-filter'),
                        value: normalize(select.value)
                    };
                });

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search-text'));
                    var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchedFilters = filters.every(function (filter) {
                        if (!filter.value) {
                            return true;
                        }
                        return normalize(card.getAttribute('data-' + filter.key)).indexOf(filter.value) !== -1;
                    });
                    card.classList.toggle('hidden-card', !(matchedKeyword && matchedFilters));
                });
            }

            if (input) {
                input.addEventListener('input', applyFilters);
            }
            selects.forEach(function (select) {
                select.addEventListener('change', applyFilters);
            });
        });

        document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-dot]'));
            if (!slides.length) {
                return;
            }
            var current = 0;
            var timer = null;

            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, position) {
                    slide.classList.toggle('is-active', position === current);
                });
                dots.forEach(function (dot, position) {
                    dot.classList.toggle('is-active', position === current);
                });
            }

            function start() {
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            dots.forEach(function (dot, position) {
                dot.addEventListener('click', function () {
                    show(position);
                    start();
                });
            });

            show(0);
            start();
        });
    });
})();
