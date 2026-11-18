/* ==========================================================================
   CrownCAD Indonesia — main.js
   Progressive enhancement only: the page is fully readable without this file.
   ========================================================================== */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }

  /* ---------------------------------------------------------------------
     1. Year
     --------------------------------------------------------------------- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------------------------------------------------------------------
     2. Scroll progress + sticky nav + to-top
     --------------------------------------------------------------------- */
  var scrollbar = $("#scrollbar");
  var nav = $("#nav");
  var toTop = $("#toTop");
  var ticking = false;
  /* Header is transparent only at the very top of the page (over the hero
     render); it regains a solid bar as soon as the page scrolls. */
  function updateNavTone() {
    if (!nav) return;
    var y = window.pageYOffset || root.scrollTop;
    nav.classList.toggle("is-stuck", y > 8);
  }

  function onScroll() {
    var y = window.pageYOffset || root.scrollTop;
    var max = root.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;

    if (scrollbar) scrollbar.style.transform = "scaleX(" + ratio + ")";
    updateNavTone();
    if (toTop) toTop.classList.toggle("is-visible", y > 720);
    ticking = false;
  }

  function requestScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }

  window.addEventListener("scroll", requestScroll, { passive: true });
  window.addEventListener("resize", requestScroll);
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------------------------------------------------------------------
     3. Mobile menu
     --------------------------------------------------------------------- */
  var menu = $("#mobileMenu");
  var menuBtn = $("#menuBtn");
  var menuClose = $("#menuClose");
  var lastFocus = null;

  function menuIsOpen() {
    return !!menu && menu.classList.contains("is-open");
  }

  function openMenu() {
    if (!menu) return;
    lastFocus = doc.activeElement;
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    doc.body.classList.add("is-locked");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "true");
    var first = $("a, button", menu);
    if (first) first.focus();
  }

  function closeMenu(restoreFocus) {
    if (!menu) return;
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    doc.body.classList.remove("is-locked");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
    if (restoreFocus && lastFocus && lastFocus.focus) lastFocus.focus();
  }

  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      menuIsOpen() ? closeMenu(true) : openMenu();
    });
  }
  if (menuClose) menuClose.addEventListener("click", function () { closeMenu(true); });

  if (menu) {
    $$("a", menu).forEach(function (link) {
      link.addEventListener("click", function () { closeMenu(false); });
    });

    menu.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var focusables = $$("a[href], button:not([disabled])", menu).filter(function (el) {
        return el.offsetParent !== null;
      });
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && doc.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && doc.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  doc.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menuIsOpen()) closeMenu(true);
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 1180 && menuIsOpen()) closeMenu(false);
  });

  /* ---------------------------------------------------------------------
     4. Module tabs
     --------------------------------------------------------------------- */
  var tabs = $$('.tabs [role="tab"]');

  function selectTab(tab, setFocus) {
    tabs.forEach(function (t) {
      var selected = t === tab;
      t.classList.toggle("is-active", selected);
      t.setAttribute("aria-selected", selected ? "true" : "false");
      t.setAttribute("tabindex", selected ? "0" : "-1");

      var panel = doc.getElementById(t.getAttribute("aria-controls"));
      if (panel) {
        panel.classList.toggle("is-active", selected);
        if (selected) panel.removeAttribute("hidden");
        else panel.setAttribute("hidden", "");
      }
    });
    if (setFocus) tab.focus();
  }

  tabs.forEach(function (tab, i) {
    tab.setAttribute("tabindex", tab.getAttribute("aria-selected") === "true" ? "0" : "-1");

    tab.addEventListener("click", function () { selectTab(tab, false); });

    tab.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") next = tabs[0];
      else if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) {
        e.preventDefault();
        selectTab(next, true);
      }
    });
  });

  /* ---------------------------------------------------------------------
     5. Gallery lightbox
     --------------------------------------------------------------------- */
  var items = $$(".gallery-item[data-full]");
  var lb = $("#lightbox");
  var lbImage = $("#lbImage");
  var lbCount = $("#lbCount");
  var lbClose = $("#lbClose");
  var lbPrev = $("#lbPrev");
  var lbNext = $("#lbNext");
  var lbIndex = 0;
  var lbReturnFocus = null;

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function showSlide(index) {
    if (!items.length) return;
    lbIndex = (index + items.length) % items.length;
    var item = items[lbIndex];
    var full = item.getAttribute("data-full");
    var img = $("img", item);
    var alt = (img && img.getAttribute("alt")) || item.getAttribute("aria-label") || "";
    if (lbImage) {
      lbImage.src = full;
      lbImage.alt = alt;
    }
    if (lbCount) lbCount.textContent = pad(lbIndex + 1) + " / " + pad(items.length);
  }

  function openLightbox(index, trigger) {
    if (!lb) return;
    lbReturnFocus = trigger || doc.activeElement;
    showSlide(index);
    lb.removeAttribute("hidden");
    doc.body.classList.add("is-locked");
    if (lbClose) lbClose.focus();
  }

  function closeLightbox() {
    if (!lb || lb.hasAttribute("hidden")) return;
    lb.setAttribute("hidden", "");
    doc.body.classList.remove("is-locked");
    if (lbImage) lbImage.removeAttribute("src");
    if (lbReturnFocus && lbReturnFocus.focus) lbReturnFocus.focus();
  }

  items.forEach(function (item, i) {
    item.addEventListener("click", function () { openLightbox(i, item); });
  });

  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lbPrev) lbPrev.addEventListener("click", function () { showSlide(lbIndex - 1); });
  if (lbNext) lbNext.addEventListener("click", function () { showSlide(lbIndex + 1); });

  if (lb) {
    lb.addEventListener("click", function (e) {
      if (e.target === lb) closeLightbox();
    });
  }

  doc.addEventListener("keydown", function (e) {
    if (!lb || lb.hasAttribute("hidden")) return;
    if (e.key === "Escape") { e.preventDefault(); closeLightbox(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); showSlide(lbIndex + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); showSlide(lbIndex - 1); }
  });

  /* Swipe on touch devices */
  if (lb) {
    var startX = null;
    lb.addEventListener("touchstart", function (e) {
      startX = e.changedTouches[0].clientX;
    }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 48) showSlide(dx < 0 ? lbIndex + 1 : lbIndex - 1);
      startX = null;
    }, { passive: true });
  }

  /* ---------------------------------------------------------------------
     5b. Gallery chamber (all photos, two rows stay in the page)
     --------------------------------------------------------------------- */
  var chamber = $("#galleryChamber");
  var chamberGrid = $("#chamberGrid");
  var chamberClose = $("#chamberClose");
  var chamberCount = $("#chamberCount");
  var galleryAll = $("#galleryAll");
  var galleryCount = $("#galleryCount");
  var chamberReturnFocus = null;
  var chamberBuilt = false;

  function chamberTotal(n) {
    if (galleryCount) galleryCount.textContent = pad(n);
    if (chamberCount) chamberCount.textContent = pad(n);
  }

  function buildChamber() {
    if (chamberBuilt || !chamberGrid) return;
    items.forEach(function (item, i) {
      var source = $("img", item);
      var btn = doc.createElement("button");
      btn.type = "button";
      btn.className = "chamber-item";
      btn.setAttribute("aria-label", "Buka foto " + (i + 1) + " dari " + items.length);
      var img = doc.createElement("img");
      if (source) {
        if (source.getAttribute("src")) img.src = source.getAttribute("src");
        if (source.getAttribute("srcset")) img.srcset = source.getAttribute("srcset");
        if (source.getAttribute("sizes")) img.sizes = source.getAttribute("sizes");
        if (source.getAttribute("alt")) img.alt = source.getAttribute("alt");
      }
      img.loading = "lazy";
      img.decoding = "async";
      btn.appendChild(img);
      btn.addEventListener("click", function () {
        closeChamber();
        openLightbox(i, galleryAll);
      });
      chamberGrid.appendChild(btn);
    });
    chamberBuilt = true;
  }

  function openChamber(trigger) {
    if (!chamber) return;
    buildChamber();
    chamberReturnFocus = trigger || doc.activeElement;
    chamber.removeAttribute("hidden");
    doc.body.classList.add("is-locked");
    if (chamberClose) chamberClose.focus();
  }

  function closeChamber() {
    if (!chamber || chamber.hasAttribute("hidden")) return;
    chamber.setAttribute("hidden", "");
    doc.body.classList.remove("is-locked");
    if (chamberReturnFocus && chamberReturnFocus.focus) chamberReturnFocus.focus();
  }

  chamberTotal(items.length);
  if (galleryAll) galleryAll.addEventListener("click", function () { openChamber(galleryAll); });
  if (chamberClose) chamberClose.addEventListener("click", closeChamber);

  if (chamber) {
    chamber.addEventListener("click", function (e) {
      if (e.target === chamber) closeChamber();
    });
  }

  doc.addEventListener("keydown", function (e) {
    if (!chamber || chamber.hasAttribute("hidden")) return;
    if (e.key === "Escape") { e.preventDefault(); closeChamber(); }
  });

  /* ---------------------------------------------------------------------
     6. Map activation (avoid loading Google Maps before intent)
     --------------------------------------------------------------------- */
  var mapCover = $("#mapCover");
  if (mapCover) {
    mapCover.addEventListener("click", function () {
      var frame = mapCover.closest(".map-frame");
      if (frame) frame.classList.add("is-active");
    });
  }

  /* ---------------------------------------------------------------------
     7. Lead form → WhatsApp
     --------------------------------------------------------------------- */
  var form = $("#leadForm");
  if (form) {
    var error = $("#formError");
    var nameField = $("#fName");
    var companyField = $("#fCompany");
    var emailField = $("#fEmail");
    var phoneField = $("#fPhone");
    var needField = $("#fNeed");

    function mark(el, valid) {
      if (!el) return;
      el.classList.toggle("is-invalid", !valid);
      el.setAttribute("aria-invalid", valid ? "false" : "true");
    }

    function validEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value.trim());
    }

    function validPhone(value) {
      var digits = value.replace(/[^0-9]/g, "");
      return digits.length >= 8 && digits.length <= 16;
    }

    function validate() {
      var okName = !!nameField && nameField.value.trim().length >= 2;
      var okCompany = !!companyField && companyField.value.trim().length >= 2;
      var okEmail = !!emailField && validEmail(emailField.value);
      var okPhone = !!phoneField && validPhone(phoneField.value);

      mark(nameField, okName);
      mark(companyField, okCompany);
      mark(emailField, okEmail);
      mark(phoneField, okPhone);

      var ok = okName && okCompany && okEmail && okPhone;
      if (error) error.hidden = ok;
      if (!ok) {
        var first = [nameField, companyField, emailField, phoneField].filter(function (el) {
          return el && el.classList.contains("is-invalid");
        })[0];
        if (first) first.focus();
      }
      return ok;
    }

    [nameField, companyField, emailField, phoneField].forEach(function (el) {
      if (!el) return;
      el.addEventListener("input", function () {
        if (el.classList.contains("is-invalid")) mark(el, true);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) return;

      var lines = [
        "Halo PT Hetra, saya ingin informasi CrownCAD.",
        "",
        "Nama: " + nameField.value.trim(),
        "Perusahaan: " + companyField.value.trim(),
        "Email: " + emailField.value.trim(),
        "WhatsApp: " + phoneField.value.trim(),
        "Kebutuhan: " + (needField ? needField.value : "-")
      ];

      var url = "https://wa.me/6283815512745?text=" + encodeURIComponent(lines.join("\n"));
      window.open(url, "_blank", "noopener");
    });
  }

  /* ---------------------------------------------------------------------
     8. Anchor links: keep keyboard focus in sync with smooth scrolling
     --------------------------------------------------------------------- */
  $$('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function () {
      var id = link.getAttribute("href");
      if (!id || id === "#") return;
      var target = doc.querySelector(id);
      if (!target) return;
      target.setAttribute("tabindex", "-1");
      setTimeout(function () { target.focus({ preventScroll: true }); }, reduceMotion ? 0 : 520);
    });
  });
})();
