(function () {
  var toggle = document.querySelector('.mobile-toggle');
  var panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var isOpen = !panel.hasAttribute('hidden');
      if (isOpen) {
        panel.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
      } else {
        panel.removeAttribute('hidden');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  var filterPanels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  filterPanels.forEach(function (panelElement) {
    var keyword = panelElement.querySelector('[data-filter-keyword]');
    var type = panelElement.querySelector('[data-filter-type]');
    var year = panelElement.querySelector('[data-filter-year]');
    var grid = document.querySelector('[data-filter-grid]');

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function applyFilter() {
      var q = keyword && keyword.value ? keyword.value.trim().toLowerCase() : '';
      var selectedType = type && type.value ? type.value : '';
      var selectedYear = year && year.value ? year.value : '';

      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var cardType = card.getAttribute('data-type') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
        var cardGenre = (card.getAttribute('data-genre') || '').toLowerCase();
        var keywordMatched = !q || title.indexOf(q) !== -1 || cardRegion.indexOf(q) !== -1 || cardGenre.indexOf(q) !== -1;
        var typeMatched = !selectedType || cardType === selectedType;
        var yearMatched = !selectedYear || cardYear === selectedYear;
        card.hidden = !(keywordMatched && typeMatched && yearMatched);
      });
    }

    [keyword, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });
})();
