# OpenSSF Best Practices evidence

This is an evidence index for [OpenSSF Passing criteria](https://www.bestpractices.dev/en/criteria/0), not an awarded badge or completed assessment. The repository contains the organization's public static website and shared community files; it is a code project even though it has no application package build.

## Public development and interfaces

[Source and history](https://github.com/victron-venus/.github), [issues](https://github.com/victron-venus/.github/issues) and [pull requests](https://github.com/victron-venus/.github/pulls) record public development. [README](../README.md) describes the site structure and deployment, [CONTRIBUTING](../CONTRIBUTING.md) covers reporting/testing/review, and [SECURITY](../SECURITY.md) defines private reporting, response goals and trust boundaries. The root [MIT license](../LICENSE) and [scope record](licensing-review.md) document the owner-confirmed grant; third-party terms remain separate.

The maintained browser behavior is in [main.js](../assets/js/main.js): project filters/search, diagram hover states, footer year and an optional Google Translate integration. The translation trust boundary requires explicit consent, including before restoring a saved language. Static HTML remains readable when JavaScript is unavailable. Public catalog changes require checking repository visibility.

## Verification

[Local validation](../scripts/ci.sh) runs the syntax/workflow validator and [Node regression tests](../tests/main.test.cjs) against the actual browser script. Tests cover non-English visitors, legacy cookies, explicit and remembered consent, Original/revocation, denied browser storage, duplicate and failed script requests, unrecognized language values and combined search/filter results. [Validation CI](../.github/workflows/validate.yml) installs the documented tools and runs that same command.

[CodeQL](../.github/workflows/codeql.yml) analyzes JavaScript and Python; [dependency review](../.github/workflows/dependency-review.yml), [security scanning](../.github/workflows/security-scan.yml) and [quality gate](../.github/workflows/quality-gate.yml) define the other checks. Read the actual results for the submitted commit; a workflow's existence or a successful metadata check does not establish a clean security assessment.

## Current assessment boundaries

The owner-confirmed MIT grant, maintainer attestations and dated report/scanning inventory are recorded in [quality evidence](quality.md). [Governance](../GOVERNANCE.md), [conduct](../CODE_OF_CONDUCT.md), [roadmap](../ROADMAP.md) and [source publication](../RELEASING.md) define the ongoing process. Optional CLI network operations use the [transport profile](transport-security.md).

Full browser accessibility, real third-party translation behavior, complete coverage and backup-maintainer continuity remain unestablished. A merge or passing fixture test does not prove Pages deployment or linked-site security. Source revisions use full Git identities and [human-readable changes](../CHANGELOG.md), not invented package versions.
