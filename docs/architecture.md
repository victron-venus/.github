# System architecture (detailed)

Org-level map of how [victron-venus](https://github.com/victron-venus) repos connect around Cerbo GX / Venus OS.

Skim version: [organization profile README](../profile/README.md#system-architecture).

GitHub Mermaid scales **each** diagram to page width. One wide graph stays short and tiny — so this page uses several **narrow, top→bottom** diagrams instead.

## 1. Plant → Venus OS (on Cerbo)

```mermaid
flowchart TB
    subgraph Field["Field hardware"]
        direction TB
        ESP["ESP32 + ESPHome"]
        TAS["Tasmota energy meter"]
        EVCHG["EV charger OCPP"]
        PUMP["Water tank / pump"]
        BMS["JBD BMS / LiFePO4"]
    end

    subgraph Pkgs["Venus OS packages"]
        direction TB
        BM["dbus-mqtt-battery"]
        PV["dbus-tasmota-pv"]
        EMP["dbus-emporia-vue"]
        GRD["dbus-esphome-grid-sensor"]
        EV["dbus-evcharger / dbus-ev"]
        PMP["dbus-pump"]
        IC["inverter-control"]
        EL["dbus-event-log"]
        OBS["venus-os-observability"]
        ESPH["esphome-jbd-bms-mqtt"]
    end

    Field -->|"sensors / MQTT / HTTP"| Pkgs
    Pkgs -->|"D-Bus"| CERBO["Cerbo GX / Venus OS"]

    ESP -.-> BM
    ESP -.-> ESPH
    ESPH -.-> BM
    TAS -.-> PV
    EVCHG -.-> EV
    PUMP -.-> PMP

    style CERBO fill:#e67e22,color:#fff
    style IC fill:#4ecdc4,color:#000
    style OBS fill:#8e44ad,color:#fff
```

Protocols in short: ESP/BMS → MQTT → `dbus-mqtt-battery`; Tasmota HTTP → `dbus-tasmota-pv`; EV/pump MQTT → `dbus-evcharger` / `dbus-pump`; packages expose D-Bus on Cerbo; `inverter-control` / `dbus-event-log` / `venus-os-observability` attach on D-Bus too.

## 2. MQTT → dashboards & edge

```mermaid
flowchart TB
    subgraph Pub["Publishers"]
        direction TB
        IC["inverter-control"]
        FG["fastapi-mqtt-gateway"]
        MO["mqtt-observability-otel"]
        SF["solar-forecast-langgraph"]
    end

    MQTT["MQTT broker"]

    subgraph Cons["Consumers"]
        direction TB
        IGW["inverter-gateway"]
        VIT["inverter-web-vitrine"]
        DGO["inverter-dashboard-go"]
        DPY["inverter-dashboard"]
        DVUE["inverter-dashboard-vue"]
        DT["inverter-desktop"]
        MON["inverter-monitoring"]
        MCP["mcp-venus-os"]
    end

    Pub --> MQTT --> Cons
    IGW -->|"HTTPS + Access"| VIT

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
    RAG["energy-data-rag-pipeline"] --> DOCS["Victron docs + community"]
```

## Development & ops

No edges into the live energy path (table on purpose — a disconnected Mermaid subgraph blows out layout):

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
