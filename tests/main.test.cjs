const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { test } = require("node:test");
const { runInNewContext } = require("node:vm");

const source = readFileSync(resolve(__dirname, "../assets/js/main.js"), "utf8");

function element(properties = {}) {
  const classes = new Set();
  return {
    children: [],
    listeners: {},
    dataset: {},
    value: "",
    textContent: "",
    attributes: {},
    classList: {
      add(name) { classes.add(name); },
      remove(name) { classes.delete(name); },
      toggle(name, enabled) { enabled ? classes.add(name) : classes.delete(name); },
      contains(name) { return classes.has(name); },
    },
    appendChild(child) { this.children.push(child); },
    addEventListener(name, callback) { this.listeners[name] = callback; },
    setAttribute(name, value) { this.attributes[name] = value; },
    remove() { this.removed = true; },
    querySelector() { return null; },
    ...properties,
  };
}

function page({ cookie = "", consent = false, original = false, blockedStorage = false } = {}) {
  const head = element();
  const footer = element();
  const picker = element();
  const storage = new Map();
  if (consent) storage.set("googtrans-consent", "1");
  if (original) storage.set("googtrans-original", "1");
  let reloads = 0;
  const timers = [];
  const appliedLanguages = [];
  let widgetReady = false;
  const combo = element({ dispatchEvent() { appliedLanguages.push(this.value); } });
  const battery = element({ dataset: { tags: "python battery" }, textContent: "Battery bridge" });
  const dashboard = element({ dataset: { tags: "go dashboard" }, textContent: "Dashboard UI" });
  const group = element({ querySelectorAll: () => [battery, dashboard] });
  const all = element({ dataset: { filter: "all" } });
  const python = element({ dataset: { filter: "python" } });
  const filters = element({ querySelectorAll: () => [all, python] });
  const search = element();
  const empty = element();
  const nodes = {
    hub: element({ dataset: { node: "hub" } }),
    mqtt: element({ dataset: { node: "mqtt" } }),
    mqtt2: element({ dataset: { node: "mqtt2" } }),
    unconnected: element({ dataset: { node: "unconnected" } }),
    withoutId: element(),
  };
  // Like index.html, edges may connect more than one named node.
  const edges = [
    element({ dataset: { n: "hub mqtt" } }),
    element({ dataset: { n: "mqtt dash" } }),
    element({ dataset: { n: "mqtt2 ha" } }),
    element({ dataset: { n: "pv" } }),
  ];
  const years = [element({ textContent: "2026" }), element({ textContent: "2025" })];
  const document = {
    cookie,
    head,
    body: element(),
    querySelector(selector) {
      return {
        ".foot-inner": footer,
        ".foot-inner select.lang-select": picker,
        ".filters": filters,
        ".empty-note": empty,
        "select.goog-te-combo": widgetReady ? combo : null,
      }[selector] || null;
    },
    querySelectorAll(selector) {
      if (selector === ".group") return [group];
      if (selector === ".diagram .dg-node") return Object.values(nodes);
      if (selector === ".diagram .dg-edge") return edges;
      if (selector === "[data-year]") return years;
      const edgeMatch = /^\.diagram \.dg-edge\[data-n~="([^"]+)"\]$/.exec(selector);
      if (edgeMatch) {
        return edges.filter((edge) => edge.dataset.n.split(/\s+/).includes(edgeMatch[1]));
      }
      return [];
    },
    getElementById(id) { return id === "proj-search" ? search : null; },
    createElement(tagName) {
      return element({ tagName, querySelector: (selector) => selector === "select" ? picker : null });
    },
  };
  const context = {
    document,
    window: {},
    location: { host: "victron-venus.github.io", pathname: "/.github/", reload() { reloads++; } },
    navigator: { language: "de-DE" },
    localStorage: {
      getItem(key) { if (blockedStorage) throw new Error("Storage blocked"); return storage.get(key); },
      setItem(key, value) { if (blockedStorage) throw new Error("Storage blocked"); storage.set(key, value); },
      removeItem(key) { if (blockedStorage) throw new Error("Storage blocked"); storage.delete(key); },
    },
    setTimeout(callback) { timers.push(callback); },
    Event: class Event { constructor(type) { this.type = type; } },
    Date: class extends Date { constructor() { super("2042-06-15T12:00:00Z"); } },
  };
  runInNewContext(source, context, { filename: "assets/js/main.js" });
  return {
    head, storage, document, picker, battery, dashboard, group, all, python, search, empty,
    nodes, edges, years,
    reloads: () => reloads,
    appliedLanguages,
    initializeTranslation() {
      function TranslateElement() { widgetReady = true; }
      TranslateElement.InlineLayout = { SIMPLE: "simple" };
      context.google = { translate: { TranslateElement } };
      context.window.googleTranslateElementInit();
    },
    runPendingTimers() {
      for (const callback of timers.splice(0)) callback();
    },
    choose(code) { picker.value = code; picker.listeners.change(); },
  };
}

test("non-English browser and legacy language cookie do not load a third party", () => {
  for (const cookie of ["", "googtrans=/en/de"]) {
    const view = page({ cookie });
    assert.equal(view.head.children.length, 0);
    assert.equal(view.picker.value, "");
  }
});

test("explicit choice loads Google once while the first request is pending", () => {
  const view = page();
  view.choose("de");
  view.choose("fr");
  assert.equal(view.head.children.length, 1);
  assert.equal(new URL(view.head.children[0].src).hostname, "translate.google.com");
  assert.equal(view.storage.get("googtrans-consent"), "1");
  assert.match(view.document.cookie, /\/en\/fr/);
});

test("a previously consented choice restores, but original overrides it", () => {
  assert.equal(page({ cookie: "googtrans=/en/de", consent: true }).head.children.length, 1);
  assert.equal(page({ cookie: "googtrans=/en/de", consent: true, original: true }).head.children.length, 0);
  assert.equal(page({ cookie: "googtrans=/en/unknown", consent: true }).head.children.length, 0);
});

test("choosing original revokes consent and reloads", () => {
  const view = page({ cookie: "googtrans=/en/de", consent: true });
  view.choose("");
  assert.equal(view.storage.has("googtrans-consent"), false);
  assert.match(view.document.cookie, /max-age=0/);
  assert.equal(view.reloads(), 1);
});

test("blocked localStorage does not load automatically or break explicit selection", () => {
  const view = page({ cookie: "googtrans=/en/de", blockedStorage: true });
  assert.equal(view.head.children.length, 0);
  view.choose("fr");
  assert.equal(view.head.children.length, 1);
});

test("failed script requests can be retried by a later explicit choice", () => {
  const view = page();
  view.choose("de");
  view.head.children[0].onerror();
  assert.equal(view.head.children[0].removed, true);
  view.choose("fr");
  assert.equal(view.head.children.length, 2);
});

test("unknown language input cannot initiate an external request", () => {
  const view = page();
  view.choose("not-a-language");
  assert.equal(view.head.children.length, 0);
  assert.equal(view.storage.size, 0);
});

test("catalog combines tag filters with search and exposes empty results", () => {
  const view = page();
  view.python.listeners.click();
  assert.equal(view.battery.classList.contains("hidden"), false);
  assert.equal(view.dashboard.classList.contains("hidden"), true);
  assert.equal(view.python.attributes["aria-pressed"], "true");
  view.search.value = "dashboard";
  view.search.listeners.input();
  assert.equal(view.group.classList.contains("hidden"), true);
  assert.equal(view.empty.classList.contains("show"), true);
  view.all.listeners.click();
  assert.equal(view.dashboard.classList.contains("hidden"), false);
  assert.equal(view.group.classList.contains("hidden"), false);
  assert.equal(view.empty.classList.contains("show"), false);
});

test("diagram hover highlights only edges with the complete node token", () => {
  const { nodes, edges } = page();
  const highlights = () => edges.map((edge) => edge.classList.contains("hot"));
  assert.deepEqual(highlights(), [false, false, false, false]);
  nodes.mqtt.listeners.mouseenter();
  assert.deepEqual(highlights(), [true, true, false, false]);
  nodes.mqtt.listeners.mouseleave();
  assert.deepEqual(highlights(), [false, false, false, false]);

  nodes.hub.listeners.mouseenter();
  assert.deepEqual(highlights(), [true, false, false, false]);
  nodes.hub.listeners.mouseleave();
  nodes.mqtt2.listeners.mouseenter();
  assert.deepEqual(highlights(), [false, false, true, false]);
  nodes.mqtt2.listeners.mouseleave();
  assert.deepEqual(highlights(), [false, false, false, false]);
});

test("leaving a diagram node preserves highlights on unrelated edges", () => {
  const { nodes, edges } = page();
  nodes.mqtt.listeners.mouseenter();
  nodes.mqtt2.listeners.mouseenter();
  nodes.mqtt.listeners.mouseleave();
  assert.deepEqual(edges.map((edge) => edge.classList.contains("hot")), [false, false, true, false]);
});

test("unconnected nodes do not highlight edges and unnamed nodes have no hover handlers", () => {
  const { nodes, edges } = page();
  nodes.unconnected.listeners.mouseenter();
  assert.ok(edges.every((edge) => !edge.classList.contains("hot")));
  nodes.unconnected.listeners.mouseleave();
  assert.ok(edges.every((edge) => !edge.classList.contains("hot")));
  assert.deepEqual(nodes.withoutId.listeners, {});
});

test("all footer years use the current year from the clock", () => {
  assert.deepEqual(page().years.map((year) => String(year.textContent)), ["2042", "2042"]);
});


test("pending retries cannot restore an older language after the widget loads", () => {
  const view = page();
  view.choose("de");
  view.choose("fr");
  view.initializeTranslation();
  assert.deepEqual(view.appliedLanguages, ["fr"]);
  view.runPendingTimers();
  assert.deepEqual(view.appliedLanguages, ["fr", "fr"]);
  assert.equal(view.picker.value, "fr");
  assert.match(view.document.cookie, /\/en\/fr/);
});
