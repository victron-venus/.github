# Contributing to Victron Venus

Thank you for contributing to the [victron-venus](https://github.com/victron-venus) organization.

## Where to contribute

Each repository owns its code, issues, and releases. Pick the repo that matches your change:

- **Control logic** → [inverter-control](https://github.com/victron-venus/inverter-control)
- **Battery bridge** → [dbus-mqtt-battery](https://github.com/victron-venus/dbus-mqtt-battery)
- **PV / Tasmota** → [dbus-tasmota-pv](https://github.com/victron-venus/dbus-tasmota-pv)
- **ESP32 firmware** → [esphome-jbd-bms-mqtt](https://github.com/victron-venus/esphome-jbd-bms-mqtt)
- **Dashboards** → [inverter-dashboard-go](https://github.com/victron-venus/inverter-dashboard-go), [inverter-dashboard](https://github.com/victron-venus/inverter-dashboard), or [inverter-desktop](https://github.com/victron-venus/inverter-desktop)
- **Observability** → [inverter-monitoring](https://github.com/victron-venus/inverter-monitoring)
- **Integration tests** → [integration-tests](https://github.com/victron-venus/integration-tests)
- **Org / Terraform** → [terraform-github](https://github.com/victron-venus/terraform-github) or this `.github` repo for profile docs only

## Workflow

1. Fork the target repository (or branch within the org if you are a maintainer).
2. Create a feature branch from `main`.
3. Make focused changes with tests where applicable.
4. Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`, etc.).
5. Open a pull request; CI and CodeQL must pass.
6. Address review feedback; signed commits may be required on protected branches.

## Code standards

- **Python:** `pytest`, type hints where practical, no secrets in logs or HTML.
- **Go:** `go test ./...`, `gofmt`, minimal dependencies.
- **Rust / Tauri:** `cargo test`, `cargo clippy` clean on changed code.
- **Security:** Dependabot PRs welcome; pin GitHub Actions to SHAs.

## Releases

Package repos (`inverter-control`, `dbus-mqtt-battery`, `dbus-tasmota-pv`, dashboards) use tagged releases (`v*`) and Venus `setup` scripts. Bump `version` / `VERSION` files in the same commit as the tag when applicable.

## Questions

Use GitHub Discussions (when enabled) or open a question issue in the most relevant repository.

## Code of conduct

Be respectful and constructive. Report unacceptable behavior to repository maintainers.
