# victron-venus/.github

Organization-level repository for the [victron-venus](https://github.com/victron-venus) GitHub
organization. Two jobs:

1. **Organization profile** — `profile/README.md` (shown on the org page), community health files,
   and issue templates.
2. **Organization website** — served by GitHub Pages at
   **[https://victron-venus.github.io](https://victron-venus.github.io/)** from the root of `main`.

## Website structure

```
index.html          Landing page with animated one-line system diagram + flagship projects
projects.html       Full catalog of all ecosystem projects (filter + search)
wiki/               Documentation hub
  install.html      Layer-by-layer full-stack install guide
  architecture.html The five layers, D-Bus vs MQTT split
  integration.html  Venus OS conventions: service naming, topics, packaging
  ci-standards.html Reusable workflows, pinning policy, release rules
  contributing.html PR flow, conventional commits, local checks
404.html            "Open circuit" error page
assets/             CSS, JS, favicon — no build step, no framework
.nojekyll           Serve static files as-is, skip Jekyll processing
sitemap.xml         Submitted via robots.txt
```

The site is dependency-free static HTML/CSS/JS. Edit any file, push to `main` (via PR), Pages
redeploys automatically.

## Pages enablement

Settings → Pages → *Deploy from a branch* → `main` / `/ (root)`. One-time setup; after that every
push redeploys.

## Docs

Long-form docs live in [`docs/`](docs/) (`INSTALL.md`, `CI_CD_STRATEGY.md`) and are summarized into
the website wiki. Contributing rules are in [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

Independent open-source projects. Not affiliated with or endorsed by Victron Energy B.V.
