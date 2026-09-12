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
