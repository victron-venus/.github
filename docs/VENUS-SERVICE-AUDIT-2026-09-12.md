# Venus OS service audit — 12 September 2026

The subsequent [audit closure](VENUS-AUDIT-CLOSURE-2026-09-12.md) records the final
freshness/reconnect fixes, additional releases and installation checks, the NAS
alert-bridge update, and a passive meter capture with a naturally occurring
hold-expiry/recovery event. The timestamps below describe earlier checkpoints.

## Published releases and coordinated rollout

Following explicit user authorization, releases were published for fifteen projects.
The nine existing GX packages were updated and verified:

- [inverter-control 1.23.3](https://github.com/victron-venus/inverter-control/releases/tag/v1.23.3), including the native transport, grid validity, hold-policy and missing CLI reply follow-ups.
- [venus-os-observability 0.1.4](https://github.com/victron-venus/venus-os-observability/releases/tag/v0.1.4).
- [dbus-ev 0.1.1](https://github.com/victron-venus/dbus-ev/releases/tag/v0.1.1), [dbus-evcharger 0.1.2](https://github.com/victron-venus/dbus-evcharger/releases/tag/v0.1.2), [dbus-pump 0.1.1](https://github.com/victron-venus/dbus-pump/releases/tag/v0.1.1), and [dbus-emporia-vue 1.0.2](https://github.com/victron-venus/dbus-emporia-vue/releases/tag/v1.0.2).
- [dbus-mqtt-battery 2.7.5](https://github.com/victron-venus/dbus-mqtt-battery/releases/tag/v2.7.5) and [dbus-virtual-battery 2.7.5](https://github.com/victron-venus/dbus-virtual-battery/releases/tag/v2.7.5), updated as a coordinated pair.
- [dbus-tasmota-pv 3.0.2](https://github.com/victron-venus/dbus-tasmota-pv/releases/tag/v3.0.2).

Installation receipts verify controller 1.23.2 at 19:33:40 UTC, observability at
19:39:08, EV at 19:44:31, charger at 19:45:51, pump at 19:47:11 and Emporia at
19:50:03. The battery pair and Tasmota then completed their coordinated updates.
Shipped source/runtime hashes matched the release candidates, configuration
hashes were preserved, and service, logger and supervisor directory inodes
remained unchanged. The battery-pair backup is
`/data/backups/battery-pair-20260912T195125Z`.

The final controller follow-up, 1.23.3, was published at 20:10:25 UTC and its
36 installed runtime files were verified at 20:11:10. Configuration and
supervisor directories were preserved. The final rollout receipt and its
startup/recovery limits are recorded under "Follow-up for missing CLI telemetry
replies" below. The 20:12:01 final check confirmed all nine version markers,
all checked D-Bus services and exporter health after this last update.

The 19:58:50 UTC checkpoint found all 19 checked services and their loggers
running, a 3.94-second controller heartbeat, normal valid-grid control and a
10-second loss-hold setting. No maintenance keepalive remained. EV capacity
was numeric 118, all 19 Emporia channels were connected with numeric power,
and the pump's three checked D-Bus paths responded with a fresh heartbeat.
These readings verify the observed runtime, not every future source outage.

At 20:00:14 UTC, runtime version files matched all nine installed-version
markers byte for byte, and all twelve custom-service/logger/supervisor directory
inodes still matched the pre-rollout snapshot. D-Bus checks reached 19 AC-load,
four battery, two PV, two pump, one tank, one EV and one charger service without
a failed read. The exporter returned HTTP 200 with 864 finite numeric samples.
PackageManager auto-install and GitHub auto-download both remained disabled.

Manual installation had left controller's SetupHelper marker at 1.21.2 and no
marker for the other five manually updated packages. After source/runtime and
service verification, all six markers were repaired at 19:55:57 UTC using exact
package-version bytes and atomic replacement. Their backup is
`/data/backups/installed-version-markers-20260912T195557Z`. This bookkeeping
repair caused zero restarts and preserved SetupOptions, package registrations
and existing installation/download flags.

The complete rollout did add one PackageManager registration: Tasmota had
already been running manually with two PV services, but its installation lacked
`setup`, `version`, `gitHubInfo` and an installed-version marker. The canonical
release supplied valid metadata, and PackageManager's `AddStoredPackages` scan
registered that existing package at index 7 around 19:53:43–44 UTC, increasing
the count from seven to eight. `endScript` wrote its version marker and
`optionsSet`; it did not append the registration itself. The PV topology and
site configuration were preserved, and auto-install/download stayed disabled.
No PackageManager entry was removed or cleaned up.

The other six releases provide source or companion-host packages:

- [dbus-esphome-grid-sensor 1.0.2](https://github.com/victron-venus/dbus-esphome-grid-sensor/releases/tag/v1.0.2), [mcp-venus-os 0.2.4](https://github.com/4alvit/mcp-venus-os/releases/tag/v0.2.4), and [dbus-event-log 0.1.3](https://github.com/victron-venus/dbus-event-log/releases/tag/v0.1.3) were not newly installed on the GX or NAS. No unconfigured grid bridge, MCP endpoint or event store was created.
- [dbus-service-template 0.1.0](https://github.com/4alvit/dbus-service-template/releases/tag/v0.1.0), [venus-os-integration-patterns 0.1.1](https://github.com/victron-venus/venus-os-integration-patterns/releases/tag/v0.1.1), and [venus-os-ci-toolkit 0.1.0](https://github.com/victron-venus/venus-os-ci-toolkit/releases/tag/v0.1.0) are template, documentation and CI releases, not additional device services.

Observability publishes a validated native SetupHelper source archive, checksum,
Python wheel and source distribution. Its archive's 17 files were compared with
the signed release revision before installation. The optional PyPI step explicitly
skipped publication because no credential was configured; the complete GitHub
release does not imply a PyPI release. MCP's amd64/arm64 Docker publication and
event-log's wheel/source/container release completed successfully. ARMv7 support
is not implied by those companion images.

The initial release backup is
`/data/backups/pre-audit-release-20260912T191900Z`, with 1651 files covering twelve
custom services. Package-specific and battery-pair backups supplement it. The
verified updates preserved local configuration and service/logger supervisor
directories. PackageManager registration is separate from installation and
version-marker bookkeeping. See the [installation guide](INSTALL.md)
for version-marker bookkeeping and verification before redelivering a timed-out
release webhook.

## Scope and evidence

The audit inspected the repositories and the live device reached through `root@cerbo`: Raspberry Pi 3 Model B Rev 1.2, ARMv7, Venus OS v3.75, Python 3.12.13, 944280 KiB physical memory and no swap. This hostname is not evidence of Cerbo GX hardware. Hardware-specific support for other GX models remains unverified.

Evidence included service/supervisor state, bounded current log tails, stock VRM logger mappings, read-only D-Bus values/types, boot scripts, filesystem mounts, process/resource sampling, dependency imports and installer regression tests. Logs contain historical errors as well as current events; a match in an old file is not evidence of an active fault. Private configurations, credentials and raw device logs are excluded from this report.

The device was not rebooted, reflashed or subjected to a simulated power failure. The initial inspection and telemetry repairs issued no inverter mode or power-setpoint commands. A separate concurrent task deployed inverter-control 1.23.1 around 16:16 UTC; its restart and control changes must not be attributed to the telemetry repairs below. The later authorized controller rollouts at 18:11:54 and 18:34:35 UTC are recorded separately in this report.

## Running custom services

Twelve supervised processes were present:

- `dbus-mqtt-chain1` and `dbus-mqtt-chain2` from dbus-mqtt-battery.
- `dbus-virtual-chain` from dbus-virtual-battery.
- `dbus-tasmota-pv`.
- `dbus-emporia-vue`.
- `dbus-ev` and `dbus-evcharger`.
- `dbus-pump`.
- `inverter-control`, `log-forwarder` and `watchdog` from inverter-control.
- `venus-os-observability`.

The host had a checkout of mcp-venus-os but no supervised MCP process. dbus-esphome-grid-sensor, dbus-event-log and venus-os-governance were not running as native services. Repository availability is not proof of runtime integration. Dashboards, forecasting, databases, Docker and MCP workloads should be evaluated as companion-host components unless a specific on-device deployment is documented and measured.

## Repairs verified on the device

### EV metadata crashed the stock VRM logger

`com.victronenergy.ev.ha /BatteryCapacity` returned a string containing `118`. The stock VRM datalist applies precision 1 to this numeric path, and `monitor.py` called `round(value, precision)`. This raised `TypeError: type str doesn't define __round__ method` during config upload. The logger repeatedly restarted approximately every seven seconds; FlashMQ also logged missing replies from the logger service.

The EV bridge now converts static and sensed capacity to finite numeric values, accepts decimal literals, publishes invalid values correctly and reflects source availability through `/Connected`. Two runtime files were backed up and deployed at 16:13:53 UTC. A subsequent D-Bus read returned `double 118`; VRM entered its main loop and logged its first successful post. The same VRM PID remained running through later checks.

Patch: [dbus-ev PR #22](https://github.com/victron-venus/dbus-ev/pull/22). The initial telemetry repair did not execute the installer; the later release rollout used and verified the complete installer.

### Observability warning flood

The metrics-only process created spans for every signal even without a trace exporter. D-Bus string wrappers in `dbus.changed_keys` also failed OpenTelemetry attribute validation, producing dozens of warning lines per second.

The repair normalizes keys to Python strings, disables span recording when no OTLP endpoint is configured, and skips formatting values for nonrecording spans. Two runtime files were backed up and deployed at 16:16:36 UTC. The warning flood ended, while the Prometheus endpoint continued returning HTTP 200 with populated metrics. No dependency upgrade or trace-export configuration change was required.

A follow-up at 16:30:29 UTC made package exports lazy and assigned shutdown cleanup to the application lifespan, removing the module pre-import warning and duplicate cleanup path. The replacement process started cleanly and continued serving metrics. Source: [observability PR #27](https://github.com/victron-venus/venus-os-observability/pull/27).

Later log inspection exposed another failure during meter disappearance: `float(dbus.Array([]))` raised an exception and discarded the rest of an ItemsChanged batch. A two-file repair completed at 16:46:09 UTC after live-file hash verification, backup and a smoke test using the installed interpreter and real dbus-python types. Explicit invalid or nonfinite numeric values now publish NaN in both metric backends, valid zero stays zero, and display-text-only updates do not overwrite measurements. All 94 local tests, strict type checks and configured hooks passed. The metrics endpoint recovered with HTTP 200; the next log check showed clean shutdown/startup and no new conversion error. This is not a claim that all silent source outages are independently detected.

### Log-forwarder lost its cursor at batch boundaries

After reading 100 lines with TextIO iteration, the forwarder called `tell()` before EOF. CPython raises `OSError: telling position disabled by next() call` in this case, preventing reliable cursor advancement.

The repair uses `readline()` and verifies consecutive full batches without duplicates or omissions. Frequent cursor writes now go to `/run/inverter-control/log-forwarder-state.json`; `/var/log` resolves to persistent `/data/log` on this device. The runtime file was backed up and deployed at 16:16:39 UTC, restarting only the forwarder. The new cursor file was created and advanced.

### Invalid legacy MQTT keepalive

A 2024 startup helper still used the literal portal ID `xxxxxxxxxxx`, opening a new MQTT connection every 30 seconds and generating rejected read requests. Its exact boot entry was disabled after backup, and its two identified processes were stopped. Existing application MQTT connections were left in place. The old scripts were retained for inspection.

Device backups for these operations are under `/data/backups/venus-service-audit-20260912/`. Restoring an individual runtime file requires restarting only the matching service; it does not require a whole-stack reinstall.

## Source and installation improvements

The initial audit prepared repository patches separately from targeted live repairs. The subsequent authorized release rollout is recorded at the start of this report; historical validation below describes the corresponding reviewed revisions.

- EV/charger/pump/Emporia updates stage source before an in-place install, preserve local configuration and supervisor directory inodes, check dependencies before stopping services, restore log directories, and place boot hooks before an existing `exit 0`.
- Emporia's SetupHelper path is consolidated with the tested updater; transient HA connection failures use bounded retry and unavailable measurements are not reported as live zeros. See [Emporia #28](https://github.com/victron-venus/dbus-emporia-vue/pull/28), [charger #26](https://github.com/victron-venus/dbus-evcharger/pull/26), and [pump #27](https://github.com/victron-venus/dbus-pump/pull/27).
- Battery/PV/grid changes are reconciled against current upstream so already merged fixes are not duplicated. Incremental work covers bounded alarm logging, GLib-thread publication, stale-input handling and native installation errors. Battery/DVCC changes require topology-aware testing before deployment.
- Native controller transport improvements validate SetValue acknowledgement, distinguish remembered from live signal subscriptions, preserve cooldown after failed connection setup, correct NameOwnerChanged argument order, defer discovery off the D-Bus loop and refresh inverter power during fallback polling.
- Controller installation preserves service inodes and local state, removes process-killing based only on working directory and waits for a fresh heartbeat before reporting recovery.
- The controller's duplicate DEBUG file was approximately 565 MiB. Source changes disable it by default, bound an explicitly requested duplicate file, and send watchdog logs through multilog. The existing large file was retained, and these controller runtime changes were not part of the telemetry hotfix.
- Native observability/MCP/template installers and support documentation are reviewed against actual Venus service management and rootfs persistence. The [installation guide](INSTALL.md) replaces nonexistent bootstrap commands and incorrect systemd/status instructions.

### Audited repository changes and validation

- [inverter-control #198](https://github.com/victron-venus/inverter-control/pull/198): transport, forwarder, bounded logging and installer recovery. After rebasing on 1.23.1, 594 tests passed with 87.05% coverage. Ruff, ShellCheck, formatting and secret checks passed. The configured Pylint hook retains warnings reproduced on the unchanged base, including a Python 3.14 standard-library inference issue; the new transport test file passes all hooks.
- [dbus-mqtt-battery #64](https://github.com/victron-venus/dbus-mqtt-battery/pull/64): low-SoC warning throttling and chain installation; 116 tests.
- [dbus-virtual-battery #41](https://github.com/victron-venus/dbus-virtual-battery/pull/41): required-source validity and native installation; 57 tests.
- [dbus-tasmota-pv #73](https://github.com/victron-venus/dbus-tasmota-pv/pull/73): GLib publication, stale values and installation; 41 tests.
- [dbus-esphome-grid-sensor #19](https://github.com/victron-venus/dbus-esphome-grid-sensor/pull/19): native D-Bus registration, freshness and installation; 45 tests and a container build. This does not establish physical CT calibration or direction.
- [dbus-ev #22](https://github.com/victron-venus/dbus-ev/pull/22), [dbus-evcharger #26](https://github.com/victron-venus/dbus-evcharger/pull/26), [dbus-pump #27](https://github.com/victron-venus/dbus-pump/pull/27), and [dbus-emporia-vue #28](https://github.com/victron-venus/dbus-emporia-vue/pull/28): respectively 73, 70, 44 and 69 tests after reconciliation with current upstream.
- [venus-os-observability #27](https://github.com/victron-venus/venus-os-observability/pull/27), [mcp-venus-os #47](https://github.com/4alvit/mcp-venus-os/pull/47), and [dbus-service-template #14](https://github.com/4alvit/dbus-service-template/pull/14): native runtime and installer corrections. Template validation includes rendering and executing generated tests.
- [dbus-event-log #51](https://github.com/victron-venus/dbus-event-log/pull/51), [venus-os-integration-patterns #21](https://github.com/victron-venus/venus-os-integration-patterns/pull/21), and [venus-os-ci-toolkit #31](https://github.com/victron-venus/venus-os-ci-toolkit/pull/31): retention, deployment boundaries and target-runtime validation.

The event-log follow-up implements a 30-day age ceiling, four retained archives, 100 MiB rotation checks before each insert/batch, and scheduled maintenance. Rotation checkpoints and closes WAL, prepares the replacement schema before moving the active file, and restores the original file if replacement fails. Tests cover collisions, busy WAL, rollback, ownership boundaries and unrelated files: 109 passed, 93.72% coverage, with lint/type/package and extracted-source-distribution checks passing. One batch can exceed the rotation threshold; this is not a hard filesystem quota or a minimum history guarantee. No event-log process was installed on the audited device.

### Grid measurement validity follow-up

[inverter-control #199](https://github.com/victron-venus/inverter-control/pull/199) was initially a separate draft stacked on #198. Offline reproduction showed that an invalid grid value could leave the old power cached while unrelated battery traffic renewed a shared timestamp. Venus also replaces a missing external meter with native inverter measurements. On this site, that would replace a declared two-phase VM-3P75CT source with a one-phase VE.Bus source.

The follow-up separates grid validity from general bus activity, pins source/device instance and topology, checks external meter metadata, and rejects replies that span an invalidation. Normal control pauses before calculation and rechecks validity before writing. Pending manual requests and established watchdog policy are preserved; stale filter history is discarded. Unchanged measurements remain valid through periodic authoritative reads, with a 40-second monotonic revalidation budget. Explicit invalidation pauses normal writes on the next control cycle; silent expiry must first exhaust the revalidation budget before the existing watchdog timeout and hysteresis complete.

Default automatic discovery cannot identify an external meter that has never appeared in the current process. This site's rollout therefore requires explicit expected meter and two-phase settings after checking the healthy physical configuration. These settings and controller changes were not deployed during the initial audit; the authorized 18:11:54 UTC rollout below applied them. The [operator guide](https://github.com/victron-venus/inverter-control/blob/v1.23.3/docs/grid-telemetry-safety.md) documents cold-start limits, recovery timing and unsupported three-phase control.

The initial follow-up suite passed 654 tests with 87.17% coverage, including 60 focused grid regressions. Independent review included 14 additional behavioral checks. Ruff/format checks passed; Bandit 1.8.3 under Python 3.12 found no medium/high findings and skipped no scanned files. Existing Pylint baseline findings remain documented. Because the follow-up targets a feature branch, CodeQL and Python Security workflows restricted to `main` must rerun after retargeting; their filters were not weakened.

These changes were drafts during the initial audit. The user later authorized their merges and releases after successful checks, including one-time administrative merges where independent-review rules blocked the prepared PRs; repository protection settings were preserved. Test counts below describe the audited revisions. The MCP container build subsequently passed GitHub CI; its saved NAS directory was present but no MCP container was running. The governance repository remains archived, and its deployment limitations are consolidated in the active [installation guide](INSTALL.md#archived-governance-project).

## Resource observations and remaining work

At 16:23:06 UTC, a 30.63-second `/proc` sample measured 48.75% aggregate host CPU busy, load averages 3.47/3.15/3.61 and 363060 KiB available memory (about 355 MiB). Top measured processes included inverter-control at 27.46% of one CPU core with 28.8 MiB RSS, dbus-daemon at 23.11% of one core, and observability at 5.16% of one core with 27.0 MiB RSS. Aggregate CPU and per-process one-core percentages use different denominators.

These are a short post-repair sample, not a capacity guarantee or a controlled before/after benchmark. The initial top snapshot showed substantially higher busy time and VRM crash churn, but sampling methods and the concurrent controller rollout differ.

A fresh 31.07-second sample at 16:38:09 UTC measured 49.62% aggregate CPU busy and load averages 4.76/3.55/3.42. The one-minute load therefore still spikes; a sustained load reduction is not established. A subsequent thread-state inspection ending at 16:40:01 UTC measured 0.05% iowait and observed only one blocked-thread sample, with up to seven runnable threads. That more intrusive diagnostic itself adds CPU overhead. These samples do not indicate a persistent storage wait bottleneck, but do show runnable-task contention on the four-core host.

At 16:47:11 UTC load averages were 2.59/2.63/2.98. VRM retained the same PID for 2005 seconds, the forwarder for 1832 seconds, and the most recently patched observability process was up for 67 seconds. The lower recent load is encouraging, but representative-day measurements remain outstanding.

The final 31.00-second CPU sample ended at 16:52:23 UTC: 52.50% aggregate busy, load averages 2.71/2.78/2.97 and 344916 KiB available memory. Recent interval measurements therefore cluster around half of aggregate CPU capacity; they are not directly equivalent to the initial instantaneous top reading.

### Fresh runtime and control snapshot (17:46–17:56 UTC)

A passive capture from 17:46:58 to 17:51:58 UTC measured 47.04% aggregate host CPU busy, 0.09% iowait, load averages 4.70/3.90/3.33 and about 347 MiB available memory. The observer itself used 6.55% of one CPU core, included in the host measurement. Load still spikes; these samples do not establish a sustained reduction. The controller recorded nine additional missed deadlines and zero reported failed writes. The latter is not independently verified acknowledgement of every write in the running transport implementation.

The grid service lost its D-Bus owner at 17:50:45 and 17:51:02 UTC, returning approximately 1.3 seconds after each loss. System feedback switched from the external two-phase meter to a one-phase VE.Bus source reporting roughly −600 W. Command readback moved from −112 W to +475 W; the largest consecutive observed step was 658 W, from +475 W to −183 W. All 12 observed command steps greater than 100 W followed the service losses. Before the first loss, grid power was within ±50 W for about 94.7% of observed time and no command step exceeded 100 W. The observer's periodic metadata refresh extended invalid coverage beyond the owner-loss intervals; it does not establish an equally long physical meter outage.

Later logs recorded four further removals, bringing the total to six since 17:50:45 UTC. The first followed a timeout at `0x3080–0x3087`; the other five cited `0x2000–0x2023`. The last removal at 17:55:39 was followed by registration at 17:56:04, with another no-reply event at `0x1009` during that interval. The stock driver process did not restart. At 17:56:30 UTC, all 15 checked services were up with unchanged PIDs and load averages were 3.49/3.39/3.24. Recovery between failures does not establish stable meter transport.

Retain the device's `CREEP_RATE = 0.0` and existing two-second grid filter time constant while addressing source reliability. These observations support guarding source changes before adding smoothing. At 17:56 UTC, controller transport and grid-validity changes in [#198](https://github.com/victron-venus/inverter-control/pull/198) and [#199](https://github.com/victron-venus/inverter-control/pull/199) remained undeployed. Their deployment source first needed [#200](https://github.com/victron-venus/inverter-control/pull/200), merged as `4205f00`, to retain support for the device-local creep override. The draft heads at that time and the `v1.23.1` release hard-coded the old rate even when local configuration was preserved. The later rollout incorporated #200 before installation.

Checks from 17:52:38 to 17:53:18 UTC found all 24 HA-backed D-Bus services reporting `/Connected = 1`, all 19 Emporia channels publishing numeric power, and numeric EV, charger, pump and tank measurements. These checks read published D-Bus values and made no HA requests. All 12 custom-service supervisors and 15 log supervisors were up; observability returned HTTP 200 and no new conversion flood was observed. Availability flags and numeric types do not independently prove end-to-end freshness or recovery during future HA outages.

### Authorized controller rollout (18:11 UTC)

After explicit authorization, the prepared controller changes were installed manually at 18:11:54 UTC from signed commit [`f2a139b`](https://github.com/victron-venus/inverter-control/commit/f2a139b162e39320f83d51fec29eeae90c3a4fc2). Signed merges incorporated current `main` (`4205f00`, #200) into #198 and then into #199. Both PRs were drafts at that time; this installation did not merge a PR, publish a release or invoke the deployment webhook. The backup is `/data/inverter-control-backups/pre-grid-validity-20260912T180524Z`. All 36 shipped runtime file hashes matched the candidate after installation, and service directory inodes were preserved.

Device-local `CREEP_RATE = 0.0` and the two-second grid filter were retained. `GRID_EXPECTED_SERVICE` now pins the verified external meter and `GRID_EXPECTED_PHASES = 2` enforces its two-phase layout at startup. Preflight native D-Bus reads and subscriptions confirmed the selected meter's connected state, phase count and device instance. Existing modes, limits and control policy were preserved. A final small recovery fix clears derivative and legacy derived-grid EMA history when measurements become invalid; the first recovered zero reading no longer compares against pre-outage samples and generates an unwanted correction. Pending manual requests remain preserved.

The 18:11 UTC candidate passed 675 local tests with 87.25% coverage, plus an independent 123-test review. The integrated #198 branch passed 613 tests with 87.15% coverage. Changed-file Ruff, formatting, ShellCheck, secret, whitespace and EOF checks passed; existing Pylint and unrelated all-repository hook findings were not suppressed or folded into the rollout. Bandit 1.8.3 under Python 3.12 found no medium/high findings, nine low findings and no skipped files. These checks do not replace observation of actual source loss and recovery on the device.

The first 300-second observation ended at 18:17:12 UTC. Aggregate CPU busy was 52.39% and load averages were 2.96/3.48/3.30. Three brief read-validation pauses held the sampled setpoint; no grid-service owner loss occurred in this interval, so natural meter-disappearance recovery was not exercised. The controller reported zero failed writes, 26 additional missed deadlines and 771 CLI calls. Modes, limits and creep tuning stayed unchanged. This was an intermediate result, not a final performance improvement claim: logs exposed invalid numeric EV/charger destination guesses that unnecessarily reset the shared native connection and caused CLI bursts. A separate correction was prepared before concluding the rollout.

### Combined EV transport and short-hold rollout (18:34 UTC)

The second authorized installation completed at 18:34:35 UTC from signed commit [`71cc708`](https://github.com/victron-venus/inverter-control/commit/71cc7081bb12888eff8a8ab139b094e3be02bb5d), combining the EV transport correction with the separately requested short-hold policy in [#202](https://github.com/victron-venus/inverter-control/pull/202). There was no separate installation of the intermediate EV-fix commit `e51c5b8`. All 36 shipped runtime hashes matched the final candidate and service directory inodes were preserved. The second backup is `/data/inverter-control-backups/pre-grid-validity-20260912T181647Z`. This was a manual installation, not a PR merge, release or webhook deployment.

EV and charger discovery now matches actual textual D-Bus names against `/DeviceInstance`, including service appearance and disappearance. Local request-validation errors no longer disconnect the shared native connection. A read-only device preflight confirmed that an invalid destination left the same connection and subscriptions healthy and that a subsequent valid system read succeeded. The intermediate EV/grid candidate passed 689 tests with 87.21% coverage and an independent 209-test review. All applicable CI checks on #198 and #199, including Docker integration, passed at the corresponding `891ec23` and `e51c5b8` heads. At that stage, the stacked #199 base excluded the main-only security workflows; those workflows later passed after retargeting to `main`. Local Bandit found no medium/high findings and skipped no scanned files.

The final `71cc708` candidate passed 723 tests and 11 subtests with 87.43% coverage under Python 3.11. Independent verification on that exact signed head passed 243 focused tests and two deterministic watchdog/repeated-outage traces. All applicable #202 checks, including Docker integration, passed. Main-only security workflows were scheduled to rerun when the stacked changes targeted `main`; those checks later passed before release.

At 18:34 UTC, both the active and SetupHelper configuration retained `CREEP_RATE = 0.0`, the two-second filter and the verified external two-phase source expectation, and set `GRID_LOSS_HOLD_SECONDS = 3.0`. At the first detected invalid measurement, normal correction pauses and the last accepted command is held briefly. If validity does not recover before the deadline, the controller requests 0 W; rejected writes are retried and zero remains in effect until the correct source recovers. No previously accepted command means immediate zero at startup. After zero is requested, recovery requires an accepted zero and two consecutive valid watchdog checks, then calculates from fresh readings without restoring the old command. Pending manual requests remain preserved.

The three-second setting begins at detection; it does not shorten the existing 40-second budget for silent telemetry revalidation. Control-loop scheduling and D-Bus latency affect enforcement, and background-only enforcement can add up to the five-second watchdog check interval. A 0 W inverter command does not imply zero utility-meter power. The [hold-policy operator guide](https://github.com/victron-venus/inverter-control/blob/71cc7081bb12888eff8a8ab139b094e3be02bb5d/docs/grid-telemetry-safety.md) documents these timing and recovery limits. ESS modes, power limits and battery policy were preserved.

The three-second observation captured a natural meter disappearance around 18:35:11 UTC, with its D-Bus owner absent for 4.150 seconds. A narrow monitor of actual Hub4 `SetValue` calls recorded the last pre-loss command at −204 W, no further calls during the hold, and a single 0 W request approximately 3.30 seconds after detected invalidity. The controller then reported zero accepted. The one-phase native fallback remained invalid and no nonzero write occurred during the outage or recovery qualification. After the correct external two-phase source returned, zero stayed in effect until fresh control resumed at −113 W; the old −204 W command was not replayed. This exercises one natural loss/hold/zero/recovery sequence and does not establish behavior for every transport failure.

The complete 300-second capture with the three-second setting measured aggregate CPU busy at 51.57%, iowait at 0.07% and final load averages of 2.21/2.84/3.00. It recorded 390 additional CLI calls, 17 additional missed deadlines and zero reported failed writes; that counter alone does not independently verify every acknowledgement. Two later reconnect/CLI clusters were unresolved at that checkpoint. In that deployed revision, a single slow request could disconnect the shared native bus; correlated logs named pump `/State` and tank `/Level` requests. The subsequently released #203 correction isolates individual request deadlines from shared-connection failure. Synchronous HA polling in the pump service is a plausible contributor, but the exception type and causal timing were not established. These measurements do not demonstrate a sustained CPU reduction or elimination of native transport churn.

At the user's request, `GRID_LOSS_HOLD_SECONDS` changed from 3.0 to 5.0 at 18:44:37 UTC. This configuration-only adjustment changed that value in both configuration files, restarted only the controller and produced a fresh heartbeat; the forwarder and external watchdog PIDs stayed unchanged. All 36 code hashes still matched `71cc708`. The backup is `/data/inverter-control-backups/pre-hold-5s-20260912T184424Z`. The earlier natural-outage measurement above describes the three-second setting, not a measured five-second hold.

The subsequent 120-second observation ended at 18:46:52 UTC: aggregate CPU busy was 51.15%, iowait 0.03%, final load averages 4.07/3.66/3.28, and counters increased by 20 CLI calls and two missed deadlines with zero reported failed writes. Grid validity remained normal throughout; no source-owner loss or control pause occurred, so the five-second deadline was not exercised. All seven control flags stayed false, power limits and mode 3 were preserved, and alarms stayed zero. Actual method-call capture recorded a final valid-grid command change from −133 W to +5 W, a 138 W step, with logged burst and derivative contributions of +120 W and +20 W. The 250 ms readback sampler missed that final step. Source validity and the hold policy therefore do not eliminate larger corrections from the existing burst/derivative logic; additional tuning requires a separate comparison under valid feedback.

### Later recovery and follow-up preparation (18:50–19:05 UTC)

Subsequent logs recorded an actual meter-owner loss at 18:47:08 UTC, a successful zero/watchdog action at 18:47:13, owner return at 18:47:21 and qualified recovery at 18:47:32. This is logged evidence of the five-second policy; the independent method-call monitor had already ended at 18:46:52, so these events do not have the same independent command trace as the earlier three-second test. At 18:50:12, normal control had resumed and all 19 checked services were running. A 31-second `/proc` sample ending at 18:50:40 measured aggregate CPU busy at 51.20% and load averages of 3.69/3.48/3.29. The detailed observer was stopped; a brief status collector overlapped the first seconds. Sustained resource improvement remains unproven.

At the user's subsequent request, a separate task changed only the hold setting to 10.0 seconds at 18:58:33 UTC, backing up under `/data/inverter-control-backups/pre-hold-10s-20260912T185820Z` and restarting only the controller. An independent read-only check at 19:00:10 confirmed `GRID_LOSS_HOLD_SECONDS = 10.0` in both configurations and live telemetry, normal valid-grid control, all 19 services running and a fresh heartbeat. Load averages at that check were 4.74/3.80/3.37. A subsequent 31-second sample ending at 19:05:40 measured aggregate CPU busy at 50.10%, load averages of 2.97/3.21/3.22 and 363716 KiB available memory, with no other detailed observer running. Load continues to fluctuate; this is not evidence of sustained CPU improvement. At that snapshot the deployed code remained `71cc708`, with creep zero, the two-second filter and the verified external two-phase source expectation preserved. The logged five-second event above does not test a ten-second deadline. The additional source changes below had not yet been installed at 19:05; they were incorporated into the later released rollout.

[Native timeout follow-up #203](https://github.com/victron-venus/inverter-control/pull/203), signed commit [`26633ab`](https://github.com/victron-venus/inverter-control/commit/26633ab39bdd5ab2cbd29f2ece9501f380dcfbfa), isolates individual request deadlines from shared-connection failure, cleans cancelled reply handlers and refuses overdue queued work. Actual transport or event-loop failure still reconnects, without a late failure dropping a newer connection. Timed-out writes remain unaccepted; cancellation cannot retract messages already handed to the D-Bus writer. The candidate passed 739 tests and 11 subtests with 87.61% coverage, plus 211 independent focused tests; all applicable CI checks, including Docker integration, passed. A smoke test on Python 3.12.13/dbus-fast 2.21.1 verified retained connection/subscriptions and no leaked reply handlers across three request deadlines, healthy reads after delayed test replies, and reconnect/rearm after disconnecting only the test's own connection. It issued no hardware writes and installed no runtime files.

[Pump follow-up #27](https://github.com/victron-venus/dbus-pump/pull/27), initially reviewed at signed head [`6cb8923`](https://github.com/victron-venus/dbus-pump/commit/6cb89233b44306ba3ac77d46d2a35b95887b811b), moves HA work to one bounded worker while retaining D-Bus publication on the main loop. Tests cover stale-data and valve safety, queued-command cancellation and compensating OFF retries: 59 passed with 89.01% coverage, plus 26 independent checks; all configured hooks and applicable CI checks passed. The final CI correction changes only a test, leaving production files identical to the worker fix in `a1e321f`. This addresses pump responsiveness separately from the controller's shared-timeout amplification. The initiating HA latency remains unproven, and neither follow-up is evidence that the live CPU or timeout behavior has improved.

### Resource checkpoint after the nine-package rollout

A 30.845-second sample ending at 19:59:34 UTC measured 50.74% aggregate host CPU
busy, load averages of 3.35/3.79/3.61 and 358692 KiB available memory, with no
swap. This is comparable in scale to the earlier approximately half-capacity
samples and does not establish sustained CPU improvement. Warm installation,
current D-Bus responsiveness and intact supervisor directories do not establish
cold-boot recovery, physical calibration or a full day of source reliability.

### Follow-up for missing CLI telemetry replies

Logs during the Tasmota update exposed another caught polling error: after an
optional service disappeared, both its native read and CLI fallback could
return no value, and `_get_float_nolock()` called `.split()` on `None`. The
background thread survived, but the rest of that pass, including other PV
yield reads and battery-energy polling, was skipped.

[Controller #204](https://github.com/victron-venus/inverter-control/pull/204)
adds a two-line guard that preserves this helper's existing zero fallback for
missing replies. Grid validity, loss handling, control policy and device-local
configuration are unchanged. Four new regressions failed with the exact
`AttributeError` on 1.23.2; all six new cases passed with the guard, together
with 78 focused tests and the full Python 3.11 suite of 746 tests and 11
subtests at 87.66% coverage. The cases cover missing/empty replies, native/CLI
fallback, service backoff, continued reads from other services and subsequent
recovery. The configured Pylint hook retained five findings reproduced on the
unchanged released source; the new test passed Pylint and the remaining
applicable hooks passed.

After all applicable CI checks succeeded, #204 merged at signed revision
[`b695a841`](https://github.com/victron-venus/inverter-control/commit/b695a84147b2d65d7204da0dcba07411a944244a),
whose tree matched the tested candidate. The signed `v1.23.3` release was
published at 20:10:25 UTC and installed through the existing release webhook.
The release archive's SHA-256 was
`0bdb824098140bc1fa85b4d30dfc499e43b90c09fbaaafc02570b8546597596c`;
all 36 runtime members matched the signed revision and installed files.
Verification at 20:11:10 found the new controller, forwarder and watchdog
running, a 2.461-second heartbeat, unchanged configuration in both locations,
and unchanged supervisor directory inodes. The pre-patch backup is
`/data/backups/pre-controller-v1.23.3-20260912T200245Z`.

At 20:11:34 UTC the controller's installed-version marker was atomically
refreshed to the exact 1.23.3 package-version bytes, after backing it up under
`/data/backups/controller-v1.23.3-marker-20260912T201134Z`. This metadata-only
repair caused zero restarts and changed no options or registrations. At
20:11:37 all 19 checked processes and their loggers were running, the controller
heartbeat was 4.769 seconds old, grid control was normal and valid with the
10-second hold, and no maintenance helper remained.

Startup initially lacked valid grid data at 20:10:47 and requested neutral
zero; normal control recovered at 20:10:57. No new `None.split` failure was
observed after the patch. A 318 ms calculation warning at 20:11:28 shows that
occasional slow stages remain; the patch repairs missing-reply handling and
does not establish a sustained latency or CPU improvement.

The final 20:12:01 UTC check found all nine runtime version files matching their
installed-version markers byte for byte, no changed service/logger/supervisor
directory inodes, PackageManager count eight and both automatic installation
and download disabled. All 30 checked D-Bus services responded without a failed
read, and the exporter returned HTTP 200 with 864 finite numeric samples. A
30.907-second passive sample ending at 20:12:36 measured 51.05% aggregate host
CPU busy, load averages of 3.75/3.67/3.56 and 350856 KiB available memory, with
no swap. The controller used 34.3% of one core; that denominator differs from
aggregate host CPU. These short observations do not establish a sustained
performance improvement or resolve the external meter and HA timeout causes.

### Meter transport follow-up

Nine removals logged between 16:00 and 16:50 UTC cited configuration registers `0x2000–0x2023`; the meter reappeared three to nine seconds later. Inspection of the installed driver showed that removal requires more than five seconds without a successful full update. Its transaction timeout adapts to the greater of 100 ms and four times filtered transaction latency. The installed pymodbus client disables retries for empty/invalid replies; subsequent driver update calls provide additional attempts.

The 16:50:20–31 UTC network snapshot routed meter traffic through wired Ethernet at 100 Mbps/full duplex. CRC/frame/missed-packet errors and collisions were zero, with no new UDP buffer/checksum errors or softnet drops. Generic interface receive drops increased by eight; cumulative UDP receive-buffer errors show historical software drops. These counters cover all traffic, so they neither identify meter packets nor establish a NIC fault. The next useful check is register-specific Modbus response timing during an actual failure, correlated with socket drops and switch-port error/discard/link counters. No Modbus protocol, driver timeout or network configuration was changed.

The user subsequently reported Wi-Fi/eero in the network topology. The host-interface snapshot does not characterize every link on that path, and the topology alone does not establish the cause of the meter timeouts.

Outstanding checks:

1. VM-3P75CT Modbus UDP timeouts and service disappearance still occurred after telemetry repairs. Ten ICMP probes completed without loss (5.714–14.424 ms); this does not validate UDP delivery, switch behavior or the meter's response timing. Keep investigating the source transport rather than masking outages as fresh grid data.
2. HA bridges had timeouts and connection refusals. Backoff and invalid values improve recovery; they cannot make an unavailable HA endpoint deliver measurements.
3. Validate battery-chain disconnect/reconnect and stale-data behavior against the actual series/parallel topology and DVCC consumers in a controlled maintenance window. Successful installation and current valid readings do not replace that fault-injection test.
4. Validate change-only D-Bus signals, per-source freshness and fallback behavior under controlled bus/service restarts. A connected bus and armed subscriptions alone do not prove every measurement is fresh.
5. Schedule a real reboot/firmware-update recovery check for the released installers. No cold-boot claim is made from shell simulations or successful warm updates.
6. Calibrate an ESPHome CT grid bridge on real hardware before using it for export-sensitive control; a current magnitude plus assumed voltage/power factor cannot establish direction by itself.
7. Repeat CPU, D-Bus traffic and flash-write measurements over a representative day with normal dashboards/HA/VRM clients active.

## References

- [Victron customization, rootfs and boot hooks](https://www.victronenergy.com/live/ccgx:root_access).
- [Victron D-Bus API and change signals](https://github.com/victronenergy/venus/wiki/dbus-api).
- [D-Bus NameOwnerChanged specification](https://dbus.freedesktop.org/doc/dbus-specification.html#bus-messages-name-owner-changed).
- [dbus-send reply behavior](https://dbus.freedesktop.org/doc/dbus-send.1.html).
