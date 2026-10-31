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

  describe('schema and documents returned by a stage', () => {
    const producer = './tests/custom-plugins/stage-transform-producer.js';
    const producerAlt = './tests/custom-plugins/stage-transform-producer-alt.js';
    const consumer = './tests/custom-plugins/stage-transform-consumer.js';
    const LOADED_TYPES = 'Boolean,MyType,Query,String';

    it('Should forward a returned schema to the next stage', async () => {
      const { result, error } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          'out.ts': [{ plugins: [{ [producer]: { addType: 'Added' } }] }, { plugins: [consumer] }],
        },
      });

      expect(error).toBeNull();
      expect(result[0].content).toBe(
        `// PRODUCER: Added \n// CONSUMER: types=Added,Boolean,ID,MyType,Query,String documents=`,
      );
    });

    it('Should forward returned documents to the next stage', async () => {
      const { result, error } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          'out.ts': [
            { plugins: [{ [producer]: { addDocument: 'Added' } }] },
            { plugins: [consumer] },
          ],
        },
      });

      expect(error).toBeNull();
      expect(result[0].content).toBe(
        `// PRODUCER:  Added\n// CONSUMER: types=${LOADED_TYPES} documents=Added.graphql`,
      );
    });

    it('Should pass the schema and documents through a stage that returns neither', async () => {
      const { result, error } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          'out.ts': [
            { plugins: [{ [producer]: { addType: 'Added', addDocument: 'Added' } }] },
            { plugins: [{ add: { content: '// MIDDLE' } }] },
            { plugins: [consumer] },
          ],
        },
      });

      expect(error).toBeNull();
      expect(result[0].content).toBe(
        '// PRODUCER: Added Added\n// MIDDLE\n// CONSUMER: types=Added,Boolean,ID,MyType,Query,String documents=Added.graphql',
      );
    });

    it('Should give the first stage, and other plugins of the returning stage, the loaded schema and documents', async () => {
      const { result, error } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        documents: 'query Loaded { f }',
        generates: {
          'out.ts': [
            { plugins: [consumer, { [producer]: { addType: 'Added', addDocument: 'Added' } }] },
            { plugins: [consumer] },
          ],
        },
      });

      expect(error).toBeNull();
      const [firstStageConsumer, , secondStageConsumer] = result[0].content.split('\n');
      expect(firstStageConsumer).toMatch(
        new RegExp(`^// CONSUMER: types=${LOADED_TYPES} documents=[^,]+$`),
      );
      expect(secondStageConsumer).toMatch(
        /^\/\/ CONSUMER: types=Added,Boolean,ID,MyType,Query,String documents=[^,]+,Added\.graphql$/,
      );
    });

    it('Should use what the plugin listed last returns when several plugins of a stage return it', async () => {
      const { result, error } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          'out.ts': [
            {
              plugins: [
                // finishes last, but is listed first
                { [producer]: { addType: 'First', addDocument: 'First', delay: 20 } },
                { [producerAlt]: { addType: 'Last', addDocument: 'Last' } },
              ],
            },
            { plugins: [consumer] },
          ],
        },
      });

      expect(error).toBeNull();
      expect(result[0].content).toContain(
        '// CONSUMER: types=Boolean,ID,Last,MyType,Query,String documents=Last.graphql',
      );
    });
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
