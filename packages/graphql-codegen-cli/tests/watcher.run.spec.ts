import * as path from 'path';
import { mkdtempSync, mkdirSync, writeFileSync } from 'fs';
import { createWatcher } from '../src/utils/watcher.js';
import { CodegenContext } from '../src/config.js';

/**
 * waitForNextEvent
 * @description This function waits for a short amount of time to let async things run
 * e.g. watcher subscription setup, watcher to react to change/create events, etc.
 */
const waitForNextEvent = async () => {
  return await new Promise(resolve => setTimeout(resolve, 500));
};

type TestFilePaths = { absolute: string; relative: string };
const setupTestFiles = (): { testDir: string; schemaFile: TestFilePaths; documentFile: TestFilePaths } => {
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

const setupMockWatcher = async (codegenContext: ConstructorParameters<typeof CodegenContext>[0]) => {
  const onNextMock = vi.fn().mockResolvedValue([]);
  const { stopWatching } = createWatcher(new CodegenContext(codegenContext), onNextMock);
  // After creating watcher, wait for a tick for subscription to be completely set up
  await waitForNextEvent();
  return { stopWatching, onNextMock };
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
      `
    );
    writeFileSync(
      documentFile.absolute,
      /* GraphQL */ `
        query {
          me {
            id
          }
        }
      `
    );

    const { stopWatching, onNextMock } = await setupMockWatcher({
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
    });

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
      `
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
      `
    );
    await waitForNextEvent();
    expect(onNextMock).toHaveBeenCalledTimes(2);

    await stopWatching();
  });

  test('only re-runs generates processes based on watched path', async () => {
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
      `
    );
    writeFileSync(
      documentFile.absolute,
      /* GraphQL */ `
        query {
          me {
            id
          }
        }
      `
    );

    const generatesKey1 = path.join(testDir, 'types-1.ts');
    const generatesKey2 = path.join(testDir, 'types-2.ts');

    const { stopWatching, onNextMock } = await setupMockWatcher({
      filepath: path.join(testDir, 'codegen.ts'),
      config: {
        schema: schemaFile.relative,
        generates: {
          [generatesKey1]: {
            plugins: ['typescript'],
          },
          [generatesKey2]: {
            documents: documentFile.relative, // When this file is changed, only this block will be re-generated
            plugins: ['typescript'],
          },
        },
      },
    });

    // 1. Initial setup: onNext in initial run should be called successfully with 2 files,
    // because there are no errors
    expect(onNextMock.mock.calls[0][0].length).toBe(2);
    expect(onNextMock.mock.calls[0][0][0].filename).toBe(generatesKey1);
    expect(onNextMock.mock.calls[0][0][1].filename).toBe(generatesKey2);

    // 2. Subsequent run 1: update document file for generatesKey2,
    // so only the second generates block gets triggered
    writeFileSync(
      documentFile.absolute,
      /* GraphQL */ `
        query {
          me {
            id
            name
          }
        }
      `
    );
    await waitForNextEvent();
    expect(onNextMock.mock.calls[1][0].length).toBe(1);
    expect(onNextMock.mock.calls[1][0][0].filename).toBe(generatesKey2);

    // 2. Subsequent run 2: update schema file, so both generates block are triggered
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

        scalar DateTime
      `
    );
    await waitForNextEvent();
    expect(onNextMock.mock.calls[2][0].length).toBe(2);
    expect(onNextMock.mock.calls[2][0][0].filename).toBe(generatesKey1);
    expect(onNextMock.mock.calls[2][0][1].filename).toBe(generatesKey2);

    await stopWatching();
  });
});
