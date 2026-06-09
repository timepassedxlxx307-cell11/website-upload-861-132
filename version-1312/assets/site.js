(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    ready(function () {
        var menuToggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (menuToggle && mobileNav) {
            menuToggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                var url = "search.html";
                if (query) {
                    url += "?q=" + encodeURIComponent(query);
                }
                window.location.href = url;
            });
        });

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var timer = null;
            var showSlide = function (index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            };
            var start = function () {
                if (timer || slides.length < 2) {
                    return;
                }
                timer = window.setInterval(function () {
                    showSlide(current + 1);
                }, 5200);
            };
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    showSlide(index);
                    if (timer) {
                        window.clearInterval(timer);
                        timer = null;
                    }
                    start();
                });
            });
            showSlide(0);
            start();
        }

        var filterInput = document.querySelector("[data-card-filter]");
        var list = document.querySelector("[data-card-list]");
        var empty = document.querySelector("[data-empty-state]");
        if (filterInput && list) {
            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
            var applyFilter = function () {
                var query = normalize(filterInput.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var content = normalize(card.getAttribute("data-search") || card.textContent);
                    var match = !query || content.indexOf(query) !== -1;
                    card.style.display = match ? "" : "none";
                    if (match) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            };
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";
            if (initialQuery) {
                filterInput.value = initialQuery;
            }
            filterInput.addEventListener("input", applyFilter);
            applyFilter();
        }

        var video = document.querySelector("[data-player]");
        var overlay = document.querySelector("[data-play-overlay]");
        if (video && overlay) {
            var started = false;
            var begin = function () {
                var streamUrl = video.getAttribute("data-stream");
                if (!streamUrl) {
                    return;
                }
                if (!started) {
                    started = true;
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = streamUrl;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls();
                        hls.loadSource(streamUrl);
                        hls.attachMedia(video);
                    } else {
                        video.src = streamUrl;
                    }
                }
                overlay.classList.add("is-hidden");
                var playAction = video.play();
                if (playAction && typeof playAction.catch === "function") {
                    playAction.catch(function () {});
                }
            };
            overlay.addEventListener("click", begin);
            video.addEventListener("click", function () {
                if (video.paused) {
                    begin();
                }
            });
        }
    });
})();
