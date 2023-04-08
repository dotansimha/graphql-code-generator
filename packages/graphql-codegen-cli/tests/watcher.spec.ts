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
        schema: [
          './foo/something.ts',
          './foo/**/match-schema-everywhere.graphql',
          '!**/exclude-schema-everywhere.graphql',
        ],
        watch: ['!**/exclude-watch-everywhere.graphql', 'foo/**/match-watch-everywhere.graphql'],
        documents: ['foo/**/match-doc-everywhere.graphql', '!**/exclude-doc-everywhere.graphql'],
        generates: {
          // globally inclued paths should be included even when a local pattern negates them
          ['./foo/local-exclusions-dont-precede-global-inclusions.ts']: {
            watchPattern: ['!foo/global-beats-local/match-watch-everywhere.graphql'],
            documents: ['!foo/global-beats-local/match-doc-everywhere.graphql'],
            schema: ['!foo/global-beats-local/match-schema-everywhere.graphql'],
          },
          // globally negated paths should be excluded even when a local pattern matches them
          ['./foo/local-inclusions-dont-precede-global-exclusions.ts']: {
            watchPattern: ['foo/global-beats-local/exclude-watch-everywhere.graphql'],
            documents: ['foo/global-beats-local/exclude-doc-everywhere.graphql'],
            schema: ['foo/global-beats-local/exclude-schema-everywhere.graphql'],
          },
          // local watchPattern negation should override local documents match
          ['./foo/some-output.ts']: {
            watchPattern: '!./foo/bar/never-watch.graphql',
            documents: ['./foo/bar/*.graphql', '!./foo/bar/never.graphql'],
          },
          // local watchPattern negation should override local schema match
          ['./foo/some-other-output.ts']: {
            documents: './foo/some-other-bar/*.graphql',
            watchPattern: ['!foo/some-other-bar/schemas/never-watch-schema.graphql'],
            schema: ['./foo/some-other-bar/schemas/*.graphql', '!foo/some-other-bar/schemas/never-schema.graphql'],
          },
          // match in one local group, negation in another local group, should still match
          ['./foo/alphabet/types-no-sigma.ts']: {
            schema: './foo/alphabet/schema/no-sigma.graphql',
            documents: [
              './foo/alphabet/queries/*.graphql', // zeta implicitly included (should always match)
              '!**/sigma.graphql', // sigma excluded here
            ],
          },
          // match in one local group, negation in another local group, should still match
          ['./foo/alphabet/types-no-zeta.ts']: {
            schema: './foo/alphabet/schema/no-sigma.graphql',
            documents: [
              './foo/alphabet/queries/sigma.graphql', // sigma explicitly included (should always match)
              '!./foo/alphabet/queries/zeta.graphql', // zeta excluded here
            ],
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
        './foo/some-other-bar/schemas/fizzbuzz.graphql', // included by wildcard
        //
        // match in one local group, negation in another local group, should still match
        './foo/alphabet/queries/zeta.graphql', // excluded in types-no-zeta, but included in types-no-sigma
        './foo/alphabet/queries/sigma.graphql', // excluded in types-no-sigma, but included in types-no-sigma
        //
        // globally inclued paths should be included even when a local pattern negates them
        // watch
        './foo/match-watch-everywhere.graphql',
        './foo/fizz/match-watch-everywhere.graphql',
        './foo/fizz/buzz/match-watch-everywhere.graphql',
        './foo/fizz/buzz/foobarbaz/match-watch-everywhere.graphql',
        // doc
        './foo/match-doc-everywhere.graphql',
        './foo/fizz/match-doc-everywhere.graphql',
        './foo/fizz/buzz/match-doc-everywhere.graphql',
        './foo/fizz/buzz/foobarbaz/match-doc-everywhere.graphql',
        // schema
        './foo/match-schema-everywhere.graphql',
        './foo/fizz/match-schema-everywhere.graphql',
        './foo/fizz/buzz/match-schema-everywhere.graphql',
        './foo/fizz/buzz/foobarbaz/match-schema-everywhere.graphql',
      ],
      shouldNotTriggerBuild: [
        //
        // paths outside of watch directory should be excluded
        '.git/index.lock', // totally unrelated
        'match-watch-everywhere.graphql', // would match pattern if under foo
        //
        // pattern matching should work as expected
        './foo/bar/something.ts', // unrelated file (non-matching extension)
        './foo/some-other-bar/nested/directory/blah.graphql', // no greedy pattern (**/*) to match
        //
        // output files should be excluded
        './foo/some-output.ts', // output file (note: should be ignored by parcel anyway)
        //
        // locally negated paths should be excluded even when a local pattern matches them
        './foo/bar/never.graphql', // excluded in same document set
        './foo/bar/never-watch.graphql', // excluded by local watchPattern, matched by local docs
        './foo/some-other-bar/schemas/never-schema.graphql', // excluded by local schema group
        './foo/some-other-bar/schemas/never-watch-schema.graphql', // excluded by local watchPattern group
        //
        // globally negated paths should be excluded even when a local pattern matches them
        './foo/alphabet/queries/exclude-watch-everywhere.graphql', // included in types-no-sigma.ts, but globaly excluded
        'foo/global-beats-local/exclude-watch-everywhere.graphql',
        'foo/global-beats-local/exclude-doc-everywhere.graphql',
        'foo/global-beats-local/exclude-schema-everywhere.graphql',
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
    });
  });
});
