# System architecture (detailed)

Org-level map of how [victron-venus](https://github.com/victron-venus) repos connect around Cerbo GX / Venus OS.

For a skim-friendly version see the [organization profile README](../profile/README.md#system-architecture).
This page keeps the full repo-level graph (protocols and package names).

## Full stack

```mermaid
flowchart LR
    subgraph HW["Hardware"]
        direction TB
        CERBO["Cerbo GX / Venus OS"]
        BMS["JBD BMS / LiFePO4"]
        ESP["ESP32 + ESPHome"]
        TAS["Tasmota energy meter"]
        EVCHG["EV charger (OCPP)"]
        PUMP["Water tank / pump"]
    end

    subgraph CTL["Control (Venus OS packages)"]
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
    end

    subgraph BRG["Bridge services"]
        direction TB
        ESPH["esphome-jbd-bms-mqtt"]
        FG["fastapi-mqtt-gateway"]
        MO["mqtt-observability-opentelemetry"]
    end

    subgraph DAT["Data & analytics"]
        direction TB
        RAG["energy-data-rag-pipeline"]
        SF["solar-forecast-langgraph"]
        DOCS["Victron docs + community"]
    end

    subgraph DEV["Development & ops"]
        direction TB
        IT["integration-tests"]
        TFV["terraform-github-victron"]
        TF4["terraform-github-4alvit"]
        BUILD["iot-project-builder-profile"]
        CITK["venus-os-ci-toolkit"]
    end

    subgraph UI["Monitoring & dashboards"]
        direction TB
        MQTT["MQTT broker"]
        IGW["inverter-gateway"]
        DGO["inverter-dashboard-go"]
        DPY["inverter-dashboard"]
        DVUE["inverter-dashboard-vue"]
        DT["inverter-desktop"]
        MON["inverter-monitoring"]
        VIT["inverter-web-vitrine"]
        MCP["mcp-venus-os"]
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
    RAG -->|"RAG pipeline"| DOCS
    SF -->|"Forecast"| MQTT

    MQTT --> IGW
    IGW -->|"HTTPS + Access"| VIT
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
    style IGW fill:#f48120,color:#fff
    style VIT fill:#5b8cff,color:#fff
```

## How to read it

| Layer | What lives here |
|-------|-----------------|
| Hardware | Physical plant + Cerbo |
| Control | Venus OS packages on the GX (D-Bus services) |
| Bridge | Off-Cerbo bridges that feed MQTT / BMS |
| Monitoring & dashboards | MQTT consumers, gateway, UIs |
| Data & analytics | Forecast / RAG (optional) |
| Development & ops | CI, Terraform, org tooling |

Install path for a typical home stack: [INSTALL.md](./INSTALL.md).
