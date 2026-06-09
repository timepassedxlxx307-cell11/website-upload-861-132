(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector(".mobile-menu-button");
        var links = document.querySelector(".nav-links");
        if (!button || !links) {
            return;
        }
        button.addEventListener("click", function () {
            links.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector(".hero");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                play();
            });
        });
        hero.addEventListener("mouseenter", function () {
            window.clearInterval(timer);
        });
        hero.addEventListener("mouseleave", play);
        show(0);
        play();
    }

    function setupCardFilters() {
        var grids = Array.prototype.slice.call(document.querySelectorAll(".filterable-grid"));
        grids.forEach(function (grid) {
            var scope = grid.closest("main") || document;
            var input = scope.querySelector(".card-filter-input");
            var selects = Array.prototype.slice.call(scope.querySelectorAll(".card-filter-select"));
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }
            function apply() {
                var keyword = normalize(input ? input.value : "");
                var activeFilters = selects.map(function (select) {
                    return {
                        key: select.getAttribute("data-filter"),
                        value: normalize(select.value)
                    };
                });
                cards.forEach(function (card) {
                    var text = normalize(card.textContent);
                    var matched = !keyword || text.indexOf(keyword) !== -1;
                    activeFilters.forEach(function (filter) {
                        if (filter.value) {
                            matched = matched && normalize(card.getAttribute("data-" + filter.key)).indexOf(filter.value) !== -1;
                        }
                    });
                    card.classList.toggle("is-hidden-by-filter", !matched);
                });
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });
        });
    }

    function setupSearchPage() {
        var input = document.getElementById("site-search-input");
        var results = document.getElementById("search-results");
        if (!input || !results || !window.SITE_MOVIES) {
            return;
        }
        var typeSelect = document.getElementById("search-type");
        var regionSelect = document.getElementById("search-region");
        var yearSelect = document.getElementById("search-year");
        var form = document.querySelector(".search-page-form");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        input.value = initialQuery;
        var years = Array.prototype.slice.call(new Set(window.SITE_MOVIES.map(function (movie) {
            return movie.year;
        }).filter(Boolean))).sort().reverse();
        years.slice(0, 80).forEach(function (year) {
            var option = document.createElement("option");
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });
        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }
        function createCard(movie) {
            var article = document.createElement("article");
            article.className = "movie-card";
            article.innerHTML = [
                '<a class="card-cover" href="movie/' + movie.id + '.html" aria-label="' + escapeHtml(movie.title) + '">',
                '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '<span class="card-play">▶</span>',
                '</a>',
                '<div class="card-body">',
                '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
                '<h3><a href="movie/' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h3>',
                '<p>' + escapeHtml(movie.one_line) + '</p>',
                '<div class="tag-row">' + movie.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join("") + '</div>',
                '</div>'
            ].join("");
            return article;
        }
        function escapeHtml(value) {
            return String(value || "").replace(/[&<>"']/g, function (char) {
                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;"
                }[char];
            });
        }
        function render() {
            var keyword = normalize(input.value);
            var type = normalize(typeSelect.value);
            var region = normalize(regionSelect.value);
            var year = normalize(yearSelect.value);
            var matched = window.SITE_MOVIES.filter(function (movie) {
                var haystack = normalize([movie.title, movie.one_line, movie.summary, movie.genre, movie.region, movie.type, movie.year, movie.tags.join(" ")].join(" "));
                return (!keyword || haystack.indexOf(keyword) !== -1) &&
                    (!type || normalize(movie.type).indexOf(type) !== -1) &&
                    (!region || normalize(movie.region).indexOf(region) !== -1) &&
                    (!year || normalize(movie.year) === year);
            }).slice(0, 120);
            results.innerHTML = "";
            matched.forEach(function (movie) {
                results.appendChild(createCard(movie));
            });
        }
        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                render();
            });
        }
        [input, typeSelect, regionSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", render);
                control.addEventListener("change", render);
            }
        });
        render();
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupCardFilters();
        setupSearchPage();
    });
})();

function bindMoviePlayer(source) {
    var video = document.getElementById("movie-player");
    var overlay = document.getElementById("player-overlay");
    if (!video || !overlay || !source) {
        return;
    }
    var started = false;
    var hlsInstance = null;
    function load() {
        if (started) {
            return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }
    }
    function play() {
        load();
        overlay.classList.add("is-hidden");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                overlay.classList.remove("is-hidden");
            });
        }
    }
    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
        if (!started) {
            play();
        }
    });
    video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
