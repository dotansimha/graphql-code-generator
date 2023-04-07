import { setupMockFilesystem, setupMockWatcher } from './watcher-test-helpers/setup-mock-watcher.js';
import { assertBuildTriggers } from './watcher-test-helpers/assert-watcher-build-triggers.js';
import { join } from 'path';

describe('Watch targets', () => {
  beforeEach(() => {
    // Silence logs
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();

    setupMockFilesystem();
  });

  afterEach(() => {
    jest.resetAllMocks();
    // IMPORTANT: setupMockWatcher() mocks @parcel/watcher module, so we must reset modules
    jest.resetModules();
  });

  test('watches the longest common prefix directory', async () => {
    const { stopWatching, watchDirectory } = await setupMockWatcher({
      filepath: './foo/some-config.ts',
      config: {
        schema: './foo/something.ts',
        generates: {
          ['./foo/some-output.ts']: {
            documents: ['./foo/bar/*.graphql'],
          },
        },
      },
    });

    expect(watchDirectory).toBe(join(process.cwd(), 'foo'));
    await stopWatching();
  });

  test('watches process.cwd() when longest common prefix directory is not accessible', async () => {
    setupMockFilesystem({
      access: async path => {
        if (path === join(process.cwd(), 'foo')) {
          throw new Error();
        }
      },
    });

    const { stopWatching, watchDirectory } = await setupMockWatcher({
      filepath: './foo/some-config.ts',
      config: {
        schema: './foo/something.ts',
        generates: {
          ['./foo/some-output.ts']: {
            documents: ['./foo/bar/*.graphql'],
          },
        },
      },
    });

    expect(watchDirectory).toBe(join(process.cwd()));
    await stopWatching();
  });

  // This test uses manual assertions to make sure they're tested individually,
  // but note that `assertBuildTriggers` can do most of this work for you
  test('triggers a rebuild for basic case', async () => {
    const { onWatchTriggered, dispatchChange, stopWatching, subscribeCallbackSpy, unsubscribeSpy, watchDirectory } =
      await setupMockWatcher({
        filepath: './foo/some-config.ts',
        config: {
          schema: './foo/something.ts',
          generates: {
            ['./foo/some-output.ts']: {
              documents: ['./foo/bar/*.graphql'],
            },
          },
        },
      });

    expect(watchDirectory).toBe(join(process.cwd(), 'foo'));

    const shouldTriggerBuild = join(process.cwd(), './foo/bar/fizzbuzz.graphql');
    const shouldNotTriggerBuild = join(process.cwd(), './foo/bar/something.ts');

    await dispatchChange(shouldTriggerBuild);
    expect(subscribeCallbackSpy).toHaveBeenLastCalledWith(undefined, [{ path: shouldTriggerBuild, type: 'update' }]);
    expect(onWatchTriggered).toHaveBeenLastCalledWith('update', shouldTriggerBuild);

    await dispatchChange(shouldNotTriggerBuild);
    expect(subscribeCallbackSpy).toHaveBeenLastCalledWith(undefined, [{ path: shouldNotTriggerBuild, type: 'update' }]);
    expect(onWatchTriggered).not.toHaveBeenLastCalledWith('update', shouldNotTriggerBuild);
    expect(onWatchTriggered).toHaveBeenCalledTimes(1);

    expect(subscribeCallbackSpy).toHaveBeenCalledTimes(2);

    await stopWatching();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  test('triggers rebuilds as expected (auto-assertions)', async () => {
    const mockWatcher = await setupMockWatcher({
      filepath: './foo/some-config.ts',
      config: {
        schema: './foo/something.ts',
        generates: {
          ['./foo/some-output.ts']: {
            documents: ['./foo/bar/*.graphql'],
          },
          ['./foo/some-other-output.ts']: {
            documents: ['./foo/some-other-bar/*.graphql'],
          },
          ['./foo/some-preset-bar/']: {
            preset: 'near-operation-file',
            presetConfig: {
              extension: '.generated.tsx',
              baseTypesPath: 'types.ts',
            },
            documents: ['./foo/some-preset-bar/*.graphql'],
          },
        },
      },
    });

    expect(mockWatcher.watchDirectory).toBe(join(process.cwd(), 'foo'));

    await assertBuildTriggers(mockWatcher, {
      shouldTriggerBuild: [
        './foo/some-config.ts', // config file
        './foo/bar/fizzbuzz.graphql',
      ],
      pathsWouldBeIgnoredByParcelWatcher: [
        // note: expectations should be relative from cwd; assertion helper converts
        //       the values received by parcelWatcher to match before testing them (see typedoc)
        './foo/some-output.ts', // output file
        'foo/some-output.ts', // output file
      ],
      globsWouldBeIgnoredByParcelWatcher: [
        // note: globs are tested for exact match with argument passed to subscribe options,
        //       so they should be specified relative from watchDirectory, _not_ cwd (see typedoc)
        'some-preset-bar/**/*.generated.tsx', // output of preset
      ],
      shouldNotTriggerBuild: [
        './foo/bar/something.ts', // unrelated file
        './foo/some-output.ts', // output file (note: should be ignored by parcel anyway)
        '.git/index.lock',
      ],
    });
  });
});
