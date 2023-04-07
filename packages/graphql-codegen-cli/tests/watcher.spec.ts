import { setupMockFilesystem, setupMockWatcher } from './watcher-helpers.js';
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
});
