# Contributing to Victron Venus

Thank you for contributing to the [victron-venus](https://github.com/victron-venus) organization.

## Where to contribute

Each repository owns its code, issues, and releases. Pick the repo that matches your change:

- **Control logic** → [inverter-control](https://github.com/victron-venus/inverter-control)
- **Thermostats and climate coordination** → [inverter-climate](https://github.com/victron-venus/inverter-climate)
- **Battery bridge** → [dbus-mqtt-battery](https://github.com/victron-venus/dbus-mqtt-battery)
- **PV / Tasmota** → [dbus-tasmota-pv](https://github.com/victron-venus/dbus-tasmota-pv)
- **ESP32 firmware** → [esphome-jbd-bms-mqtt](https://github.com/victron-venus/esphome-jbd-bms-mqtt)
- **Dashboards** → [inverter-dashboard-go](https://github.com/victron-venus/inverter-dashboard-go), [inverter-dashboard](https://github.com/victron-venus/inverter-dashboard), or [inverter-desktop](https://github.com/victron-venus/inverter-desktop)
- **Observability** → [inverter-monitoring](https://github.com/victron-venus/inverter-monitoring)
- **Integration tests** → [integration-tests](https://github.com/victron-venus/integration-tests)
- **Remote gateway and public status** → [inverter-gateway](https://github.com/victron-venus/inverter-gateway), [inverter-web-vitrine](https://github.com/victron-venus/inverter-web-vitrine), or [Cloudflare Access configuration](https://github.com/victron-venus/terraform-cloudflare-inverter-gateway)
- **Vehicle and water bridges** → [dbus-ev](https://github.com/victron-venus/dbus-ev) or [dbus-pump](https://github.com/victron-venus/dbus-pump)
- **Org / Terraform** → [terraform-github-victron](https://github.com/4alvit/terraform-github-victron); organization profile, catalog and website documentation belong here

See the [public project catalog](https://victron-venus.github.io/#projects) for the remaining tools.

Before adding a cross-project reference, verify that its repository is public and
link to its current owner and maintained implementation. Do not publish names,
links, deployment inventories or migration provenance for non-public repositories.
A public catalog must not be generated from authenticated inventory without
filtering repository visibility.

## Workflow

1. Fork the target repository (or branch within the org if you are a maintainer).
2. Create a feature branch from the target repository's default branch.
3. Make focused changes with tests where applicable.
4. Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`, etc.).
5. Open a pull request; CI and CodeQL must pass.
6. Address review feedback; signed commits may be required on protected branches.

## Code standards

- **Python:** `pytest`, type hints where practical, no secrets in logs or HTML.
- **Go:** `go test ./...`, `gofmt`, minimal dependencies.
- **Rust / Tauri:** `cargo test`, `cargo clippy` clean on changed code.
- **Security:** Dependency updates use Renovate; pin GitHub Actions to SHAs.

## Releases

Application repositories define their version files, validation and artifacts in
`.release-policy.json`. Follow the target repository's `RELEASING.md` and
`docs/release-workflow.md`: review base-version changes through a PR, publish
immutable beta/RC candidates through the release pipeline, and promote the tested
RC bytes after approval. Do not create release tags by hand. This website uses
[source publication](RELEASING.md) rather than application releases.

## Questions

Use GitHub Discussions (when enabled) or open a question issue in the most relevant repository.

## Code of conduct

Follow the [Code of Conduct](CODE_OF_CONDUCT.md), including its confidential reporting channel and enforcement policy.

## Working on this repository

This repository holds the organization profile, community health files and redirect stubs that point
at the maintained site. It does not contain the published website; that lives in the separate
[`victron-venus.github.io`](https://github.com/victron-venus/victron-venus.github.io) repository.

A stub must keep three things identical: the `<link rel="canonical">` href, the `refresh` meta
target and the `location.replace` target. Stubs carry `noindex` and must not load local scripts,
stylesheets or images, so they cannot drift from the published site.

Use Python 3.12, PyYAML 6.0.3 and ruff, then run:

```sh
python3 -m pip install --require-hashes --only-binary=:all: -r .github/requirements-workflow-contracts.txt -r .github/requirements-lint.txt
bash scripts/ci.sh
```

This checks tracked-source syntax, GitHub workflow semantics and the publishing contract for the
redirect stubs. It does not replace a browser check of the maintained site. Report bugs and feature
requests in English with the affected URL/commit, browser and reproduction steps; maintainers should
respond constructively to actionable reports. Report security defects through [SECURITY.md](SECURITY.md).
