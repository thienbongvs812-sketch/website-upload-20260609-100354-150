document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide-dot]"));
    var previous = carousel.querySelector("[data-slide-prev]");
    var next = carousel.querySelector("[data-slide-next]");
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }

      index = (target + slides.length) % slides.length;

      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === index);
      });

      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide-dot")) || 0);
        start();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
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

    show(0);
    start();
  });

  var searchInput = document.querySelector("[data-search-input]");
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
  var movieCards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
  var activeFilter = "all";

  function textOf(card) {
    return [
      card.getAttribute("data-title"),
      card.getAttribute("data-type"),
      card.getAttribute("data-year"),
      card.getAttribute("data-region"),
      card.getAttribute("data-tags"),
      card.textContent
    ].join(" ").toLowerCase();
  }

  function applyFilters() {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : "";

    movieCards.forEach(function (card) {
      var content = textOf(card);
      var matchesQuery = !query || content.indexOf(query) !== -1;
      var matchesFilter = activeFilter === "all" || content.indexOf(activeFilter.toLowerCase()) !== -1;
      card.classList.toggle("is-hidden", !(matchesQuery && matchesFilter));
    });
  }

  if (searchInput && movieCards.length) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query) {
      searchInput.value = query;
    }
    searchInput.addEventListener("input", applyFilters);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeFilter = button.getAttribute("data-filter") || "all";
      filterButtons.forEach(function (item) {
        item.classList.toggle("is-active", item === button);
      });
      applyFilters();
    });
  });

  applyFilters();

  var backTop = document.querySelector("[data-back-top]");
  if (backTop) {
    window.addEventListener("scroll", function () {
      backTop.classList.toggle("is-visible", window.scrollY > 420);
    });

    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  var video = document.querySelector("[data-player-video]");
  var trigger = document.querySelector("[data-player-trigger]");
  var overlay = document.querySelector("[data-player-overlay]");
  var loaded = false;
  var hls = null;

  function startPlayer() {
    if (!video) {
      return;
    }

    var source = video.getAttribute("data-m3u8");

    if (!loaded && source) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      loaded = true;
    }

    video.controls = true;

    if (overlay) {
      overlay.classList.add("is-hidden");
    }

    var playTask = video.play();
    if (playTask && typeof playTask.catch === "function") {
      playTask.catch(function () {});
    }
  }

  if (video) {
    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        startPlayer();
      }
    });

    video.addEventListener("ended", function () {
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    });
  }

  if (trigger) {
    trigger.addEventListener("click", startPlayer);
  }
});
