#!/usr/bin/env node
import { runClientPresetCodemod } from './codemod.js';

function printHelp(): void {
  // eslint-disable-next-line no-console
  console.log(`
@graphql-codegen/client-preset-codemod

Rewrites "client-preset" tagged GraphQL documents (graphql(\`query MyQuery { ... }\`)) into direct
imports from the generated artifacts, so bundlers can code-split/tree-shake them without a
build-time Babel or SWC plugin.

Usage:
  client-preset-codemod --include <glob> --artifactDirectory <dir> [options]

Options:
  --include <glob>            Glob of files to codemod. Repeatable. Prefix with "!" to exclude,
                               same as the "documents" field in your codegen config.
  --artifactDirectory <dir>   Directory "client-preset" writes its artifacts to (the same value as
                               the "generates" key using "preset: 'client'" in your codegen config).
  --gqlTagName <name>         Name of the "graphql tag" function to look for. Default: "graphql".
  --cwd <dir>                 Working directory used to resolve globs and paths. Default: cwd.
  --dry-run                   Compute the changes without writing them to disk.
  --help                      Show this message.
`);
}

function parseArgs(argv: string[]) {
  const include: string[] = [];
  let artifactDirectory: string | undefined;
  let gqlTagName: string | undefined;
  let cwd: string | undefined;
  let dryRun = false;
  let help = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case '--include':
        include.push(argv[++i]);
        break;
      case '--artifactDirectory':
        artifactDirectory = argv[++i];
        break;
      case '--gqlTagName':
        gqlTagName = argv[++i];
        break;
      case '--cwd':
        cwd = argv[++i];
        break;
      case '--dry-run':
        dryRun = true;
        break;
      case '--help':
      case '-h':
        help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return { include, artifactDirectory, gqlTagName, cwd, dryRun, help };
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || args.include.length === 0 || !args.artifactDirectory) {
    printHelp();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const { changedFiles, skippedCallSites } = runClientPresetCodemod({
    include: args.include,
    artifactDirectory: args.artifactDirectory,
    gqlTagName: args.gqlTagName,
    cwd: args.cwd,
    dryRun: args.dryRun,
  });

  for (const file of changedFiles) {
    // eslint-disable-next-line no-console
    console.log(`${args.dryRun ? '[dry-run] would change' : 'changed'} ${file}`);
  }

  for (const { file, reason } of skippedCallSites) {
    // eslint-disable-next-line no-console
    console.warn(`[client-preset-codemod] skipped a call site in ${file}: ${reason}`);
  }

  // eslint-disable-next-line no-console
  console.log(
    `\n${args.dryRun ? 'Would change' : 'Changed'} ${changedFiles.length} file(s), skipped ${
      skippedCallSites.length
    } call site(s).`,
  );
}

main();
