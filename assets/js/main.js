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
})();
