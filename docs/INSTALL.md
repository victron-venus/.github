# Full stack install guide

End-to-end setup for a Victron Venus home energy stack: **Cerbo GX + ESP32 BMS + Tasmota PV + control + dashboard**.

Created by [@4alvit](https://github.com/4alvit).

## Overview

| Layer | Component | Install method |
|-------|-----------|----------------|
| Battery sensing | ESP32 + ESPHome | Flash firmware (separate from Cerbo) |
| Battery on D-Bus | dbus-mqtt-battery | Venus PackageManager / `bootstrap.sh` |
| PV metering | Tasmota plug + dbus-tasmota-pv | Flash Tasmota, then Venus package |
| ESS control | inverter-control | Venus PackageManager / `bootstrap.sh` |
| Live dashboard | inverter-dashboard-go | Cerbo binary or Venus package |
| Optional Docker UI | inverter-dashboard | NAS Docker `alvit/inverter-dashboard` |
| Optional desktop | inverter-desktop | Release installer |
| Long-term metrics | inverter-monitoring | Docker on NAS |

## Prerequisites

- Victron Cerbo GX (or Raspberry Pi with Venus OS)
- SSH access to Cerbo (`root@cerbo` or your hostname)
- [kwindrem/SetupHelper](https://github.com/kwindrem/SetupHelper) on the Cerbo
- MQTT enabled on Cerbo (or external broker reachable from all components)
- Home Assistant (optional, for sensor entities used by inverter-control)

## 1. Cerbo bootstrap (Venus packages)

From a machine with SSH to the Cerbo and this monorepo checked out:

```bash
cd /path/to/victron
./bootstrap.sh cerbo.local
```

This installs via SetupHelper:

- `inverter-control`
- `dbus-mqtt-battery`
- `dbus-tasmota-pv`

Verify in Cerbo UI → Settings → Package Manager.

Manual package list entries (also in `defaultPackageList.custom`):

```
inverter-control        victron-venus    main
dbus-mqtt-battery       victron-venus    main
dbus-tasmota-pv         victron-venus    main
```

## 2. ESP32 JBD BMS (separate flash step)

ESPHome firmware is **not** installed through Venus PackageManager.

1. Clone [esphome-jbd-bms-mqtt](https://github.com/victron-venus/esphome-jbd-bms-mqtt).
2. Copy `secrets.yaml.example` → `secrets.yaml` and set WiFi + MQTT broker (Cerbo IP).
3. Flash:

```bash
esphome run jbd-bms-mqtt.yaml
```

4. Confirm MQTT topics publish cell voltage / SOC to the Cerbo broker.
5. Configure `dbus-mqtt-battery` on Cerbo to consume those topics (see dbus-mqtt-battery README).

## 3. Tasmota PV meter

1. Flash [Tasmota](https://tasmota.github.io/docs/) on a compatible energy meter plug.
2. Set `SetOption19 1` (MQTT) and point broker to Cerbo.
3. Install `dbus-tasmota-pv` on Cerbo (bootstrap or PackageManager).
4. Configure device IP/hostname in dbus-tasmota-pv settings.

## 4. inverter-control

1. Edit `/data/inverter-control/config.yaml` (or use the repo template).
2. Set Home Assistant URL/token and MQTT broker if not local.
3. Restart: `svc -t /service/inverter-control`
4. Confirm MQTT topic `inverter/state` publishes at ~3 Hz.

## 5. Dashboard

### Recommended: Go binary on Cerbo

```bash
# On Cerbo (ARM example — pick asset from releases)
wget https://github.com/victron-venus/inverter-dashboard-go/releases/latest/download/inverter-dashboard-raspberry-pi3
chmod +x inverter-dashboard-raspberry-pi3
./inverter-dashboard-raspberry-pi3
```

Open `http://<cerbo-ip>:8080`.

### Alternative: Docker on NAS

```bash
docker run -d --name inverter-dashboard \
  -p 8080:8080 \
  -e MQTT_HOST=<cerbo-ip> \
  alvit/inverter-dashboard:latest
```

### Desktop client

Download from [inverter-desktop releases](https://github.com/victron-venus/inverter-desktop/releases) and set MQTT host to Cerbo.

## 6. Monitoring stack (optional)

On a NAS or server with Docker:

```bash
git clone https://github.com/victron-venus/inverter-monitoring.git
cd inverter-monitoring
# Edit telegraf.conf for your MQTT broker
docker compose up -d
```

Grafana: import dashboards from `grafana/dashboards/`.

## 7. Validation

Run integration tests from a dev machine:

```bash
git clone https://github.com/victron-venus/integration-tests.git
cd integration-tests
docker compose up --abort-on-container-exit
```

## Troubleshooting

| Symptom | Check |
|---------|--------|
| No battery on VRM | ESP32 MQTT + dbus-mqtt-battery logs (`logread -f`) |
| No PV on D-Bus | Tasmota MQTT + dbus-tasmota-pv HTTP reachability |
| Dashboard empty | `mosquitto_sub -h <cerbo> -t 'inverter/state' -v` |
| Control not adjusting | inverter-control D-Bus permissions, HA entity IDs |

## Related docs

- [Organization profile](../profile/README.md)
- [CONTRIBUTING.md](../CONTRIBUTING.md)
- Per-repo README files for configuration detail
