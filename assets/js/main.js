// victron-venus.github.io — progressive enhancement only.
// Pages are fully readable without JS; this adds filtering, search,
// and the hero-diagram hover highlight.

(function () {
  "use strict";

  // ----- Project catalog: tag filter + text search -----
  const filterBar = document.querySelector(".filters");
  if (filterBar) {
    const btns = Array.from(filterBar.querySelectorAll(".filter-btn"));
    const search = document.getElementById("proj-search");
    const groups = Array.from(document.querySelectorAll(".group"));
    const emptyNote = document.querySelector(".empty-note");
    let activeTag = "all";

    function apply() {
      const q = search ? search.value.trim().toLowerCase() : "";
      let visible = 0;
      groups.forEach((group) => {
        let groupVisible = 0;
        group.querySelectorAll(".proj").forEach((card) => {
          const tags = card.dataset.tags || "";
          const text = card.textContent.toLowerCase();
          const show =
            (activeTag === "all" || tags.split(" ").includes(activeTag)) &&
            (!q || text.includes(q));
          card.classList.toggle("hidden", !show);
          if (show) groupVisible++;
        });
        group.classList.toggle("hidden", groupVisible === 0);
        visible += groupVisible;
      });
      if (emptyNote) emptyNote.classList.toggle("show", visible === 0);
    }

    btns.forEach((btn) =>
      btn.addEventListener("click", () => {
        btns.forEach((b) => b.setAttribute("aria-pressed", b === btn ? "true" : "false"));
        activeTag = btn.dataset.filter;
        apply();
      })
    );
    if (search) search.addEventListener("input", apply);
  }

  // ----- Hero diagram: hover a node -> light up its edges -----
  document.querySelectorAll(".diagram .dg-node").forEach((node) => {
    const id = node.dataset.node;
    if (!id) return;
    const edges = document.querySelectorAll(
      '.diagram .dg-edge[data-n~="' + id + '"]'
    );
    node.addEventListener("mouseenter", () => {
      edges.forEach((e) => e.classList.add("hot"));
    });
    node.addEventListener("mouseleave", () => {
      edges.forEach((e) => e.classList.remove("hot"));
    });
  });

  // ----- Footer year -----
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  // ----- In-place Google Translate -----
  // Uses Google's Translate Element: the page is rewritten where it stands —
  // no translate.goog proxy hop and no collapsible top banner. A googtrans
  // cookie keeps the choice across every page of the site.
  // No third-party script loads until the visitor opts in.
  const EURO_LANGS = {
    sq: "shqip", hy: "հայերեն", az: "azərbaycan", be: "беларуская",
    bs: "bosanski", bg: "български", ca: "català", hr: "hrvatski",
    cs: "čeština", da: "dansk", nl: "Nederlands", en: "English",
    et: "eesti", fi: "suomi", fr: "Français", gl: "galego",
    ka: "ქართული", de: "Deutsch", el: "Ελληνικά", hu: "magyar",
    is: "íslenska", ga: "Gaeilge", it: "Italiano", lv: "latviešu",
    lt: "lietuvių", lb: "Lëtzebuergesch", mk: "македонски", mt: "Malti",
    no: "norsk", pl: "polski", pt: "Português", ro: "română",
    ru: "Русский", sr: "српски", sk: "slovenčina", sl: "slovenščina",
    es: "Español", sv: "svenska", tr: "Türkçe", uk: "Українська", cy: "Cymraeg",
  };
  const QUICK_LANGS = [
    ["nl", "Nederlands"],
    ["de", "Deutsch"],
    ["fr", "Français"],
    ["ru", "Русский"],
  ];

  function activeLang() {
    const m = document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([a-zA-Z-]+)/);
    return m ? m[1].toLowerCase() : "";
  }

  let elementLoaded = false;

  // "Visitor chose Original" flag (localStorage can throw in privacy modes).
  function origFlagSet(on) {
    try {
      if (on) localStorage.setItem("googtrans-original", "1");
      else localStorage.removeItem("googtrans-original");
    } catch (e) {}
  }
  function origFlagGet() {
    try { return localStorage.getItem("googtrans-original"); } catch (e) { return null; }
  }

  // Google renders its own <select class="goog-te-combo"> inside the hidden
  // mount; setting its value and firing change translates the page in place.
  function applyViaCombo(code) {
    let tries = 0;
    (function poke() {
      const combo = document.querySelector("select.goog-te-combo");
      if (combo && code) {
        combo.value = code;
        combo.dispatchEvent(new Event("change"));
        markActive(code);
      } else if (++tries < 40) {
        setTimeout(poke, 50);
      }
    })();
  }

  function ensureTranslateElement() {
    if (elementLoaded) return;
    window.googleTranslateElementInit = function () {
      // Hidden mount: translation is driven from our own picker UI.
      const mount = document.createElement("div");
      mount.id = "google_translate_element";
      document.body.appendChild(mount);
      new google.translate.TranslateElement(
        { pageLanguage: "en", autoDisplay: false },
        "google_translate_element"
      );
      elementLoaded = true;
      const saved = activeLang();
      if (saved) applyViaCombo(saved); // restore the choice on later pages
    };
    const s = document.createElement("script");
    s.async = true;
    s.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.head.appendChild(s);
  }

  function setLang(code) {
    if (!code) {
      // Back to original: drop the cookie, reload clean. Remember the
      // choice so browser-language auto-detect stays off afterwards.
      document.cookie = "googtrans=;path=/;max-age=0";
      origFlagSet(true);
      location.reload();
      return;
    }
    origFlagSet(false);
    document.cookie = `googtrans=/en/${code};path=/;samesite=lax`;
    ensureTranslateElement();
    applyViaCombo(code);
  }

  function markActive(code) {
    document.querySelectorAll(".lang-top .lang-btn").forEach((b) => {
      const on = b.dataset.lang === code;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", String(on));
    });
    const sel = document.querySelector(".foot-inner select.lang-select");
    if (sel) sel.value = code;
  }

  // Quick language buttons pinned to the top of every wiki page.
  if (location.pathname.includes("/wiki") && !location.host.startsWith("localhost")) {
    const bar = document.createElement("div");
    bar.className = "lang-top container";
    bar.setAttribute("aria-label", "In-place Google Translate");
    bar.innerHTML =
      '<span class="lt-label">🌐 Translate:</span>' +
      QUICK_LANGS.map(
        ([code, name]) =>
          `<button type="button" class="lang-btn" data-lang="${code}">${name}</button>`
      ).join("") +
      '<button type="button" class="lang-btn" data-lang="">Original</button>';
    bar.addEventListener("click", (e) => {
      const btn = e.target.closest(".lang-btn");
      if (btn) setLang(btn.dataset.lang);
    });
    const header = document.querySelector("header.nav");
    if (header) header.insertAdjacentElement("afterend", bar);
  }

  const footCol = document.querySelector(".foot-inner");
  if (footCol && !location.host.startsWith("localhost")) {
    const wrap = document.createElement("div");
    wrap.className = "foot-col";
    wrap.innerHTML =
      '<h4>Translate</h4>' +
      '<select class="lang-select" aria-label="Translate this page">' +
      '<option value="">English (original)</option>' +
      Object.entries(EURO_LANGS)
        .map(([code, name]) => `<option value="${code}">${name}</option>`)
        .join("") +
      "</select>";
    const sel = wrap.querySelector("select");
    sel.addEventListener("change", () => setLang(sel.value));
    sel.value = activeLang();
    footCol.appendChild(wrap);
  }

  // Browser-language auto-detect: first visit in a non-English browser
  // translates automatically. Skipped once the visitor picks Original
  // (opt-out flag) or a language of their own.
  if (
    !location.host.startsWith("localhost") &&
    !activeLang() &&
    !origFlagGet()
  ) {
    const auto = (navigator.language || "").slice(0, 2).toLowerCase();
    if (auto !== "en" && EURO_LANGS[auto]) setLang(auto);
  }

  markActive(activeLang());
})();
