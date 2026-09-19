#!/usr/bin/env node
/**
 * Runs a command and asserts it exits with a specific code, without relying on
 * shell syntax (`$?`, `||`) to inspect the result. `pnpm run` on Windows invokes
 * package.json scripts through cmd.exe regardless of the calling process's own
 * shell, and cmd.exe doesn't expand POSIX `$?`, so that check silently broke
 * there. Spawning the command directly from Node and inspecting its exit code
 * in JS sidesteps shell portability entirely.
 *
 * Usage: node assert-exit-code.mjs <expectedCode> <command> [...args]
 */
import { spawnSync } from 'node:child_process';

const [expectedCodeArg, command, ...args] = process.argv.slice(2);
const expectedCode = Number(expectedCodeArg);

const result = spawnSync(command, args, { stdio: 'inherit' });

if (result.error) {
  throw result.error;
}

if (result.status === expectedCode) {
  process.exit(0);
}

console.error(
  `Expected exit code ${expectedCode}, but got ${result.status === null ? `signal ${result.signal}` : result.status}`,
);
// A falsy or missing status (0, or killed by signal) can't itself signal this
// mismatch as a failure, so fall back to a fixed non-zero code in that case.
process.exit(result.status ? result.status : 1);
