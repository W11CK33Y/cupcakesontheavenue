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

  /* ── Init ───────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    warmColors();
    markActiveNav();
    updateHdrCartBadge();
    initSearch();
    initReveal();
    initSprinkles();
    handleSearchParam();

    /* keep badge in sync when cart changes on any page */
    window.addEventListener('storage', updateHdrCartBadge);
  });

})();
