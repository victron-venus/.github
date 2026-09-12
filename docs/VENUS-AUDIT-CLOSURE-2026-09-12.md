# Venus OS audit closure — 12 September 2026

This follow-up closes the source, installation and non-disruptive runtime review
started in the [service audit](VENUS-SERVICE-AUDIT-2026-09-12.md). The target is the
existing Raspberry Pi 3 Model B running Venus OS v3.75, reached through the
operator's GX hostname. It is not a hardware qualification of every Cerbo model.

## Coverage

The inventory contains 55 top-level Git checkouts. Nine installed GX packages
produce twelve custom supervised processes; the health check also includes seven
stock services and all nineteen loggers. Firmware examples, templates, developer
tools, desktop clients and duplicate organization checkouts are not additional
native services. Fifteen projects received releases during the original audit;
that number does not mean all 55 repositories passed a full functional review.

The native review covers inverter-control, its watchdog and log forwarder;
MQTT and virtual batteries; Tasmota PV; Emporia, EV, charger and pump bridges;
and observability. Existing evidence for the source-only ESPHome grid bridge,
MCP, event-log, template, integration patterns and CI toolkit is retained with
their deployment boundaries. No unconfigured grid source, MCP endpoint or event
store was commissioned. Archived governance remains archived.

The existing NAS alert bridge was also traced to its exact deployed source.
The release webhook was inspected and its synchronous update/retry limitation
remains documented. Forecasting and third-party monitoring/database containers
were inventoried, not certified by this native-service audit. Stopped containers
were left in their existing state.

## Closure releases and regression evidence

- [Virtual battery 2.7.6](https://github.com/victron-venus/dbus-virtual-battery/releases/tag/v2.7.6), [PR #43](https://github.com/victron-venus/dbus-virtual-battery/pull/43): 64 tests, 97.75% coverage.
- [EV 0.1.2](https://github.com/victron-venus/dbus-ev/releases/tag/v0.1.2), [PR #24](https://github.com/victron-venus/dbus-ev/pull/24): 105 tests, 87.76% coverage.
- [Charger 0.1.4](https://github.com/victron-venus/dbus-evcharger/releases/tag/v0.1.4), [PR #29](https://github.com/victron-venus/dbus-evcharger/pull/29): 136 tests, 89.66% coverage; includes the worker/freshness changes from [PR #28](https://github.com/victron-venus/dbus-evcharger/pull/28).
- [Pump 0.1.3](https://github.com/victron-venus/dbus-pump/releases/tag/v0.1.3), [PR #30](https://github.com/victron-venus/dbus-pump/pull/30): 87 tests, 90.70% coverage; includes the stale-level fixes from [PR #29](https://github.com/victron-venus/dbus-pump/pull/29).
- [Emporia 1.0.4](https://github.com/victron-venus/dbus-emporia-vue/releases/tag/v1.0.4), [PR #31](https://github.com/victron-venus/dbus-emporia-vue/pull/31): 92 tests, 96.13% coverage in Python 3.12 CI; includes the HA snapshot ordering fix from [PR #30](https://github.com/victron-venus/dbus-emporia-vue/pull/30).
- [Event-log 0.1.4](https://github.com/victron-venus/dbus-event-log/releases/tag/v0.1.4), [PR #53](https://github.com/victron-venus/dbus-event-log/pull/53): 114 tests, 93.72% coverage, repeated from the extracted source distribution. Compose/YAML examples needed by those tests are explicitly packaged.

- [Observability 0.1.5](https://github.com/victron-venus/venus-os-observability/releases/tag/v0.1.5), [PR #30](https://github.com/victron-venus/venus-os-observability/pull/30): 132 tests, 91.73% coverage; all 18 native archive files and the 16 installed runtime files are checked separately.

These are separate project suites; coverage percentages refer to their
respective projects. Independent review additionally exercised charger
HA/MQTT expiry, late completion, voltage invalidation and valid-zero recovery.
Actual configured poll cadence is tested, including a 15-second HA interval with
five-second MQTT field lifetimes. Repository check thresholds were not reduced.
Emporia's bare Pylint hook reports 29 baseline diagnostics and 32 after the
shutdown change: the additional dependency-missing exception import, intentional
broad cleanup catch and main-function branch count are disclosed in its PR. The
charger baseline is separately documented in its PR. These local lint limitations
are not claimed as clean runs; configured CI thresholds were not weakened.

Signed release revisions were compared with the exact CI-tested source trees.
The existing alert bridge uses the already published observability 0.1.4 source;
the relay did not require a new native service. The exporter subsequently
required its own 0.1.5 owner-lifecycle fix described below.

## Additional defects repaired

- **Virtual battery:** reader cache expiry and reconnect throttling now use a
  monotonic clock. Connection loss and reconnection clear cached values. A
  backward wall-clock adjustment can no longer retain telemetry or suppress
  reconnection indefinitely. Regression tests reproduce the released defect.
- **EV:** one bounded worker performs HA polling and dispatches publication back
  to the GLib loop. Slow HTTP requests do not block the heartbeat or freshness
  checks. Unit metadata comes from the existing template request, eliminating
  three extra requests per poll. Invalid numeric and charging-state values no
  longer crash the periodic callback. Freshness starts when acquisition starts,
  so a late response cannot become fresh merely by reaching the main loop.
- **Charger:** blocking HA and grid-voltage reads use one bounded worker. MQTT
  reconnect uses one client/network loop and bounded backoff. Critical status
  and power fields must each remain valid within their original five-second
  MQTT lifetime; optional messages and queued publication cannot extend it.
  Missing data remain invalid instead of becoming connected zeros. Two-phase
  current derives from each phase's power, preserving explicit zero and measured
  currents. Failed voltage reads clear cached values and permit rediscovery;
  cached acquisition age remains bounded. Native registration now waits until
  every path and configured initial value is ready, with `/Connected=0` until
  valid telemetry arrives.
- **Pump:** an unavailable level after a valid reading no longer raises an
  assertion or refreshes the level's stale deadline. AUTO mode retains its
  existing grace period and closes after expiry; manual modes retain their
  semantics. Delayed worker completion cannot renew level freshness. Invalid
  remaining-volume telemetry is published as unavailable. All three private
  D-Bus services are initialized before publishing names, including configured
  capacity and callback wiring; initial connection state is unavailable.
- **Emporia:** the initial HA state response can no longer overwrite a newer
  interleaved trigger event. HA timestamps resolve overlap; when timestamps are
  absent or ambiguous, the already received event is retained. Zero and
  unavailable states are covered by regressions. SIGTERM/SIGINT now cancel and
  join workers instead of raising `SystemExit` inside an unobserved task. Socket
  close and service release have deadlines, and cleanup releases every private
  bus even when a close operation fails.
- **Event-log:** Compose now uses the environment names actually accepted by
  configuration parsing and a consistent recorder/broker network. Explicit YAML
  configuration precedence and log bounds are tested. The README correctly
  identifies `/var/log` as persistent on the audited Venus image. This remains a
  source/companion release: its current monitor does not subscribe to native
  BusItem `ItemsChanged`, so it is not yet a complete GX event recorder.

The registration changes follow the [Victron D-Bus API guidance](https://github.com/victronenergy/venus/wiki/dbus-api):
publish the service name after its required paths and initial data are ready.
Six new native-registration regressions fail against the previous charger and
pump releases and pass against the corrected implementations.

**Observability:** an unresolved unique D-Bus owner previously became a metric
label while a throttled cache retained obsolete owners. The released listener
reproduction grew from 8 to 16, 24 and 32 samples over three restarts. The new
listener tracks `NameOwnerChanged`, resolves its initial snapshot asynchronously,
evicts old owners and bounds unresolved batches by count, item count and age.
It never substitutes a raw `:1.x` owner as a service label. Lost publishers'
existing gauges become unavailable (`NaN`) in Prometheus and OpenTelemetry;
stable counters remain, and a measured zero restores the gauge normally.
Overlapping publishers do not invalidate each other's latest values. A repeated
100-reconnect regression keeps one active owner and a constant five samples.
The real OpenTelemetry SDK also verifies the transition from 42 to `NaN` to 0.

The charger currently mirrors configured source values into D-Bus. Its exposed
control paths are not evidence of a verified command round trip to the physical
charger. No actuator functionality or new scheduling policy was added here.

## Meter exchange and natural recovery

A five-minute passive Ethernet capture from **22:44:35 to 22:49:35 UTC** recorded
5,788 UDP/502 packet headers with `SO_TIMESTAMPNS` enabled. The collector used
kernel timestamps when ancillary data were present; its metadata does not retain
a per-row flag proving that every timestamp came from the kernel. The capture sent no
queries, stored no register measurements or network addresses, and reported **zero kernel
capture drops**. Requests and replies matched peer, client port, transaction ID,
unit and function; there were no unmatched responses, Modbus exceptions or
inconsistent response byte-count/declared MBAP length fields. Actual full datagram
length was not retained. All 111 unanswered active-meter requests occurred
more than two seconds before capture ended; no additional requests were excluded
as pending at the capture boundary.

- Power block `0x3080`, eight registers: 2,739 requests, 2,658 replies, **81
  unanswered**. Received-reply median 10.605 ms, p99 131.101 ms, maximum 737.359 ms.
- Configuration block `0x2000`, 36 registers: 119 requests, 89 replies, **30
  unanswered**. Received-reply median 14.737 ms, maximum 3,551.741 ms.
- Block `0x3032`, 30 registers: 71 requests and 71 replies. Received-reply median
  12.068 ms, maximum 263.183 ms.

Missing and delayed replies were clustered. These are observations at the GX
Ethernet interface, not proof that the meter firmware, a particular network
component or the GX receive path caused the loss. Cumulative Ethernet counters are not interval loss
measurements. Increasing smoothing or timeout settings cannot establish the
missing upstream measurements.

The stock Modbus driver logged a configuration-read timeout and removed its grid
service at **22:47:56**. The controller retained its accepted command for the
configured ten-second hold. At **22:48:06**, controller/watchdog logs recorded hold
expiry and a forced 0 W request. The grid owner returned at **22:48:07**, and
control resumed at **22:48:15**. This natural outage exercises expiry and recovery
without injecting a fault. The logs establish the software action; no independent
electrical measurement verifies the inverter's physical transient response.

The passive-capture checkpoint used a 10-second hold, grid filter tau of
2 seconds, creep at zero, the selected two-phase meter and unchanged configured
power caps. The controller configuration is managed by the coordinated control
task; final site settings are recorded with the installation checkpoint below.
Next diagnosis belongs to the meter/network path: correlate a future occurrence
with switch-port and GX receive counters and meter diagnostics, then evaluate a supported
firmware change with rollback. No stock-driver patch or firmware update was
applied on speculation.

## Final installed checkpoint

At **23:40:14–23:40:20 UTC**, all nineteen supervised processes and their
nineteen loggers were up. Every installed version matched its SetupHelper
version marker, and the original supervisor directory identities were unchanged.
D-Bus inspection found 19 AC-load services, four batteries, two PV inverters,
two pumps, one tank, one EV and one charger, with no failed reads, disconnected
services or invalid AC-load/PV power in that snapshot. The bounded regular-file
log review found no errors or warnings between **23:39:25 and 23:40:20 UTC**.
Earlier pump startup retained its expected monitoring-only warning; automatic
actuation remains disabled by site configuration.

Installed versions: inverter-control **1.23.3**, observability **0.1.5**, EV
**0.1.2**, charger **0.1.4**, pump **0.1.3**, Emporia **1.0.4**, MQTT battery
**2.7.5**, virtual battery **2.7.6**, and Tasmota PV **3.0.2**. Event-log **0.1.4**
is published as a companion/source package; no recorder was commissioned.

Emporia also passed one actual supervised restart after installation: graceful
stop took **2.065 seconds**, no forced kill was used, and it returned with a new
PID while its logger, configuration hash and supervisor directories remained
unchanged. The fresh log window includes that shutdown and startup. Native
release files were verified against published archive hashes; private backups
under `/data/backups` retain the previous installed files and version markers.
The separate NAS relay backup retains its previous bound source file.

The coordinated control task applied the operator's requested **20-second**
site hold at **23:31:56 UTC**, changing only that setting in the runtime and
SetupHelper configurations. This audit independently matched both resulting
configuration hashes, the new controller PID and fresh MQTT state reporting
`grid_loss_hold_seconds=20`, valid grid control and normal operation. The filter
remains at tau 2 seconds, creep is zero, the selected two-phase meter and
−2300/+2250 W caps are retained. The earlier natural-outage evidence used the
old 10-second setting; an actual 20-second expiry was not induced or observed.

The exporter returned HTTP 200 with finite samples and no raw unique-owner
labels in all seven observations from **23:39:51 to 23:40:52 UTC**, after the
Emporia restart. Sample counts stayed within **411–413** during that window.
Earlier post-start growth involved first-seen service/path counters; neither a
short plateau nor a fresh process establishes long-term constant cardinality.
The repeated owner-churn regression provides the reproducible leak check.

The final **30.81-second** resource sample ended at **23:41:47 UTC**. Busy CPU
was **51.74% across four cores**, and load averages were **2.56 / 3.23 / 3.22**
for one/five/fifteen minutes. Available memory was **357,900 KiB** (about 349.5
MiB), swap was absent, and CPU temperature was **51.54°C**. All four CPUs used
the existing `powersave` governor at **600 MHz**. This was measured, not changed;
thermal-throttling flags were unavailable. The earlier comparable short sample
was 50.24% busy CPU with load 2.24 / 2.86 / 3.23, so a sustained CPU reduction is
**not established**. The controller used 33.62% of one core, D-Bus 22.75% and
FlashMQ 12.85%; process percentages use one-core units and must not be confused
with whole-host utilization.

## Installation and validation boundary

Warm updates use the released installers, private rollback copies and exact
archive/runtime hashes. Local configuration, persistent `/data` layout and
supervisor directory identity are checked. The native platform uses daemontools,
not systemd; `/service` is volatile and boot restoration belongs before `exit 0`
in `/data/rc.local`. Logs require rotation because `/var/log` resolves to
`/data/log`. See the [installation guide](INSTALL.md).

Physical cold boot, power interruption, firmware/rootfs replacement, battery
topology fault injection, CT calibration and physical EV/valve control were not
exercised during the remote production audit. A short CPU sample cannot establish
a sustained day-long reduction. These are explicit validation limits, not hidden
claims of successful tests.
