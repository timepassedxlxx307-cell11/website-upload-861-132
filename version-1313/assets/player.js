(function () {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function nativeHls(video) {
        return video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL");
    }

    window.initMoviePlayer = function (source, poster) {
        onReady(function () {
            var video = document.getElementById("movieVideo");
            var shell = document.getElementById("videoShell");
            var overlay = document.getElementById("playOverlay");
            if (!video || !shell || !overlay || !source) {
                return;
            }
            if (poster) {
                video.setAttribute("poster", poster);
            }
            var started = false;
            var hls = null;
            function playVideo() {
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }
            function start(event) {
                if (event) {
                    event.preventDefault();
                }
                if (started) {
                    playVideo();
                    return;
                }
                started = true;
                shell.classList.add("player-ready");
                if (nativeHls(video)) {
                    video.src = source;
                    video.load();
                    playVideo();
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        playVideo();
                    });
                    return;
                }
                video.src = source;
                video.load();
                playVideo();
            }
            overlay.addEventListener("click", start);
            shell.addEventListener("click", function (event) {
                if (!started && event.target !== video) {
                    start(event);
                }
            });
            video.addEventListener("click", function () {
                if (!started) {
                    start();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            });
        });
    };
})();
