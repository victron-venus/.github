const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { test } = require("node:test");
const { runInNewContext } = require("node:vm");

const source = readFileSync(resolve(__dirname, "../assets/js/site.js"), "utf8");
const entries = [
  { title: "Battery setup", text: "Configure the battery bridge.", url: "wiki/install.html#battery" },
  { title: "MQTT", text: "Broker integration.", url: "wiki/integration.html#mqtt" },
];

function element() {
  return {
    children: [],
    listeners: {},
    value: "",
    textContent: "",
    append(child) { this.children.push(child); },
    replaceChildren(...children) { this.children = children; },
    addEventListener(name, callback) { this.listeners[name] = callback; },
  };
}

function page() {
  const input = element();
  const results = element();
  const status = element();
  const search = element();
  search.querySelector = (selector) => ({
    input,
    ".search-results": results,
    ".search-status": status,
  })[selector] || null;
  const requests = [];
  const document = {
    currentScript: { src: "https://victron-venus.github.io/.github/assets/js/site.js" },
    querySelector: (selector) => selector === ".doc-search" ? search : null,
    querySelectorAll: () => [],
    createElement: element,
  };
  runInNewContext(source, {
    document,
    navigator: {},
    URL,
    fetch(url) {
      return new Promise((resolveRequest, rejectRequest) => {
        requests.push({
          url: String(url),
          succeed(value = entries) { resolveRequest({ ok: true, json: async () => value }); },
          failHttp() { resolveRequest({ ok: false }); },
          failNetwork() { rejectRequest(new Error("Network unavailable")); },
        });
      });
    },
  }, { filename: "assets/js/site.js" });
  return {
    results, status, requests,
    type(value) { input.value = value; return input.listeners.input(); },
    links() { return results.children.map((row) => row.children[0]); },
  };
}

test("returning to the same query during the initial fetch renders each result once", async () => {
  const view = page();
  const pending = [view.type("ba"), view.type("bat"), view.type("ba")];
  assert.equal(view.requests.length, 1);
  assert.equal(view.requests[0].url, "https://victron-venus.github.io/.github/assets/search-index.json");
  view.requests[0].succeed();
  await Promise.all(pending);

  assert.equal(view.links().length, 1);
  assert.equal(view.links()[0].textContent, "Battery setup");
  assert.equal(view.links()[0].href, "https://victron-venus.github.io/.github/wiki/install.html#battery");
  assert.equal(view.status.textContent, "1 matching sections");
});

test("clearing a query keeps late success or failure from restoring results or status", async (t) => {
  for (const complete of ["succeed", "failNetwork"]) {
    await t.test(complete, async () => {
      const view = page();
      const pending = view.type("battery");
      await view.type("");
      const clearedStatus = view.status.textContent;
      assert.match(clearedStatus, /at least two characters/);
      view.requests[0][complete]();
      await pending;
      assert.equal(view.links().length, 0);
      assert.equal(view.status.textContent, clearedStatus);
      assert.equal(view.requests.length, 1);
    });
  }
});

test("a later search retries a failed index request and then reuses the successful index", async (t) => {
  for (const fail of ["failHttp", "failNetwork"]) {
    await t.test(fail, async () => {
      const view = page();
      const failed = view.type("battery");
      view.requests[0][fail]();
      await failed;
      assert.match(view.status.textContent, /Search is unavailable/);
      assert.equal(view.links().length, 0);

      const retry = view.type("MQTT");
      assert.equal(view.requests.length, 2);
      view.requests[1].succeed();
      await retry;
      assert.deepEqual(view.links().map((link) => link.textContent), ["MQTT"]);
      await view.type("battery");
      assert.equal(view.requests.length, 2);
      assert.deepEqual(view.links().map((link) => link.textContent), ["Battery setup"]);
    });
  }
});
