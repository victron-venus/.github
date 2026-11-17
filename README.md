# victron-venus/.github

Organization-level repository for the [victron-venus](https://github.com/victron-venus) GitHub
organization. Two jobs:

1. **Organization profile** — `profile/README.md` (shown on the org page), community health files,
   and issue templates.
2. **Redirect stubs** — the historical site paths (`index.html`, `projects.html`, `wiki/*.html`)
   now redirect to the single maintained site at
   **[https://victron-venus.github.io/](https://victron-venus.github.io/)**, which is served from the
   separate `victron-venus.github.io` repository. There is no second copy of the catalog or the
   guides here; a stale duplicate used to compete with the root site in search results.

<!-- ci-release-process:start -->
## CI and deployment

See [CI and deployment workflow](docs/release-workflow.md) for required checks and local commands. This repository uses validation-only policy; application release channels do not apply.
<!-- ci-release-process:end -->

## Repository layout

```
profile/README.md   Organization profile shown on the GitHub org page
docs/               Organization-level documents (install, CI strategy, evidence, quality)
index.html          Redirect stub -> https://victron-venus.github.io/
projects.html       Redirect stub -> https://victron-venus.github.io/#projects
wiki/*.html         Redirect stubs -> the matching anchors on the maintained site
404.html            Minimal error page pointing at the maintained site
scripts/            Local validation entry point (scripts/ci.sh) and release helpers
tests/              Publishing-contract tests for the redirect stubs
```

The redirects keep historical links working and carry `noindex`, so only one copy of the
catalog appears in search results.

The stubs are plain HTML with no scripts, stylesheets or build step, so they cannot drift from the
maintained site: each one names the exact target URL and canonical link. Edit them through a pull
request as part of an organization docs change.

## Pages enablement

The canonical site is published from the `victron-venus.github.io` repository. Stubs here rely on
that repository's Pages deployment; keep the target URLs in the stubs aligned with its anchors.

## Keeping the catalog current

Update `profile/README.md` and the catalog in the `victron-venus.github.io` repository when a
public project is added, moved or archived. Keep related links in installation and architecture
guides aligned with the maintained implementation. Keep deployment claims tied to
the dated, scoped records in [the evidence index](docs/DEPLOYMENT-EVIDENCE.md);
a release or passing CI is not a current fleet inventory. Verify repository visibility
before publishing any name or URL; see [contribution rules](CONTRIBUTING.md).

## Docs

Long-form organization docs live in [`docs/`](docs/) (`INSTALL.md`, `CI_CD_STRATEGY.md`).
Published guides are maintained in the `victron-venus.github.io` repository. Contributing rules are in [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

Independent open-source projects. Not affiliated with or endorsed by Victron Energy B.V.

## Security and project readiness

See [security reporting and trust boundaries](SECURITY.md), [validation and contribution rules](CONTRIBUTING.md), and the [OpenSSF evidence and remaining requirements](docs/openssf-evidence.md). The root [MIT license](LICENSE) covers original source and documentation; [third-party notices](THIRD_PARTY_NOTICES.md) preserve separate terms and marks.

## Maintenance and security evidence

See [governance](GOVERNANCE.md), [Code of Conduct](CODE_OF_CONDUCT.md), [roadmap](ROADMAP.md), [source changes](CHANGELOG.md) and [quality evidence](docs/quality.md). Source revisions use complete Git identities; no synthetic application releases are created. Optional CLI status operations use the documented [transport profile](docs/transport-security.md).

[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/15586/badge)](https://www.bestpractices.dev/projects/15586)

## Public website

The maintained site is <https://victron-venus.github.io/> — it holds the project catalog, the
guides and the offline search index. Website editing, validation and publication are documented in
that repository; this repository only redirects to it. See [docs/PUBLIC_SITE.md](docs/PUBLIC_SITE.md)
for what each stub maps to.
