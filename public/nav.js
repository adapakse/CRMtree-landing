/*
 * CRMtree landing — menu nawigacji na telefonie/tablecie (☰) i rozwijane „Produkty”.
 * Esc albo klik obok zamyka menu; stan w aria-expanded.
 * Etykiety „Otwórz menu” / „Zamknij menu” biorą tłumaczenie z i18n.js, jeśli jest
 * na stronie (polityka prywatności go nie ładuje — wtedy zostają po polsku).
 */
(function () {
  "use strict";

  var DESKTOP = window.matchMedia("(min-width: 1200px)");
  var FALLBACK = { "nav.menu_open": "Otwórz menu", "nav.menu_close": "Zamknij menu" };

  function t(key) {
    var i18n = window.CRMtreeI18N;
    var val = i18n && i18n.t ? i18n.t(key) : null;
    return val || FALLBACK[key];
  }

  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".navbar__toggle");
    var menu = document.getElementById("siteMenu");
    if (!toggle || !menu) return;

    var backdrop = document.createElement("div");
    backdrop.className = "navbar__backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    document.body.appendChild(backdrop);

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
      setLabel(open);
      if (!open && returnFocus) toggle.focus();
    }

    setLabel(false);
    toggle.addEventListener("click", function () { setOpen(!isOpen(), false); });
    backdrop.addEventListener("click", function () { setOpen(false, false); });

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
    var onWide = function () { if (DESKTOP.matches && isOpen()) setOpen(false, false); };
    if (DESKTOP.addEventListener) DESKTOP.addEventListener("change", onWide);
    else if (DESKTOP.addListener) DESKTOP.addListener(onWide);

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
  });
})();
