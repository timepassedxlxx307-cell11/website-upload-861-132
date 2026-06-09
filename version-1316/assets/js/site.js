const hlsUrl = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
let hlsLoader = null;

function loadHls() {
  if (window.Hls) {
    return Promise.resolve(window.Hls);
  }

  if (hlsLoader) {
    return hlsLoader;
  }

  hlsLoader = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = hlsUrl;
    script.async = true;
    script.onload = () => resolve(window.Hls);
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return hlsLoader;
}

async function attachStream(video) {
  const stream = video.getAttribute("data-stream");

  if (!stream || video.dataset.ready === "true" || video.dataset.loading === "true") {
    return;
  }

  video.dataset.loading = "true";

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = stream;
    video.dataset.ready = "true";
    video.dataset.loading = "false";
    return;
  }

  try {
    const Hls = await loadHls();

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(stream);
      hls.attachMedia(video);
      video.hlsInstance = hls;
    } else {
      video.src = stream;
    }
  } catch (error) {
    video.src = stream;
  }

  video.dataset.ready = "true";
  video.dataset.loading = "false";
}

function initPlayers() {
  document.querySelectorAll(".player-shell").forEach((shell) => {
    const video = shell.querySelector("video[data-stream]");
    const button = shell.querySelector(".play-layer");

    if (!video) {
      return;
    }

    if (button) {
      button.addEventListener("click", async () => {
        button.classList.add("is-hidden");
        await attachStream(video);
        const playTask = video.play();

        if (playTask && typeof playTask.catch === "function") {
          playTask.catch(() => {
            button.classList.remove("is-hidden");
          });
        }
      });
    }

    video.addEventListener("click", async () => {
      if (video.dataset.ready !== "true") {
        await attachStream(video);
      }
    });

    video.addEventListener("play", async () => {
      if (video.dataset.ready !== "true") {
        video.pause();
        await attachStream(video);
        video.play();
      }
    });
  });
}

function initMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const panel = document.querySelector("[data-mobile-panel]");

  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener("click", () => {
    panel.classList.toggle("is-open");
  });
}

function initHero() {
  const slider = document.querySelector("[data-hero-slider]");

  if (!slider) {
    return;
  }

  const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
  let active = 0;

  const setActive = (index) => {
    active = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === active);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === active);
    });
  };

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      setActive(Number(dot.dataset.heroDot || 0));
    });
  });

  if (slides.length > 1) {
    window.setInterval(() => {
      setActive(active + 1);
    }, 5200);
  }
}

function initFilters() {
  document.querySelectorAll("[data-filter-scope]").forEach((scope) => {
    const input = scope.querySelector("[data-filter-input]");
    const select = scope.querySelector("[data-sort-select]");
    const list = scope.querySelector("[data-filter-list]");

    if (!list) {
      return;
    }

    const cards = Array.from(list.querySelectorAll(".movie-card"));

    const applyFilter = () => {
      const query = input ? input.value.trim().toLowerCase() : "";

      cards.forEach((card) => {
        const keywords = card.getAttribute("data-filter-keywords") || "";
        card.classList.toggle("is-filter-hidden", query && !keywords.includes(query));
      });
    };

    const applySort = () => {
      if (!select) {
        return;
      }

      const mode = select.value;
      const sorted = [...cards];

      if (mode === "year-desc") {
        sorted.sort((a, b) => Number(b.dataset.year || 0) - Number(a.dataset.year || 0));
      }

      if (mode === "year-asc") {
        sorted.sort((a, b) => Number(a.dataset.year || 0) - Number(b.dataset.year || 0));
      }

      if (mode === "title") {
        sorted.sort((a, b) => (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN"));
      }

      sorted.forEach((card) => list.appendChild(card));
    };

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    if (select) {
      select.addEventListener("change", () => {
        applySort();
        applyFilter();
      });
    }
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function initSearchPage() {
  const results = document.querySelector("[data-search-results]");
  const input = document.querySelector("[data-search-page-input]");

  if (!results || !window.SEARCH_ITEMS) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const query = (params.get("q") || "").trim();

  if (input) {
    input.value = query;
  }

  const normalized = query.toLowerCase();
  const items = window.SEARCH_ITEMS.filter((item) => {
    if (!normalized) {
      return true;
    }

    return item.search.includes(normalized);
  }).slice(0, 120);

  results.innerHTML = items.map((item) => {
    return `
      <article class="movie-card">
        <a class="movie-cover" href="${escapeHtml(item.url)}" aria-label="${escapeHtml(item.title)}">
          <img src="./${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy">
          <span class="movie-year">${escapeHtml(item.year)}</span>
          <span class="movie-type">${escapeHtml(item.type)}</span>
        </a>
        <div class="movie-card-body">
          <a class="movie-category" href="${escapeHtml(item.categoryUrl)}">${escapeHtml(item.category)}</a>
          <h3><a href="${escapeHtml(item.url)}">${escapeHtml(item.title)}</a></h3>
          <p>${escapeHtml(item.oneLine)}</p>
          <div class="tag-row"><span>${escapeHtml(item.region)}</span><span>${escapeHtml(item.genre)}</span></div>
        </div>
      </article>
    `;
  }).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  initHero();
  initFilters();
  initPlayers();
  initSearchPage();
});
