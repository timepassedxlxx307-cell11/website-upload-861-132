(function () {
    'use strict';

    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.from((scope || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initMobileMenu() {
        var button = qs('[data-mobile-menu-button]');
        var panel = qs('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }

        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHeroCarousel() {
        var carousel = qs('[data-hero-carousel]');
        if (!carousel) {
            return;
        }

        var slides = qsa('[data-hero-slide]', carousel);
        var dots = qsa('[data-hero-dot]', carousel);
        var prev = qs('[data-hero-prev]', carousel);
        var next = qs('[data-hero-next]', carousel);
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        function startAutoPlay() {
            stopAutoPlay();
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        function stopAutoPlay() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startAutoPlay();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(activeIndex - 1);
                startAutoPlay();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(activeIndex + 1);
                startAutoPlay();
            });
        }

        carousel.addEventListener('mouseenter', stopAutoPlay);
        carousel.addEventListener('mouseleave', startAutoPlay);
        startAutoPlay();
    }

    function initDomFilters() {
        var scope = qs('[data-filter-scope]');
        if (!scope) {
            return;
        }

        var keywordInput = qs('[data-filter-input]');
        var yearSelect = qs('[data-filter-year]');
        var typeSelect = qs('[data-filter-type]');
        var countOutput = qs('[data-filter-count]');
        var cards = qsa('[data-movie-card]', scope);

        function matchesYear(card, selectedYear) {
            if (!selectedYear) {
                return true;
            }
            var year = card.getAttribute('data-year') || '';
            if (selectedYear === '2022') {
                return Number(year) <= 2022;
            }
            return year === selectedYear;
        }

        function applyFilters() {
            var keyword = (keywordInput && keywordInput.value || '').trim().toLowerCase();
            var selectedYear = yearSelect && yearSelect.value || '';
            var selectedType = typeSelect && typeSelect.value || '';
            var visible = 0;

            cards.forEach(function (card) {
                var searchText = (card.getAttribute('data-search-text') || '').toLowerCase();
                var typeText = card.getAttribute('data-type') || '';
                var isMatch = true;

                if (keyword && searchText.indexOf(keyword) === -1) {
                    isMatch = false;
                }
                if (isMatch && !matchesYear(card, selectedYear)) {
                    isMatch = false;
                }
                if (isMatch && selectedType && typeText.indexOf(selectedType) === -1) {
                    isMatch = false;
                }

                card.classList.toggle('is-hidden-by-filter', !isMatch);
                if (isMatch) {
                    visible += 1;
                }
            });

            if (countOutput) {
                countOutput.textContent = '正在显示 ' + visible + ' 部影片';
            }
        }

        [keywordInput, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    }

    function initSearchPage() {
        var results = qs('#searchResults');
        if (!results || !window.MOVIE_DATA) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        var input = qs('[data-search-page-input]');
        var summary = qs('[data-search-summary]');

        if (input) {
            input.value = query;
        }

        if (!query) {
            results.innerHTML = '';
            if (summary) {
                summary.textContent = '请输入关键词开始搜索。';
            }
            return;
        }

        var keywords = query.toLowerCase().split(/\s+/).filter(Boolean);
        var matches = window.MOVIE_DATA.filter(function (movie) {
            var text = [
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.category,
                movie.oneLine,
                (movie.tags || []).join(' ')
            ].join(' ').toLowerCase();

            return keywords.every(function (keyword) {
                return text.indexOf(keyword) !== -1;
            });
        });

        if (summary) {
            summary.textContent = '“' + query + '” 找到 ' + matches.length + ' 部相关影片。';
        }

        results.innerHTML = matches.slice(0, 240).map(renderSearchCard).join('');
    }

    function renderSearchCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span class="tag-chip">' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
            '<a class="movie-card" href="' + escapeHtml(movie.url) + '">',
            '    <div class="movie-poster">',
            '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <div class="poster-gradient"></div>',
            '        <span class="poster-type">' + escapeHtml(movie.type) + '</span>',
            '        <span class="poster-year">' + escapeHtml(movie.year) + '</span>',
            '    </div>',
            '    <div class="movie-info">',
            '        <h3>' + escapeHtml(movie.title) + '</h3>',
            '        <p class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</p>',
            '        <p class="movie-one-line">' + escapeHtml(movie.oneLine) + '</p>',
            '        <div class="movie-tags">' + tags + '</div>',
            '    </div>',
            '</a>'
        ].join('\n');
    }

    function initPlayer() {
        var player = qs('[data-player]');
        var video = qs('#moviePlayer');
        var button = qs('[data-play-button]');
        var message = qs('[data-player-message]');
        if (!player || !video || !button) {
            return;
        }

        var source = video.getAttribute('data-src');
        var initialized = false;
        var hlsInstance = null;
        var pendingPlay = false;

        function setMessage(text) {
            if (message) {
                message.textContent = text || '';
            }
        }

        function requestPlayback() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    setMessage('浏览器阻止了自动播放，请再次点击播放器。');
                });
            }
        }

        function initializeSource() {
            if (initialized) {
                return;
            }
            initialized = true;

            if (!source) {
                setMessage('当前影片未配置播放源。');
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                setMessage('正在使用浏览器原生 HLS 播放。');
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setMessage('播放源已加载，可开始观看。');
                    if (pendingPlay) {
                        requestPlayback();
                    }
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setMessage('播放加载遇到问题，请刷新页面或稍后再试。');
                    }
                });
                return;
            }

            setMessage('当前浏览器不支持 HLS 播放，请更换浏览器或使用支持 M3U8 的播放器。');
        }

        function playVideo() {
            pendingPlay = true;
            initializeSource();

            if (!hlsInstance) {
                requestPlayback();
            } else if (video.readyState >= 2) {
                requestPlayback();
            }
        }

        button.addEventListener('click', playVideo);
        video.addEventListener('play', function () {
            player.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            player.classList.remove('is-playing');
        });
        video.addEventListener('ended', function () {
            player.classList.remove('is-playing');
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHeroCarousel();
        initDomFilters();
        initSearchPage();
        initPlayer();
    });
}());
