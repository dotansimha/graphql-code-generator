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

  test('globally included paths should be included even when a local pattern negates them', async () => {
    const mockWatcher = await setupMockWatcher({
      filepath: './foo/some-config.ts',
      config: {
        schema: ['./foo/**/match-schema-everywhere.graphql'],
        watch: [
          'foo/**/match-watch-everywhere.graphql',
          'foo/**/match-watch-doc-everywhere.graphql',
          'foo/**/match-watch-schema-everywhere.graphql',
        ],
        documents: ['foo/**/match-doc-everywhere.graphql'],
        generates: {
          // globally inclued paths should be included even when a local pattern negates them
          ['./foo/local-exclusions-dont-precede-global-inclusions.ts']: {
            watchPattern: ['!foo/global-beats-local/match-watch-everywhere.graphql'],
            documents: [
              '!foo/global-beats-local/match-doc-everywhere.graphql',
              '!foo/global-beats-local/match-watch-doc-everywhere.graphql',
            ],
            schema: [
              '!foo/global-beats-local/match-schema-everywhere.graphql',
              '!foo/global-beats-local/match-watch-schema-everywhere.graphql',
            ],
          },
        },
      },
    });

    expect(mockWatcher.watchDirectory).toBe(join(process.cwd(), 'foo'));

    await assertBuildTriggers(mockWatcher, {
      shouldTriggerBuild: [
        // watch
        './foo/match-watch-everywhere.graphql',
        './foo/fizz/match-watch-everywhere.graphql',
        './foo/fizz/buzz/match-watch-everywhere.graphql',
        './foo/fizz/buzz/foobarbaz/match-watch-everywhere.graphql',
        // watch-doc (matched in global watch, excluded in local doc)
        './foo/match-watch-doc-everywhere.graphql',
        './foo/fizz/match-watch-doc-everywhere.graphql',
        './foo/fizz/buzz/match-watch-doc-everywhere.graphql',
        './foo/fizz/buzz/foobarbaz/match-watch-doc-everywhere.graphql',
        // watch-schema (matched in global watch, excluded in local schema)
        './foo/match-watch-schema-everywhere.graphql',
        './foo/fizz/match-watch-schema-everywhere.graphql',
        './foo/fizz/buzz/match-watch-schema-everywhere.graphql',
        './foo/fizz/buzz/foobarbaz/match-watch-schema-everywhere.graphql',
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
    });
  });

  test('globally negated paths should be excluded even when a local pattern matches them', async () => {
    const mockWatcher = await setupMockWatcher({
      filepath: './foo/some-config.ts',
      config: {
        schema: ['!**/exclude-schema-everywhere.graphql'],
        watch: [
          '!**/exclude-watch-everywhere.graphql',
          '!**/exclude-watch-doc-everywhere.graphql',
          '!**/exclude-watch-schema-everywhere.graphql',
        ],
        documents: ['!**/exclude-doc-everywhere.graphql'],
        generates: {
          ['./foo/local-inclusions-dont-precede-global-exclusions.ts']: {
            watchPattern: [
              'foo/global-beats-local/exclude-watch-everywhere.graphql',
              'foo/global-beats-local/exclude-watch-doc-everywhere.graphql',
              'foo/global-beats-local/exclude-watch-schema-everywhere.graphql',
            ],
            documents: [
              'foo/global-beats-local/exclude-doc-everywhere.graphql',
              'foo/global-beats-local/exclude-watch-doc-everywhere.graphql',
            ],
            schema: [
              'foo/global-beats-local/exclude-schema-everywhere.graphql',
              'foo/global-beats-local/exclude-watch-schema-everywhere.graphql',
            ],
          },
        },
      },
    });

    expect(mockWatcher.watchDirectory).toBe(join(process.cwd(), 'foo'));

    await assertBuildTriggers(mockWatcher, {
      shouldNotTriggerBuild: [
        'foo/global-beats-local/exclude-watch-everywhere.graphql',
        'foo/global-beats-local/exclude-doc-everywhere.graphql',
        'foo/global-beats-local/exclude-schema-everywhere.graphql',
        'foo/global-beats-local/exclude-watch-doc-everywhere.graphql',
        'foo/global-beats-local/exclude-watch-schema-everywhere.graphql',
      ],
    });
  });

  test('local watchPattern negation should override local documents match', async () => {
    const mockWatcher = await setupMockWatcher({
      filepath: './foo/some-config.ts',
      config: {
        schema: './foo/something.ts',
        generates: {
          ['./foo/some-output.ts']: {
            watchPattern: '!./foo/bar/never-watch.graphql',
            documents: ['./foo/bar/*.graphql'],
          },
        },
      },
    });

    expect(mockWatcher.watchDirectory).toBe(join(process.cwd(), 'foo'));

    await assertBuildTriggers(mockWatcher, {
      shouldTriggerBuild: ['./foo/bar/okay-doc.graphql'],
      shouldNotTriggerBuild: ['./foo/bar/never-watch.graphql'],
    });
  });

  test('local negations in documents set should override match in same documents set', async () => {
    const mockWatcher = await setupMockWatcher({
      filepath: './foo/some-config.ts',
      config: {
        schema: './foo/something.ts',
        generates: {
          ['./foo/some-output.ts']: {
            documents: ['./foo/bar/*.graphql', '!./foo/bar/never.graphql'],
          },
        },
      },
    });

    expect(mockWatcher.watchDirectory).toBe(join(process.cwd(), 'foo'));

    await assertBuildTriggers(mockWatcher, {
      shouldTriggerBuild: ['./foo/bar/okay.graphql'],
      shouldNotTriggerBuild: ['./foo/bar/never.graphql'],
    });
  });

  test('local watchPattern negation should override local schema match', async () => {
    const mockWatcher = await setupMockWatcher({
      filepath: './foo/some-config.ts',
      config: {
        schema: './foo/something.ts',
        generates: {
          ['./foo/some-output.ts']: {
            watchPattern: '!./foo/bar/never-watch.graphql',
            schema: ['./foo/bar/*.graphql'],
          },
        },
      },
    });

    expect(mockWatcher.watchDirectory).toBe(join(process.cwd(), 'foo'));

    await assertBuildTriggers(mockWatcher, {
      shouldTriggerBuild: ['./foo/bar/okay-doc.graphql'],
      shouldNotTriggerBuild: ['./foo/bar/never-watch.graphql'],
    });
  });

  test('local negations in schema set should override match in same schema set', async () => {
    const mockWatcher = await setupMockWatcher({
      filepath: './foo/some-config.ts',
      config: {
        schema: './foo/something.ts',
        generates: {
          ['./foo/some-output.ts']: {
            schema: ['./foo/bar/*.graphql', '!./foo/bar/never.graphql'],
          },
        },
      },
    });

    expect(mockWatcher.watchDirectory).toBe(join(process.cwd(), 'foo'));

    await assertBuildTriggers(mockWatcher, {
      shouldTriggerBuild: ['./foo/bar/okay.graphql'],
      shouldNotTriggerBuild: ['./foo/bar/never.graphql'],
    });
  });

  test('match in one local group, negated in another group, should still match', async () => {
    const mockWatcher = await setupMockWatcher({
      filepath: './foo/some-config.ts',
      config: {
        schema: './foo/something.ts',
        generates: {
          // match in one local group, negation in another local group, should still match
          ['./foo/alphabet/types-no-sigma.ts']: {
            schema: [
              './foo/alphabet/schema/delta.graphql', // delta explicitly included
              './foo/alphabet/schema/zeta.graphql', // zeta explicitly included
              '!foo/alphabet/schema/sigma.graphql', // sigma explicitly excluded
            ],
            documents: [
              './foo/alphabet/docs/*.graphql', // zeta implicitly included
              '!**/sigma.graphql', // sigma excluded here
            ],
          },
          // match in one local group, negation in another local group, should still match
          ['./foo/alphabet/types-no-zeta.ts']: {
            watchPattern: [
              // local watch pattern doesnt take priority over other groups schema
              '!./foo/alphabet/schema/delta.graphql', // delta explicitly excluded
            ],
            schema: [
              './foo/alphabet/schema/sigma.graphql', // sigma explicitly included
              '!foo/alphabet/schema/zeta.graphql', // zeta explicitly excluded
            ],
            documents: [
              './foo/alphabet/docs/sigma.graphql', // sigma explicitly included (should always match)
              '!./foo/alphabet/docs/zeta.graphql', // zeta excluded here
            ],
          },
        },
      },
    });

    expect(mockWatcher.watchDirectory).toBe(join(process.cwd(), 'foo'));

    await assertBuildTriggers(mockWatcher, {
      shouldTriggerBuild: [
        './foo/alphabet/docs/zeta.graphql',
        './foo/alphabet/docs/sigma.graphql',
        './foo/alphabet/schema/zeta.graphql',
        './foo/alphabet/schema/sigma.graphql',
        './foo/alphabet/schema/delta.graphql',
      ],
    });
  });

  test('output directories with presetConfig create glob patterns ignored by parcel watcher', async () => {
    const mockWatcher = await setupMockWatcher({
      filepath: './foo/some-config.ts',
      config: {
        generates: {
          ['./foo/some-preset-bar/']: {
            preset: 'near-operation-file',
            presetConfig: {
              extension: '.generated.tsx',
              baseTypesPath: 'types.ts',
            },
            documents: ['./foo/some-preset-bar/*.graphql'],
          },
          ['./foo/some-preset-without-trailing-slash']: {
            // no trailing slash after directory
            preset: 'near-operation-file',
            presetConfig: {
              extension: '.fizzbuzz.tsx',
              baseTypesPath: 'types.ts',
            },
            documents: ['./foo/some-preset-without-trailing-slash/*.graphql'],
          },
        },
      },
    });

    expect(mockWatcher.watchDirectory).toBe(join(process.cwd(), 'foo'));

    await assertBuildTriggers(mockWatcher, {
      // note: since our mock does not implement ParcelWatcher's shouldIgnore logic,
      // we can't actually test shouldNotTriggerBuild, because the subscription callback
      // will still be called. For that reason, we only check that the globs were passed
      // to ParcelWatcher.Options["ignore"] as expected (hence _would_BeIgnoredByParcelWatcher)
      shouldNotTriggerBuild: [],
      globsWouldBeIgnoredByParcelWatcher: [
        // note: globs are tested for exact match with argument passed to subscribe options,
        //       so they should be specified relative from watchDirectory, _not_ cwd (see typedoc)
        'some-preset-bar/**/*.generated.tsx',
        'some-preset-without-trailing-slash/**/*.fizzbuzz.tsx',
      ],
    });
  });

  test('output files are ignored by parcel watcher, but would not trigger rebuild anyway', async () => {
    const mockWatcher = await setupMockWatcher({
      filepath: './foo/some-config.ts',
      config: {
        generates: {
          ['./foo/some-output.ts']: {
            documents: ['./foo/bar/*.graphql', '!./foo/bar/never.graphql'],
          },
        },
      },
    });

    expect(mockWatcher.watchDirectory).toBe(join(process.cwd(), 'foo'));

    await assertBuildTriggers(mockWatcher, {
      // NOTE: Unlike the test with output _directories_, we can actually assert
      // that we wouldn't build output files, even if they were _not_ passed
      // to ParcelWatcher.Options[ignore], because we don't include output files
      // in our pattern matching (but there is no logic for output directories)
      shouldNotTriggerBuild: [
        './foo/some-output.ts', // output file (note: should be ignored by parcel anyway)
      ],
      pathsWouldBeIgnoredByParcelWatcher: [
        // note: expectations should be relative from cwd; assertion helper converts
        //       the values received by parcelWatcher to match before testing them (see typedoc)
        './foo/some-output.ts', // output file
        'foo/some-output.ts', // output file
      ],
    });
  });

  // NOTE: Each individual aspect of this test should be covered by its own isolated test above,
  // so if one of those is failing, this should be failing too. This big test was written first,
  // and then broken into the individual tests, but we may as well keep it here.
  // However, all instances of "foo" have been changed to "fuzz", so that if a test fails,
  // ctrl+f for the failing expectation will be easier to find the right place
  test('all expectations also work in a big combined config', async () => {
    const mockWatcher = await setupMockWatcher({
      filepath: './fuzz/some-config.ts',
      config: {
        schema: [
          './fuzz/something.ts',
          './fuzz/**/match-schema-everywhere.graphql',
          '!**/exclude-schema-everywhere.graphql',
        ],
        watch: ['!**/exclude-watch-everywhere.graphql', 'fuzz/**/match-watch-everywhere.graphql'],
        documents: ['fuzz/**/match-doc-everywhere.graphql', '!**/exclude-doc-everywhere.graphql'],
        generates: {
          // globally inclued paths should be included even when a local pattern negates them
          ['./fuzz/local-exclusions-dont-precede-global-inclusions.ts']: {
            watchPattern: ['!fuzz/global-beats-local/match-watch-everywhere.graphql'],
            documents: ['!fuzz/global-beats-local/match-doc-everywhere.graphql'],
            schema: ['!fuzz/global-beats-local/match-schema-everywhere.graphql'],
          },
          // globally negated paths should be excluded even when a local pattern matches them
          ['./fuzz/local-inclusions-dont-precede-global-exclusions.ts']: {
            watchPattern: ['fuzz/global-beats-local/exclude-watch-everywhere.graphql'],
            documents: ['fuzz/global-beats-local/exclude-doc-everywhere.graphql'],
            schema: ['fuzz/global-beats-local/exclude-schema-everywhere.graphql'],
          },
          // local watchPattern negation should override local documents match
          ['./fuzz/some-output.ts']: {
            watchPattern: '!./fuzz/bar/never-watch.graphql',
            documents: ['./fuzz/bar/*.graphql', '!./fuzz/bar/never.graphql'],
          },
          // local watchPattern negation should override local schema match
          ['./fuzz/some-other-output.ts']: {
            documents: './fuzz/some-other-bar/*.graphql',
            watchPattern: ['!fuzz/some-other-bar/schemas/never-watch-schema.graphql'],
            schema: ['./fuzz/some-other-bar/schemas/*.graphql', '!fuzz/some-other-bar/schemas/never-schema.graphql'],
          },
          // match in one local group, negation in another local group, should still match
          ['./fuzz/alphabet/types-no-sigma.ts']: {
            schema: './fuzz/alphabet/schema/no-sigma.graphql',
            documents: [
              './fuzz/alphabet/queries/*.graphql', // zeta implicitly included (should always match)
              '!**/sigma.graphql', // sigma excluded here
            ],
          },
          // match in one local group, negation in another local group, should still match
          ['./fuzz/alphabet/types-no-zeta.ts']: {
            schema: './fuzz/alphabet/schema/no-sigma.graphql',
            documents: [
              './fuzz/alphabet/queries/sigma.graphql', // sigma explicitly included (should always match)
              '!./fuzz/alphabet/queries/zeta.graphql', // zeta excluded here
            ],
          },
          ['./fuzz/some-preset-bar/']: {
            preset: 'near-operation-file',
            presetConfig: {
              extension: '.generated.tsx',
              baseTypesPath: 'types.ts',
            },
            documents: ['./fuzz/some-preset-bar/*.graphql'],
          },
        },
      },
    });

    expect(mockWatcher.watchDirectory).toBe(join(process.cwd(), 'fuzz'));

    await assertBuildTriggers(mockWatcher, {
      shouldTriggerBuild: [
        './fuzz/some-config.ts', // config file
        './fuzz/bar/fizzbuzz.graphql',
        './fuzz/some-other-bar/schemas/fizzbuzz.graphql', // included by wildcard
        //
        // match in one local group, negation in another local group, should still match
        './fuzz/alphabet/queries/zeta.graphql', // excluded in types-no-zeta, but included in types-no-sigma
        './fuzz/alphabet/queries/sigma.graphql', // excluded in types-no-sigma, but included in types-no-sigma
        //
        // globally inclued paths should be included even when a local pattern negates them
        // watch
        './fuzz/match-watch-everywhere.graphql',
        './fuzz/fizz/match-watch-everywhere.graphql',
        './fuzz/fizz/buzz/match-watch-everywhere.graphql',
        './fuzz/fizz/buzz/fuzzbarbaz/match-watch-everywhere.graphql',
        // doc
        './fuzz/match-doc-everywhere.graphql',
        './fuzz/fizz/match-doc-everywhere.graphql',
        './fuzz/fizz/buzz/match-doc-everywhere.graphql',
        './fuzz/fizz/buzz/fuzzbarbaz/match-doc-everywhere.graphql',
        // schema
        './fuzz/match-schema-everywhere.graphql',
        './fuzz/fizz/match-schema-everywhere.graphql',
        './fuzz/fizz/buzz/match-schema-everywhere.graphql',
        './fuzz/fizz/buzz/fuzzbarbaz/match-schema-everywhere.graphql',
      ],
      shouldNotTriggerBuild: [
        //
        // paths outside of watch directory should be excluded
        '.git/index.lock', // totally unrelated
        'match-watch-everywhere.graphql', // would match pattern if under fuzz
        //
        // pattern matching should work as expected
        './fuzz/bar/something.ts', // unrelated file (non-matching extension)
        './fuzz/some-other-bar/nested/directory/blah.graphql', // no greedy pattern (**/*) to match
        //
        // output files should be excluded
        './fuzz/some-output.ts', // output file (note: should be ignored by parcel anyway)
        //
        // locally negated paths should be excluded even when a local pattern matches them
        './fuzz/bar/never.graphql', // excluded in same document set
        './fuzz/bar/never-watch.graphql', // excluded by local watchPattern, matched by local docs
        './fuzz/some-other-bar/schemas/never-schema.graphql', // excluded by local schema group
        './fuzz/some-other-bar/schemas/never-watch-schema.graphql', // excluded by local watchPattern group
        //
        // globally negated paths should be excluded even when a local pattern matches them
        './fuzz/alphabet/queries/exclude-watch-everywhere.graphql', // included in types-no-sigma.ts, but globaly excluded
        'fuzz/global-beats-local/exclude-watch-everywhere.graphql',
        'fuzz/global-beats-local/exclude-doc-everywhere.graphql',
        'fuzz/global-beats-local/exclude-schema-everywhere.graphql',
      ],
      pathsWouldBeIgnoredByParcelWatcher: [
        // note: expectations should be relative from cwd; assertion helper converts
        //       the values received by parcelWatcher to match before testing them (see typedoc)
        './fuzz/some-output.ts', // output file
        'fuzz/some-output.ts', // output file
      ],
      globsWouldBeIgnoredByParcelWatcher: [
        // note: globs are tested for exact match with argument passed to subscribe options,
        //       so they should be specified relative from watchDirectory, _not_ cwd (see typedoc)
        'some-preset-bar/**/*.generated.tsx', // output of preset
      ],
    });
  });
});
