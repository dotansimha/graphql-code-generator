import 'graphql-codegen-plugin-helpers/dist/testing';
import { buildASTSchema } from 'graphql';
import gql from 'graphql-tag';
import { plugin, validate } from '../dist';

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
              name: 'Character'
            },
            {
              name: 'Jedi'
            },
            {
              name: 'Droid'
            }
          ]
        }
      ]
    }
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
        {},
        {
          outputFile: 'foo.json'
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
        {},
        {
          outputFile: 'foo.js'
        }
      );
      const jsxContent = await plugin(
        schema,
        [],
        {},
        {
          outputFile: 'foo.jsx'
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
          module: 'commonjs'
        },
        {
          outputFile: 'foo.js'
        }
      );
      const jsxContent = await plugin(
        schema,
        [],
        {
          module: 'commonjs'
        },
        {
          outputFile: 'foo.jsx'
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
        {},
        {
          outputFile: 'foo.ts'
        }
      );
      const tsxContent = await plugin(
        schema,
        [],
        {},
        {
          outputFile: 'foo.tsx'
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

    it('should use es2015 even though commonjs is requested', async () => {
      const tsContent = await plugin(
        schema,
        [],
        {
          module: 'commonjs'
        },
        {
          outputFile: 'foo.ts'
        }
      );
      const tsxContent = await plugin(
        schema,
        [],
        {
          module: 'commonjs'
        },
        {
          outputFile: 'foo.tsx'
        }
      );
      const output = `
        export default result;
      `;

      expect(tsContent).toBeSimilarStringTo(output);
      expect(tsxContent).toBeSimilarStringTo(output);
    });
  });
});
