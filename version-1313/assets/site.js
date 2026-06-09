(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    ready(function () {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-main-nav]");
        var search = document.querySelector(".header-search");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("is-open");
                if (search) {
                    search.classList.toggle("is-open");
                }
            });
        }

        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                if (value) {
                    event.preventDefault();
                    window.location.href = "search.html?q=" + encodeURIComponent(value);
                }
            });
        });

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var index = 0;
        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        if (slides.length) {
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    showSlide(i);
                });
            });
            if (prev) {
                prev.addEventListener("click", function () {
                    showSlide(index - 1);
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    showSlide(index + 1);
                });
            }
            window.setInterval(function () {
                showSlide(index + 1);
            }, 5600);
        }

        var filterForm = document.querySelector("[data-filter-form]");
        var filterGrid = document.querySelector("[data-filter-grid]");
        if (filterForm && filterGrid) {
            var cards = Array.prototype.slice.call(filterGrid.querySelectorAll(".movie-card"));
            var queryInput = filterForm.querySelector("[data-filter-query]");
            var yearInput = filterForm.querySelector("[data-filter-year]");
            var typeInput = filterForm.querySelector("[data-filter-type]");
            function applyFilter() {
                var query = normalize(queryInput && queryInput.value);
                var year = normalize(yearInput && yearInput.value);
                var type = normalize(typeInput && typeInput.value);
                cards.forEach(function (card) {
                    var searchText = normalize(card.getAttribute("data-search"));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var cardType = normalize(card.getAttribute("data-type"));
                    var ok = true;
                    if (query && searchText.indexOf(query) === -1) {
                        ok = false;
                    }
                    if (year && cardYear.indexOf(year) === -1) {
                        ok = false;
                    }
                    if (type && cardType.indexOf(type) === -1) {
                        ok = false;
                    }
                    card.classList.toggle("is-hidden", !ok);
                });
            }
            [queryInput, yearInput, typeInput].forEach(function (input) {
                if (input) {
                    input.addEventListener("input", applyFilter);
                    input.addEventListener("change", applyFilter);
                }
            });
            filterForm.addEventListener("submit", function (event) {
                event.preventDefault();
                applyFilter();
            });
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q && queryInput) {
                queryInput.value = q;
            }
            applyFilter();
        }
    });
})();
