# Deployment and verification evidence

Reviewed 12 October 2026. This index describes the scope of published records;
it is not a live fleet-status page. A newer release does not inherit an older
installation's verification automatically. Repository counts and presence in
the [project catalog](https://victron-venus.github.io/.github/projects.html) do
not establish that a component is installed.

## What each kind of evidence establishes

- **Released:** a tagged source or packaged artifact is available through the
  project's documented channel. An OCI archive attached to a release does not
  establish registry promotion or deployment.
- **Tested:** named checks passed for an exact source revision or artifact.
  Offline fixtures and simulated services do not establish physical behavior.
- **Observed in operation:** a dated record identifies the deployed version,
  runtime and checks performed. A health endpoint alone does not prove fresh
  telemetry, alert delivery or the identity of the running release artifact.
- **Physically verified:** an operator observed the intended device behavior
  for the stated scenarios. One successful report or device is not acceptance
  of every command, failure mode, firmware version or installation.

## Published records and their limits

### Native Venus services

The [12 September service audit](VENUS-SERVICE-AUDIT-2026-09-12.md) and
[closure record](VENUS-AUDIT-CLOSURE-2026-09-12.md) include runtime observations,
source/hash comparisons, service restarts and regression results. The target
was a Raspberry Pi 3 Model B running Venus OS v3.75, reached through the
operator's GX hostname. It was not a qualification of every Cerbo GX model.

The closure includes the observability exporter's populated Prometheus endpoint
and its owner-lifecycle repair. Its alert-bridge source was inspected separately.
Those records do not show that every later release is installed, that every
silent source outage is detected, or that all current notification recipients
receive firing and recovery messages. A controlled hardware qualification must
bind the exact installed artifact and configuration to its own observations,
including failure, recovery and rollback results.

### Gateway and public status

The gateway's [12 September energy API validation](https://github.com/victron-venus/inverter-gateway/blob/adc3fad7a01540cfe4d2c280e166a428adc15e24/docs/validation.md)
records an external-host deployment, authenticated HTTPS reads, fresh configured
sources, read-token rejection on command routes and Alexa backend reads. It
describes the 0.3.0 implementation. Production MQTT loss and physical alarms
were not induced, and it does not identify a later stable artifact as deployed.

The [web vitrine](https://github.com/victron-venus/inverter-web-vitrine) is a
read-only frontend and server-side proxy. An accessible demo landing page proves
page delivery; fresh plant data require a successful proxy read and source-age
checks. Neither the landing page nor a passing frontend check proves the
gateway's running image digest, all upstream sensors or command behavior.

### Voice adapters

The [Alexa verification summary](https://github.com/4alvit/amazon-echo-home-voice/blob/697ef9eab929f6598a53bd9a9106232e917c618f/docs/validation-2026-09-12.md)
separates backend and Amazon simulator checks from physical Echo microphone
recognition and playback. Installing the backend does not create, certify or
publish an Alexa skill. New voice and screen features need their own device
acceptance after the interaction model and backend have both been updated.

The [Google/Cast verification record](https://github.com/4alvit/google-home-voice-stats/blob/4d43797d42643e4fddd9a524fec000a1a46ac69b/docs/deployment-validation.md)
records exact-media receiver playback, the Matter/HA trigger path, an initial
transport failure and a successful retry. It also records operator confirmation
of the status report on the physical display. That confirmation does not cover
voice invocation of the other reports or other household members. Cast playback
alone does not add Google microphone commands.

### MQTT observability

The [MQTT component architecture](https://github.com/4alvit/mqtt-observability-opentelemetry/blob/928908ceeae05e0a16cec3fdb54362dc26f65984/README.md#runtime-architecture)
separates the observer, broker exporter, collector and monitoring stack. Deploying
Prometheus, Tempo or Grafana does not by itself install the MQTT components.
Broker statistics require their actual source topics; an empty or newly created
metric family is not evidence of observed device traffic. Verify source updates,
scrape freshness, trace ingestion and alert delivery separately for the installed
revision. The generic MQTT project and the Venus D-Bus exporter have different
inputs and deployment requirements.

## Recording a new verification

Keep a private operator record with the exact source revision, release asset
checksum or running image digest, software/firmware versions, configuration
revision, observation interval and test method. Record failed and skipped checks
alongside successes. Distinguish passive reads from commands, induced outages,
restarts and physical observations; disruptive acceptance needs a maintenance
plan and a known rollback artifact.

Publish a sanitized summary in the component repository and link it here. Include
the date, artifact identity, tested scenarios and remaining limits. Omit secrets,
household readings, account/device identifiers, private deployment topology and
non-public repository references. Keep older records as historical evidence;
do not silently relabel them as verification of a new release.
