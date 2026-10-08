# OpenSSF Best Practices evidence

This is an evidence index for [OpenSSF Passing criteria](https://www.bestpractices.dev/en/criteria/0), not an awarded badge or completed assessment. The repository contains the organization's public static website and shared community files; it is a code project even though it has no application package build.

## Public development and interfaces

[Source and history](https://github.com/victron-venus/.github), [issues](https://github.com/victron-venus/.github/issues) and [pull requests](https://github.com/victron-venus/.github/pulls) record public development. [README](../README.md) describes the site structure and deployment, [CONTRIBUTING](../CONTRIBUTING.md) covers reporting/testing/review, and [SECURITY](../SECURITY.md) defines private reporting, response goals and trust boundaries. [Licensing review](licensing-review.md) records the missing root license and a proposal for owner review; this is an unresolved Passing requirement.

The maintained browser behavior is in [main.js](../assets/js/main.js): project filters/search, diagram hover states, footer year and an optional Google Translate integration. The translation trust boundary requires explicit consent, including before restoring a saved language. Static HTML remains readable when JavaScript is unavailable. Public catalog changes require checking repository visibility.

## Verification

[Local validation](../scripts/ci.sh) runs the syntax/workflow validator and [Node regression tests](../tests/main.test.cjs) against the actual browser script. Tests cover non-English visitors, legacy cookies, explicit and remembered consent, Original/revocation, denied browser storage, duplicate and failed script requests, unrecognized language values and combined search/filter results. [Validation CI](../.github/workflows/validate.yml) installs the documented tools and runs that same command.

[CodeQL](../.github/workflows/codeql.yml) analyzes JavaScript and Python; [dependency review](../.github/workflows/dependency-review.yml), [security scanning](../.github/workflows/security-scan.yml) and [quality gate](../.github/workflows/quality-gate.yml) define the other checks. Read the actual results for the submitted commit; a workflow's existence or a successful metadata check does not establish a clean security assessment.

## Remaining assessment work

- Publish an owner-approved open-source license after provenance review.
- Verify confidential reporting and historical handling of feedback/vulnerabilities, including channels outside GitHub; new documentation cannot establish past response times.
- Obtain this project's primary developer's secure-design and vulnerability-prevention attestations.
- Audit all open code, dependency and secret-scanning findings and review their age.
- Verify interface documentation, accessibility, actual browser behavior, and the external translation integration; DOM fixture tests do not cover them fully.
- Verify deployment/change history and useful notes for user-facing changes. This repository has validation-only CI and no tagged application release pipeline; do not invent package release evidence.

Record the final merged commit and passing checks before submitting. Add only this project's actual badge URL when an assessment exists and accurately reflects its status.
