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

### Grid measurement validity follow-up

[inverter-control #199](https://github.com/victron-venus/inverter-control/pull/199) is a separate draft stacked on #198. Offline reproduction showed that an invalid grid value could leave the old power cached while unrelated battery traffic renewed a shared timestamp. Venus also replaces a missing external meter with native inverter measurements. On this site, that would replace a declared two-phase VM-3P75CT source with a one-phase VE.Bus source.

The follow-up separates grid validity from general bus activity, pins source/device instance and topology, checks external meter metadata, and rejects replies that span an invalidation. Normal control pauses before calculation and rechecks validity before writing. Pending manual requests and established watchdog policy are preserved; stale filter history is discarded. Unchanged measurements remain valid through periodic authoritative reads, with a 40-second monotonic revalidation budget. Explicit invalidation pauses normal writes on the next control cycle; silent expiry must first exhaust the revalidation budget before the existing watchdog timeout and hysteresis complete.

Default automatic discovery cannot identify an external meter that has never appeared in the current process. This site's rollout therefore needs explicit expected meter and two-phase settings after checking the healthy physical configuration. No such configuration or controller runtime change was deployed by the audit. The [operator guide](https://github.com/victron-venus/inverter-control/blob/fix/grid-telemetry-validity-20260912/docs/grid-telemetry-safety.md) documents cold-start limits, recovery timing and unsupported three-phase control.

The final frozen suite passed 654 tests with 87.17% coverage, including 60 focused grid regressions. Independent review included 14 additional behavioral checks. Ruff/format checks passed; Bandit 1.8.3 under Python 3.12 found no medium/high findings and skipped no scanned files. Existing Pylint baseline findings remain documented. Because the follow-up targets a feature branch, CodeQL and Python Security workflows restricted to `main` must rerun after retargeting; their filters were not weakened.

These changes remain drafts and were not automatically merged or released. Test counts describe the audited local heads; CI and subsequent PR updates should be checked at the linked current heads. Docker integration tests for MCP were not executed because the local Docker daemon was unavailable. The governance repository is archived: its signed documentation correction remains local because GitHub rejected the push; the audit did not unarchive the repository.

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

Retain the device's `CREEP_RATE = 0.0` and existing two-second grid filter time constant while addressing source reliability. These observations support guarding source changes before adding smoothing. Controller transport and grid-validity changes in [#198](https://github.com/victron-venus/inverter-control/pull/198) and [#199](https://github.com/victron-venus/inverter-control/pull/199) remain undeployed. Their deployment source must first incorporate [#200](https://github.com/victron-venus/inverter-control/pull/200), merged as `4205f00`, to retain support for the device-local creep override. The current draft heads and the `v1.23.1` release otherwise hard-code the old rate even when local configuration is preserved.

Checks from 17:52:38 to 17:53:18 UTC found all 24 HA-backed D-Bus services reporting `/Connected = 1`, all 19 Emporia channels publishing numeric power, and numeric EV, charger, pump and tank measurements. These checks read published D-Bus values and made no HA requests. All 12 custom-service supervisors and 15 log supervisors were up; observability returned HTTP 200 and no new conversion flood was observed. Availability flags and numeric types do not independently prove end-to-end freshness or recovery during future HA outages.

### Meter transport follow-up

Nine removals logged between 16:00 and 16:50 UTC cited configuration registers `0x2000–0x2023`; the meter reappeared three to nine seconds later. Inspection of the installed driver showed that removal requires more than five seconds without a successful full update. Its transaction timeout adapts to the greater of 100 ms and four times filtered transaction latency. The installed pymodbus client disables retries for empty/invalid replies; subsequent driver update calls provide additional attempts.

The 16:50:20–31 UTC network snapshot routed meter traffic through wired Ethernet at 100 Mbps/full duplex. CRC/frame/missed-packet errors and collisions were zero, with no new UDP buffer/checksum errors or softnet drops. Generic interface receive drops increased by eight; cumulative UDP receive-buffer errors show historical software drops. These counters cover all traffic, so they neither identify meter packets nor establish a NIC fault. The next useful check is register-specific Modbus response timing during an actual failure, correlated with socket drops and switch-port error/discard/link counters. No protocol, timeout or network configuration was changed.

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
