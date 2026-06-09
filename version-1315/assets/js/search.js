import { movies } from '../data/search-index.js';

var input = document.getElementById('searchInput');
var results = document.getElementById('searchResults');
var title = document.getElementById('searchTitle');
var hint = document.getElementById('searchHint');
var params = new URLSearchParams(window.location.search);
var initialKeyword = params.get('q') || '';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalize(value) {
  return String(value || '').toLowerCase();
}

function card(movie) {
  return [
    '<article class="movie-card">',
    '<a href="' + escapeHtml(movie.href) + '" class="poster-wrap" aria-label="' + escapeHtml(movie.title) + '">',
    '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
    '<span class="genre-badge">' + escapeHtml(movie.category) + '</span>',
    '<span class="play-hover">▶</span>',
    '</a>',
    '<div class="movie-card-body">',
    '<h3><a href="' + escapeHtml(movie.href) + '">' + escapeHtml(movie.title) + '</a></h3>',
    '<p>' + escapeHtml(movie.oneLine) + '</p>',
    '<div class="movie-meta">',
    '<span>' + escapeHtml(movie.year) + '</span>',
    '<span>' + escapeHtml(movie.region) + '</span>',
    '<span>' + escapeHtml(movie.type) + '</span>',
    '</div>',
    '</div>',
    '</article>'
  ].join('');
}

function render(keyword) {
  var q = normalize(keyword).trim();
  var list = q
    ? movies.filter(function (movie) {
        return normalize(movie.title).indexOf(q) !== -1 ||
          normalize(movie.oneLine).indexOf(q) !== -1 ||
          normalize(movie.genre).indexOf(q) !== -1 ||
          normalize(movie.tags).indexOf(q) !== -1 ||
          normalize(movie.region).indexOf(q) !== -1 ||
          normalize(movie.type).indexOf(q) !== -1 ||
          normalize(movie.category).indexOf(q) !== -1;
      })
    : movies.slice(0, 24);

  if (title) {
    title.textContent = q ? '搜索结果' : '推荐内容';
  }

  if (hint) {
    hint.textContent = q ? '正在展示与“' + keyword + '”相关的片库内容。' : '输入关键词后可按片名、简介、类型、标签筛选。';
  }

  if (!results) {
    return;
  }

  if (!list.length) {
    results.innerHTML = '<div class="empty-state">未找到相关内容</div>';
    return;
  }

  results.innerHTML = list.slice(0, 120).map(card).join('');
}

if (input) {
  input.value = initialKeyword;
  input.addEventListener('input', function () {
    render(input.value);
  });
}

render(initialKeyword);
