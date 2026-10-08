# victron-venus/.github

Organization-level repository for the [victron-venus](https://github.com/victron-venus) GitHub
organization. Two jobs:

1. **Organization profile** — `profile/README.md` (shown on the org page), community health files,
   and issue templates.
2. **Organization website** — served by GitHub Pages at
   **[https://victron-venus.github.io/.github/](https://victron-venus.github.io/.github/)** (the root https://victron-venus.github.io/ redirects there via the `victron-venus.github.io` repo) from the root of `main`.

<!-- ci-release-process:start -->
## CI and deployment

See [CI and deployment workflow](docs/release-workflow.md) for required checks and local commands. This repository uses validation-only policy; application release channels do not apply.
<!-- ci-release-process:end -->

## Website structure

```
index.html          Landing page with animated one-line system diagram + flagship projects
projects.html       Public project catalog, including archived replacements (filter + search)
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

The site uses static HTML/CSS/JS with no build dependencies. Google Translate loads only after an explicit language choice; a locally remembered consent and language can restore that choice on later pages. Choosing Original revokes that consent. Edit files through a pull request; Pages redeploys when the change reaches `main`.

## Pages enablement

Settings → Pages → *Deploy from a branch* → `main` / `/ (root)`. One-time setup; after that every
push redeploys.

## Keeping the catalog current

Update `profile/README.md` and `projects.html` together when a public project is
added, moved or archived. Keep related links in installation and architecture
guides aligned with the maintained implementation. Verify repository visibility
before publishing any name or URL; see [contribution rules](CONTRIBUTING.md).

## Docs

Long-form docs live in [`docs/`](docs/) (`INSTALL.md`, `CI_CD_STRATEGY.md`) and are summarized into
the website wiki. Contributing rules are in [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

Independent open-source projects. Not affiliated with or endorsed by Victron Energy B.V.

## Security and project readiness

See [security reporting and trust boundaries](SECURITY.md), [validation and contribution rules](CONTRIBUTING.md), and the [OpenSSF evidence and remaining requirements](docs/openssf-evidence.md). The repository does not currently contain a root license; [ownership and licensing review](docs/licensing-review.md) remains required before an open-source badge claim.
