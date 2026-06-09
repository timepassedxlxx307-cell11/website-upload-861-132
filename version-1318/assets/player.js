(function () {
    function initMoviePlayer(options) {
        var video = document.querySelector(options.selector);
        var playButton = document.querySelector(options.playButton);
        var source = options.source;
        var attached = false;
        var hls = null;

        if (!video || !source) {
            return;
        }

        function attachSource() {
            if (attached) {
                return;
            }
            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function startPlayback() {
            attachSource();
            if (playButton) {
                playButton.classList.add("is-hidden");
            }
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (playButton) {
            playButton.addEventListener("click", startPlayback);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });

        video.addEventListener("play", function () {
            if (playButton) {
                playButton.classList.add("is-hidden");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
