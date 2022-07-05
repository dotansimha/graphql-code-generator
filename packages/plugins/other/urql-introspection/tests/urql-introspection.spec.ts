import '@graphql-codegen/testing';
import { getIntrospectedSchema, minifyIntrospectionQuery } from '@urql/introspection';

import { buildSchema } from 'graphql';

import { plugin, validate } from '../src/index.js';

const schema = buildSchema(`
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
const introspection = JSON.stringify(minifyIntrospectionQuery(getIntrospectedSchema(schema)), null, 2);

describe('Urql Introspection Plugin', () => {
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

    it('should throw on useTypeImports + not ts env', async () => {
      const extensions = ['.json', '.js', '.jsx'];
      const allCases = extensions.concat(extensions.map(val => val.toUpperCase()));

      try {
        await Promise.all(allCases.map(ext => validate(schema, [], { useTypeImports: true }, `foo${ext}`, [])));

        throw new Error('DONE');
      } catch (e) {
        expect(e.message).not.toEqual('DONE');
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
        {},
        {
          outputFile: 'foo.js',
        }
      );
      const jsxContent = await plugin(
        schema,
        [],
        {},
        {
          outputFile: 'foo.jsx',
        }
      );
      const output = `export default ${introspection}`;

      expect(jsContent).toBeSimilarStringTo(output);
      expect(jsxContent).toBeSimilarStringTo(output);
    });

    it('should be able to use commonjs', async () => {
      const jsContent = await plugin(
        schema,
        [],
        {
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
        {},
        {
          outputFile: 'foo.ts',
        }
      );
      const tsxContent = await plugin(
        schema,
        [],
        {},
        {
          outputFile: 'foo.tsx',
        }
      );
      const output = `import { IntrospectionQuery } from 'graphql';
export default ${introspection} as unknown as IntrospectionQuery;`;

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
      const output = `import { IntrospectionQuery } from 'graphql';
export default ${introspection} as unknown as IntrospectionQuery;`;

      expect(tsContent).toBeSimilarStringTo(output);
      expect(tsxContent).toBeSimilarStringTo(output);
    });

    it('should emit type imports if useTypeImports config value is used', async () => {
      const tsContent = await plugin(
        schema,
        [],
        {
          useTypeImports: true,
        },
        {
          outputFile: 'foo.ts',
        }
      );
      const tsxContent = await plugin(
        schema,
        [],
        {
          useTypeImports: true,
        },
        {
          outputFile: 'foo.tsx',
        }
      );
      const output = `import type { IntrospectionQuery } from 'graphql';
export default ${introspection} as unknown as IntrospectionQuery;`;

      expect(tsContent).toBeSimilarStringTo(output);
      expect(tsxContent).toBeSimilarStringTo(output);
    });

    it('Should emit scalars if includeScalars config value is used', async () => {
      const schema = buildSchema(`
        scalar MyScalar
        type Query {
          myScalar: MyScalar
        }
      `);
      const result = await plugin(schema, [], { includeScalars: true }, { outputFile: 'foo.ts' });

      expect(result).toContain('MyScalar');
    });

    it('Should emit directives if includeDirectives config value is used', async () => {
      const schema = buildSchema(`
        directive @myDirective on FIELD_DEFINITION

        type Query {
          foo: Int @myDirective
        }
      `);
      const result = await plugin(schema, [], { includeDirectives: true }, { outputFile: 'foo.ts' });

      expect(result).toContain('myDirective');
    });

    it('Should emit enums if includeEnums config value is used', async () => {
      const schema = buildSchema(`
        enum MyEnum {
          FOO
        }

        type Query {
          myEnum: MyEnum
        }
      `);
      const result = await plugin(schema, [], { includeEnums: true }, { outputFile: 'foo.ts' });

      expect(result).toContain('MyEnum');
    });

    it('Should emit inputs if includeInputs config value is used', async () => {
      const schema = buildSchema(`
        input MyInput {
          foo: Int
        }

        type Query {
          foo(myInput: MyInput): Int
        }
      `);
      const result = await plugin(schema, [], { includeInputs: true }, { outputFile: 'foo.ts' });

      expect(result).toContain('MyInput');
    });
  });
});
