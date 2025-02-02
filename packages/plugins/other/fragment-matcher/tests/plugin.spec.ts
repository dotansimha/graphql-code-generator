import '@graphql-codegen/testing';
import { codegen } from '@graphql-codegen/core';
import { buildASTSchema, parse } from 'graphql';
import gql from 'graphql-tag';
import { plugin, validate } from '../src/index.js';

const schema = buildASTSchema(gql`
  type Character {
    name: String
  }

  type Jedi {
    side: String
  }

  type Droid {
    model: String
  }

  union People = Character | Jedi | Droid

  type Query {
    allPeople: [People]
  }
`);

// should only contain Unions and Interfaces
const introspection = JSON.stringify(
  {
    __schema: {
      types: [
        {
          kind: 'UNION',
          name: 'People',
          possibleTypes: [
            {
              name: 'Character',
            },
            {
              name: 'Jedi',
            },
            {
              name: 'Droid',
            },
          ],
        },
      ],
    },
  },
  null,
  2
);

const apolloClient3Result = JSON.stringify(
  {
    possibleTypes: {
      People: ['Character', 'Jedi', 'Droid'],
    },
  },
  null,
  2
);

describe('Fragment Matcher Plugin', () => {
  describe('validate', () => {
    it('should not throw on tsx?, jsx?, json files, both in lower and upper case', async () => {
      const extensions = ['.json', '.js', '.jsx', '.ts', '.tsx'];
      const allCases = extensions.concat(extensions.map(val => val.toUpperCase()));

      try {
        await Promise.all(allCases.map(ext => validate(schema, [], {}, `foo${ext}`, [])));

        throw new Error('DONE');
      } catch (e) {
        expect(e.message).toEqual('DONE');
      }
    });

    it('should throw on commonjs + ts', async () => {
      try {
        await validate(schema, [], { module: 'commonjs' }, 'foo.ts', []);

        throw new Error('SHOULD_NOT_BE_HERE');
      } catch (e) {
        expect(e.message).toContain('commonjs');
      }
    });

    it('should throw on unsupported extension', async () => {
      try {
        await validate(schema, [], {}, 'foo.yml', []);

        throw new Error('SHOULD_NOT_BE_HERE');
      } catch (e) {
        expect(e.message).toContain('extension');
      }
    });
  });
  describe('JSON', () => {
    it('should stringify the result', async () => {
      const content = await plugin(
        schema,
        [],
        {
          apolloClientVersion: 2,
        },
        {
          outputFile: 'foo.json',
        }
      );

      expect(content).toEqual(introspection);
    });
  });

  describe('JavaScript', () => {
    it('should use es2015 module by default', async () => {
      const jsContent = await plugin(
        schema,
        [],
        {
          apolloClientVersion: 2,
        },
        {
          outputFile: 'foo.js',
        }
      );
      const jsxContent = await plugin(
        schema,
        [],
        {
          apolloClientVersion: 2,
        },
        {
          outputFile: 'foo.jsx',
        }
      );
      const output = `
        export default ${introspection}
      `;

      expect(jsContent).toBeSimilarStringTo(output);
      expect(jsxContent).toBeSimilarStringTo(output);
    });

    it('should be able to use commonjs', async () => {
      const jsContent = await plugin(
        schema,
        [],
        {
          apolloClientVersion: 2,
          module: 'commonjs',
        },
        {
          outputFile: 'foo.js',
        }
      );
      const jsxContent = await plugin(
        schema,
        [],
        {
          apolloClientVersion: 2,
          module: 'commonjs',
        },
        {
          outputFile: 'foo.jsx',
        }
      );
      const output = `
        module.exports = ${introspection}
      `;

      expect(jsContent).toBeSimilarStringTo(output);
      expect(jsxContent).toBeSimilarStringTo(output);
    });
  });

  describe('TypeScript', () => {
    it('should use es2015 module by default', async () => {
      const tsContent = await plugin(
        schema,
        [],
        {
          apolloClientVersion: 2,
        },
        {
          outputFile: 'foo.ts',
        }
      );
      const tsxContent = await plugin(
        schema,
        [],
        {
          apolloClientVersion: 2,
        },
        {
          outputFile: 'foo.tsx',
        }
      );
      const output = `
        export interface IntrospectionResultData {
          __schema: {
            types: {
              kind: string;
              name: string;
              possibleTypes: {
                name: string;
              }[];
            }[];
          };
        }
        const result: IntrospectionResultData = ${introspection};
        export default result;
      `;

      expect(tsContent).toBeSimilarStringTo(output);
      expect(tsxContent).toBeSimilarStringTo(output);
    });

    it('should use es2015 module by default - apollo client 3', async () => {
      const tsContent = await plugin(
        schema,
        [],
        {
          apolloClientVersion: 3,
        },
        {
          outputFile: 'foo.ts',
        }
      );
      const tsxContent = await plugin(
        schema,
        [],
        {
          apolloClientVersion: 3,
        },
        {
          outputFile: 'foo.tsx',
        }
      );
      const output = `
      export interface PossibleTypesResultData {
        possibleTypes: {
          [key: string]: string[]
        }
      }

        const result: PossibleTypesResultData = ${apolloClient3Result};

        export default result;
      `;

      expect(tsContent).toBeSimilarStringTo(output);
      expect(tsxContent).toBeSimilarStringTo(output);
    });

    it('should use es2015 even though commonjs is requested', async () => {
      const tsContent = await plugin(
        schema,
        [],
        {
          module: 'commonjs',
        },
        {
          outputFile: 'foo.ts',
        }
      );
      const tsxContent = await plugin(
        schema,
        [],
        {
          module: 'commonjs',
        },
        {
          outputFile: 'foo.tsx',
        }
      );
      const output = `
        export default result;
      `;

      expect(tsContent).toBeSimilarStringTo(output);
      expect(tsxContent).toBeSimilarStringTo(output);
    });

    it('should support exportAsConst for apolloClientVersion 2', async () => {
      const tsContent = await plugin(
        schema,
        [],
        {
          apolloClientVersion: 2,
          useExplicitTyping: true,
        },
        {
          outputFile: 'foo.ts',
        }
      );
      const tsxContent = await plugin(
        schema,
        [],
        {
          apolloClientVersion: 2,
          useExplicitTyping: true,
        },
        {
          outputFile: 'foo.tsx',
        }
      );
      const output = `
        export type IntrospectionResultData = ${introspection};
        const result: IntrospectionResultData = ${introspection};
        export default result;
      `;

      expect(tsContent).toBeSimilarStringTo(output);
      expect(tsxContent).toBeSimilarStringTo(output);
    });

    it('should support useExplicitTyping for apolloClientVersion 3', async () => {
      const tsContent = await plugin(
        schema,
        [],
        {
          apolloClientVersion: 3,
          useExplicitTyping: true,
        },
        {
          outputFile: 'foo.ts',
        }
      );
      const tsxContent = await plugin(
        schema,
        [],
        {
          apolloClientVersion: 3,
          useExplicitTyping: true,
        },
        {
          outputFile: 'foo.tsx',
        }
      );
      const output = `
        export type PossibleTypesResultData = ${apolloClient3Result};
        const result: PossibleTypesResultData = ${apolloClient3Result};
        export default result;
      `;

      expect(tsContent).toBeSimilarStringTo(output);
      expect(tsxContent).toBeSimilarStringTo(output);
    });
  });

  it('should support Apollo Federation', async () => {
    const federatedSchema = parse(/* GraphQL */ `
      type Character @key(fields: "id") {
        id: ID
        name: String
      }

      type Jedi @key(fields: "id") {
        id: ID
        side: String
      }

      type Droid @key(fields: "id") {
        id: ID
        model: String
      }

      union People = Character | Jedi | Droid

      type Query {
        allPeople: [People]
      }
    `);
    const content = await codegen({
      filename: 'foo.json',
      schema: federatedSchema,
      documents: [],
      plugins: [
        {
          'fragment-matcher': {},
        },
      ],
      config: {
        federation: true,
        apolloClientVersion: 2,
      },
      pluginMap: {
        'fragment-matcher': {
          plugin,
          validate,
        },
      },
    });

    expect(content).toEqual(introspection);
  });
  it('should support Apollo Federation with predefined directive definitions', async () => {
    const federatedSchema = parse(/* GraphQL */ `
      directive @key(fields: String!) on FIELD_DEFINITION

      type Character @key(fields: "id") {
        id: ID
        name: String
      }

      type Jedi @key(fields: "id") {
        id: ID
        side: String
      }

      type Droid @key(fields: "id") {
        id: ID
        model: String
      }

      union People = Character | Jedi | Droid

      type Query {
        allPeople: [People]
      }
    `);
    const content = await codegen({
      filename: 'foo.json',
      schema: federatedSchema,
      documents: [],
      plugins: [
        {
          'fragment-matcher': {},
        },
      ],
      config: {
        apolloClientVersion: 2,
        federation: true,
      },
      pluginMap: {
        'fragment-matcher': {
          plugin,
          validate,
        },
      },
    });

    expect(content).toEqual(introspection);
  });
  it('should create the result deterministically when configured to', async () => {
    const complexSchema = buildASTSchema(gql`
      type Droid {
        model: String
      }

      type Character {
        name: String
      }

      type Jedi {
        side: String
      }

      union People = Jedi | Droid | Character
      union People2 = Droid | Jedi | Character

      type Query {
        allPeople: [People]
      }
    `);

    const reorderedComplexSchema = buildASTSchema(gql`
      type Droid {
        model: String
      }

      type Character {
        name: String
      }

      type Jedi {
        side: String
      }

      union People2 = Droid | Jedi | Character
      union People = Jedi | Droid | Character

      type Query {
        allPeople: [People]
      }
    `);

    const contentA = await plugin(
      complexSchema,
      [],
      {
        apolloClientVersion: 2,
        deterministic: true,
      },
      {
        outputFile: 'foo.json',
      }
    );
    const contentB = await plugin(
      reorderedComplexSchema,
      [],
      {
        apolloClientVersion: 2,
        deterministic: true,
      },
      {
        outputFile: 'foo.json',
      }
    );

    expect(contentA).toEqual(contentB);
  });
});
