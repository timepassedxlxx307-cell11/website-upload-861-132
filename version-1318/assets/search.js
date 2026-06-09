(function () {
    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function unique(items) {
        return items.filter(Boolean).filter(function (item, index, array) {
            return array.indexOf(item) === index;
        });
    }

    function getQueryValue(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    function optionList(select, items) {
        items.forEach(function (item) {
            var option = document.createElement("option");
            option.value = item;
            option.textContent = item;
            select.appendChild(option);
        });
    }

    function card(movie) {
        var tags = String(movie.tags || movie.genre || "").split(/[,，/、|]+/).filter(Boolean).slice(0, 4);
        return "" +
            "<article class=\"movie-card\">" +
                "<a class=\"poster-frame\" href=\"" + escapeHtml(movie.url) + "\">" +
                    "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
                    "<span class=\"poster-glow\"></span>" +
                "</a>" +
                "<div class=\"movie-card-body\">" +
                    "<div class=\"movie-meta-line\">" +
                        "<span>" + escapeHtml(movie.year) + "</span>" +
                        "<span>" + escapeHtml(movie.region) + "</span>" +
                        "<span>" + escapeHtml(movie.type) + "</span>" +
                    "</div>" +
                    "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
                    "<p>" + escapeHtml(movie.oneLine || movie.summary || "") + "</p>" +
                    "<div class=\"tag-row\">" + tags.map(function (tag) {
                        return "<span>" + escapeHtml(tag) + "</span>";
                    }).join("") + "</div>" +
                "</div>" +
            "</article>";
    }

    function main() {
        var data = window.MOVIE_SEARCH_DATA || [];
        var input = document.getElementById("search-input");
        var type = document.getElementById("search-type");
        var region = document.getElementById("search-region");
        var year = document.getElementById("search-year");
        var results = document.getElementById("search-results");
        var count = document.getElementById("search-count");

        if (!input || !type || !region || !year || !results || !count) {
            return;
        }

        optionList(type, unique(data.map(function (movie) { return movie.type; })).sort());
        optionList(region, unique(data.map(function (movie) { return movie.region; })).sort());
        optionList(year, unique(data.map(function (movie) { return movie.year; })).sort().reverse());

        input.value = getQueryValue("q");

        function apply() {
            var query = input.value.trim().toLowerCase();
            var selectedType = type.value;
            var selectedRegion = region.value;
            var selectedYear = year.value;
            var matches = data.filter(function (movie) {
                var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine, movie.summary].join(" ").toLowerCase();
                if (query && haystack.indexOf(query) === -1) {
                    return false;
                }
                if (selectedType && movie.type !== selectedType) {
                    return false;
                }
                if (selectedRegion && movie.region !== selectedRegion) {
                    return false;
                }
                if (selectedYear && movie.year !== selectedYear) {
                    return false;
                }
                return true;
            });

            count.textContent = "共找到 " + matches.length + " 部影片";
            results.innerHTML = matches.map(card).join("");
            results.querySelectorAll("img").forEach(function (image) {
                image.addEventListener("error", function () {
                    image.classList.add("image-missing");
                });
            });
        }

        [input, type, region, year].forEach(function (control) {
            control.addEventListener("input", apply);
            control.addEventListener("change", apply);
        });

        apply();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", main);
    } else {
        main();
    }
})();
