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

  it('Should use the first element and warn once when there are multiple elements', async () => {
    const { result } = await executeCodegen({
      schema: SIMPLE_TEST_SCHEMA,
      generates: {
        'out.ts': [
          { plugins: ['typescript'] },
          { plugins: [{ add: { content: '// SECOND_ELEMENT' } }] },
        ],
      },
    });

    expect(result.length).toBe(1);
    expect(result[0].content).toContain('export type MyType');
    expect(result[0].content).not.toContain('SECOND_ELEMENT');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      'Multiple generates config detected. Only the first one is used.',
    );
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
