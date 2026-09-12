# Installing services on Venus OS

Use each repository's released installer and configuration example. This organization contains independent repositories, not a monorepo with a shared `bootstrap.sh`.

## Device prerequisites

Check the actual device before choosing packages:

```sh
ssh root@cerbo
cat /opt/victronenergy/version
python3 --version
uname -m
command -v svc svstat multilog
```

The September 2026 audit used Venus OS v3.75, Python 3.12.13 and a Raspberry Pi 3 Model B (ARMv7, approximately 1 GB RAM). This verifies that host, not every Cerbo GX hardware or firmware revision.

Venus uses daemontools services under `/service`. Use `svstat` for status and `svc` for control. `systemctl`, `sv`, and `svcadm` are not native installation requirements. `/service` is volatile; retain application files, configuration and service templates under `/data` and recreate service links from `/data/rc.local` at boot. Put hooks before an existing `exit 0`. `/data/rc/S99*` alone is not a boot integration mechanism.

Firmware replaces the root filesystem. Do not install Python dependencies globally or assume files copied to `/opt` survive an update. Use firmware-provided D-Bus/PyGObject libraries; if a package requires a venv, use its documented `/data` environment and check native-library availability after a firmware update. Never download or resolve dependencies from a boot hook. See [Victron's customization documentation](https://www.victronenergy.com/live/ccgx:root_access).

## Components

Native device services and their authoritative instructions:

- [dbus-mqtt-battery](https://github.com/victron-venus/dbus-mqtt-battery): MQTT battery chains; configure each service instance and BMS topology.
- [dbus-virtual-battery](https://github.com/victron-venus/dbus-virtual-battery): derived battery values; verify every required source and its availability.
- [dbus-tasmota-pv](https://github.com/victron-venus/dbus-tasmota-pv): MQTT PV meters; configure the Tasmota topics and device mapping.
- [dbus-emporia-vue](https://github.com/victron-venus/dbus-emporia-vue): Home Assistant measurements published as AC loads.
- [dbus-ev](https://github.com/victron-venus/dbus-ev), [dbus-evcharger](https://github.com/victron-venus/dbus-evcharger), and [dbus-pump](https://github.com/victron-venus/dbus-pump): Home Assistant bridges. They depend on the configured HA endpoint and credentials.
- [dbus-esphome-grid-sensor](https://github.com/victron-venus/dbus-esphome-grid-sensor): alternative MQTT grid bridge; not installed on the audited device.
- [inverter-control](https://github.com/victron-venus/inverter-control): ESS controller. Configuration is Python `local_config.py`, optionally supplied through `/data/setupOptions/inverter-control/local_config.py`; it is not `config.yaml`.
- [venus-os-observability](https://github.com/victron-venus/venus-os-observability): optional metrics agent. Use metrics-only operation on constrained devices unless trace export is specifically required and measured.

SetupHelper integration is package-specific. Install [SetupHelper](https://github.com/kwindrem/SetupHelper) if the selected package requires it. Follow that package's `setup` invocation, release asset and dependency requirements; do not assume every project ships a native IPK or PackageManager package.

Installers must preserve local configuration and venvs, stage an in-place update before replacing source files, and leave supervised service directories in place. Run installation checks before stopping a working service. For ESS controllers, use the repository's documented maintenance/keepalive procedure and verify a fresh heartbeat after starting.

Keep dashboards, Docker, Grafana, Loki, databases, forecasting and development tooling on a companion NAS/server by default. Install an on-device dashboard binary only after checking its architecture and measuring memory/CPU headroom. ESPHome firmware runs on the ESP32; desktop/mobile applications run on their respective clients. `mcp-venus-os` can run on a companion host over SSH. No governance or event-log service was running on the audited GX; verify actual integration before assuming controller writes are mediated or recorded by them.

### SetupHelper version bookkeeping after a manual update

Calling a package's `update.sh` directly can bypass SetupHelper's `endScript`
bookkeeping. The service may be updated successfully while
`/etc/venus/installedVersion-<package>` is missing or still names an older
release. Check the deployed source, runtime file hashes, preserved configuration,
service state and package-specific health before repairing this metadata.

Back up the existing marker, recording its absence if it does not exist. For a
manually installed package whose installation has been verified, copy the exact
bytes from its `version` file into a temporary file in `/etc/venus`, then rename
that file atomically over the matching marker. For example, after completing
those checks and the backup:

```sh
(
    set -eu
    package=inverter-control
    package_version="/data/$package/version"
    marker="/etc/venus/installedVersion-$package"
    test -f "$package_version"
    marker_tmp=$(mktemp "/etc/venus/.installedVersion-$package.XXXXXX")
    trap 'rm -f "$marker_tmp"' EXIT
    trap 'exit 1' HUP INT TERM
    cp "$package_version" "$marker_tmp"
    chmod 644 "$marker_tmp"
    mv "$marker_tmp" "$marker"
    cmp -s "$package_version" "$marker"
)
```

Do not rerun `setup` or `update.sh`, restart PackageManager, or restart the
service solely to repair this marker. The marker does not implicitly register
a package with PackageManager; a manually installed package can remain
unregistered. Preserve existing registrations or their absence,
`optionsSet`, `DO_NOT_AUTO_INSTALL` and existing auto-install/download settings.
Updating the marker records a verified installation; it does not install or
validate the runtime itself.

### Archived governance project

[`venus-os-governance`](https://github.com/victron-venus/venus-os-governance) is
archived. Its source is not a validated native SetupHelper package, and its
direct D-Bus adapter remains unfinished. The adapter's Battery/DVCC/VE.Bus
convenience interfaces must not be assumed to implement Venus BusItem
`GetValue`/`SetValue` calls. A recorded policy decision does not demonstrate that
the controller requested permission or that a physical device accepted a write.
Keep this distinction when reading historical architecture diagrams.

Any future governance integration needs a tested caller contract and explicit
write acknowledgement. Prefer companion-host MQTT integration on constrained
GX systems; if a native package is developed, validate its persistent `/data`
layout, offline dependencies, bounded logs and service lifecycle separately.
The September audit's documentation correction is maintained here without
reopening or deploying the archived repository.

## Release webhooks and retries

Check the existing release webhook and package auto-update settings before
publishing a tag. A release can trigger installation independently of the
interactive maintenance session.

The audited NAS controller webhook runs installation synchronously through one
Gunicorn worker. During the 1.23.2 release, processing occupied the worker for
about 20 seconds: GitHub recorded delivery timeouts, although device verification
confirmed that installation completed. The subsequent `released` event was
eventually ignored after waiting behind the `published` request.

Verify the installed version, shipped file hashes, service state and fresh
controller heartbeat before redelivery, and confirm that no installer or
maintenance helper is still active. A version file alone does not prove a
complete install. The current controller webhook checks the version after
installation and has no delivery-ID deduplication or asynchronous job queue;
redelivery can repeat the update and restart services. Delivery status and
device installation status must be assessed separately.

## MQTT

Use the GX's existing broker or a documented external broker. Venus OS v3.75 on the audited device uses FlashMQ. Do not start another system D-Bus daemon or install a second broker as part of a bridge installer.

Topic schemes differ. Native Venus telemetry uses `N/<portal-id>/<service>/<instance>/<path>`; native read requests use `R/<portal-id>/...`. Raw ESPHome/Tasmota battery topics and application `inverter/state` are separate contracts. Read the publisher's README and use the actual portal ID; `xxxxxxxxxxx` is a placeholder that generates rejected requests. A broad `victron/#` subscription does not validate these installations.

## Verify installation and logs

Use the actual supervised instance name, which can differ from the repository name:

```sh
svstat /service/dbus-mqtt-chain1 /service/dbus-mqtt-chain2
svstat /service/dbus-virtual-chain /service/inverter-control
svstat /service/dbus-ev /service/vrmlogger
tail -n 80 /var/log/dbus-ev/current
tail -n 80 /var/log/vrmlogger/current
```

`svc -s` suspends a service; it is not a status command. Never read `supervise/ok` with `cat`: it is a FIFO and can leave a blocked process. Use `svc -u` to start, `svc -d` to stop, or `svc -t` for a deliberate restart.

Verify values and types as well as process uptime:

```sh
dbus-send --system --print-reply --dest=com.victronenergy.ev.ha \
  /BatteryCapacity com.victronenergy.BusItem.GetValue
dbus-send --system --print-reply --dest=com.victronenergy.ev.ha \
  /Connected com.victronenergy.BusItem.GetValue
```

The capacity must be numeric or invalid, never a numeric-looking string. In the audited system a string capacity crashed the stock VRM logger repeatedly. Also verify current values in the GX UI, a successful VRM upload, and fresh MQTT/HA inputs.

Check `/var/log` with `readlink -f /var/log`: on the audited device it points to `/data/log`, so logs write flash. Send normal logs to stdout/stderr through bounded `multilog`; avoid duplicate DEBUG files. Store frequently updated cursors and heartbeat files in `/run`.

Reboot/firmware persistence must be validated in a planned maintenance window. A passing unit test or a successful `svc -u` does not prove restart health, measurement correctness, DVCC safety, or firmware-upgrade compatibility.

See the [service audit and remaining checks](VENUS-SERVICE-AUDIT-2026-09-12.md).
