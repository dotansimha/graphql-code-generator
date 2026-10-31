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

  describe('`pluginContext.output` shared by the stages', () => {
    const producer = './tests/custom-plugins/stage-meta-producer.js';
    const consumer = './tests/custom-plugins/stage-meta-consumer.js';
    const readConsumerOutput = (content: string): unknown =>
      JSON.parse(content.split('// CONSUMER: ')[1].split('\n')[0]);

    it('Should give a later stage the files and merged meta of earlier stages', async () => {
      const { result, error } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          'out.ts': [
            {
              plugins: [
                {
                  [producer]: {
                    content: '// ONE',
                    prepend: ['import a from "a";'],
                    append: ['// END_ONE'],
                    meta: { typeNames: ['User'], files: 'not files' },
                  },
                },
              ],
            },
            { plugins: [consumer] },
          ],
        },
      });

      expect(error).toBeNull();
      expect(readConsumerOutput(result[0].content)).toEqual({
        files: {
          'out.ts': { content: '// ONE', prepend: ['import a from "a";'], append: ['// END_ONE'] },
        },
        typeNames: ['User'],
      });
    });

    it('Should give the first stage empty files', async () => {
      const { result, error } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          'out.ts': [{ plugins: [consumer] }, { plugins: [{ add: { content: '// TWO' } }] }],
        },
      });

      expect(error).toBeNull();
      expect(readConsumerOutput(result[0].content)).toEqual({ files: {} });
    });

    it('Should let the meta of a later stage win on a collision', async () => {
      const { result, error } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          'out.ts': [
            { plugins: [{ [producer]: { content: '// ONE', meta: { a: 1, b: 1 } } }] },
            { plugins: [{ [producer]: { content: '// TWO', meta: { b: 2 } } }] },
            { plugins: [consumer] },
          ],
        },
      });

      expect(error).toBeNull();
      expect(readConsumerOutput(result[0].content)).toMatchObject({
        files: { 'out.ts': { content: '// ONE\n// TWO' } },
        a: 1,
        b: 2,
      });
    });

    it('Should write the prepend lines of all stages, then their content in order, then their append lines', async () => {
      const { result, error } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          'out.ts': [
            {
              plugins: [
                {
                  [producer]: {
                    content: '// ONE',
                    prepend: ['// HEADER'],
                    append: ['// END_ONE'],
                  },
                },
              ],
            },
            {
              plugins: [
                {
                  [producer]: {
                    content: '// TWO',
                    prepend: ['import b from "b";', '// HEADER'],
                    append: ['// END_TWO'],
                  },
                },
              ],
            },
          ],
        },
      });

      expect(error).toBeNull();
      expect(result[0].content).toBe(
        '// HEADER\nimport b from "b";\n// ONE\n// TWO\n// END_ONE\n// END_TWO',
      );
    });

    it('Should write a single stage as before, and not give it `output`', async () => {
      const { result, error } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          'out.ts': {
            plugins: [
              {
                [producer]: {
                  content: '// ONE',
                  prepend: ['import a from "a";', '// HEADER'],
                  append: ['// END'],
                },
              },
              consumer,
            ],
          },
        },
      });

      expect(error).toBeNull();
      expect(result[0].content).toBe(
        '// HEADER\nimport a from "a";\n// ONE\n// CONSUMER: undefined\n// END',
      );
    });
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

    it('Should not forward a schema returned as `schemaAst`', async () => {
      const { result, error } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          'out.ts': [
            { plugins: [{ [producer]: { addType: 'Added', returnSchemaAst: true } }] },
            { plugins: [consumer] },
          ],
        },
      });

      expect(error).toBeNull();
      expect(result[0].content).toBe(
        `// PRODUCER: Added \n// CONSUMER: types=${LOADED_TYPES} documents=`,
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
      // `add` puts its content in `prepend` by default, so it comes before the content of all stages
      expect(result[0].content).toBe(
        '// MIDDLE\n// PRODUCER: Added Added\n// CONSUMER: types=Added,Boolean,ID,MyType,Query,String documents=Added.graphql',
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
