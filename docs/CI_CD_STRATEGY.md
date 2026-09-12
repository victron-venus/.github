# Organization CI/CD and releases

The current policy is [the generated operations guide](release-workflow.md) and the [release toolkit](https://github.com/victron-venus/venus-os-ci-toolkit).

Applications use required PR checks, nightly builds, immutable beta/RC candidates and manually approved promotion of the exact RC bytes. Infrastructure and community repositories use PR/nightly validation and explicit deployment. The previous direct-tag/latest release examples are retired.
