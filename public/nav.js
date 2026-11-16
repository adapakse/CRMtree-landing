/*
 * CRMtree landing — menu nawigacji na telefonie/tablecie (☰), rozwijane „Produkty”
 * i widoczność widgetu czatu na telefonie.
 * Menu: panel na całą wysokość pod paskiem, strona pod spodem się nie przewija;
 * Esc, ✕ albo klik w link zamyka; stan w aria-expanded.
 * Etykiety „Otwórz menu” / „Zamknij menu” biorą tłumaczenie z i18n.js, jeśli jest
 * na stronie (polityka prywatności go nie ładuje — wtedy zostają po polsku).
 */
(function () {
  "use strict";

  var DESKTOP = window.matchMedia("(min-width: 1200px)");
  var PHONE = window.matchMedia("(max-width: 1023px)");  // telefon i tablet: hero z mockupem jest wtedy pod czatem
  var FALLBACK = { "nav.menu_open": "Otwórz menu", "nav.menu_close": "Zamknij menu" };

  function t(key) {
    var i18n = window.CRMtreeI18N;
    var val = i18n && i18n.t ? i18n.t(key) : null;
    return val || FALLBACK[key];
  }

  function onMediaChange(mq, fn) {
    if (mq.addEventListener) mq.addEventListener("change", fn);
    else if (mq.addListener) mq.addListener(fn);
  }

  function initMenu() {
    var toggle = document.querySelector(".navbar__toggle");
    var menu = document.getElementById("siteMenu");
    if (!toggle || !menu) return;

    function setLabel(open) {
      var key = open ? "nav.menu_close" : "nav.menu_open";
      toggle.setAttribute("data-i18n-aria-label", key);
      toggle.setAttribute("aria-label", t(key));
    }

    function isOpen() { return toggle.getAttribute("aria-expanded") === "true"; }

    function setOpen(open, returnFocus) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      menu.classList.toggle("open", open);
      document.body.classList.toggle("nav-open", open);
      document.documentElement.classList.toggle("nav-open", open);
      setLabel(open);
      if (open) menu.scrollTop = 0;
      if (!open && returnFocus) toggle.focus();
    }

    setLabel(false);
    toggle.addEventListener("click", function () { setOpen(!isOpen(), false); });

    // Klik w link w menu (np. #compare) — przewiń i zamknij menu.
    menu.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("a[href]") : null;
      if (a && isOpen()) setOpen(false, false);
    });

    // Fokus ucieka poza pasek (Tab za ostatni element) — zamknij.
    document.addEventListener("focusin", function (e) {
      var header = toggle.closest("header");
      if (isOpen() && header && !header.contains(e.target)) setOpen(false, false);
    });

    // Przejście do szerokiego ekranu — menu wraca do paska.
    onMediaChange(DESKTOP, function () { if (DESKTOP.matches && isOpen()) setOpen(false, false); });

    // ── „Produkty” (rozwijane) ──────────────────────────────────────
    var megas = document.querySelectorAll(".has-mega");
    Array.prototype.forEach.call(megas, function (wrap) {
      var btn = wrap.querySelector(".mega-trigger");
      if (!btn) return;
      btn.addEventListener("click", function () {
        var open = !wrap.classList.contains("open");
        wrap.classList.toggle("open", open);
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
      wrap.addEventListener("click", function (e) {
        if (e.target.closest && e.target.closest(".mega-item")) {
          wrap.classList.remove("open");
          btn.setAttribute("aria-expanded", "false");
        }
      });
      document.addEventListener("click", function (e) {
        if (DESKTOP.matches && !wrap.contains(e.target) && wrap.classList.contains("open")) {
          wrap.classList.remove("open");
          btn.setAttribute("aria-expanded", "false");
        }
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var openMega = document.querySelector(".has-mega.open");
      if (openMega && DESKTOP.matches) {
        openMega.classList.remove("open");
        var b = openMega.querySelector(".mega-trigger");
        if (b) { b.setAttribute("aria-expanded", "false"); b.focus(); }
        return;
      }
      if (isOpen()) setOpen(false, true);
    });
  }

  // ── Czat na telefonie ─────────────────────────────────────────────
  // Launcher nie może zasłaniać CTA: pokazuje się dopiero, gdy hero zniknie
  // z ekranu, i chowa się, gdy widać formularz kontaktowy albo stopkę.
  function initChat() {
    var chat = document.getElementById("chatWidget");
    if (!chat || !("IntersectionObserver" in window)) return;
    var hero = document.querySelector(".hero");
    var blockers = document.querySelectorAll("#trial, #contact, .footer");
    var heroVisible = !!hero;
    var visibleBlockers = 0;

    function update() {
      var hide = PHONE.matches && (heroVisible || visibleBlockers > 0);
      chat.classList.toggle("is-hidden", hide);
    }

    if (hero) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
        update();
      }).observe(hero);
    }
    var state = [];
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var i = Array.prototype.indexOf.call(blockers, en.target);
        state[i] = en.isIntersecting;
      });
      visibleBlockers = state.filter(Boolean).length;
      update();
    });
    Array.prototype.forEach.call(blockers, function (el) { io.observe(el); });
    onMediaChange(PHONE, update);
    update();
  }

  // ── Kotwice do zwiniętych modułów ─────────────────────────────────
  // Kafelki modułów to <details>. Link z menu, cyklu albo stopki do takiego
  // kafelka (np. #f-seobot) ma go rozwinąć, a nie przewinąć do zamkniętego.
  function openTarget(hash) {
    if (!hash || hash.length < 2) return;
    var el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (el && el.tagName === "DETAILS") el.open = true;
  }
  function initDetailsAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (a) openTarget(a.getAttribute("href"));
    });
    window.addEventListener("hashchange", function () { openTarget(location.hash); });
    openTarget(location.hash);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initChat();
    initDetailsAnchors();
  });
})();
