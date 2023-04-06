/* eslint-disable no-console */
import { setupMockFilesystem, setupMockWatcher } from './watcher-helpers.js';
import { join } from 'path';

process.on('unhandledRejection', (error, _p) => {
  console.log('=== UNHANDLED REJECTION ===');
  // @ts-expect-error fine
  console.dir(error.stack);
});

const msNow = () => new Date(new Date().getTime()).toISOString().slice(13, -1);

describe('Watch targets', () => {
  // beforeEach(() => {
  //   // Silence log spam
  //   // jest.spyOn(console, 'log').mockImplementation((...args) => console.log("blah", ...args));
  //   // jest.spyOn(console, 'info').mockImplementation();

  //   // setupMockFilesystem();
  // });

  afterEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  test('one one one one', async () => {
    const origConsoleLog = console.log;
    const origConsoleInfo = console.info;
    jest.spyOn(console, 'log').mockImplementation((...args) => origConsoleLog('[one]', msNow(), ...args));
    jest.spyOn(console, 'info').mockImplementation((...args) => origConsoleInfo('[one]', msNow(), ...args));

    setupMockFilesystem();

    const { onWatchTriggered, dispatchChange, stopper, subscribeCallbackSpy, unsubscribeSpy, watchDirectory } =
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

    console.log('---- DELAY TWO SECONDS ----');
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('---- FINISH TWO SECOND DELAY ----');

    await dispatchChange(shouldTriggerBuild);
    expect(subscribeCallbackSpy).toHaveBeenLastCalledWith(undefined, [{ path: shouldTriggerBuild, type: 'update' }]);
    expect(onWatchTriggered).toHaveBeenLastCalledWith('update', shouldTriggerBuild);

    await dispatchChange(shouldNotTriggerBuild);
    expect(subscribeCallbackSpy).toHaveBeenLastCalledWith(undefined, [{ path: shouldNotTriggerBuild, type: 'update' }]);
    expect(onWatchTriggered).not.toHaveBeenLastCalledWith('update', shouldNotTriggerBuild);
    expect(onWatchTriggered).toHaveBeenCalledTimes(2);

    expect(subscribeCallbackSpy).toHaveBeenCalledTimes(3);

    console.log('---- DELAY TWO SECONDS BEFORE STOPPING ----');
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('---- FINISH TWO SECOND DELAY BEFORE STOPPING----');

    stopper.stopWatching();
    console.log('----- stopped watching');
    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  test('can trigger an event', async () => {
    const origConsoleLog = console.log;
    const origConsoleInfo = console.info;
    jest.spyOn(console, 'log').mockImplementation((...args) => origConsoleLog('[two]', msNow(), ...args));
    jest.spyOn(console, 'info').mockImplementation((...args) => origConsoleInfo('[two]', msNow(), ...args));

    setupMockFilesystem();

    const { onWatchTriggered, dispatchChange, stopper, subscribeCallbackSpy, unsubscribeSpy, watchDirectory } =
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

    console.log('---- DELAY TWO SECONDS ----');
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('---- FINISH TWO SECOND DELAY ----');

    await dispatchChange(shouldTriggerBuild);
    expect(subscribeCallbackSpy).toHaveBeenLastCalledWith(undefined, [{ path: shouldTriggerBuild, type: 'update' }]);
    expect(onWatchTriggered).toHaveBeenLastCalledWith('update', shouldTriggerBuild);

    await dispatchChange(shouldNotTriggerBuild);
    expect(subscribeCallbackSpy).toHaveBeenLastCalledWith(undefined, [{ path: shouldNotTriggerBuild, type: 'update' }]);
    expect(onWatchTriggered).not.toHaveBeenLastCalledWith('update', shouldNotTriggerBuild);
    expect(onWatchTriggered).toHaveBeenCalledTimes(2);

    expect(subscribeCallbackSpy).toHaveBeenCalledTimes(3);

    console.log('---- DELAY TWO SECONDS BEFORE STOPPING ----');
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('---- FINISH TWO SECOND DELAY BEFORE STOPPING----');

    stopper.stopWatching();
    console.log('----- stopped watching');
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
