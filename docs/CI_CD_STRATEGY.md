# Organization CI/CD & Release Strategy

This document outlines the standard release channels, tagging conventions, and automated build pipelines across the **Victron Venus** organization.

---

## Release Channels

### 1. Stable Releases
- **Tag Format**: `vX.Y.Z` (e.g. `v1.2.0`, `v2.0.1`)
- **Trigger**: Git push to tag or manual `workflow_dispatch`.
- **Target Audience**: Production environments running Victron Venus OS or client applications.
- **Behavior**: Generates official GitHub Releases with compiled binaries, installer packages, and `:latest` Docker images.

### 2. Pre-releases (Release Candidates & Betas)
- **Tag Format**: `vX.Y.Z-rc.N`, `vX.Y.Z-beta.N`, `vX.Y.Z-alpha.N` (e.g. `v1.2.0-rc.1`)
- **Trigger**: Git push to tag containing `-rc`, `-beta`, or `-alpha`.
- **Target Audience**: Early adopters and beta testers with real hardware setups.
- **Behavior**: GitHub Release automatically flagged with `prerelease: true`. Prevents accidental auto-updates on stable installations.

### 3. Nightly Builds
- **Tag Format**: `nightly` (rolling tag) or `:nightly` Docker image tag.
- **Trigger**: Automated schedule every night (`02:00 UTC`).
- **Target Audience**: Developers and testers validating bleeding-edge changes from `main`.
- **Behavior**: Updates the rolling GitHub Release named **"Nightly Build (Development)"** marked as pre-release.

---

## Repositories & Build Matrix

| Repository | Stable Releases | Pre-releases | Nightly Builds | Docker Tag |
|---|:---:|:---:|:---:|---|
| `inverter-desktop` | Yes (`v*`) | Yes (`v*-rc*`) | Yes (Binaries) | N/A |
| `inverter-dashboard-go` | Yes (`v*`) | Yes (`v*-rc*`) | Yes (Go Binaries) | `ghcr.io/victron-venus/inverter-dashboard-go:nightly` |
| `inverter-dashboard` | Yes (`v*`) | Yes (`v*-rc*`) | Yes (PyInstaller) | `ghcr.io/victron-venus/inverter-dashboard:nightly` |
| `dbus-mqtt-battery` | Yes (`v*`) | Yes (`v*-rc*`) | Yes (Tarball) | N/A |
| `dbus-tasmota-pv` | Yes (`v*`) | Yes (`v*-rc*`) | Yes (Tarball) | N/A |
| `inverter-control` | Yes (`v*`) | Yes (`v*-rc*`) | Optional | N/A |
| `integration-tests` | N/A | N/A | Yes (Scheduled E2E) | N/A |

---

## Workflow Implementation Guidelines

1. **Runner Security**: Always include `step-security/harden-runner` in all GitHub Actions workflows to audit egress network calls.
2. **Release Action**: Use `softprops/action-gh-release@v2` with dynamic `prerelease` detection:
   ```bash
   if [[ "$TAG" =~ -(alpha|beta|rc)\.[0-9]+ || "$TAG" =~ - ]]; then
     echo "is_prerelease=true" >> $GITHUB_OUTPUT
   fi
   ```
