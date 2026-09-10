# System architecture (detailed)

Org-level map of how [victron-venus](https://github.com/victron-venus) repos connect around Cerbo GX / Venus OS.

Skim version: [organization profile README](../profile/README.md#system-architecture).

GitHub Mermaid scales each diagram to page width — one giant graph becomes unreadably wide and short. Below, the stack is split into **narrow vertical** diagrams (top → bottom) so labels stay large.

## 1. Plant → Venus OS (on Cerbo)

Field devices and Venus packages meet on the Cerbo over D-Bus / MQTT.

```mermaid
flowchart TB
    ESP["ESP32 + ESPHome"]
    TAS["Tasmota energy meter"]
    EVCHG["EV charger OCPP"]
    PUMP["Water tank / pump"]
    BMS["JBD BMS / LiFePO4"]

    ESP -->|"BLE→MQTT"| BM["dbus-mqtt-battery"]
    ESP -.->|"BLE→MQTT"| ESPH["esphome-jbd-bms-mqtt"]
    ESPH -.-> BM
    TAS -->|"HTTP"| PV["dbus-tasmota-pv"]
    EVCHG -.->|"MQTT"| EV["dbus-evcharger / dbus-ev"]
    PUMP -.->|"MQTT"| PMP["dbus-pump"]

    EMP["dbus-emporia-vue"]
    GRD["dbus-esphome-grid-sensor"]
    IC["inverter-control"]
    EL["dbus-event-log"]
    OBS["venus-os-observability"]

    BM -->|"D-Bus"| CERBO["Cerbo GX / Venus OS"]
    PV -->|"D-Bus"| CERBO
    EMP -->|"D-Bus"| CERBO
    GRD -->|"D-Bus"| CERBO
    EV -->|"D-Bus"| CERBO
    PMP -->|"D-Bus"| CERBO
    IC -->|"D-Bus"| CERBO
    EL -->|"D-Bus monitor"| CERBO
    OBS -->|"OTel"| CERBO

    style CERBO fill:#e67e22,color:#fff
    style IC fill:#4ecdc4,color:#000
    style OBS fill:#8e44ad,color:#fff
```

## 2. MQTT → dashboards & edge

Cerbo / control publish into MQTT; UIs and the public edge consume it.

```mermaid
flowchart TB
    IC["inverter-control"] -->|"inverter/state"| MQTT["MQTT broker"]
    FG["fastapi-mqtt-gateway"] -.->|"REST/WS"| MQTT
    MO["mqtt-observability-otel"] -.->|"metrics/traces"| MQTT
    SF["solar-forecast-langgraph"] -->|"forecast"| MQTT

    MQTT --> IGW["inverter-gateway"]
    IGW -->|"HTTPS + Access"| VIT["inverter-web-vitrine"]

    MQTT --> DGO["inverter-dashboard-go"]
    MQTT --> DPY["inverter-dashboard"]
    MQTT --> DVUE["inverter-dashboard-vue"]
    MQTT --> DT["inverter-desktop"]
    MQTT --> MON["inverter-monitoring"]
    MQTT --> MCP["mcp-venus-os"]

    style MQTT fill:#2c3e50,color:#fff
    style IGW fill:#f48120,color:#fff
    style VIT fill:#5b8cff,color:#fff
    style DGO fill:#00ADD8,color:#fff
    style DPY fill:#3776ab,color:#fff
    style DT fill:#24c8db,color:#000
    style IC fill:#4ecdc4,color:#000
```

## 3. Data & docs (optional)

```mermaid
flowchart TB
    RAG["energy-data-rag-pipeline"] -->|"RAG"| DOCS["Victron docs + community"]
```

## Development & ops

No edges into the live energy path (listed so they do not distort layout):

| Repo | Role |
|------|------|
| [integration-tests](https://github.com/victron-venus/integration-tests) | Cross-repo integration tests |
| [terraform-github-victron](https://github.com/4alvit/terraform-github-victron) | Org GitHub Terraform |
| [terraform-github-4alvit](https://github.com/4alvit/terraform-github-4alvit) | Personal GitHub Terraform |
| [iot-project-builder-profile](https://github.com/4alvit/iot-project-builder-profile) | Public IoT profile site |
| [venus-os-ci-toolkit](https://github.com/victron-venus/venus-os-ci-toolkit) | Shared CI workflows |

## How to read it

| Layer | What lives here |
|-------|-----------------|
| Hardware | Physical plant + Cerbo |
| Control | Venus OS packages on the GX (D-Bus) |
| Bridge | Off-Cerbo MQTT / BMS helpers |
| Monitoring & dashboards | MQTT consumers, gateway, UIs |
| Data & analytics | Forecast / RAG (optional) |
| Development & ops | CI, Terraform, org tooling |

Install path: [INSTALL.md](./INSTALL.md).
