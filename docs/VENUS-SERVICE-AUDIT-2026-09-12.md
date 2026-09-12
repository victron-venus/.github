# Venus OS service audit — 12 September 2026

## Scope and evidence

The audit inspected the repositories and the live device reached through `root@cerbo`: Raspberry Pi 3 Model B Rev 1.2, ARMv7, Venus OS v3.75, Python 3.12.13, 944280 KiB physical memory and no swap. This hostname is not evidence of Cerbo GX hardware. Hardware-specific support for other GX models remains unverified.

Evidence included service/supervisor state, bounded current log tails, stock VRM logger mappings, read-only D-Bus values/types, boot scripts, filesystem mounts, process/resource sampling, dependency imports and installer regression tests. Logs contain historical errors as well as current events; a match in an old file is not evidence of an active fault. Private configurations, credentials and raw device logs are excluded from this report.

The device was not rebooted, reflashed or subjected to a simulated power failure. This audit issued no inverter mode or power-setpoint commands. A separate concurrent task deployed inverter-control 1.23.1 around 16:16 UTC; its restart and control changes must not be attributed to the telemetry repairs below.

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

Patch: [dbus-ev PR #22](https://github.com/victron-venus/dbus-ev/pull/22). Installer changes in the PR were not executed on the live device.

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

The audit prepares repository patches separately from the targeted live repairs. Draft PRs are reviewable changes, not a claim that every patch is deployed.

- EV/charger/pump/Emporia updates stage source before an in-place install, preserve local configuration and supervisor directory inodes, check dependencies before stopping services, restore log directories, and place boot hooks before an existing `exit 0`.
- Emporia's SetupHelper path is consolidated with the tested updater; transient HA connection failures use bounded retry and unavailable measurements are not reported as live zeros. See [Emporia #28](https://github.com/victron-venus/dbus-emporia-vue/pull/28), [charger #26](https://github.com/victron-venus/dbus-evcharger/pull/26), and [pump #27](https://github.com/victron-venus/dbus-pump/pull/27).
- Battery/PV/grid changes are reconciled against current upstream so already merged fixes are not duplicated. Incremental work covers bounded alarm logging, GLib-thread publication, stale-input handling and native installation errors. Battery/DVCC changes require topology-aware testing before deployment.
- Native controller transport improvements validate SetValue acknowledgement, distinguish remembered from live signal subscriptions, preserve cooldown after failed connection setup, correct NameOwnerChanged argument order, defer discovery off the D-Bus loop and refresh inverter power during fallback polling.
- Controller installation preserves service inodes and local state, removes process-killing based only on working directory and waits for a fresh heartbeat before reporting recovery.
- The controller's duplicate DEBUG file was approximately 565 MiB. Source changes disable it by default, bound an explicitly requested duplicate file, and send watchdog logs through multilog. The existing large file was retained, and these controller runtime changes were not part of the telemetry hotfix.
- Native observability/MCP/template installers and support documentation are reviewed against actual Venus service management and rootfs persistence. The [installation guide](INSTALL.md) replaces nonexistent bootstrap commands and incorrect systemd/status instructions.

### Reviewable repository changes

- [inverter-control #198](https://github.com/victron-venus/inverter-control/pull/198): transport, forwarder, bounded logging and installer recovery. After rebasing on 1.23.1, 594 tests passed with 87.05% coverage. Ruff, ShellCheck, formatting and secret checks passed. The configured Pylint hook retains warnings reproduced on the unchanged base, including a Python 3.14 standard-library inference issue; the new transport test file passes all hooks.
- [dbus-mqtt-battery #64](https://github.com/victron-venus/dbus-mqtt-battery/pull/64): low-SoC warning throttling and chain installation; 116 tests.
- [dbus-virtual-battery #41](https://github.com/victron-venus/dbus-virtual-battery/pull/41): required-source validity and native installation; 57 tests.
- [dbus-tasmota-pv #73](https://github.com/victron-venus/dbus-tasmota-pv/pull/73): GLib publication, stale values and installation; 41 tests.
- [dbus-esphome-grid-sensor #19](https://github.com/victron-venus/dbus-esphome-grid-sensor/pull/19): native D-Bus registration, freshness and installation; 45 tests and a container build. This does not establish physical CT calibration or direction.
- [dbus-ev #22](https://github.com/victron-venus/dbus-ev/pull/22), [dbus-evcharger #26](https://github.com/victron-venus/dbus-evcharger/pull/26), [dbus-pump #27](https://github.com/victron-venus/dbus-pump/pull/27), and [dbus-emporia-vue #28](https://github.com/victron-venus/dbus-emporia-vue/pull/28): respectively 73, 70, 44 and 69 tests after reconciliation with current upstream.
- [venus-os-observability #27](https://github.com/victron-venus/venus-os-observability/pull/27), [mcp-venus-os #47](https://github.com/4alvit/mcp-venus-os/pull/47), and [dbus-service-template #14](https://github.com/4alvit/dbus-service-template/pull/14): native runtime and installer corrections. Template validation includes rendering and executing generated tests.
- [dbus-event-log #51](https://github.com/victron-venus/dbus-event-log/pull/51), [venus-os-integration-patterns #21](https://github.com/victron-venus/venus-os-integration-patterns/pull/21), and [venus-os-ci-toolkit #31](https://github.com/victron-venus/venus-os-ci-toolkit/pull/31): retention, deployment boundaries and target-runtime validation.

The event-log follow-up implements a 30-day age ceiling, four retained archives, 100 MiB rotation checks before each insert/batch, and scheduled maintenance. Rotation checkpoints and closes WAL, prepares the replacement schema before moving the active file, and restores the original file if replacement fails. Tests cover collisions, busy WAL, rollback, ownership boundaries and unrelated files: 109 passed, 93.72% coverage, with lint/type/package and extracted-source-distribution checks passing. One batch can exceed the rotation threshold; this is not a hard filesystem quota or a minimum history guarantee. No event-log process was installed on the audited device.

These changes remain drafts and were not automatically merged or released. Test counts describe the audited local heads; CI and subsequent PR updates should be checked at the linked current heads. Docker integration tests for MCP were not executed because the local Docker daemon was unavailable. The governance repository is archived: its signed documentation correction remains local because GitHub rejected the push; the audit did not unarchive the repository.

## Resource observations and remaining work

At 16:23:06 UTC, a 30.63-second `/proc` sample measured 48.75% aggregate host CPU busy, load averages 3.47/3.15/3.61 and 363060 KiB available memory (about 355 MiB). Top measured processes included inverter-control at 27.46% of one CPU core with 28.8 MiB RSS, dbus-daemon at 23.11% of one core, and observability at 5.16% of one core with 27.0 MiB RSS. Aggregate CPU and per-process one-core percentages use different denominators.

These are a short post-repair sample, not a capacity guarantee or a controlled before/after benchmark. The initial top snapshot showed substantially higher busy time and VRM crash churn, but sampling methods and the concurrent controller rollout differ.

A fresh 31.07-second sample at 16:38:09 UTC measured 49.62% aggregate CPU busy and load averages 4.76/3.55/3.42. The one-minute load therefore still spikes; a sustained load reduction is not established. A subsequent thread-state inspection ending at 16:40:01 UTC measured 0.05% iowait and observed only one blocked-thread sample, with up to seven runnable threads. That more intrusive diagnostic itself adds CPU overhead. These samples do not indicate a persistent storage wait bottleneck, but do show runnable-task contention on the four-core host.

At 16:47:11 UTC load averages were 2.59/2.63/2.98. VRM retained the same PID for 2005 seconds, the forwarder for 1832 seconds, and the most recently patched observability process was up for 67 seconds. The lower recent load is encouraging, but representative-day measurements remain outstanding.

Outstanding checks:

1. VM-3P75CT Modbus UDP timeouts and service disappearance still occurred after telemetry repairs. Ten ICMP probes completed without loss (5.714–14.424 ms); this does not validate UDP delivery, switch behavior or the meter's response timing. Keep investigating the source transport rather than masking outages as fresh grid data.
2. HA bridges had timeouts and connection refusals. Backoff and invalid values improve recovery; they cannot make an unavailable HA endpoint deliver measurements.
3. Validate battery-chain disconnect/reconnect and stale-data behavior against the actual series/parallel topology and DVCC consumers before deploying control-affecting patches.
4. Validate change-only D-Bus signals, per-source freshness and fallback behavior under controlled bus/service restarts. A connected bus and armed subscriptions alone do not prove every measurement is fresh.
5. Schedule a real reboot/firmware-update recovery check after reviewing installer patches. No cold-boot claim is made from shell simulations.
6. Calibrate an ESPHome CT grid bridge on real hardware before using it for export-sensitive control; a current magnitude plus assumed voltage/power factor cannot establish direction by itself.
7. Repeat CPU, D-Bus traffic and flash-write measurements over a representative day with normal dashboards/HA/VRM clients active.

## References

- [Victron customization, rootfs and boot hooks](https://www.victronenergy.com/live/ccgx:root_access).
- [Victron D-Bus API and change signals](https://github.com/victronenergy/venus/wiki/dbus-api).
- [D-Bus NameOwnerChanged specification](https://dbus.freedesktop.org/doc/dbus-specification.html#bus-messages-name-owner-changed).
- [dbus-send reply behavior](https://dbus.freedesktop.org/doc/dbus-send.1.html).
