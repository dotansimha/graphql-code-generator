import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'fs';
import * as path from 'path';
import type { Mock } from 'vitest';
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
});
