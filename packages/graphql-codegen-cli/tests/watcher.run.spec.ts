import type { Mock } from 'vitest';
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

const onNextMock = vi.fn();

const setupMockWatcher = async (
  codegenContext: ConstructorParameters<typeof CodegenContext>[0],
  onNext: Mock = vi.fn().mockResolvedValue([])
) => {
  const { stopWatching } = createWatcher(new CodegenContext(codegenContext), onNext);
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
      onNextMock
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

    await waitForNextEvent();
  });
});
