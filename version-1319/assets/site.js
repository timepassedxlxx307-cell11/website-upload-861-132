(function () {
  const doc = document;
  const body = doc.body;

  function qs(sel, root = doc) {
    return root.querySelector(sel);
  }

  function qsa(sel, root = doc) {
    return Array.from(root.querySelectorAll(sel));
  }

  function getPageName() {
    const path = location.pathname.split("/").pop() || "index.html";
    return path.toLowerCase();
  }

  function setActiveNav() {
    const page = getPageName();
    qsa(".nav a").forEach((link) => {
      const href = (link.getAttribute("href") || "").split("/").pop().toLowerCase();
      const active =
        href === page ||
        (page === "" && href === "index.html") ||
        (page === "index.html" && href === "index.html") ||
        (page === "categories.html" && href === "categories.html") ||
        (page === "ranking.html" && href === "ranking.html") ||
        (page === "search.html" && href === "search.html") ||
        (page === "about.html" && href === "about.html");
      link.classList.toggle("is-active", active);
    });
  }

  function setupMobileMenu() {
    const toggle = qs("[data-mobile-toggle]");
    const nav = qs("[data-nav]");
    const search = qs("[data-header-search]");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      if (search) search.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function setupPageFilter() {
    const input = qs("[data-filter-input]");
    const cards = qsa("[data-search-item]");
    if (!input || cards.length === 0) return;

    const status = qs("[data-filter-status]");
    const sortSelect = qs("[data-sort-select]");

    function normalize(v) {
      return (v || "").toString().toLowerCase().trim();
    }

    function applyFilter() {
      const keyword = normalize(input.value);
      const sortValue = sortSelect ? sortSelect.value : "default";
      let visibleCards = [];

      cards.forEach((card) => {
        const hay = normalize(
          [
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags,
            card.dataset.oneline
          ].join(" ")
        );
        const show = !keyword || hay.includes(keyword);
        card.classList.toggle("hidden", !show);
        if (show) visibleCards.push(card);
      });

      if (sortSelect) {
        visibleCards.sort((a, b) => {
          const ay = Number(a.dataset.year || 0);
          const by = Number(b.dataset.year || 0);
          const as = Number(a.dataset.score || 0);
          const bs = Number(b.dataset.score || 0);
          if (sortValue === "year-desc") return by - ay || bs - as;
          if (sortValue === "year-asc") return ay - by || bs - as;
          if (sortValue === "score-desc") return bs - as || by - ay;
          return 0;
        });

        const parent = cards[0].parentElement;
        visibleCards.forEach((card) => parent.appendChild(card));
      }

      if (status) {
        status.textContent = `已显示 ${visibleCards.length} 条结果`;
      }
    }

    input.addEventListener("input", applyFilter);
    if (sortSelect) sortSelect.addEventListener("change", applyFilter);
    applyFilter();
  }

  function setupBackToTop() {
    qsa("[data-backtop]").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  function setupDetailPlayer() {
    const player = qs("[data-player]");
    const btn = qs("[data-play-button]");
    if (!player || !btn) return;

    btn.addEventListener("click", async () => {
      try {
        await player.play();
        btn.style.opacity = "0";
        btn.style.pointerEvents = "none";
      } catch (err) {
        console.warn("Playback failed:", err);
      }
    });

    player.addEventListener("play", () => {
      btn.style.opacity = "0";
      btn.style.pointerEvents = "none";
    });

    player.addEventListener("pause", () => {
      btn.style.opacity = "1";
      btn.style.pointerEvents = "auto";
    });
  }

  function setupSearchPage() {
    const root = qs("[data-search-page]");
    if (!root || !window.MOVIES) return;

    const input = qs("[data-search-query]", root);
    const results = qs("[data-search-results]", root);
    const count = qs("[data-search-count]", root);
    const trend = qs("[data-search-trend]", root);

    const params = new URLSearchParams(location.search);
    const initial = (params.get("q") || params.get("keyword") || "").trim();
    if (input && initial) input.value = initial;

    function escapeHtml(value) {
      return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
    }

    function cards(movies) {
      return movies
        .map((m) => {
          const tags = (m.tags || [])
            .slice(0, 4)
            .map((t) => `<span class="movie-card__tag">${escapeHtml(t)}</span>`)
            .join("");
          return `
            <article class="movie-card" data-search-item data-title="${escapeHtml(m.title)}" data-region="${escapeHtml(m.region)}" data-type="${escapeHtml(m.type)}" data-year="${escapeHtml(String(m.year))}" data-genre="${escapeHtml(m.genre)}" data-tags="${escapeHtml((m.tags || []).join(" "))}" data-oneline="${escapeHtml(m.oneLine || "")}" data-score="${escapeHtml(String(m.score || 0))}">
              <a href="movie-${m.id}.html">
                <div class="movie-card__poster">
                  <img src="assets/posters/${m.id}.svg" alt="${escapeHtml(m.title)}">
                </div>
                <div class="movie-card__body">
                  <h3 class="movie-card__title">${escapeHtml(m.title)}</h3>
                  <div class="movie-card__meta">${escapeHtml(m.year)} · ${escapeHtml(m.region)} · ${escapeHtml(m.type)}</div>
                  <div class="movie-card__meta">${escapeHtml(m.oneLine || "")}</div>
                  <div class="movie-card__tags">${tags}</div>
                </div>
              </a>
            </article>`;
        })
        .join("");
    }

    function searchMovies(keyword) {
      const q = keyword.trim().toLowerCase();
      if (!q) return window.MOVIES.slice(0, 48);
      return window.MOVIES.filter((m) => {
        const hay = [
          m.id,
          m.title,
          m.region,
          m.type,
          m.year,
          m.genre,
          (m.tags || []).join(" "),
          m.oneLine
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      }).slice(0, 96);
    }

    function render() {
      const keyword = input ? input.value : initial;
      const list = searchMovies(keyword);
      if (results) results.innerHTML = cards(list);
      if (count) count.textContent = `找到 ${list.length} 条匹配影片`;
      if (trend) {
        const top = window.MOVIES.slice().sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 8);
        trend.innerHTML = top.map((m) => `<a class="chip" href="movie-${m.id}.html">#${m.id} ${escapeHtml(m.title)}</a>`).join("");
      }
    }

    if (input) input.addEventListener("input", render);
    render();
  }

  function setupRevealButtons() {
    qsa("[data-scroll-target]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = btn.getAttribute("data-scroll-target");
        if (!target) return;
        const el = qs(target);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  function init() {
    setActiveNav();
    setupMobileMenu();
    setupPageFilter();
    setupDetailPlayer();
    setupSearchPage();
    setupBackToTop();
    setupRevealButtons();
    const year = qs("[data-current-year]");
    if (year) year.textContent = new Date().getFullYear();
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
