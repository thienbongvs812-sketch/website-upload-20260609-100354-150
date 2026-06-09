// Generated static movie website interactions.
(function () {
    var HLS_CDN = "https://cdn.jsdelivr.net/npm/hls.js@latest";
    var hlsLoadingPromise = null;

    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function loadHlsScript() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (hlsLoadingPromise) {
            return hlsLoadingPromise;
        }

        hlsLoadingPromise = new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = HLS_CDN;
            script.async = true;
            script.onload = function () {
                if (window.Hls) {
                    resolve(window.Hls);
                } else {
                    reject(new Error("Hls.js 未能正确加载"));
                }
            };
            script.onerror = function () {
                reject(new Error("Hls.js 加载失败"));
            };
            document.head.appendChild(script);
        });

        return hlsLoadingPromise;
    }

    function setupNavigation() {
        var toggle = qs("[data-nav-toggle]");
        var mobileNav = qs("[data-mobile-nav]");

        if (!toggle || !mobileNav) {
            return;
        }

        toggle.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var carousel = qs("[data-hero-carousel]");

        if (!carousel) {
            return;
        }

        var slides = qsa("[data-hero-slide]", carousel);
        var dots = qsa("[data-hero-dot]", carousel);
        var prev = qs("[data-hero-prev]", carousel);
        var next = qs("[data-hero-next]", carousel);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function cardText(card) {
        return normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.year,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.tags
        ].join(" "));
    }

    function fillSearchSelects(panel, cards) {
        var yearSelect = qs("[data-filter-year]", panel);
        var typeSelect = qs("[data-filter-type]", panel);

        if (yearSelect && yearSelect.options.length <= 1) {
            var years = Array.from(new Set(cards.map(function (card) {
                return card.dataset.year || "";
            }).filter(Boolean))).sort().reverse();

            years.slice(0, 40).forEach(function (year) {
                var option = document.createElement("option");
                option.value = year;
                option.textContent = year;
                yearSelect.appendChild(option);
            });
        }

        if (typeSelect && typeSelect.options.length <= 1) {
            var types = Array.from(new Set(cards.map(function (card) {
                return card.dataset.type || "";
            }).filter(Boolean))).sort();

            types.slice(0, 80).forEach(function (type) {
                var option = document.createElement("option");
                option.value = type;
                option.textContent = type;
                typeSelect.appendChild(option);
            });
        }
    }

    function setupFilters() {
        qsa("[data-filter-panel]").forEach(function (panel) {
            var scope = panel.parentElement ? qs("[data-filter-scope]", panel.parentElement) : null;
            var cards = scope ? qsa("[data-movie-card]", scope) : [];
            var input = qs("[data-filter-input]", panel);
            var yearSelect = qs("[data-filter-year]", panel);
            var typeSelect = qs("[data-filter-type]", panel);
            var resetButton = qs("[data-filter-reset]", panel);
            var count = qs("[data-filter-count]", panel);

            if (!cards.length) {
                return;
            }

            fillSearchSelects(panel, cards);

            function apply() {
                var keyword = normalize(input ? input.value : "");
                var year = yearSelect ? yearSelect.value : "";
                var type = typeSelect ? typeSelect.value : "";
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var matchesKeyword = !keyword || cardText(card).indexOf(keyword) !== -1;
                    var matchesYear = !year || card.dataset.year === year;
                    var matchesType = !type || card.dataset.type === type;
                    var visible = matchesKeyword && matchesYear && matchesType;

                    card.style.display = visible ? "" : "none";
                    if (visible) {
                        visibleCount += 1;
                    }
                });

                if (count) {
                    count.textContent = String(visibleCount);
                }
            }

            [input, yearSelect, typeSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            if (resetButton) {
                resetButton.addEventListener("click", function () {
                    if (input) {
                        input.value = "";
                    }
                    if (yearSelect) {
                        yearSelect.value = "";
                    }
                    if (typeSelect) {
                        typeSelect.value = "";
                    }
                    apply();
                });
            }

            var queryInput = qs("[data-search-query-input]", panel);
            if (queryInput) {
                var params = new URLSearchParams(window.location.search);
                var q = params.get("q");
                if (q) {
                    queryInput.value = q;
                }
            }

            apply();
        });
    }

    function setupPlayers() {
        qsa("[data-player]").forEach(function (player) {
            var video = qs("video", player);
            var button = qs("[data-play-button]", player);
            var status = qs("[data-player-status]", player);
            var source = player.dataset.src;
            var initialized = false;
            var hlsInstance = null;

            if (!video || !button || !source) {
                return;
            }

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function nativePlay() {
                video.src = source;
                video.play().catch(function () {
                    setStatus("浏览器已加载播放源，请点击视频控件继续播放。");
                });
            }

            function initialize() {
                if (initialized) {
                    video.play().catch(function () {});
                    return;
                }

                initialized = true;
                button.classList.add("is-hidden");
                setStatus("正在初始化高清播放源…");

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    nativePlay();
                    setStatus("已使用浏览器原生 HLS 播放。");
                    return;
                }

                loadHlsScript().then(function (Hls) {
                    if (Hls.isSupported()) {
                        hlsInstance = new Hls({
                            enableWorker: true,
                            lowLatencyMode: false
                        });
                        hlsInstance.loadSource(source);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                            setStatus("HLS 播放源加载完成，正在播放。");
                            video.play().catch(function () {
                                setStatus("播放源已就绪，请点击视频控件继续播放。");
                            });
                        });
                        hlsInstance.on(Hls.Events.ERROR, function (_, data) {
                            if (data && data.fatal) {
                                setStatus("播放源连接异常，可刷新页面后重试。");
                            }
                        });
                    } else {
                        nativePlay();
                    }
                }).catch(function () {
                    nativePlay();
                    setStatus("已尝试使用浏览器原生方式播放。");
                });
            }

            button.addEventListener("click", initialize);
            video.addEventListener("play", function () {
                button.classList.add("is-hidden");
            });
            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
