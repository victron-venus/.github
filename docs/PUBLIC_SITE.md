# Public documentation site

The maintained site is <https://victron-venus.github.io/>, published from the separate
[`victron-venus.github.io`](https://github.com/victron-venus/victron-venus.github.io) repository. It
is a single page with the project catalog and the guides, plus a local search index. It is separate
from GitHub's built-in Wiki, whose page styling is controlled by GitHub.

This repository no longer publishes a second copy of that site. It keeps redirect stubs so
historical links keep working, and those stubs carry `noindex` so only the maintained site appears
in search results.

## Redirect stubs

Each stub names an exact target and declares a matching canonical link:

| Stub | Target |
| --- | --- |
| `index.html` | <https://victron-venus.github.io/> |
| `projects.html` | <https://victron-venus.github.io/#projects> |
| `wiki/index.html` | <https://victron-venus.github.io/#docs> |
| `wiki/install.html` | <https://victron-venus.github.io/#install> |
| `wiki/architecture.html` | <https://victron-venus.github.io/#architecture> |
| `wiki/integration.html` | <https://victron-venus.github.io/#integration> |
| `wiki/ci-standards.html` | <https://victron-venus.github.io/#ci> |
| `wiki/contributing.html` | <https://victron-venus.github.io/#contributing> |

`404.html` is a minimal error page that points at the maintained site. It has no CSS, JavaScript or
local assets, so nothing here can drift from the palette or behaviour of the published site.

## Editing

Content and design live in the `victron-venus.github.io` repository. Only touch these stubs when an
anchor on the maintained site is renamed. Keep the `<link rel="canonical">` href, the `refresh`
target and the `location.replace` target identical, then run:

```sh
bash scripts/ci.sh
```

The check rejects a stub whose target disagrees with its canonical link, a stub that reintroduces
local assets or scripts, and a stub missing `noindex`.

## Publication boundary

Only link projects that are already public. Local settings and private repository names are not
organization docs. Keep compatibility requirements and operating limits in the text, and never
present a sample graph as live data.
