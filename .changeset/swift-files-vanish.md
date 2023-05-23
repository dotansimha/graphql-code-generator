---
'@graphql-codegen/cli': patch
---

Trigger rebuilds in watch mode while respecting rules of precedence and negation, both in terms of global (top-level) config vs. local (per-output target) config, and in terms of watch patterns (higher priority) vs. documents/schemas (lower priority). This fixes an issue with overly-aggressive rebuilds during watch mode.
