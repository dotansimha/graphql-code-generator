import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import * as path from 'path';
import type { Mock } from 'vitest';
import * as addPlugin from '@graphql-codegen/add';
import type { Types } from '@graphql-codegen/plugin-helpers';
import { CodegenContext } from '../src/config.js';
import { generate } from '../src/generate-and-save.js';
import * as watcherModule from '../src/utils/watcher.js';

const createWatcherSpy = vi.spyOn(watcherModule, 'createWatcher');

/**
 * waitForNextEvent
 * @description This function waits for a short amount of time to let async things run
 * e.g. watcher subscription setup, watcher to react to change/create events, etc.
 */
const waitForNextEvent = async () => {
  return await new Promise(resolve => setTimeout(resolve, 500));
};

type TestFilePaths = { absolute: string; relative: string };
const setupTestFiles = (): {
  testDir: string;
  schemaFile: TestFilePaths;
  documentFile: TestFilePaths;
} => {
  const tempDir = path.join(__dirname, '..', 'temp');
  mkdirSync(tempDir, { recursive: true });

  const testDir = mkdtempSync(path.join(tempDir, 'watcher-run-spec-'));

  const schemaFileAbsolute = path.join(testDir, 'schema.graphql');
  const schemaFile = {
    absolute: schemaFileAbsolute,
    relative: path.relative(process.cwd(), schemaFileAbsolute),
  };

  const documentFileAbsolute = path.join(testDir, 'document.graphql');
  const documentFile = {
    absolute: documentFileAbsolute,
    relative: path.relative(process.cwd(), documentFileAbsolute),
  };

  return {
    testDir,
    schemaFile,
    documentFile,
  };
};

const onNextMock = vi.fn();

const setupMockWatcher = async (
  codegenContext: ConstructorParameters<typeof CodegenContext>[0],
  onNext: Mock = vi.fn().mockResolvedValue([]),
) => {
  const { stopWatching } = watcherModule.createWatcher(new CodegenContext(codegenContext), onNext);
  // After creating watcher, wait for a tick for subscription to be completely set up
  await waitForNextEvent();
  return { stopWatching };
};

describe('Watch runs', () => {
  test('calls onNext correctly on initial runs and subsequent runs', async () => {
    const { testDir, schemaFile, documentFile } = setupTestFiles();
    writeFileSync(
      schemaFile.absolute,
      /* GraphQL */ `
        type Query {
          me: User
        }

        type User {
          id: ID!
          name: String!
        }
      `,
    );
    writeFileSync(
      documentFile.absolute,
      /* GraphQL */ `
        query {
          me {
            id
          }
        }
      `,
    );
    await waitForNextEvent();
    const { stopWatching } = await setupMockWatcher(
      {
        filepath: path.join(testDir, 'codegen.ts'),
        config: {
          schema: schemaFile.relative,
          documents: documentFile.relative,
          generates: {
            [path.join(testDir, 'types.ts')]: {
              plugins: ['typescript'],
            },
          },
        },
      },
      onNextMock,
    );

    // 1. Initial setup: onNext in initial run should be called because no errors
    expect(onNextMock).toHaveBeenCalledTimes(1);

    // 2. Subsequent run 1: correct document file, so `onNext` is called again because no errors
    writeFileSync(
      documentFile.absolute,
      /* GraphQL */ `
        query {
          me {
            id
            name
          }
        }
      `,
    );
    await waitForNextEvent();
    expect(onNextMock).toHaveBeenCalledTimes(2);

    // 3. Subsequent run 2: incorrect document file, so `onNext` is NOT called
    writeFileSync(
      documentFile.absolute,
      /* GraphQL */ `
        query {
          me {
            id
            name
            zzzz # should throw error
          }
        }
      `,
    );
    await waitForNextEvent();
    expect(onNextMock).toHaveBeenCalledTimes(2);

    await stopWatching();

    await waitForNextEvent();
  });
});

describe('Watch runs - overwrite.removeStaleFiles', () => {
  const runWatchAndGetStopWatching = async (
    codegenContext: ConstructorParameters<typeof CodegenContext>[0],
  ) => {
    const context = new CodegenContext(codegenContext);
    const runningWatcher = generate(context);
    await waitForNextEvent();

    const { stopWatching } = createWatcherSpy.mock.results.at(-1)!.value as ReturnType<
      typeof watcherModule.createWatcher
    >;

    return { context, runningWatcher, stopWatching };
  };

  test('removes a stale generated file on rebuild when overwrite.removeStaleFiles=true', async () => {
    const { testDir, schemaFile, documentFile } = setupTestFiles();
    writeFileSync(
      schemaFile.absolute,
      /* GraphQL */ `
        type Query {
          me: User
        }

        type User {
          id: ID!
          name: String!
        }
      `,
    );
    writeFileSync(
      documentFile.absolute,
      /* GraphQL */ `
        query {
          me {
            id
          }
        }
      `,
    );
    await waitForNextEvent();

    const keptOutputFile = path.join(testDir, 'kept.ts');
    const staleOutputFile = path.join(testDir, 'stale.ts');

    const { context, runningWatcher, stopWatching } = await runWatchAndGetStopWatching({
      filepath: path.join(testDir, 'codegen.ts'),
      config: {
        schema: schemaFile.relative,
        documents: documentFile.relative,
        watch: true,
        overwrite: {
          removeStaleFiles: true,
          updateExistingFiles: true,
        },
        generates: {
          [keptOutputFile]: { plugins: ['typescript'] },
          [staleOutputFile]: { plugins: ['typescript'] },
        },
      },
    });

    // Initial run: both outputs are generated
    expect(existsSync(keptOutputFile)).toBe(true);
    expect(existsSync(staleOutputFile)).toBe(true);

    // Simulate the config no longer producing `staleOutputFile` (e.g. removed from codegen config)
    context.updateConfig({
      generates: {
        [keptOutputFile]: { plugins: ['typescript'] },
      },
    });
    writeFileSync(
      documentFile.absolute,
      /* GraphQL */ `
        query {
          me {
            id
            name
          }
        }
      `,
    );
    await waitForNextEvent();

    expect(existsSync(keptOutputFile)).toBe(true);
    expect(existsSync(staleOutputFile)).toBe(false);

    await stopWatching();
    await runningWatcher;
    await waitForNextEvent();
  });

  test('keeps a stale generated file on rebuild when overwrite.removeStaleFiles=false', async () => {
    const { testDir, schemaFile, documentFile } = setupTestFiles();
    writeFileSync(
      schemaFile.absolute,
      /* GraphQL */ `
        type Query {
          me: User
        }

        type User {
          id: ID!
          name: String!
        }
      `,
    );
    writeFileSync(
      documentFile.absolute,
      /* GraphQL */ `
        query {
          me {
            id
          }
        }
      `,
    );
    await waitForNextEvent();

    const keptOutputFile = path.join(testDir, 'kept.ts');
    const staleOutputFile = path.join(testDir, 'stale.ts');

    const { context, runningWatcher, stopWatching } = await runWatchAndGetStopWatching({
      filepath: path.join(testDir, 'codegen.ts'),
      config: {
        schema: schemaFile.relative,
        documents: documentFile.relative,
        watch: true,
        overwrite: {
          removeStaleFiles: false,
          updateExistingFiles: true,
        },
        generates: {
          [keptOutputFile]: { plugins: ['typescript'] },
          [staleOutputFile]: { plugins: ['typescript'] },
        },
      },
    });

    // Initial run: both outputs are generated
    expect(existsSync(keptOutputFile)).toBe(true);
    expect(existsSync(staleOutputFile)).toBe(true);

    // Simulate the config no longer producing `staleOutputFile` (e.g. removed from codegen config)
    context.updateConfig({
      generates: {
        [keptOutputFile]: { plugins: ['typescript'] },
      },
    });
    writeFileSync(
      documentFile.absolute,
      /* GraphQL */ `
        query {
          me {
            id
            name
          }
        }
      `,
    );
    await waitForNextEvent();

    expect(existsSync(keptOutputFile)).toBe(true);
    // removeStaleFiles=false means the stale file is left on disk
    expect(existsSync(staleOutputFile)).toBe(true);

    await stopWatching();
    await runningWatcher;
    await waitForNextEvent();
  });

  test('preset - does not remove stale files when overwrite.removeStaleFiles=false', async () => {
    const { testDir, schemaFile, documentFile } = setupTestFiles();
    writeFileSync(
      schemaFile.absolute,
      /* GraphQL */ `
        type Query {
          me: User
        }

        type User {
          id: ID!
          name: String!
        }
      `,
    );
    writeFileSync(
      documentFile.absolute,
      /* GraphQL */ `
        query {
          me {
            id
          }
        }
      `,
    );
    await waitForNextEvent();

    // The `generates` entry is keyed by a directory (`baseOutputDir`), not a file path,
    // and has no `plugins` key — the preset supplies plugins itself. Both facts used to
    // defeat the per-file `overwrite` lookup, so the entry's setting was silently ignored.
    const baseOutputDir = path.join(testDir, 'generated');
    const fileUnderDirA = path.join(baseOutputDir, 'a.ts');
    const fileUnderDirB = path.join(baseOutputDir, 'b.ts');
    // Deliberately outside `baseOutputDir` — a preset may emit files anywhere, so a
    // path-prefix match on the directory key would not cover this one either.
    const fileOutsideDir = path.join(testDir, 'outside.ts');

    let run = 0;
    const { runningWatcher, stopWatching } = await runWatchAndGetStopWatching({
      filepath: path.join(testDir, 'codegen.ts'),
      config: {
        schema: schemaFile.relative,
        documents: documentFile.relative,
        watch: true,
        // Global `overwrite` is left at its default (`removeStaleFiles: true`), so the
        // stale files would be deleted unless the entry's setting is honored.
        generates: {
          [baseOutputDir]: {
            preset: {
              buildGeneratesSection: options => {
                const runFiles: string[][] = [
                  [fileUnderDirA, fileUnderDirB, fileOutsideDir],
                  [fileUnderDirA],
                ];

                const result = runFiles[run].map((filename: string) => ({
                  filename,
                  plugins: [{ inline: {} }],
                  pluginMap: { inline: { plugin: () => 'export const generated = true;' } },
                  schema: options.schema,
                  schemaAst: options.schemaAst,
                  documents: [],
                  config: {},
                }));

                run++;

                return result;
              },
            } satisfies Types.OutputPreset,
            overwrite: { removeStaleFiles: false },
          },
        },
      },
    });

    // Initial run: all three outputs are generated
    expect(existsSync(fileUnderDirA)).toBe(true);
    expect(existsSync(fileUnderDirB)).toBe(true);
    expect(existsSync(fileOutsideDir)).toBe(true);

    // Second run: the preset now emits only one file, so the other two become stale
    writeFileSync(
      documentFile.absolute,
      /* GraphQL */ `
        query {
          me {
            id
            name
          }
        }
      `,
    );
    await waitForNextEvent();

    expect(existsSync(fileUnderDirA)).toBe(true);
    // removeStaleFiles=false on the preset entry means both stale files are left on disk,
    // whether they were under `baseOutputDir` or outside it.
    expect(existsSync(fileUnderDirB)).toBe(true);
    expect(existsSync(fileOutsideDir)).toBe(true);

    await stopWatching();
    await runningWatcher;
    await waitForNextEvent();
  });

  test('preset - removes stale files when overwrite.removeStaleFiles=true', async () => {
    const { testDir, schemaFile, documentFile } = setupTestFiles();
    writeFileSync(
      schemaFile.absolute,
      /* GraphQL */ `
        type Query {
          me: User
        }

        type User {
          id: ID!
          name: String!
        }
      `,
    );
    writeFileSync(
      documentFile.absolute,
      /* GraphQL */ `
        query {
          me {
            id
          }
        }
      `,
    );
    await waitForNextEvent();

    const baseOutputDir = path.join(testDir, 'generated');
    const fileUnderDirA = path.join(baseOutputDir, 'a.ts');
    const fileUnderDirB = path.join(baseOutputDir, 'b.ts');
    const fileOutsideDir = path.join(testDir, 'outside.ts');

    let run = 0;
    const { runningWatcher, stopWatching } = await runWatchAndGetStopWatching({
      filepath: path.join(testDir, 'codegen.ts'),
      config: {
        schema: schemaFile.relative,
        documents: documentFile.relative,
        watch: true,
        // Global `overwrite` disables stale removal, so the stale files would be kept
        // unless the entry's `removeStaleFiles: true` is honored and overrides it.
        overwrite: { removeStaleFiles: false },
        generates: {
          [baseOutputDir]: {
            preset: {
              buildGeneratesSection: options => {
                const runFiles: string[][] = [
                  [fileUnderDirA, fileUnderDirB, fileOutsideDir],
                  [fileUnderDirA],
                ];

                const result = runFiles[run].map((filename: string) => ({
                  filename,
                  plugins: [{ inline: {} }],
                  pluginMap: { inline: { plugin: () => 'export const generated = true;' } },
                  schema: options.schema,
                  schemaAst: options.schemaAst,
                  documents: [],
                  config: {},
                }));

                run++;

                return result;
              },
            } satisfies Types.OutputPreset,
            overwrite: { removeStaleFiles: true },
          },
        },
      },
    });

    // Initial run: all three outputs are generated
    expect(existsSync(fileUnderDirA)).toBe(true);
    expect(existsSync(fileUnderDirB)).toBe(true);
    expect(existsSync(fileOutsideDir)).toBe(true);

    // Second run: the preset now emits only one file, so the other two become stale
    writeFileSync(
      documentFile.absolute,
      /* GraphQL */ `
        query {
          me {
            id
            name
          }
        }
      `,
    );
    await waitForNextEvent();

    expect(existsSync(fileUnderDirA)).toBe(true);
    // removeStaleFiles=true on the preset entry means both stale files are removed,
    // whether they were under `baseOutputDir` or outside it.
    expect(existsSync(fileUnderDirB)).toBe(false);
    expect(existsSync(fileOutsideDir)).toBe(false);

    await stopWatching();
    await runningWatcher;
    await waitForNextEvent();
  });
});

describe('Watch runs - externally modified output files', () => {
  const runWatchAndGetStopWatching = async (
    codegenContext: ConstructorParameters<typeof CodegenContext>[0],
  ) => {
    const context = new CodegenContext(codegenContext);
    const runningWatcher = generate(context);
    await waitForNextEvent();

    const { stopWatching } = createWatcherSpy.mock.results.at(-1)!.value as ReturnType<
      typeof watcherModule.createWatcher
    >;

    return { context, runningWatcher, stopWatching };
  };

  const setupSchemaAndDocument = () => {
    const files = setupTestFiles();
    writeFileSync(
      files.schemaFile.absolute,
      /* GraphQL */ `
        type Query {
          me: User
        }

        type User {
          id: ID!
          name: String!
        }
      `,
    );
    writeFileSync(
      files.documentFile.absolute,
      /* GraphQL */ `
        query {
          me {
            id
          }
        }
      `,
    );
    return files;
  };

  // The `typescript` plugin output depends only on the schema, so editing the
  // document triggers a rebuild that regenerates identical content -- exercising
  // the "identical hash -> skip write" path where the on-disk change would
  // otherwise be lost.
  const triggerRebuild = (documentFile: { absolute: string }) => {
    writeFileSync(
      documentFile.absolute,
      /* GraphQL */ `
        query {
          me {
            id
            name
          }
        }
      `,
    );
  };

  test('preset - compares output content against content on disk when contentComparison=disk', async () => {
    const { testDir, schemaFile, documentFile } = setupSchemaAndDocument();
    await waitForNextEvent();

    const { runningWatcher, stopWatching } = await runWatchAndGetStopWatching({
      filepath: path.join(testDir, 'codegen.ts'),
      config: {
        schema: schemaFile.relative,
        documents: documentFile.relative,
        watch: true,
        generates: {
          [testDir]: {
            preset: {
              buildGeneratesSection: options => [
                {
                  filename: path.join(options.baseOutputDir, 'output.ts'),
                  schema: options.schema,
                  schemaAst: options.schemaAst,
                  documents: [],
                  config: {},
                  pluginMap: { add: addPlugin },
                  plugins: [{ add: { content: 'Default Content' } }],
                  contentComparison: 'disk',
                },
              ],
            },
          },
        },
      },
    });

    const outputFile = path.join(testDir, 'output.ts');

    // Initial run generates the file.
    expect(existsSync(outputFile)).toBe(true);
    const generatedContent = readFileSync(outputFile, 'utf8');
    expect(generatedContent.length).toBeGreaterThan(0);

    // Simulate the file being changed on disk after codegen wrote it. The watcher
    // ignores output files, so this write does not itself trigger a rebuild.
    writeFileSync(outputFile, '// tampered on disk\n');

    triggerRebuild(documentFile);
    await waitForNextEvent();

    // contentComparison:'disk' forces a disk comparison, so the tampered file is
    // restored to the generated content.
    expect(readFileSync(outputFile, 'utf8')).toBe(generatedContent);

    await stopWatching();
    await runningWatcher;
    await waitForNextEvent();
  });

  test('preset - compares output content against content in the cache when contentComparison=cache-first (default)', async () => {
    const { testDir, schemaFile, documentFile } = setupSchemaAndDocument();
    await waitForNextEvent();

    const { runningWatcher, stopWatching } = await runWatchAndGetStopWatching({
      filepath: path.join(testDir, 'codegen.ts'),
      config: {
        schema: schemaFile.relative,
        documents: documentFile.relative,
        watch: true,
        generates: {
          [testDir]: {
            preset: {
              buildGeneratesSection: options => [
                {
                  filename: path.join(options.baseOutputDir, 'output.ts'),
                  schema: options.schema,
                  schemaAst: options.schemaAst,
                  documents: [],
                  config: {},
                  pluginMap: { add: addPlugin },
                  plugins: [{ add: { content: 'Default Content' } }],
                },
              ],
            },
          },
        },
      },
    });

    const outputFile = path.join(testDir, 'output.ts');

    // Initial run generates the file.
    expect(existsSync(outputFile)).toBe(true);
    const generatedContent = readFileSync(outputFile, 'utf8');
    expect(generatedContent.length).toBeGreaterThan(0);

    // Simulate the file being changed on disk after codegen wrote it. The watcher
    // ignores output files, so this write does not itself trigger a rebuild.
    const tampered = '// tampered on disk\n';
    writeFileSync(outputFile, tampered);

    triggerRebuild(documentFile);
    await waitForNextEvent();

    // The regenerated content is identical to the cached hash, so the write is
    // skipped and the on-disk change is left untouched -- the existing
    // performance optimization for pure outputs.
    expect(readFileSync(outputFile, 'utf8')).toBe(tampered);

    await stopWatching();
    await runningWatcher;
    await waitForNextEvent();
  });

  test('plugin - compares output content against content on disk when contentComparison=disk', async () => {
    const { testDir, schemaFile, documentFile } = setupSchemaAndDocument();
    await waitForNextEvent();

    const outputFile = path.join(testDir, 'types.ts');

    const { runningWatcher, stopWatching } = await runWatchAndGetStopWatching({
      filepath: path.join(testDir, 'codegen.ts'),
      config: {
        schema: schemaFile.relative,
        documents: documentFile.relative,
        watch: true,
        generates: {
          // No preset: the flag is set directly on the output config, which the CLI
          // forwards to the resulting FileOutput.
          [outputFile]: { plugins: ['typescript'], contentComparison: 'disk' },
        },
      },
    });

    expect(existsSync(outputFile)).toBe(true);
    const generatedContent = readFileSync(outputFile, 'utf8');
    expect(generatedContent.length).toBeGreaterThan(0);

    writeFileSync(outputFile, '// tampered on disk\n');

    triggerRebuild(documentFile);
    await waitForNextEvent();

    expect(readFileSync(outputFile, 'utf8')).toBe(generatedContent);

    await stopWatching();
    await runningWatcher;
    await waitForNextEvent();
  });

  test('plugin - compares output content against content in the cache when contentComparison=cache-first (default)', async () => {
    const { testDir, schemaFile, documentFile } = setupSchemaAndDocument();
    await waitForNextEvent();

    const outputFile = path.join(testDir, 'types.ts');

    const { runningWatcher, stopWatching } = await runWatchAndGetStopWatching({
      filepath: path.join(testDir, 'codegen.ts'),
      config: {
        schema: schemaFile.relative,
        documents: documentFile.relative,
        watch: true,
        generates: {
          // Default contentComparison ('cache-first'): output is treated as a pure
          // function of the schema, so the CLI trusts its in-memory hash and skips
          // re-reading the file.
          [outputFile]: { plugins: ['typescript'] },
        },
      },
    });

    expect(existsSync(outputFile)).toBe(true);
    const tampered = '// tampered on disk\n';
    writeFileSync(outputFile, tampered);

    triggerRebuild(documentFile);
    await waitForNextEvent();

    // The regenerated content is identical to the cached hash, so the write is
    // skipped and the on-disk change is left untouched -- the existing
    // performance optimization for pure outputs.
    expect(readFileSync(outputFile, 'utf8')).toBe(tampered);

    await stopWatching();
    await runningWatcher;
    await waitForNextEvent();
  });
});

describe('Watch runs - profiler output', () => {
  // The watcher matches changed paths relative to process.cwd(), so a profiled
  // watch run resolves `context.cwd` to process.cwd() and writes its trace files
  // there. Since that location is shared, each test tracks only the files it
  // created (baseline delta) and cleans up just those.
  //
  // IMPORTANT: these tests must stay sequential (do NOT mark them
  // `.concurrent`). They share process.cwd() for trace output, so running them
  // at the same time would make each test see the other's files in its delta and
  // clobber them during cleanup.
  const listProfilerFiles = () =>
    readdirSync(process.cwd()).filter(f => f.startsWith('codegen-') && f.endsWith('.json'));

  test('writes a fresh profiler trace file after the initial run and after each rebuild', async () => {
    const { testDir, schemaFile, documentFile } = setupTestFiles();
    writeFileSync(
      schemaFile.absolute,
      /* GraphQL */ `
        type Query {
          me: User
        }

        type User {
          id: ID!
          name: String!
        }
      `,
    );
    writeFileSync(
      documentFile.absolute,
      /* GraphQL */ `
        query {
          me {
            id
          }
        }
      `,
    );
    await waitForNextEvent();

    const context = new CodegenContext({
      filepath: path.join(testDir, 'codegen.ts'),
      config: {
        schema: schemaFile.relative,
        documents: documentFile.relative,
        watch: true,
        generates: {
          [path.join(testDir, 'types.ts')]: {
            plugins: ['typescript'],
          },
        },
      },
    });
    context.useProfiler();

    const runningWatcher = generate(context);
    await waitForNextEvent();

    const { stopWatching } = createWatcherSpy.mock.results.at(-1)!.value as ReturnType<
      typeof watcherModule.createWatcher
    >;

    try {
      // Initial run writes one profiler trace
      const afterInitial = listProfilerFiles();
      expect(afterInitial).toHaveLength(1);

      // Trigger a rebuild
      writeFileSync(
        documentFile.absolute,
        /* GraphQL */ `
          query {
            me {
              id
              name
            }
          }
        `,
      );
      await waitForNextEvent();

      // Rebuild writes a second, distinct profiler trace
      const afterRebuild = listProfilerFiles();
      expect(afterRebuild).toHaveLength(2);
      expect(new Set(afterRebuild).size).toBe(2); // filenames are unique per run

      // Each trace contains only its own run's events (profiler was cleared between runs)
      for (const filename of afterRebuild) {
        const events = JSON.parse(readFileSync(path.join(process.cwd(), filename), 'utf8'));
        expect(Array.isArray(events)).toBe(true);
        expect(events.length).toBeGreaterThan(0);
      }
    } finally {
      await stopWatching();
      await runningWatcher;
      await waitForNextEvent();
      for (const filename of listProfilerFiles()) {
        unlinkSync(path.join(process.cwd(), filename));
      }
    }
  });

  test('does not write a trace for a failed rebuild and clears its events so the next trace stays clean', async () => {
    const { testDir, schemaFile, documentFile } = setupTestFiles();
    writeFileSync(
      schemaFile.absolute,
      /* GraphQL */ `
        type Query {
          me: User
        }

        type User {
          id: ID!
          name: String!
        }
      `,
    );
    writeFileSync(
      documentFile.absolute,
      /* GraphQL */ `
        query {
          me {
            id
          }
        }
      `,
    );
    await waitForNextEvent();

    const context = new CodegenContext({
      filepath: path.join(testDir, 'codegen.ts'),
      config: {
        schema: schemaFile.relative,
        documents: documentFile.relative,
        watch: true,
        generates: {
          [path.join(testDir, 'types.ts')]: {
            plugins: ['typescript'],
          },
        },
      },
    });
    context.useProfiler();

    const runningWatcher = generate(context);
    await waitForNextEvent();

    const { stopWatching } = createWatcherSpy.mock.results.at(-1)!.value as ReturnType<
      typeof watcherModule.createWatcher
    >;

    try {
      // Initial run writes one profiler trace
      const afterInitial = listProfilerFiles();
      expect(afterInitial).toHaveLength(1);

      // Trigger a rebuild that fails (invalid field in the document)
      writeFileSync(
        documentFile.absolute,
        /* GraphQL */ `
          query {
            me {
              id
              zzzz # invalid field -> generation error
            }
          }
        `,
      );
      await waitForNextEvent();

      // No trace is written for the failed run, and its events were discarded
      expect(listProfilerFiles()).toHaveLength(1);
      expect(context.profiler.collect()).toHaveLength(0);
    } finally {
      await stopWatching();
      await runningWatcher;
      await waitForNextEvent();
      for (const filename of listProfilerFiles()) {
        unlinkSync(path.join(process.cwd(), filename));
      }
    }
  });
});
