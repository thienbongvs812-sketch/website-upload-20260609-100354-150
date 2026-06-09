(function () {
    window.initializeMoviePlayer = function (videoUrl) {
        var video = document.getElementById('movie-player');
        var overlay = document.querySelector('[data-player-overlay]');
        var hlsInstance = null;
        var isAttached = false;

        if (!video || !overlay || !videoUrl) {
            return;
        }

        function playVideo() {
            var playback = video.play();
            if (playback && typeof playback.catch === 'function') {
                playback.catch(function () {});
            }
        }

        function attachSource() {
            if (isAttached) {
                return;
            }
            isAttached = true;
            video.controls = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = videoUrl;
                playVideo();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MEDIA_ATTACHED, function () {
                    hlsInstance.loadSource(videoUrl);
                    playVideo();
                });
                return;
            }

            video.src = videoUrl;
            playVideo();
        }

        function startPlayback() {
            overlay.classList.add('is-hidden');
            attachSource();
            playVideo();
        }

        overlay.addEventListener('click', startPlayback);
        video.addEventListener('click', function () {
            if (!isAttached) {
                startPlayback();
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
