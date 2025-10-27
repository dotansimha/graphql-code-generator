import { join, isAbsolute, relative, resolve, sep } from 'path';
import type { Options } from '@parcel/watcher';
import isGlob from 'is-glob';
import type { Mock } from 'vitest';

import {
  formatBuildTriggerErrorPrelude,
  formatErrorGlobNotIgnoredByParcelWatcher,
  formatErrorPathNotIgnoredByParcelWatcher,
} from './format-watcher-assertion-errors';

interface MockWatcher {
  watchDirectory: string;
  subscribeOpts?: Options;
  dispatchChange: (path: string) => Promise<unknown>;
  stopWatching: () => Promise<void>;
  subscribeCallbackMock: Mock;
  subscribeMock: Mock;
  onWatchTriggeredMock: Mock;
  unsubscribeMock: Mock;
}

/**
 * Helper function for asserting that multiple paths did or did not trigger a build,
 * and for asserting the values of paths and globs passed to {@link Options}`["ignore"]`
 */
export const assertBuildTriggers = async (
  mockWatcher: MockWatcher,
  {
    shouldTriggerBuild,
    shouldNotTriggerBuild,
    globsWouldBeIgnoredByParcelWatcher,
    pathsWouldBeIgnoredByParcelWatcher,
    keepWatching,
  }: {
    /**
     * Optional array of relative (from CWD) paths that SHOULD trigger build during watch mode
     *
     * Each path will be converted to an absolute path before dispatching it as
     * a change event, which is consistent with how ParcelWatcher dispatches
     * events (always containing an absolute path).
     */
    shouldTriggerBuild?: string[];
    /**
     * Optional array of relative (from CWD) paths that SHOULD NOT trigger build during watch mode
     *
     * Each path will be converted to an absolute path before dispatching it as
     * a change event, which is consistent with how ParcelWatcher dispatches
     * events (always containing an absolute path).
     *
     * NOTE: If a path would match one of the ignore patterns passed to Parcel,
     * because we do not implement the C++ code that evaluates those paths, it
     * will still be evaluated by the subscribe trigger. That's probably fine,
     * if you expect that our JS level matchers should also ignore the path,
     * but keep in mind that in production, the real Parcel watcher would (hopefully)
     * never dispatch an event with an ignored path to the subscribe callback.
     */
    shouldNotTriggerBuild?: string[];
    /**
     * Optional array specifying paths (_not_ globs) that should be included
     * in the `options.ignore` value passed to {@link ParcelWatcher.subscribe}.
     *
     * Any paths expected to be ignored should be specified _relative from cwd_,
     * as they would be in the config file. Note that ParcelWatcher expects
     * these paths to be relative from the `watchDirectory`, and the assertion
     * helper will do the conversion, by converting each item in the `options.ignore`
     * array to be relative from the cwd, and _then_ searching for a match to the
     * specified path.
     *
     * This is different from {@link globsWouldBeIgnoredByParcelWatcher} which
     * does no conversion and only looks for exact matches.
     *
     * For each path in this array:
     *
     *  * It will be checked for equality with an item in `options.ignore`, but
     *    only after all paths in options.ignore have been converted to also be relative from cwd
     *
     * See: {@link https://github.com/parcel-bundler/watcher#options}
     *
     * NOTE: Because our mock does not implement Parcel Watcher's C++ code that
     * checks whether a path should be ignored, that means that every dispatched
     * event, regardless of path, will always call the subscribe callback on our mock,
     * even if Parcel would have otherwise ignored it.
     */
    pathsWouldBeIgnoredByParcelWatcher?: string[];
    /**
     * Optional array specifying glob patterns (_not_ paths) that should be included
     * in the `options.ignore` value passed to {@link ParcelWatcher.subscribe}.
     *
     * This assertion helper will look for an **exact match** of each string
     * in this array. Any relative globs should be specified relative from the
     * `watchDirectory`, because this asertion helper will not attempt to convert
     * them (unlike with {@link pathsWouldBeIgnoredByParcelWatcher}).
     *
     * For each string in this array:
     *
     *  * It will be checked for exact equality with an item in options.ignore
     *
     * See: {@link https://github.com/parcel-bundler/watcher#options}
     *
     * NOTE: Because our mock does not implement Parcel Watcher's C++ code that
     * checks whether a path should be ignored, that means that every dispatched
     * event, regardless of path, will always call the subscribe callback on our mock,
     * even if Parcel would have otherwise ignored it.
     */
    globsWouldBeIgnoredByParcelWatcher?: string[];
    /**
     * Set this to `true` if the helper function should not call `stopWatching()`
     * (for example, if you want to continue making assertions within the test).
     *
     * By default, the helper will stop the watcher when it's done, even if it
     * encounters an error.
     */
    keepWatching?: true;
  }
) => {
  const {
    onWatchTriggeredMock,
    dispatchChange,
    stopWatching,
    subscribeCallbackMock,
    subscribeMock,
    unsubscribeMock,
    watchDirectory,
    subscribeOpts,
  } = mockWatcher;

  // These are optional, but to avoid if/else nesting, set them to empty list if not specified
  shouldTriggerBuild ??= [];
  shouldNotTriggerBuild ??= [];

  // Wrap in a try/finally block so even if there's an error, we can stop the watcher
  // This way, we avoid misleading "cannot log after tests are done" error
  try {
    expect(subscribeMock).toHaveBeenCalledTimes(1);
    expect(subscribeMock.mock.calls[0][0]).toBe(watchDirectory);
    expect(subscribeMock.mock.calls[0][2]).toStrictEqual(subscribeOpts);

    for (const relPath of shouldTriggerBuild) {
      const path = join(process.cwd(), relPath);
      await assertTriggeredBuild(path, { dispatchChange, subscribeCallbackMock, onWatchTriggeredMock });
    }

    expect(subscribeCallbackMock).toHaveBeenCalledTimes(shouldTriggerBuild.length);
    expect(onWatchTriggeredMock).toHaveBeenCalledTimes(shouldTriggerBuild.length);

    for (const relPath of shouldNotTriggerBuild) {
      const path = join(process.cwd(), relPath);
      await assertDidNotTriggerBuild(path, { dispatchChange, subscribeCallbackMock, onWatchTriggeredMock });
    }

    expect(subscribeCallbackMock).toHaveBeenCalledTimes(shouldTriggerBuild.length + shouldNotTriggerBuild.length);
    expect(onWatchTriggeredMock).toHaveBeenCalledTimes(shouldTriggerBuild.length);

    const ignore = subscribeOpts.ignore ?? [];
    if (pathsWouldBeIgnoredByParcelWatcher) {
      for (const relPathFromCwd of pathsWouldBeIgnoredByParcelWatcher) {
        if (isGlob(relPathFromCwd)) {
          throw new Error(
            [
              `expected path, got glob: ${relPathFromCwd}`,
              'pass globs to globsWouldBeIgnoredByParcelWatcher, not pathsWouldBeIgnoredByParcelWatcher',
            ].join('\n')
          );
        }

        if (isAbsolute(relPathFromCwd)) {
          throw new Error('pathsWouldBeIgnoredByParcelWatcher should only include relative paths from cwd');
        }
        assertParcelWouldIgnorePath(relPathFromCwd, { watchDirectory, ignore });
      }
    }

    if (globsWouldBeIgnoredByParcelWatcher) {
      for (const expectedIgnoredGlob of globsWouldBeIgnoredByParcelWatcher) {
        if (!isGlob(expectedIgnoredGlob)) {
          throw new Error(
            [
              `expected glob, got path (or something that is not a glob): ${expectedIgnoredGlob}`,
              'pass paths to pathsWouldBeIgnoredByParcelWatcher, not globsWouldBeIgnoredByParcelWatcher',
            ].join('\n')
          );
        }

        assertParcelWouldIgnoreGlob(expectedIgnoredGlob, { watchDirectory, ignore });
      }
    }
  } finally {
    if (keepWatching !== true) {
      await stopWatching();
      expect(unsubscribeMock).toHaveBeenCalledTimes(1);
    }
  }
};

/**
 * Given a glob pattern, assert that {@link Options}`["ignore"]`
 * contains that glob pattern (exact match).
 *
 * We don't implement actual globbing logic, because Parcel Watcher does that
 * from C++ and it would be a leaky mock.
 */
const assertParcelWouldIgnoreGlob = (
  /** Glob pattern expected to exist in {@link Options}`["ignore"]` */
  expectToIgnoreGlob: string,
  { ignore, watchDirectory }: { watchDirectory: string; ignore: Required<Options>['ignore'] }
) => {
  const parcelIgnoredGlobs = ignore.filter(pathOrGlob => isGlob(pathOrGlob));

  const hasMatch = parcelIgnoredGlobs.includes(expectToIgnoreGlob);

  try {
    expect(hasMatch).toBe(true);
  } catch (error) {
    error.message = formatErrorGlobNotIgnoredByParcelWatcher({
      expectedGlob: expectToIgnoreGlob,
      parcelIgnoredGlobs,
      jestErrorMessage: error.message,
      watchDirectory,
    });
    Error.captureStackTrace(error, assertParcelWouldIgnoreGlob);
    throw error;
  }
};

/**
 * Given a path, and the `ignore` option passed to the mocked {@link Options},
 * assert that ParcelWatcher "would" ignore the path if given it as part of the ignore option.
 *
 * Note that ParcelWatcher expects paths relative from the watchDirectory, but
 * our assertion helper expects paths relative from cwd.
 */
const assertParcelWouldIgnorePath = (
  /**
   * Relative path from cwd, as given to {@link assertBuildTriggers}
   * `pathsWouldBeIgnoredByParcelWatcher` option
   */
  expectToIgnoreRelPathFromCwd: string,
  {
    watchDirectory,
    ignore,
  }: {
    watchDirectory: string;
    ignore: Required<Options>['ignore'];
  }
) => {
  const parcelIgnoredPaths = ignore.filter(pathOrGlob => !isGlob(pathOrGlob));

  const parcelIgnoredPathsRelativeFromCwd = parcelIgnoredPaths.map(relOrAbsolutePath => {
    // NOTE: ParcelWatcher considers relative ignore paths relative from the given watchDirectory
    const relPathFromWatchDir = isAbsolute(relOrAbsolutePath)
      ? relative(watchDirectory, relOrAbsolutePath)
      : relOrAbsolutePath;

    // ...but we want to assert relative from cwd
    const absPath = resolve(process.cwd(), relative(process.cwd(), watchDirectory), relPathFromWatchDir);
    const relPathFromCwd = relative(process.cwd(), absPath);

    // NOTE: This will not include "./"
    return relPathFromCwd;
  });

  // Match on exact match, or exact match with ./ prefix (or .\ on windows)
  const hasMatch = parcelIgnoredPathsRelativeFromCwd.some(
    ignorePathRelFromCwd =>
      expectToIgnoreRelPathFromCwd === ignorePathRelFromCwd ||
      expectToIgnoreRelPathFromCwd === `.${sep}${ignorePathRelFromCwd}`
  );

  try {
    expect(hasMatch).toBe(true);
  } catch (error) {
    error.message = formatErrorPathNotIgnoredByParcelWatcher({
      expectedPath: expectToIgnoreRelPathFromCwd,
      parcelIgnoredPaths,
      parcelIgnoredPathsRelativeFromCwd,
      jestErrorMessage: error.message,
      watchDirectory,
    });
    Error.captureStackTrace(error, assertParcelWouldIgnorePath);
    throw error;
  }
};

type MockWatcherAssertionHelpers = Pick<
  MockWatcher,
  'dispatchChange' | 'subscribeCallbackMock' | 'onWatchTriggeredMock'
>;

/**
 * Assertion helper to assert that the given (absolute) path triggered a build
 */
const assertTriggeredBuild = async (
  /** Absolute path */ path: string,
  { dispatchChange, subscribeCallbackMock, onWatchTriggeredMock }: MockWatcherAssertionHelpers
) => {
  try {
    await dispatchChange(path);
    expect(subscribeCallbackMock).toHaveBeenLastCalledWith(undefined, [{ path, type: 'update' }]);
    expect(onWatchTriggeredMock).toHaveBeenLastCalledWith('update', path);
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
  { dispatchChange, subscribeCallbackMock, onWatchTriggeredMock }: MockWatcherAssertionHelpers
) => {
  try {
    await dispatchChange(path);
    expect(subscribeCallbackMock).toHaveBeenLastCalledWith(undefined, [{ path, type: 'update' }]);
    expect(onWatchTriggeredMock).not.toHaveBeenLastCalledWith('update', path);
  } catch (error) {
    error.message = formatBuildTriggerErrorPrelude(path, false, error.message);
    Error.captureStackTrace(error, assertDidNotTriggerBuild);
    throw error;
  }
};
