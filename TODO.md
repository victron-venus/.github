# Victron Venus Ecosystem: Project Roadmap & Task Tracker

## Organization Projects (victron-venus)

### 1. venus-os-observability
OpenTelemetry/Prometheus for Venus OS — D-Bus event tracing, inverter metrics, distributed tracing.
- **Principle:** observability-first reference implementation
- **Stack:** Python, OpenTelemetry, Prometheus, Grafana Tempo
- **Value:** bridges the gap between inverter-monitoring and deep tracing; enables debugging D-Bus call chains
- **Priority:** HIGH — inverter-monitoring + Grafana dashboards exist, add tracing layer
- [x] Project scaffolding (pyproject.toml, CI, MIT license, badges)
- [x] OpenTelemetry SDK integration with D-Bus signal listener
- [x] Prometheus metrics exporter for inverter state machine
- [x] README with architecture Mermaid diagram + offline wheel install
- [x] Config example + systemd service + wheel build script
- [ ] Grafana Tempo traces dashboard
- [ ] Correlation IDs across MQTT → D-Bus → inverter-control pipeline
- **Branch pushed:** `chore/gitignore-and-ci-split` — **PR ready to create**
- **Branch pushed:** `Update-dbus_listener.py` — **PR ready to create**

### 2. dbus-event-log
Audit log of all D-Bus commands and inverter state transitions with chronology, filtering, and export.
- **Principle:** distributed-event-log adapted for D-Bus/IoT
- **Stack:** Python, SQLite/TimescaleDB, MQTT
- **Value:** critical for post-mortem analysis of incidents (overloads, battery failures)
- [ ] D-Bus signal subscription and event capture
- [ ] SQLite storage with rotation and retention policies
- [ ] MQTT topic for real-time event streaming
- [ ] CLI query tool (filter by time, service, signal type)
- [ ] Export to JSON/CSV for external analysis
- [ ] Integration with inverter-monitoring Grafana dashboards

### 3. inverter-monitoring (Telegraf + InfluxDB + Grafana Stack)
**Status:** Active | **Target:** Pre-configured Grafana dashboards, optimized Telegraf config
- [x] Pre-configured Grafana dashboards (Victron ESS Overview, JBD BMS Cell Analysis, Energy Financials)
- [x] Optimized Telegraf MQTT consumer config (reduced interval, collection jitter, field organization)
- [x] Added MPPT individual monitoring input
- [x] Added Battery Chain 1&2 aggregated sensors with topic tags
- [x] Added system-level monitoring (CPU, memory, disk, network)
- [x] Added Docker container monitoring input
- [ ] Add alerting rules for critical thresholds
- [ ] Document dashboard import process

### 4. inverter-dashboard (Python FastAPI Container Server)
**Status:** Active | **Target:** NAS/Docker/Container deployments
- [x] CI/CD releases & nightly builds (Docker multi-arch, PyInstaller binaries)
- [x] Async MQTT migration (aiomqtt for non-blocking I/O) — **merged #71**
- [x] Ultra-slim multi-arch Docker image (~40MB with uv multi-stage build)
- [x] Static Vue asset mounting (embed inverter-dashboard-vue dist)
- [x] Mermaid architecture diagrams in docs — **merged #69**
- [ ] WebSocket support for real-time updates
- [ ] Prometheus /metrics endpoint
- [ ] Health check endpoint for container orchestration

### 5. inverter-dashboard-go (High-Performance Go Server)
**Status:** Active | **Target:** Cerbo GX, embedded, single-binary deployments
- [x] CI/CD releases & nightly builds (multi-arch binaries, Docker :nightly)
- [x] Embedded Next-Gen Vue UI (go:embed on internal/html/vue-ui)
- [x] Prometheus /metrics endpoint (solar watts, battery SoC, grid watts, WS clients)
- [x] Resilient MQTT command buffer (ring buffer + exponential backoff)
- [x] Code quality improvements (dead code removal, DRY, formatting)
- [x] OpenTelemetry & structured logging (slog JSON + trace correlation IDs)
- [ ] gRPC interface for inter-service communication
- [ ] Configuration hot-reload
- **Branch pushed:** `review/code-quality` — **PR ready to create**

### 6. inverter-dashboard-vue (Shared Vue 3 SPA & Component Library)
**Status:** Active | **Target:** Reusable UI components for Go & Python dashboards
- [x] Dual build targets (SPA dist + library mode exports)
- [x] Automated asset export script (scripts/export_dist.sh → Go vue-ui & Python static)
- [x] Vitest unit test suite (composables: useMqtt, useChart; components: BatterySolarPanel, SidePanel)
- [x] i18n localization (EN, DE, NL, FR, UA)
- [x] CI & package publishing (GitHub Releases on tag)
- [ ] Storybook documentation for component library
- [ ] Visual regression testing (Chromatic/Playwright)
- [ ] Accessibility audit (WCAG 2.1 AA)

### 7. inverter-desktop (Tauri v2 Native Desktop & Mobile)
**Status:** Active | **Target:** Native macOS, Windows, Linux, Android, iOS apps
- [x] CI/CD releases & nightly builds (pre-release tag detection)
- [x] Tauri v2 Auto-Updater (@tauri-apps/plugin-updater → GitHub Releases)
- [x] Encrypted Storage (@tauri-apps/plugin-store for MQTT creds, HA tokens, layouts)
- [x] Native Mobile Notifications (@tauri-apps/plugin-notification for SoC <20%, grid loss)
- [x] Cargo Security Audit (cargo-deny for dependency security/license compliance)
- [ ] Mobile-specific UI adaptations (touch targets, safe areas)
- [ ] Offline-first data sync with background queue
- [ ] Biometric authentication for sensitive actions
- **Branches pushed (all rebased onto main, ready for PR):**
  - `feat/startup-system-notifications`
  - `feature/mqtt-ha-config`
  - `feature/readme-updates`
  - `fix/ha-entities-and-auth-v2`
  - `fix/ios-github-actions`
  - `fix/readme-english-only`
  - `fix/sonarqube-issues-2024-07-24`

### 8. inverter-control (Victron ESS Grid-Zero Controller Daemon)
**Status:** Active | **Target:** Cerbo GX / local server daemon
- [x] CI/CD releases (pre-release detection, package archives)
- [x] Hardware Watchdog Failsafe (30s heartbeat → fallback to passthrough/0W setpoint)
- [x] SoC & Cell Temperature Dynamic Curves (auto charge/discharge scaling)
- [x] Expanded Pytest suite (mock D-Bus, mock MQTT >85% coverage)
- [x] NaN/Inf handling in MQTT JSON (SafeEncoder) & D-Bus readers (safe defaults)
- [ ] Policy engine integration (venus-os-governance)
- [ ] Multi-inverter support (parallel systems)
- [ ] Dynamic grid code compliance profiles

### 9. dbus-mqtt-battery (Venus OS D-Bus Battery Driver for JBD BMS)
**Status:** Active | **Target:** Venus OS service persistence, 16-cell voltage exposure
- [x] CI/CD releases & nightly builds (Venus OS installer tarball)
- [x] 16-Cell Voltage D-Bus Exposure (/Cell/1/Volts … /Cell/16/Volts, GUI v2 paths)
- [x] Venus OS v3.x Firmware Update Persistence (rc.local + velib_python wrapper)
- [x] Dynamic Imbalance Throttling (CCL from max cell voltage delta)
- [x] Code quality refactor (DRY, constants, formatting, cell_count fallback)
- [ ] Multi-BMS support (parallel battery strings)
- [ ] BLE connection watchdog with auto-reconnect
- [ ] Temperature-based charge current limiting

### 10. dbus-tasmota-pv (Venus OS D-Bus Smart Plug PV Inverter Bridge)
**Status:** Active | **Target:** Async polling, mDNS auto-discovery
- [x] CI/CD releases & nightly builds (installer packaging)
- [x] Async HTTP Polling (httpx/asyncio replaced sync requests)
- [x] Smart Plug mDNS Auto-Discovery (zeroconf Tasmota discovery)
- [x] Code quality (dead code removal, DRY paths, CodeQL action versions)
- [ ] Support multiple Tasmota device templates (Shelly, Gosund, etc.)
- [ ] D-Bus service auto-registration on Venus OS
- [ ] MQTT discovery for Home Assistant integration
- **Branch pushed:** `review/code-quality` — **PR ready to create**

### 11. esphome-jbd-bms-mqtt (ESP32 BLE Proxy for JBD BMS)
**Status:** Active | **Target:** Multi-BMS BLE concurrency, CI validation
- [x] Multi-BMS BLE Concurrency (optimized scan params, connection slots for 4+ units)
- [x] ESPHome CI Validation (esphome config + compile on PRs)
- [ ] Dual ESP32 redundancy (primary + backup)
- [ ] Encrypted BLE channels (if BMS supports)
- [ ] OTA update via MQTT trigger

### 12. integration-tests (End-to-End Test Suite)
**Status:** Active | **Target:** Multi-dashboard test matrix, HTML artifacts
- [x] CI execution & security (daily scheduled, hardened runner, Step Summary)
- [x] Multi-Dashboard Test Matrix (Python, Go, Control daemons simultaneously)
- [x] HTML Test Report Artifacts (pytest-html plugin, GitHub Action artifacts)
- [ ] Contract testing (Pact) for MQTT/D-Bus interfaces
- [ ] Chaos engineering (network partition, broker restart scenarios)
- [ ] Performance benchmarks (latency, throughput baselines)

### 13. terraform-github-victron (Infrastructure as Code)
**Status:** Active | **Target:** GitHub org management via Terraform Cloud
- [x] Branch rulesets & permissions
- [x] Secret scanning & push protection (all 12 org repos)
- [x] Terraform CI validation (fmt -check, tflint on PRs)
- [ ] Dependabot auto-merge for minor/patch updates
- [ ] Repository archetypes (template repos for new services)
- [ ] Org-level security policies (required reviews, signed commits)
- **Branches pushed:** `feat/enable-org-discussions`, `feat/add-gitar-bot-bypass-rulesets`, `feat/inverter-dashboard-vue-repo`, `Enable-auto-merge-&-delete-branches;-tweak-repos` (ready for PRs)

### 14. .github-org (Organization Governance & Community)
**Status:** Active | **Target:** Shared standards, reusable workflows
- [x] CI/CD architecture documentation (docs/CI_CD_STRATEGY.md)
- [x] Centralized Issue & PR templates (bug_report.yml, feature_request.yml, PR_TEMPLATE.md)
- [x] Reusable workflows (Python Ruff lint, Go test, Docker vulnerability scan)
- [ ] Security advisory workflow (CodeQL SARIF upload)
- [ ] Contributor guide & CODEOWNERS
- [ ] Release automation (semantic versioning, changelog generation)

## Personal Account Projects (4alvit)

### 15. mqtt-observability-opentelemetry
**Status:** Planned | **Target:** OpenTelemetry patterns for MQTT systems
- [ ] MQTT message interceptor with trace context propagation
- [ ] Mosquitto $SYS metrics → OpenTelemetry
- [ ] Topic-based span creation and correlation
- [ ] Grafana dashboard templates
- [ ] Docker Compose demo (broker + exporter + Grafana)

### 16. esphome-ble-sensor-patterns
**Status:** Planned | **Target:** Reference BLE sensor implementations
- [ ] JBD BMS pattern (extract from esphome-jbd-bms-mqtt)
- [ ] Daly BMS pattern
- [ ] Generic BLE temperature sensor pattern
- [ ] Xiaomi Mi Flora plant sensor pattern
- [ ] CI matrix for all patterns (ESPHome compile)
- [ ] Comparison table: BLE vs UART vs CAN per sensor type

### 17. dbus-service-template
**Status:** Planned | **Target:** Production-ready D-Bus service cookiecutter
- [ ] Copier template with interactive prompts
- [ ] Generated project: pyproject.toml, CI, tests, MIT license
- [ ] D-Bus service skeleton (signal emission, method handling)
- [ ] MQTT bridge boilerplate
- [ ] Venus OS package build script (.ipk)
- [ ] Tutorial: "Create your first Venus OS service in 5 minutes"

### 18. mcp-venus-os
**Status:** Planned | **Target:** MCP server for Venus OS management
- [ ] MCP server with D-Bus read tools (battery SoC, PV power, grid status)
- [ ] Write tools (set inverter mode, charge limits)
- [ ] MQTT subscription for real-time data streaming
- [ ] Safety constraints (refuse dangerous commands without confirmation)
- [ ] Claude Desktop integration example
- [ ] Demo video / README walkthrough

### 19. energy-data-rag-pipeline
**Status:** Planned | **Target:** RAG pipeline for Victron/energy documentation
- [ ] Document ingestion (Victron PDF manuals, community forum posts)
- [ ] Chunking strategy optimized for technical documentation
- [ ] pgvector storage with metadata filtering
- [ ] FastAPI query endpoint
- [ ] LangChain retrieval chain with source citations
- [ ] Docker Compose (PostgreSQL + pgvector + API)

### 20. solar-forecast-langgraph
**Status:** Planned | **Target:** LangGraph workflow for solar forecasting
- [ ] Weather data agent (OpenMeteo API)
- [ ] Historical generation data loader (from inverter-monitoring)
- [ ] Panel configuration schema (azimuth, tilt, capacity)
- [ ] Forecast model (statistical + LLM reasoning)
- [ ] Integration hook for inverter-control (pre-charge before cloudy periods)
- [ ] Accuracy tracking and feedback loop

### 21. fastapi-mqtt-gateway
**Status:** Planned | **Target:** Production-ready REST/WebSocket → MQTT bridge
- [ ] MQTT client with topic subscription management
- [ ] REST endpoints: publish, subscribe (SSE), query retained
- [ ] WebSocket endpoint for real-time MQTT streaming
- [ ] JWT authentication + rate limiting
- [ ] OpenAPI schema with topic documentation
- [ ] Docker Compose (broker + gateway)

### 22. iot-project-builder-profile
**Status:** Planned | **Target:** IoT developer profile generator from GitHub activity
- [ ] GitHub API scanner for IoT-related repos
- [ ] ESPHome config analyzer (sensors, platforms, integrations)
- [ ] D-Bus service analyzer (signals, methods, interfaces)
- [ ] LLM-generated engineering profile (skills, focus areas, complexity)
- [ ] Markdown + HTML output with charts
- [ ] GitHub Action for auto-updating profile

---

## Branch & PR Status Summary

| Repo | Branch | Status | PR |
|------|--------|--------|----|
| venus-os-observability | chore/gitignore-and-ci-split | Pushed | **Create PR** |
| venus-os-observability | Update-dbus_listener.py | Pushed | **Create PR** |
| inverter-monitoring | feat/grafana-dashboards-telegraf-optimization | Merged | ✅ PR #23 |
| inverter-dashboard | feat/async-mqtt-migration | Merged | ✅ PR #71 |
| inverter-dashboard | docs/mermaid-diagrams | Merged | ✅ PR #69 |
| inverter-dashboard-go | review/code-quality | Rebased | **Create PR** |
| inverter-dashboard-vue | main | Merged (releases) | — |
| inverter-desktop | feat/startup-system-notifications | Rebased | **Create PR** |
| inverter-desktop | feature/mqtt-ha-config | Rebased | **Create PR** |
| inverter-desktop | feature/readme-updates | Rebased | **Create PR** |
| inverter-desktop | fix/ha-entities-and-auth-v2 | Rebased | **Create PR** |
| inverter-desktop | fix/ios-github-actions | Rebased | **Create PR** |
| inverter-desktop | fix/readme-english-only | Rebased | **Create PR** |
| inverter-desktop | fix/sonarqube-issues-2024-07-24 | Rebased | **Create PR** |
| inverter-control | feat/mqtt-nan-inf-handling | Merged | ✅ PR #67 |
| dbus-mqtt-battery | fix/code-quality-with-cellcount | Merged | ✅ PR #19 |
| dbus-tasmota-pv | review/code-quality | Rebased | **Create PR** |
| dbus-tasmota-pv | main | Merged | — |
| esphome-jbd-bms-mqtt | main | Merged | — |
| integration-tests | main | Merged | — |
| terraform-github-victron | feat/enable-org-discussions | Pushed | **Create PR** |
| terraform-github-victron | feat/add-gitar-bot-bypass-rulesets | Pushed | **Create PR** |
| terraform-github-victron | feat/inverter-dashboard-vue-repo | Pushed | **Create PR** |
| terraform-github-victron | Enable-auto-merge-&-delete-branches;-tweak-repos | Pushed | **Create PR** |
| .github-org | main | Merged | — |
| 4alvit | feature/readme-updates | Remote | Ready to merge |

---

## Next Actions
1. **Create PRs** - Click the PR URLs above (all branches pushed, 13 PRs pending)
2. Begin Phase 2 for venus-os-observability: Grafana Tempo traces dashboard
3. Start dbus-event-log implementation
4. Terraform: apply in cloud to add venus-os-observability to branch protection rulesets