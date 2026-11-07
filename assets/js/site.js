/* 烁普智能官网 · interactions */
(function () {
  'use strict';

  var docEl = document.documentElement;
  docEl.classList.add('js');

  var nav = document.querySelector('.nav');
  var onScroll = function () {
    if (!nav) return;
    if (window.scrollY > 24) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = document.querySelector('.burger');
  var links = document.querySelector('.nav-links');
  if (burger && links) {
    var closeMenu = function () {
      links.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    };
    burger.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = links.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) {
        closeMenu();
        burger.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (!links.classList.contains('open')) return;
      if (links.contains(e.target) || burger.contains(e.target)) return;
      closeMenu();
    });
  }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('.rv');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  // count up for [data-count]
  var nums = document.querySelectorAll('[data-count]');
  if (nums.length && !reduce && 'IntersectionObserver' in window) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var target = parseFloat(el.getAttribute('data-count'));
        var dur = 1400, t0 = performance.now();
        var fmt = function (v) { return Math.round(v).toLocaleString('en-US'); };
        var step = function (now) {
          var p = Math.min((now - t0) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(target * eased);
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        io2.unobserve(el);
      });
    }, { threshold: 0.5 });
    nums.forEach(function (el) { io2.observe(el); });
  }

  // gate mode switch (Rhea page) — 三档状态机：strict / default / auto
  var GATE_STATE = {
    strict:  ['human', 'human', 'human', 'agent', 'agent', 'agent', 'agent'],
    'default': ['human', 'agent', 'auto', 'auto', 'auto', 'auto', 'auto'],
    auto:    ['agent', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto']
  };
  // 说明文字与状态机严格一一对应：只有 default 那一条可以自称"默认"
  var GATE_NOTE = {
    strict: '强合规：G1–G3 人审 · G4–G7 Agent 审。门禁收得最紧，交付速度也最慢——这个取舍由你决定。',
    'default': '默认：G1 人审 · G2 Agent 审 · G3–G7 auto（信任自家 API）。强合规场景可一键收紧到前三关人审——但门禁变严，交付速度也会变慢。',
    auto: '高信任：G1 Agent 审 · G2–G7 auto。审批环节最少、交付最快——等于把 G1 的边界确认也交给 Agent。'
  };
  var modes = document.querySelectorAll('[data-gate-mode]');
  var gates = document.querySelectorAll('.gates .gate');
  if (modes.length && gates.length) {
    var note = document.getElementById('gateNote');
    var applyMode = function (m) {
      var state = GATE_STATE[m] || GATE_STATE['default'];
      modes.forEach(function (b) {
        var on = b.getAttribute('data-gate-mode') === m;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      gates.forEach(function (g, i) {
        var mode = state[i] || 'auto';
        // 颜色由 [data-mode] 驱动，不再写内联 color，纸面段才能跟着重映射
        g.setAttribute('data-mode', mode);
        var label = g.querySelector('.gmode');
        if (label) {
          label.textContent = mode;
          label.style.color = '';
        }
      });
      if (note) note.textContent = GATE_NOTE[m] || GATE_NOTE['default'];
    };
    modes.forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyMode(btn.getAttribute('data-gate-mode'));
      });
    });
    var initial = document.querySelector('[data-gate-mode].on');
    if (initial) applyMode(initial.getAttribute('data-gate-mode'));
  }

  // 数据表横向溢出提示：只有真的能滚才挂右侧渐隐，滚到端点撤掉
  var wraps = document.querySelectorAll('.tbl-wrap');
  if (wraps.length) {
    var syncWrap = function (w) {
      var over = w.scrollWidth - w.clientWidth;
      var canScroll = over > 1;
      w.classList.toggle('is-scrollable', canScroll);
      w.classList.toggle('at-end', canScroll && w.scrollLeft >= over - 1);
    };
    wraps.forEach(function (w) {
      syncWrap(w);
      w.addEventListener('scroll', function () { syncWrap(w); }, { passive: true });
    });
    var syncAll = function () { wraps.forEach(syncWrap); };
    window.addEventListener('resize', syncAll);
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(syncAll);
      wraps.forEach(function (w) { ro.observe(w); });
    }
  }
})();
