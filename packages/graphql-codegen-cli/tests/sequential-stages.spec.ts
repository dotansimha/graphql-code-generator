import { executeCodegen } from '../src/index.js';

/**
 * PoC for https://github.com/dotansimha/graphql-code-generator/issues/10943
 * ("RFC: Sequential Execution & Output Hand-off Between GraphQL Codegen Plugins/Presets"),
 * exercising Option 1 ("Sequential Stages"): a `generates` entry can be an array of
 * `{ plugins }` stage objects that run in order (instead of the plugins-within-a-stage
 * parallel execution) against the same output path, with each stage's plugin(s) able to
 * hand `meta` off to the next stage via `pluginContext.previousStageMeta`.
 */
const SIMPLE_TEST_SCHEMA = `type MyType { f: String } type Query { f: String }`;

describe('Sequential Stages (PoC for issue #10943, Option 1)', () => {
  it('runs stages in order and concatenates their content into one output', async () => {
    const { result, error } = await executeCodegen({
      schema: SIMPLE_TEST_SCHEMA,
      generates: {
        'out1.ts': [
          { plugins: ['./tests/custom-plugins/sequential-stage-1.js'] },
          { plugins: ['./tests/custom-plugins/sequential-stage-2.js'] },
        ],
      },
    });

    expect(error).toBeNull();
    expect(result.length).toBe(1);
    expect(result[0].filename).toBe('out1.ts');

    const content = result[0].content;
    expect(content).toContain('Stage 1');
    expect(content).toContain('Stage 2');
    // Stage 1's content comes before stage 2's - they ran in order, not in parallel.
    expect(content.indexOf('Stage 1')).toBeLessThan(content.indexOf('Stage 2'));
  });

  it('hands off `meta` from an earlier stage to a later stage via pluginContext.previousStageMeta', async () => {
    const { result, error } = await executeCodegen({
      schema: SIMPLE_TEST_SCHEMA,
      generates: {
        'out1.ts': [
          { plugins: ['./tests/custom-plugins/sequential-stage-1.js'] },
          { plugins: ['./tests/custom-plugins/sequential-stage-2.js'] },
        ],
      },
    });

    expect(error).toBeNull();
    // Stage 2 didn't hardcode `Foo, Bar` - it read it from stage 1's `meta`.
    expect(result[0].content).toContain(
      '// Stage 2 (typescript-resolvers-like): received typeNames from stage 1 -> [Foo, Bar]',
    );
  });

  it('still runs a single-stage (non-array) `generates` entry as before', async () => {
    const { result, error } = await executeCodegen({
      schema: SIMPLE_TEST_SCHEMA,
      generates: {
        'out1.ts': { plugins: ['./tests/custom-plugins/sequential-stage-1.js'] },
      },
    });

    expect(error).toBeNull();
    expect(result[0].content).toContain('Stage 1');
  });
});
