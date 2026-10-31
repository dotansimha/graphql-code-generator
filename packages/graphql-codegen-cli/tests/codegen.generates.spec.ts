import '@graphql-codegen/testing';
import { executeCodegen } from '../src/index.js';
import { getLogger } from '../src/utils/logger.js';

const SIMPLE_TEST_SCHEMA = `type MyType { f: String } type Query { f: String }`;

describe('Array `generates` value', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(getLogger(), 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('Should use the only element and not warn', async () => {
    const { result } = await executeCodegen({
      schema: SIMPLE_TEST_SCHEMA,
      generates: {
        'out.ts': [{ plugins: ['typescript'] }],
      },
    });

    expect(result.length).toBe(1);
    expect(result[0].filename).toBe('out.ts');
    expect(result[0].content).toContain('export type MyType');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('Should run multiple elements as stages in order, appending to the same file, without warning', async () => {
    const { result } = await executeCodegen({
      schema: SIMPLE_TEST_SCHEMA,
      generates: {
        'out.ts': [
          { plugins: [{ add: { content: '// FIRST_ELEMENT' } }] },
          { plugins: [{ add: { content: '// SECOND_ELEMENT' } }] },
        ],
        'out2.ts': [
          { plugins: [{ add: { content: '// THIRD_ELEMENT' } }] },
          { plugins: [{ add: { content: '// FOURTH_ELEMENT' } }] },
        ],
      },
    });

    expect(result.length).toBe(2);
    expect(result[0].filename).toBe('out.ts');
    expect(result[0].content).toBe('// FIRST_ELEMENT\n// SECOND_ELEMENT');
    expect(result[1].filename).toBe('out2.ts');
    expect(result[1].content).toBe('// THIRD_ELEMENT\n// FOURTH_ELEMENT');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('Should hand plugin meta from a stage to the next stage, keyed by plugin name', async () => {
    const producer = './tests/custom-plugins/stage-meta-producer.js';
    const { result, error } = await executeCodegen({
      schema: SIMPLE_TEST_SCHEMA,
      generates: {
        'out.ts': [
          { plugins: [producer] },
          {
            plugins: [
              { './tests/custom-plugins/stage-meta-consumer.js': { fromPlugin: producer } },
            ],
          },
        ],
      },
    });

    expect(error).toBeNull();
    expect(result.length).toBe(1);
    expect(result[0].content).toBe('// STAGE_ONE\n// STAGE_TWO: Boolean,MyType,Query,String');
  });

  it('Should not hand meta to the first stage', async () => {
    const { result } = await executeCodegen({
      schema: SIMPLE_TEST_SCHEMA,
      generates: {
        'out.ts': [
          {
            plugins: [
              {
                './tests/custom-plugins/stage-meta-consumer.js': {
                  fromPlugin: './tests/custom-plugins/stage-meta-producer.js',
                },
              },
            ],
          },
        ],
      },
    });

    expect(result[0].content).toBe('// STAGE_TWO: ');
  });

  it('Should throw when an element uses a preset and there are multiple elements', async () => {
    await expect(
      executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          'out/': [
            { preset: 'client', plugins: [] },
            { plugins: [{ add: { content: '// SECOND_ELEMENT' } }] },
          ],
        },
      }),
    ).rejects.toThrow('Presets are not supported yet');
  });

  it('Should throw when the array is empty', async () => {
    await expect(
      executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          'out.ts': [],
        },
      }),
    ).rejects.toThrow('Invalid Codegen Configuration!');
  });

  it('Should throw when an element is not a config object (old plugin list shape)', async () => {
    await expect(
      executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          // Not type-valid, but possible from YAML or JS configs
          'out.ts': ['typescript'] as any,
        },
      }),
    ).rejects.toThrow('Invalid Codegen Configuration!');
  });
});
