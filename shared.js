/* ============================================================
   CUPCAKES ON THE AVENUE — SHARED JS
   Search, cart badge, scroll reveal, sprinkles
   ============================================================ */

(function () {
  'use strict';

  /* ── Product catalogue for search ────────────────────────── */
  var PRODUCTS = [
    { name: 'Shortbread Delight',        icon: '⭐', cat: 'Signature',    href: 'shop.html' },
    { name: 'Cupcakes',                  icon: '🧁', cat: 'Fresh Bakes',  href: 'shop.html' },
    { name: 'Custom Celebration Cake',   icon: '🎂', cat: 'Custom Order', href: 'shop.html#custom' },
    { name: 'Biscoff Brownies',          icon: '🍫', cat: 'Market Bakes', href: 'shop.html' },
    { name: 'Vanilla Sponge Cake',       icon: '🍰', cat: 'Weekly Special', href: 'shop.html' },
    { name: 'Christmas Cake',            icon: '🎄', cat: 'Seasonal',     href: 'shop.html' },
    { name: 'Biscuit Selection',         icon: '🍪', cat: 'Market Bakes', href: 'shop.html' },
    { name: 'Birthday Cake',             icon: '🎂', cat: 'Custom Order', href: 'shop.html' },
    { name: 'Iced Biscuits',             icon: '🍬', cat: 'Market Bakes', href: 'shop.html' },
    { name: 'Special Request',           icon: '💌', cat: 'Custom',       href: 'index.html#special-request' },
  ];

  /* ── Inline colour warm-up ────────────────────────────────── */
  function warmColors() {
    document.querySelectorAll('[style]').forEach(function (el) {
      var s = el.getAttribute('style') || '';
      s = s
        .replace(/#667eea/gi, '#B8854F')
        .replace(/#764ba2/gi, '#96693A')
        .replace(/rgba\(102,\s*126,\s*234/gi, 'rgba(184,133,79')
        .replace(/rgba\(118,\s*75,\s*162/gi,  'rgba(150,105,58')
        .replace(/#f5f7ff/gi, '#FDF0E0')
        .replace(/#f0e6ff/gi, '#FBE8CC')
        .replace(/#0b66c3/gi, '#2C1810')
        .replace(/#10b981/g,  '#10b981'); /* keep green for "open" */
      el.setAttribute('style', s);
    });
  }

  /* ── Active nav link ─────────────────────────────────────── */
  function markActiveNav() {
    var page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.hdr-nav a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (href === page || (page === '' && href === 'index.html')) {
        a.classList.add('active');
      }
    });
  }

  /* ── Cart badge ──────────────────────────────────────────── */
  function updateHdrCartBadge() {
    var badge = document.getElementById('hdrCartBadge');
    if (!badge) return;
    var cart  = JSON.parse(localStorage.getItem('cart') || '[]');
    var count = cart.reduce(function (s, i) { return s + (i.quantity || 1); }, 0);
    badge.textContent = count;
    badge.classList.toggle('hidden', count === 0);
  }

  /* ── Search ──────────────────────────────────────────────── */
  function initSearch() {
    var input = document.getElementById('hdrSearchInput');
    var drop  = document.getElementById('hdrSearchDrop');
    if (!input || !drop) return;

    input.addEventListener('input', function () {
      var q = this.value.trim().toLowerCase();
      drop.innerHTML = '';

      if (!q) { drop.classList.remove('open'); return; }

      var matches = PRODUCTS.filter(function (p) {
        return p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q);
      });

      if (matches.length === 0) {
        drop.innerHTML = '<div class="hdr-sres-empty">No results for "' + escHtml(q) + '"</div>';
      } else {
        matches.slice(0, 6).forEach(function (p) {
          var a = document.createElement('a');
          a.className = 'hdr-sres';
          a.href = p.href;
          a.innerHTML =
            '<span class="hdr-sres-icon">' + p.icon + '</span>' +
            '<span><span class="hdr-sres-name">' + escHtml(p.name) + '</span>' +
            '<span class="hdr-sres-cat">' + escHtml(p.cat) + '</span></span>';
          drop.appendChild(a);
        });
      }

      drop.classList.add('open');
    });

    /* search button / enter */
    var btn = input.parentElement.querySelector('.hdr-search-btn');
    if (btn) {
      btn.addEventListener('click', function () { doSearch(input.value); });
    }
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') doSearch(this.value);
    });

    /* close on outside click */
    document.addEventListener('click', function (e) {
      if (!input.closest('.hdr-search').contains(e.target)) {
        drop.classList.remove('open');
      }
    });
  }

  function doSearch(q) {
    q = (q || '').trim();
    if (!q) return;
    var page = window.location.pathname.split('/').pop();
    if (page === 'shop.html') {
      filterShopProducts(q);
    } else {
      window.location.href = 'shop.html?q=' + encodeURIComponent(q);
    }
  }

  function filterShopProducts(q) {
    q = q.toLowerCase();
    document.querySelectorAll('.product-tile').forEach(function (tile) {
      var text = (tile.textContent || '').toLowerCase();
      tile.style.display = text.includes(q) ? '' : 'none';
    });
    var drop = document.getElementById('hdrSearchDrop');
    if (drop) drop.classList.remove('open');
  }

  /* handle ?q= param on shop page */
  function handleSearchParam() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      var input = document.getElementById('hdrSearchInput');
      if (input) { input.value = q; }
      filterShopProducts(q);
    }
  }

  /* ── Scroll reveal ───────────────────────────────────────── */
  function initReveal() {
    var sel = 'section, .product-tile, .stat-card, .review-card, .popular-dashboard, .cart-section, .container';
    document.querySelectorAll(sel).forEach(function (el, i) {
      el.classList.add('reveal');
      if (i % 3 === 1) el.classList.add('reveal-d1');
      if (i % 3 === 2) el.classList.add('reveal-d2');
    });

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.07 });

    document.querySelectorAll('.reveal').forEach(function (el) { obs.observe(el); });
  }

  /* ── Floating sprinkle particles ─────────────────────────── */
  function initSprinkles() {
    var palette = ['#E8C49A','#EDD48A','#B8854F','#F5E6D0','#D4A86A','#FBE8CC','#96693A','#F0D4A8'];
    var radii   = ['50%','3px','50%','6px','50%'];
    for (var i = 0; i < 18; i++) {
      var sp   = document.createElement('div');
      var size = (Math.random() * 9 + 4).toFixed(1);
      sp.className = 'sprinkle';
      sp.style.cssText = [
        'left:'               + (Math.random() * 100).toFixed(1) + 'vw',
        'width:'              + size + 'px',
        'height:'             + size + 'px',
        'border-radius:'      + radii[Math.floor(Math.random() * radii.length)],
        'background:'         + palette[Math.floor(Math.random() * palette.length)],
        'animation-duration:' + (Math.random() * 18 + 10).toFixed(1) + 's',
        'animation-delay:'    + (Math.random() * -30).toFixed(1) + 's'
      ].join(';');
      document.body.appendChild(sp);
    }
  }

  /* ── Utility ─────────────────────────────────────────────── */
  function escHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  /* ── WhatsApp float button ───────────────────────────────── */
  function injectWhatsApp() {
    if (document.querySelector('.wa-float')) return;
    var msg = encodeURIComponent("Hi! I'd like to place an order with Cupcakes on the Avenue 🧁");
    var a = document.createElement('a');
    a.className = 'wa-float';
    a.href = 'https://wa.me/447818187840?text=' + msg;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', 'Order via WhatsApp');
    a.innerHTML =
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>' +
      '<span>Order via WhatsApp</span>';
    document.body.appendChild(a);
  }

  /* ── Flavour quiz ────────────────────────────────────────── */
  var _quizAnswers = {};

  var QUIZ_RESULTS = {
    shortbread: {
      icon: '⭐', title: 'Shortbread Delight',
      desc: 'Our signature buttery shortbread — melt-in-your-mouth perfection and the star of Highworth Market. Classic, elegant and completely irresistible.',
      price: 'From £20', link: 'shop.html'
    },
    brownies: {
      icon: '🍫', title: 'Brownies',
      desc: 'Rich, fudgy homemade brownies in your choice of topping. A whole tray of pure indulgence — perfect for sharing (or not!).',
      price: 'Full tray £30', link: 'shop.html'
    },
    cookies: {
      icon: '🍪', title: 'Cookies',
      desc: 'Thick, chewy homemade cookies in any flavour you fancy. Freshly baked and packed with flavour in every bite.',
      price: '6 for £15 · 12 for £25', link: 'shop.html'
    },
    cookie_pie: {
      icon: '🥧', title: 'Cookie Pie',
      desc: 'A giant, thick cookie baked as a whole pie and loaded with toppings. The ultimate centrepiece for any celebration.',
      price: 'Whole pie £30', link: 'shop.html'
    },
    custom_cake: {
      icon: '🎂', title: 'Custom Celebration Cake',
      desc: 'A bespoke handmade cake designed just for you — your flavours, your design, your occasion. Tell us your vision and we\'ll make it happen.',
      price: 'From £45', link: 'shop.html'
    }
  };

  function openQuiz() {
    _quizAnswers = {};
    document.getElementById('quizOverlay').classList.add('open');
    document.getElementById('quizDrawer').classList.add('open');
    showQuizStep(1);
  }

  function closeQuiz() {
    document.getElementById('quizOverlay').classList.remove('open');
    document.getElementById('quizDrawer').classList.remove('open');
  }

  function showQuizStep(n) {
    document.querySelectorAll('.quiz-step').forEach(function(s) { s.classList.remove('active'); });
    var el = document.getElementById('quizStep' + n);
    if (el) el.classList.add('active');
    var pct = n <= 3 ? Math.round((n - 1) / 3 * 100) : 100;
    var fill = document.getElementById('quizFill');
    if (fill) fill.style.width = pct + '%';
  }

  function quizPick(step, val, el) {
    _quizAnswers[step] = val;
    var parent = el.closest('.quiz-options');
    if (parent) parent.querySelectorAll('.quiz-opt').forEach(function(o) { o.classList.remove('selected'); });
    el.classList.add('selected');
    setTimeout(function() {
      if (step < 3) { showQuizStep(step + 1); }
      else { showQuizResult(); }
    }, 300);
  }

  function showQuizResult() {
    var result = calcQuizResult();
    var r = QUIZ_RESULTS[result];
    var el = document.getElementById('quizStep4');
    if (!el) return;
    el.innerHTML =
      '<div class="quiz-result">' +
      '<span class="quiz-result-icon">' + r.icon + '</span>' +
      '<div class="quiz-result-title">' + r.title + '</div>' +
      '<div class="quiz-result-desc">' + r.desc + '</div>' +
      '<div class="quiz-result-price">' + r.price + '</div>' +
      '<a href="' + r.link + '" class="quiz-shop-btn">Order Now →</a>' +
      '<button class="quiz-restart-btn" onclick="openQuiz()">Take the quiz again</button>' +
      '</div>';
    showQuizStep(4);
  }

  function calcQuizResult() {
    var occ  = _quizAnswers[1]; /* birthday|party|wedding|just */
    var flav = _quizAnswers[2]; /* choc|fruity|classic|indulgent */
    var size = _quizAnswers[3]; /* me|group|big */

    if (flav === 'classic') return 'shortbread';
    if (flav === 'choc' && size === 'me') return 'brownies';
    if (flav === 'choc' && size === 'group') return 'cookie_pie';
    if (flav === 'indulgent' && size === 'me') return 'cookies';
    if (flav === 'indulgent' && size === 'group') return 'cookie_pie';
    if (size === 'big' || occ === 'wedding' || occ === 'birthday') return 'custom_cake';
    if (flav === 'fruity') return 'custom_cake';
    return 'cookies';
  }

  /* ── Init ───────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    warmColors();
    markActiveNav();
    updateHdrCartBadge();
    initSearch();
    initReveal();
    initSprinkles();
    handleSearchParam();
    injectWhatsApp();

    /* quiz overlay click-outside close */
    var overlay = document.getElementById('quizOverlay');
    if (overlay) overlay.addEventListener('click', closeQuiz);

    /* keep badge in sync when cart changes on any page */
    window.addEventListener('storage', updateHdrCartBadge);

    /* expose quiz globally */
    window.openQuiz  = openQuiz;
    window.closeQuiz = closeQuiz;
    window.quizPick  = quizPick;
  });

})();
