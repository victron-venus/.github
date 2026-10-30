# Public documentation site

The site at <https://victron-venus.github.io/.github/> introduces the public
projects and presents the guides in `wiki/`. It is separate from GitHub's built-in
Wiki, whose page styling is controlled by GitHub.

## Content and design

- `index.html`: introduction, task-based entry points and a system diagram.
- `projects.html`: project catalog with optional filtering.
- `wiki/*.html`: installation, architecture, integration and contribution guides.
- `assets/css/style.css`: shared layout, dark overview and light reading palettes.
- `assets/img/energy-system.svg`: an original conceptual diagram, not telemetry,
  a hardware photograph or a promise of supported wiring.
- `assets/js/site.js`: local search, heading navigation and copy-code controls.
- `assets/js/main.js`: catalog filters, diagram interaction and optional translation.

Content and navigation work without JavaScript. Search and copy buttons are
progressive enhancements. No remote fonts, UI libraries or analytics are needed.
Google Translate remains opt-in. Motion respects reduced-motion preferences.
Print styles remove controls and retain guide content.

Keep compatibility requirements and operating limits in the text. Never present
a sample graph as live data. Only link projects already public; local settings
and private repository names are not site content.

## Edit and validate

Edit HTML and retain existing section IDs so shared links keep working. Give new
guide sections stable IDs on their `h2`. After changing a guide, regenerate search:

```sh
python3 scripts/build-search-index.py
bash scripts/ci.sh
```

Checks reject stale search content, duplicate IDs, missing local navigation or
search anchors, missing assets and direct third-party page dependencies. The
JavaScript tests also check preservation of translation consent.

Preview the public site files with a loopback HTTP server. Check the home page,
project filters, guide search and a long guide at desktop and narrow phone widths.
Use the menu and search with a keyboard. A result must open its exact section;
Escape should close search; empty results should give a useful message. Disabling
JavaScript must leave the content and navigation usable.

## Publish and recover

Pages publishes the repository's configured source after merge. Check the Pages
deployment result and the live home, catalog and guides: a merge alone does not
confirm publication. Existing URLs stay unchanged.

Revert a presentation regression through a reviewed PR. Preserve documentation
and existing anchors; rebuild search if the reverted change affects guide text.
