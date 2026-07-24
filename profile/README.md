# Victron Venus

Open-source tools for **Victron Energy** systems on **Venus OS** — grid-zero control, battery/PV bridges, dashboards, and observability.

Created by [@4alvit](https://github.com/4alvit).

## System architecture

```mermaid
flowchart TB
    subgraph Hardware["Hardware layer"]
        BMS["JBD BMS / LiFePO4"]
        ESP["ESP32 + ESPHome"]
        TAS["Tasmota energy meter"]
        CERBO["Cerbo GX / Venus OS"]
    end

    subgraph Control["Control layer (Venus OS packages)"]
        ESP -->|"BLE → MQTT"| BM["dbus-mqtt-battery"]
        TAS -->|"HTTP"| PV["dbus-tasmota-pv"]
        BM -->|"D-Bus"| CERBO
        PV -->|"D-Bus"| CERBO
        IC["inverter-control"] -->|"D-Bus"| CERBO
    end

    subgraph UI["Monitoring & dashboards"]
        IC -->|"MQTT inverter/state"| MQTT["MQTT broker"]
        MQTT --> DGO["inverter-dashboard-go\n(primary Cerbo binary)"]
        MQTT --> DPY["inverter-dashboard\n(Docker / alvit/inverter-dashboard)"]
        MQTT --> DT["inverter-desktop\n(Tauri client)"]
        MQTT --> MON["inverter-monitoring\n(TIG stack)"]
    end

    subgraph Dev["Development & ops"]
        IT["integration-tests"]
        TF["terraform-github"]
    end

    style IC fill:#4ecdc4,color:#000
    style DGO fill:#00ADD8,color:#fff
    style DPY fill:#3776ab,color:#fff
    style DT fill:#24c8db,color:#000
```

> **ESP32 setup:** Flash [esphome-jbd-bms-mqtt](https://github.com/victron-venus/esphome-jbd-bms-mqtt) separately (not via Venus PackageManager). See [INSTALL.md](../docs/INSTALL.md).

## Repositories

| Repository | Role |
|------------|------|
| [inverter-control](https://github.com/victron-venus/inverter-control) | Grid-zero ESS external control (3 Hz loop, Home Assistant) |
| [dbus-mqtt-battery](https://github.com/victron-venus/dbus-mqtt-battery) | MQTT → D-Bus bridge for JBD BMS batteries (DVCC) |
| [dbus-tasmota-pv](https://github.com/victron-venus/dbus-tasmota-pv) | Tasmota power meter → D-Bus PV inverter |
| [esphome-jbd-bms-mqtt](https://github.com/victron-venus/esphome-jbd-bms-mqtt) | ESP32 BLE proxy for JBD BMS → MQTT |
| [inverter-dashboard-go](https://github.com/victron-venus/inverter-dashboard-go) | **Primary Cerbo dashboard** — single Go binary |
| [inverter-dashboard](https://github.com/victron-venus/inverter-dashboard) | Python/FastAPI dashboard — Docker `alvit/inverter-dashboard` |
| [inverter-desktop](https://github.com/victron-venus/inverter-desktop) | Native Tauri desktop/mobile client |
| [inverter-monitoring](https://github.com/victron-venus/inverter-monitoring) | Telegraf + InfluxDB + Grafana stack |
| [integration-tests](https://github.com/victron-venus/integration-tests) | MQTT / battery / PV integration test harness |
| [terraform-github](https://github.com/victron-venus/terraform-github) | Terraform for org repos, branch rules, and policies |
| [.github](https://github.com/victron-venus/.github) | Organization profile and shared docs (this repo) |

### Dashboard choice

| Use case | Recommended repo |
|----------|------------------|
| Cerbo GX, minimal resources | **inverter-dashboard-go** |
| NAS / Docker / Portainer | **inverter-dashboard** (`alvit/inverter-dashboard`) |
| Desktop or mobile app | **inverter-desktop** |
| Long-term metrics & Grafana | **inverter-monitoring** |

## Getting started

Full stack install guide: **[docs/INSTALL.md](../docs/INSTALL.md)**

Quick Cerbo bootstrap (Venus packages only):

```bash
git clone https://github.com/victron-venus/inverter-control.git  # or use bootstrap.sh from a local checkout
# See inverter-control README for SetupHelper / PackageManager install
```

## Community

- **Issues:** open in the relevant project repository
- **Discussions:** enable at org level (Settings → General → Discussions) or per-repo via Terraform `has_discussions = true`
- **Contributing:** [CONTRIBUTING.md](../CONTRIBUTING.md)

## License

Most projects use the MIT License. See each repository for details.

---

Community project — not affiliated with Victron Energy.
