(() => {
  const normalize = (value) => (value || "").toString().trim().toLowerCase();

  const mobileButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  if (mobileButton && mobileMenu) {
    mobileButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("is-open");
      mobileButton.textContent = mobileMenu.classList.contains("is-open") ? "×" : "☰";
    });
  }

  document.querySelectorAll("[data-header-search]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      const input = form.querySelector("input[name='q']");
      if (!input || !input.value.trim()) {
        event.preventDefault();
      }
    });
  });

  const slider = document.querySelector("[data-hero-slider]");
  if (slider) {
    const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
    let current = 0;

    const showSlide = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === current);
      });
    };

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener("click", () => showSlide(dotIndex));
    });

    if (slides.length > 1) {
      window.setInterval(() => showSlide(current + 1), 5200);
    }
  }

  const list = document.querySelector("[data-filter-list]");
  const searchInput = document.querySelector("[data-page-search]");
  const typeFilter = document.querySelector("[data-type-filter]");
  const yearFilter = document.querySelector("[data-year-filter]");
  const resultCount = document.querySelector("[data-result-count]");

  if (list && searchInput) {
    const cards = Array.from(list.querySelectorAll(".filter-item"));
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";

    if (initialQuery) {
      searchInput.value = initialQuery;
    }

    const emptyNode = document.createElement("div");
    emptyNode.className = "filter-empty";
    emptyNode.textContent = "暂无匹配影片";
    emptyNode.hidden = true;
    list.appendChild(emptyNode);

    const applyFilters = () => {
      const terms = normalize(searchInput.value).split(/\s+/).filter(Boolean);
      const typeValue = normalize(typeFilter ? typeFilter.value : "");
      const yearValue = normalize(yearFilter ? yearFilter.value : "");
      let visible = 0;

      cards.forEach((card) => {
        const searchText = normalize(card.dataset.search);
        const cardType = normalize(card.dataset.type);
        const cardYear = normalize(card.dataset.year);
        const matchesTerms = terms.every((term) => searchText.includes(term));
        const matchesType = !typeValue || cardType === typeValue;
        const matchesYear = !yearValue || cardYear === yearValue;
        const shouldShow = matchesTerms && matchesType && matchesYear;

        card.hidden = !shouldShow;
        if (shouldShow) {
          visible += 1;
        }
      });

      emptyNode.hidden = visible !== 0;
      if (resultCount) {
        resultCount.textContent = visible + " 部影片";
      }
    };

    searchInput.addEventListener("input", applyFilters);
    if (typeFilter) {
      typeFilter.addEventListener("change", applyFilters);
    }
    if (yearFilter) {
      yearFilter.addEventListener("change", applyFilters);
    }
    applyFilters();
  }
})();
