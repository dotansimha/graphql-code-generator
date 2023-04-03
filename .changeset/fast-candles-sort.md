---
'@graphql-codegen/cli': patch
---

Fix watch mode to listen to longest common directory prefix of relevant files, rather than only files below the current working directory (fixes #9266).
