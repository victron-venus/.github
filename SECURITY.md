# Security policy

## Reporting

Report vulnerabilities in this website, profile or shared workflows privately through [GitHub vulnerability reporting](https://github.com/victron-venus/.github/security/advisories/new). For another project, use its own security policy and report form. Include the affected URL or commit, reproduction steps and impact; omit active secrets and personal information. If the private channel is unavailable, open an issue requesting confidential contact without exploit details.

Maintainers aim to acknowledge reports within 14 days and correct confirmed exploitable medium-or-higher vulnerabilities within 60 days of confirmation. Prioritize critical issues, coordinate ordinary disclosure with a fix or mitigation, and publish protective guidance earlier if active exploitation or urgent risk warrants it. Identify assigned CVEs/advisory identifiers in security release or deployment notes. These are policies, not historical response-time claims.

## Scope and trust boundaries

The current default branch is the maintained site. GitHub Pages serves public static content; no private configuration or credentials belong in HTML, JavaScript, documentation or the project catalog. Verify public repository visibility before publishing links. Browser input must not become executable markup.

Translation is an optional third-party service. A language choice loads Google's script, which can read and modify the page. Do not enter secrets into public pages. The site must not initiate translation merely from the browser language or a historical cookie. A new explicit consent can be remembered locally; Original removes it. Browser privacy settings may prevent remembering a choice. Test these boundaries when changing the translation UI.

CI processes contributor-controlled files. Keep workflow tokens minimal, pin actions to reviewed commits, validate untrusted input and avoid privileged execution of unreviewed changes. Static analysis and local browser-logic tests are required checks; they do not prove the behavior of remotely served third-party code.

Obtain source through the repository's HTTPS endpoint. This validation-only repository deploys through its existing Pages configuration rather than tagged application packages. Describe user-visible changes and security fixes in reviewed pull requests. Follow [CONTRIBUTING.md](CONTRIBUTING.md) for checks and [OpenSSF evidence](docs/openssf-evidence.md) for verification gaps.
