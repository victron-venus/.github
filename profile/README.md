# Victron Venus

Open-source tools for **Victron Energy** systems on **Venus OS** — grid-zero control, battery/PV bridges, dashboards, and observability.

Created by [@4alvit](https://github.com/4alvit).

## System architecture

```mermaid
flowchart TB
    subgraph HW["Hardware"]
        direction TB
        CERBO["Cerbo GX / Venus OS"]
        ~~~ BMS["JBD BMS / LiFePO4"]
        ~~~ ESP["ESP32 + ESPHome"]
        ~~~ TAS["Tasmota energy meter"]
        ~~~ EVCHG["EV charger (OCPP)"]
        ~~~ PUMP["Water tank / pump"]
    end

    subgraph CTL["Control (Venus OS packages)"]
        direction TB
        BM["dbus-mqtt-battery"]
        ~~~ PV["dbus-tasmota-pv"]
        ~~~ EMP["dbus-emporia-vue"]
        ~~~ GRD["dbus-esphome-grid-sensor"]
        ~~~ EV["dbus-evcharger / dbus-ev"]
        ~~~ PMP["dbus-pump"]
        ~~~ IC["inverter-control"]
        ~~~ EL["dbus-event-log"]
        ~~~ OBS["venus-os-observability"]
    end

    subgraph BRG["Bridge services"]
        direction TB
        ESPH["esphome-jbd-bms-mqtt"]
        ~~~ FG["fastapi-mqtt-gateway"]
        ~~~ MO["mqtt-observability-opentelemetry"]
    end

    subgraph DAT["Data & analytics"]
        direction TB
        RAG["energy-data-rag-pipeline"]
        ~~~ SF["solar-forecast-langgraph"]
    end

    subgraph DEV["Development & ops"]
        direction TB
        IT["integration-tests"]
        ~~~ TFV["terraform-github-victron"]
        ~~~ TF4["terraform-github-4alvit"]
        ~~~ BUILD["iot-project-builder-profile"]
        ~~~ CITK["venus-os-ci-toolkit"]
    end

    subgraph UI["Monitoring & dashboards"]
        direction TB
        MQTT["MQTT broker"]
        ~~~ DGO["inverter-dashboard-go"]
        ~~~ DPY["inverter-dashboard"]
        ~~~ DVUE["inverter-dashboard-vue"]
        ~~~ DT["inverter-desktop"]
        ~~~ MON["inverter-monitoring"]
        ~~~ MCP["mcp-venus-os"]
    end

    ESP -->|"BLE→MQTT"| BM
    TAS -->|"HTTP"| PV
    EVCHG -.->|"MQTT"| EV
    PUMP -.->|"MQTT"| PMP
    BM -->|"D-Bus"| CERBO
    PV -->|"D-Bus"| CERBO
    EMP -->|"D-Bus"| CERBO
    GRD -->|"D-Bus"| CERBO
    EV -->|"D-Bus"| CERBO
    PMP -->|"D-Bus"| CERBO
    IC -->|"D-Bus"| CERBO
    EL -->|"D-Bus monitor"| CERBO
    OBS -->|"OTel tracing"| CERBO

    ESP -.->|"BLE→MQTT"| ESPH
    ESPH -.-> BM
    FG -.->|"REST/WS→MQTT"| MQTT
    MO -.->|"OTel→metrics/traces"| MQTT

    IC -->|"inverter/state"| MQTT
    RAG -->|"RAG pipeline"| DOCS["Victron docs + community"]
    SF -->|"Forecast"| MQTT

    MQTT --> DGO
    MQTT --> DPY
    MQTT --> DVUE
    MQTT --> DT
    MQTT --> MON
    MQTT --> MCP

    style IC fill:#4ecdc4,color:#000
    style DGO fill:#00ADD8,color:#fff
    style DPY fill:#3776ab,color:#fff
    style DT fill:#24c8db,color:#000
    style OBS fill:#8e44ad,color:#fff
```

> **ESP32 setup:** Flash [esphome-jbd-bms-mqtt](https://github.com/victron-venus/esphome-jbd-bms-mqtt) separately (not via Venus PackageManager). See [INSTALL.md](../docs/INSTALL.md).

## Repositories

### Core control & bridging

| Repository | Role |
|------------|------|
| [inverter-control](https://github.com/victron-venus/inverter-control) | Grid-zero ESS external control (4 s cadence, EV from D-Bus) |
| [dbus-mqtt-battery](https://github.com/victron-venus/dbus-mqtt-battery) | MQTT → D-Bus bridge for JBD BMS batteries (DVCC, reboot persistence) |
| [dbus-tasmota-pv](https://github.com/victron-venus/dbus-tasmota-pv) | Tasmota power meter → D-Bus PV inverter (daemontools multilog) |
| [dbus-emporia-vue](https://github.com/victron-venus/dbus-emporia-vue) | Emporia Vue submeters → D-Bus AC load (one per channel) |
| [dbus-esphome-grid-sensor](https://github.com/victron-venus/dbus-esphome-grid-sensor) | ESP32 CT sensor → D-Bus grid meter |
| [dbus-evcharger](https://github.com/victron-venus/dbus-evcharger) | EV charge point → D-Bus charger (OCPP via Cerbo MQTT) |
| [dbus-ev](https://github.com/victron-venus/dbus-ev) | EV charging session data → D-Bus |
| [dbus-pump](https://github.com/victron-venus/dbus-pump) | Water tank level / pump → D-Bus tank |
| [dbus-virtual-battery](https://github.com/victron-venus/dbus-virtual-battery) | Virtual battery for no-BMS chains |
| [dbus-event-log](https://github.com/victron-venus/dbus-event-log) | Audit log of D-Bus commands & state transitions |
| [dbus-service-template](https://github.com/4alvit/dbus-service-template) | Copier template for new D-Bus services (generation-test in CI) |
| [esphome-jbd-bms-mqtt](https://github.com/victron-venus/esphome-jbd-bms-mqtt) | ESP32 BLE proxy for JBD BMS → MQTT |
| [esphome-ble-sensor-patterns](https://github.com/4alvit/esphome-ble-sensor-patterns) | Production-ready ESPHome BLE sensor configurations |

### Dashboards & UI

| Repository | Role |
|------------|------|
| [inverter-dashboard-go](https://github.com/victron-venus/inverter-dashboard-go) | **Primary Cerbo dashboard** — single Go binary |
| [inverter-dashboard](https://github.com/victron-venus/inverter-dashboard) | Python/FastAPI dashboard — Docker `alvit/inverter-dashboard` |
| [inverter-dashboard-vue](https://github.com/victron-venus/inverter-dashboard-vue) | Shared Vue 3 SPA component library |
| [inverter-desktop](https://github.com/victron-venus/inverter-desktop) | Native Tauri desktop/mobile client |
| [inverter-monitoring](https://github.com/victron-venus/inverter-monitoring) | Telegraf + InfluxDB + Grafana stack |

### Platform services

| Repository | Role |
|------------|------|
| [fastapi-mqtt-gateway](https://github.com/victron-venus/fastapi-mqtt-gateway) | REST/WebSocket → MQTT bridge (auth, rate limiting, streaming) |
| [mqtt-observability-opentelemetry](https://github.com/4alvit/mqtt-observability-opentelemetry) | OpenTelemetry observability for MQTT IoT systems |
| [venus-os-observability](https://github.com/victron-venus/venus-os-observability) | OTel/Prometheus for Venus OS — D-Bus tracing, metrics export (daemontools) |
| [venus-os-ci-toolkit](https://github.com/victron-venus/venus-os-ci-toolkit) | Reusable GitHub Actions workflows (lint, test, coverage, Scorecard) — pinned to commit SHA |
| [mcp-venus-os](https://github.com/victron-venus/mcp-venus-os) | MCP server for Venus OS D-Bus/MQTT management |

### Data & AI

| Repository | Role |
|------------|------|
| [energy-data-rag-pipeline](https://github.com/4alvit/energy-data-rag-pipeline) | RAG pipeline for Victron docs + community knowledge (FastAPI, LangChain, pgvector) |
| [solar-forecast-langgraph](https://github.com/4alvit/solar-forecast-langgraph) | Solar forecasting with LangGraph (OpenMeteo + historical data) |

### Testing & infrastructure

| Repository | Role |
|------------|------|
| [integration-tests](https://github.com/victron-venus/integration-tests) | MQTT / battery / PV integration test harness (reusable workflow) |
| [terraform-github-victron](https://github.com/victron-venus/terraform-github-victron) | Terraform for org repos, branch rules, and policies |
| [terraform-github-4alvit](https://github.com/4alvit/terraform-github-4alvit) | Terraform for 4alvit personal org |
| [.github](https://github.com/victron-venus/.github) | Organization profile and shared docs (this repo) |

### Dashboard choice

| Use case | Recommended repo |
|----------|------------------|
| Cerbo GX, minimal resources | **inverter-dashboard-go** |
| NAS / Docker / Portainer | **inverter-dashboard** (`alvit/inverter-dashboard`) |
| Desktop or mobile app | **inverter-desktop** |
| Long-term metrics & Grafana | **inverter-monitoring** |
| Custom Vue dashboard | **inverter-dashboard-vue** |

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