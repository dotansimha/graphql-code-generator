import { join, relative } from 'path';
import chalk from 'chalk';
import type { SubscribeCallback } from '@parcel/watcher';
import ParcelWatcher from '@parcel/watcher';
import { CodegenContext } from '../src/config';
import * as fs from '../src/utils/file-system.js';
import { createWatcher } from '../src/utils/watcher.js';
import { Types } from '@graphql-codegen/plugin-helpers';

/**
 * Helper function for asserting that multiple paths did or did not trigger a build
 */
export const assertBuildTriggers = async (
  mockWatcher: Awaited<ReturnType<typeof setupMockWatcher>>,
  {
    shouldTriggerBuild,
    shouldNotTriggerBuild,
    keepWatching,
  }: {
    /**
     * Array of relative paths that SHOULD trigger build during watch mode
     *
     * Each path will be converted to absolute path relative to `process.cwd()`
     * before dispatching it as a change event.
     */
    shouldTriggerBuild: string[];
    /**
     * Array of relative paths that SHOULD NOT trigger build during watch mode
     *
     * Each path will be converted to absolute path relative to `process.cwd()`
     * before dispatching it as a change event.
     */
    shouldNotTriggerBuild: string[];
    /**
     * Set to `true` if the helper function should not call `stopWatching()`
     * (for example, if you want to continue making assertions within the test).
     *
     * By default, the helper will stop the watcher when it's done, even if it
     * encounters an error.
     */
    keepWatching?: true;
  }
) => {
  const { onWatchTriggered, dispatchChange, stopWatching, subscribeCallbackSpy, unsubscribeSpy } = mockWatcher;

  // Wrap in a try/finally block so even if there's an error, we can stop the watcher
  // This way, we avoid misleading "cannot log after tests are done" error
  try {
    for (const relPath of shouldTriggerBuild) {
      const path = join(process.cwd(), relPath);
      await assertTriggeredBuild(path, { dispatchChange, subscribeCallbackSpy, onWatchTriggered });
    }

    expect(subscribeCallbackSpy).toHaveBeenCalledTimes(shouldTriggerBuild.length);
    expect(onWatchTriggered).toHaveBeenCalledTimes(shouldTriggerBuild.length);

    for (const relPath of shouldNotTriggerBuild) {
      const path = join(process.cwd(), relPath);
      await assertDidNotTriggerBuild(path, { dispatchChange, subscribeCallbackSpy, onWatchTriggered });
    }

    expect(subscribeCallbackSpy).toHaveBeenCalledTimes(shouldTriggerBuild.length + shouldNotTriggerBuild.length);
    expect(onWatchTriggered).toHaveBeenCalledTimes(shouldTriggerBuild.length);
  } finally {
    if (keepWatching !== true) {
      await stopWatching();
      expect(unsubscribeSpy).toHaveBeenCalled();
    }
  }
};

type MockWatcherAssertionHelpers = Pick<
  Awaited<ReturnType<typeof setupMockWatcher>>,
  'dispatchChange' | 'subscribeCallbackSpy' | 'onWatchTriggered'
>;

/**
 * Assertion helper to assert that the given (absolute) path triggered a build
 */
const assertTriggeredBuild = async (
  /** Absolute path */ path: string,
  { dispatchChange, subscribeCallbackSpy, onWatchTriggered }: MockWatcherAssertionHelpers
) => {
  try {
    await dispatchChange(path);
    expect(subscribeCallbackSpy).toHaveBeenLastCalledWith(undefined, [{ path, type: 'update' }]);
    expect(onWatchTriggered).toHaveBeenLastCalledWith('update', path);
  } catch (error) {
    error.message = formatBuildTriggerErrorPrelude(path, true, error.message);
    Error.captureStackTrace(error, assertTriggeredBuild);
    throw error;
  }
};

/**
 * Assertion helper to assert that the given (absolute) path did NOT trigger a build
 */
const assertDidNotTriggerBuild = async (
  /** Absolute path */ path: string,
  { dispatchChange, subscribeCallbackSpy, onWatchTriggered }: MockWatcherAssertionHelpers
) => {
  try {
    await dispatchChange(path);
    expect(subscribeCallbackSpy).toHaveBeenLastCalledWith(undefined, [{ path, type: 'update' }]);
    expect(onWatchTriggered).not.toHaveBeenLastCalledWith('update', path);
  } catch (error) {
    error.message = formatBuildTriggerErrorPrelude(path, false, error.message);
    Error.captureStackTrace(error, assertDidNotTriggerBuild);
    throw error;
  }
};

/**
 * Format a readable error message to print when the assertion fails, so that
 * the developer can immediately see which path was expected to trigger the rebuild.
 *
 * Since we're using auto-assertions, this makes for much more readable errors
 * than the raw Jest message (which can be misleading because, e.g. if the assertion
 * is that `onWatchTriggered` was last called with the right path, but it wasn't,
 * then the Jest error message will misleadingly print the previous path).
 */
const formatBuildTriggerErrorPrelude = (
  /** Absolute path */ path: string,
  expectedToBuild: boolean,
  jestErrorMessage: string
) => {
  const relPath = relative(process.cwd(), path);
  const should = `${expectedToBuild ? 'have' : 'not have'} triggered build`;
  const but = expectedToBuild ? 'it did not' : 'it did';
  return `${[
    chalk.gray('---------------------- Watch Mode Build Trigger Assertion Failure: ----------------------'),
    chalk.red(`<${relPath}>` + chalk.bold(` should ${should}, but ${but}.`)),
    `     Expected: ${chalk.green(expectedToBuild ? 'to trigger build' : 'not to trigger build')}`,
    `     Received: ${chalk.red(expectedToBuild ? 'did not trigger build' : 'triggered build')}`,
    chalk.gray(`Absolute Path: ${path}`),
    '',
    chalk.gray('-------------------------------- Raw Error (from Jest): --------------------------------'),
  ].join('\n')}\n${jestErrorMessage}`;
};

/**
 * Setup mocking infrastructure for a fake watcher.
 *
 * **IMPORTANT**: Make sure to call the returned {@link stopWatching `stopWatching()`}
 * function at the end of each test that uses this, or Jest will complain about unterminated promises.
 *
 * @returns Various helpers and spies for making assertions about change events and rebuild triggers
 */
export const setupMockWatcher = async (
  /**
   * Same argument as first parameter of {@link CodegenContext} constructor
   *
   * If `config.hooks.onWatchTriggered` lifecycle hook is not provided, then
   * it will be set to a mocked function (which in all cases will be part of
   * the return value of {@link setupMockWatcher}).
   */
  contextOpts: ConstructorParameters<typeof CodegenContext>[0]
) => {
  const onWatchTriggered = createMockOnWatchTriggered();

  contextOpts.config = {
    hooks: {
      onWatchTriggered,
      ...contextOpts.config?.hooks,
    },
    ...contextOpts.config,
  };

  const context = new CodegenContext(contextOpts);

  const deferredParcelWatcher = deferMockedParcelWatcher();
  const { stopWatching, runningWatcher } = createWatcher(context, async _ => Promise.resolve([]));

  const { dispatchChange, subscribeCallbackSpy, unsubscribeSpy, watchDirectory } = await deferredParcelWatcher;

  return {
    /**
     * The {@link CodegenContext} created from the given contextOpts, which represents
     * the same {@link CodegenContext} that would be created with `new CodegenContext(contextOpts)`,
     * but is guaranteed to have defined lifecycle hook `Config.hooks.onWatchTriggered`
     */
    context,
    /**
     * The function passed to `config.hooks.onWatchTriggered`. If it was not provided
     * in the first parameter of {@link setupMockWatcher}, then it will be a mocked function.
     *
     * This lifecycle hook should only be expected to be called when a rebuild
     * is triggered for the watcher, i.e. not for every event. To make assertions
     * on every event, use {@link subscribeCallbackSpy} that is returned along with this function.
     */
    onWatchTriggered: contextOpts.config.hooks.onWatchTriggered,
    /**
     * Call this functon to stop the mock watching promise (which otherwise will not terminate).
     *
     * This _must be called_ at the end of each test to avoid unhandled promises.
     */
    stopWatching,
    /**
     * Promise that is pending as long as the watcher is running.
     *
     * There should be no need to manually await this, because `await stopWatching()`
     * will wait for also wait for this same promise to resolve.
     */
    runningWatcher,
    /**
     * Asynchronous function for dispatching file change events,
     * _which only resolves after the {@link ParcelWatcher.SubscribeCallback | subscription callback}
     * has completed consuming the event._
     */
    dispatchChange,
    /**
     * Spy on the value of the asynchronous {@link ParcelWatcher.SubscribeCallback}
     * that the implementing code provided as an argument
     * to {@link ParcelWatcher.subscribe | `@parcel/watch.subscribe`}
     *
     * This function is called for _every_ change event, so it's a useful spy
     * for making assertions about events that did _not_ call {@link onWatchTriggered}
     */
    subscribeCallbackSpy,
    /**
     * Mocked function implementing {@link ParcelWatcher.AsyncSubscription}`['unsubscribe']`
     * to spy on `subscription.unsubscribe()` which should be called by implementing
     * code when closing the subscription
     */
    unsubscribeSpy,
    /**
     * The argument that was provided to {@link ParcelWatcher.subscribe | @parcel/watch.subscribe}
     * which indicates the directory for the Parcel Watcher to watch.
     */
    watchDirectory,
  };
};

/**
 * Setup global mocks for [file-system.ts](../src/utils/file-system.ts) and {@link process.cwd}.
 */
export const setupMockFilesystem = (
  /**
   * Optionally provide the mock implementations for any {@link fs} functions
   * exported from [file-system.ts](../src/utils/file-system.ts)
   *
   * Default:
   *  * {@link fs.writeFile | `writeFile`}: no-op
   *  * {@link fs.readFile | `readFile`}: return blank string
   *  * {@link fs.access | `access` }: return `void` (indicates file is accessible, since no error is thrown)
   */
  implementations?: Partial<typeof fs>
) => {
  const mockedFsSpies = {
    /** Don't write any file */
    writeFile: jest.spyOn(fs, 'writeFile').mockImplementation(implementations?.writeFile),
    /** Read a blank file */
    readFile: jest.spyOn(fs, 'readFile').mockImplementation(implementations?.readFile ?? (async () => '')),
    /** Always accessible (void means accesible, it throws otherwise) */
    access: jest.spyOn(fs, 'access').mockImplementation(implementations?.access ?? (async () => {})),
  };

  return {
    /**
     * The spy functions created for the {@link fs} module, either those provided
     * by {@link implementations} or {@link mockedFsSpies | the defaults}.
     */
    fsSpies: mockedFsSpies,
  };
};

/**
 * Create a mocked function for the `onWatchTriggered` lifecycle hook, which can
 * be pased as a value to `Config.hooks.onWatchTriggered`, and is useful for making
 * assertions about when a rebuild was triggered, since this lifecycle hook is
 * only supposed to be called when a file change event triggers a rebuild.
 *
 * @returns Mocked function that can be passed as a lifecycle hook to `Config.hooks.onWatchTriggered`
 */
const createMockOnWatchTriggered = () => jest.fn<ReturnType<Types.HookFunction>, Parameters<Types.HookFunction>>();

/** Function to call to dispatch a change and wait for it to be processed by subscription listener */
type DispatchChange = (path: string, eventType?: ParcelWatcher.EventType) => Promise<void>;
/** Mocked @parcel/watcher.SubscribeCallback */
type SubscribeCallbackMock = jest.Mock<ReturnType<SubscribeCallback>, Parameters<SubscribeCallback>>;
/** Convenience type alias for the unsubscribe function of ParcelWatcher subcription */
type ParcelUnsubscribe = ParcelWatcher.AsyncSubscription['unsubscribe'];
/** Mocked ParcelUnsubscribe */
type UnsubscribeMock = jest.Mock<ReturnType<ParcelUnsubscribe>, Parameters<ParcelUnsubscribe>>;

/**
 * Mock {@link ParcelWatcher | `@parcel/watcher`} module to override {@link ParcelWatcher.subscribe | `@parcel/watcher.subscribe`}
 * with a function that intercepts the provided {@link ParcelWatcher.SubscribeCallback},
 * spies on it, and then calls the {@link mockOnSubscribed} function once it's been setup.
 */
const mockParcelWatcher = (
  /**
   * Callback to execute once {@link ParcelWatcher.subscribe | `@parcel/watcher.subscribe`} has been called
   *
   * NOTE: Prefixed with mock to opt out of Jest warning about uninitialized mocked
   * variables, since we're intentionally initializing it lazily
   */
  mockOnSubscribed: (opts: {
    watchDirectory: string;
    dispatchChange: DispatchChange;
    subscribeCallbackSpy: SubscribeCallbackMock;
    unsubscribeSpy: UnsubscribeMock;
  }) => void
) => {
  let mockOnEvent: SubscribeCallbackMock;
  const mockUnsubscribe: UnsubscribeMock = jest.fn<Promise<void>, undefined>(() => Promise.resolve());

  jest.mock('@parcel/watcher', () => ({
    subscribe: async (watchDirectory: string, subscribeCallback: SubscribeCallbackMock) => {
      mockOnEvent = jest.fn(subscribeCallback);
      mockOnSubscribed({
        watchDirectory,
        unsubscribeSpy: mockUnsubscribe,
        subscribeCallbackSpy: mockOnEvent,
        dispatchChange: async (path: string, eventType: ParcelWatcher.EventType = 'update') => {
          await mockOnEvent(undefined, [
            {
              type: eventType,
              path,
            },
          ]);
        },
      });

      return {
        unsubscribe: mockUnsubscribe,
      };
    },
  }));
};

/**
 * Return a Promise that will mock the global {@link ParcelWatcher | `@parcel/watcher`} module,
 * and that will only resolve once {@link ParcelWatcher.subscribe | `@parcel/watcher.subscribe`}
 * has been called (presumably by the implementing code that is implicitly consuming the mock).
 *
 * @returns Promise that resolves after mocked @parcel/watcher.subscribe has been called
 */
const deferMockedParcelWatcher = () => {
  return new Promise<{
    dispatchChange: DispatchChange;
    subscribeCallbackSpy: SubscribeCallbackMock;
    unsubscribeSpy: UnsubscribeMock;
    watchDirectory: string;
  }>((resolve, _reject) => {
    mockParcelWatcher(opts => {
      resolve(opts);
    });
  });
};
