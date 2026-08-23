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

  // ----- Auto-translate picker -----
  // Builds a Google Translate (translate.goog) proxy URL for the current page.
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
  // translate.goog host encoding: existing "-" -> "--", "." -> "-"
  // victron-venus.github.io -> victron--venus-github-io.translate.goog
  function googUrl(targetLang) {
    let host = location.hostname;
    if (!host.endsWith(".translate.goog")) {
      host = host.replaceAll("-", "--").replaceAll(".", "-") + ".translate.goog";
    }
    const params = new URLSearchParams({
      _x_tr_sl: "auto",
      _x_tr_tl: targetLang,
      _x_tr_hl: "en",
    });
    return `https://${host}${location.pathname}?${params}`;
  }

  // Quick language links pinned to the top of every wiki page.
  if (location.pathname.includes("/wiki") && !location.host.startsWith("localhost")) {
    const QUICK_LANGS = [
      ["nl", "Nederlands"],
      ["de", "Deutsch"],
      ["fr", "Français"],
      ["ru", "Русский"],
    ];
    const bar = document.createElement("div");
    bar.className = "lang-top container";
    bar.setAttribute("aria-label", "Google Translate quick links");
    bar.innerHTML =
      '<span class="lt-label">🌐 Translate:</span>' +
      QUICK_LANGS.map(
        ([code, name]) => `<a href="${googUrl(code)}" hreflang="${code}">${name}</a>`
      ).join("");
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
      '<option value="">auto-translate…</option>' +
      Object.entries(EURO_LANGS)
        .map(([code, name]) => `<option value="${code}">${name}</option>`)
        .join("") +
      "</select>";
    const sel = wrap.querySelector("select");
    sel.addEventListener("change", () => {
      if (!sel.value) return;
      location.href = googUrl(sel.value);
    });
    footCol.appendChild(wrap);
  }
})();
