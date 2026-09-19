---
'@graphql-codegen/cli': patch
---

Fix the CLI reporting success (exit code `0`) when a `generates` output's `preset` can't be resolved. The error was shown in the terminal but never counted toward the run's failure state, so `allowPartialOutputs: false` (the default) never took effect for this case.
