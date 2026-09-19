---
'@graphql-codegen/cli': patch
---

Fix lifecycle hook scripts (e.g. `hooks: { afterAllFileWrite: ['prettier --write'] } }`) failing on Windows when the file paths passed to them contain a backslash or other POSIX shell-special character. Hook arguments were always quoted using POSIX single-quoting, but `child_process.exec()` runs through `cmd.exe` on Windows by default, which doesn't strip single quotes — so the hook script received the literal quote characters as part of its argument and failed to find the file. Arguments are now quoted per-platform: POSIX quoting stays unchanged elsewhere, and Windows arguments are wrapped in double quotes only when they actually need it, matching `cmd.exe`'s own convention.
