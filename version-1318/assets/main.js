(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var isOpen = nav.classList.toggle("open");
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    function setupSearchForms() {
        document.querySelectorAll(".site-search-form").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = "./search.html";
                }
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero-carousel]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide")) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }

        restart();
    }

    function setupImageErrors() {
        document.querySelectorAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("image-missing");
            });
        });
    }

    function fillFilterOptions(bar) {
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-list] .movie-card"));
        var typeSelect = bar.querySelector("[data-filter-type]");
        var regionSelect = bar.querySelector("[data-filter-region]");
        var yearSelect = bar.querySelector("[data-filter-year]");

        function values(name) {
            return cards.map(function (card) {
                return card.getAttribute(name) || "";
            }).filter(Boolean).filter(function (value, index, array) {
                return array.indexOf(value) === index;
            }).sort(function (a, b) {
                return b.localeCompare(a, "zh-Hans-CN");
            });
        }

        function appendOptions(select, items) {
            if (!select) {
                return;
            }
            items.forEach(function (item) {
                var option = document.createElement("option");
                option.value = item;
                option.textContent = item;
                select.appendChild(option);
            });
        }

        appendOptions(typeSelect, values("data-type"));
        appendOptions(regionSelect, values("data-region"));
        appendOptions(yearSelect, values("data-year"));
    }

    function setupPageFilter() {
        var bar = document.querySelector("[data-filter-bar]");
        var list = document.querySelector("[data-filter-list]");
        if (!bar || !list) {
            return;
        }
        fillFilterOptions(bar);
        var keyword = bar.querySelector("[data-filter-keyword]");
        var typeSelect = bar.querySelector("[data-filter-type]");
        var regionSelect = bar.querySelector("[data-filter-region]");
        var yearSelect = bar.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        var empty = document.querySelector("[data-empty-state]");

        function apply() {
            var query = (keyword && keyword.value || "").trim().toLowerCase();
            var type = typeSelect && typeSelect.value || "";
            var region = regionSelect && regionSelect.value || "";
            var year = yearSelect && yearSelect.value || "";
            var visible = 0;

            cards.forEach(function (card) {
                var text = card.textContent.toLowerCase();
                var matched = true;
                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }
                if (type && card.getAttribute("data-type") !== type) {
                    matched = false;
                }
                if (region && card.getAttribute("data-region") !== region) {
                    matched = false;
                }
                if (year && card.getAttribute("data-year") !== year) {
                    matched = false;
                }
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }

        [keyword, typeSelect, regionSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    }

    ready(function () {
        setupMenu();
        setupSearchForms();
        setupHero();
        setupImageErrors();
        setupPageFilter();
    });
})();
