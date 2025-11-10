import '@graphql-codegen/testing';
import { codegen } from '@graphql-codegen/core';
import { Types } from '@graphql-codegen/plugin-helpers';
import { buildSchema, parse, versionInfo } from 'graphql';
import { plugin, validate } from '../src/index.js';

const SHOULD_THROW_ERROR = 'SHOULD_THROW_ERROR';

describe('Schema AST', () => {
  describe('Validation', () => {
    it('Should enforce graphql extension when its the only plugin', async () => {
      const fileName = 'output.ts';
      const plugins: Types.ConfiguredPlugin[] = [
        {
          'schema-ast': {},
        },
      ];

      try {
        await validate(null, null, null, fileName, plugins);

        throw new Error(SHOULD_THROW_ERROR);
      } catch (e) {
        expect(e.message).not.toBe(SHOULD_THROW_ERROR);
        expect(e.message).toBe('Plugin "schema-ast" requires extension to be ".graphql" or ".gql" or ".graphqls"!');
      }
    });

    it('Should not enforce graphql extension when its not the only plugin', async () => {
      const fileName = 'output.ts';
      const plugins: Types.ConfiguredPlugin[] = [
        {
          add: {},
        },
        {
          'schema-ast': {},
        },
      ];

      try {
        await validate(null, null, null, fileName, plugins);
      } catch {
        expect(true).toBeFalsy();
      }
    });

    it('Should allow .graphql extension when its the only plugin', async () => {
      const fileName = 'output.graphql';
      const plugins: Types.ConfiguredPlugin[] = [
        {
          'schema-ast': {},
        },
      ];

      try {
        await validate(null, null, null, fileName, plugins);
      } catch {
        expect(true).toBeFalsy();
      }
    });

    it('Should allow .gql extension when its the only plugin', async () => {
      const fileName = 'output.gql';
      const plugins: Types.ConfiguredPlugin[] = [
        {
          'schema-ast': {},
        },
      ];

      try {
        await validate(null, null, null, fileName, plugins);
      } catch {
        expect(true).toBeFalsy();
      }
    });

    it('Should allow .graphqls extension when its the only plugin', async () => {
      const fileName = 'output.graphqls';
      const plugins: Types.ConfiguredPlugin[] = [
        {
          'schema-ast': {},
        },
      ];

      try {
        await validate(null, null, null, fileName, plugins);
      } catch {
        expect(true).toBeFalsy();
      }
    });
  });
  describe('Output', () => {
    const typeDefs = /* GraphQL */ `
      directive @modify(limit: Int) on FIELD_DEFINITION

      type Query {
        fieldTest: String @modify(limit: 1)
      }

      schema {
        query: Query
      }
    `;
    const schema = buildSchema(typeDefs);

    it('Should print schema without directives when "includeDirectives" is unset', async () => {
      const content = await plugin(schema, [], { includeDirectives: false });

      expect(content).toBeSimilarStringTo(`
        type Query {
          fieldTest: String
        }
      `);
    });

    it('Should print schema with as """ comment as default', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Query {
          """
          test
          """
          fieldTest: String
        }
      `);
      const content = await plugin(testSchema, [], { includeDirectives: false });

      expect(content).toBeSimilarStringTo(`
        type Query {
          """test"""
          fieldTest: String
        }
      `);
    });

    if (versionInfo.major < 16) {
      it('Should print schema with as # when commentDescriptions=true', async () => {
        const testSchema = buildSchema(/* GraphQL */ `
          type Query {
            """
            test
            """
            fieldTest: String
          }
        `);
        const content = await plugin(testSchema, [], { commentDescriptions: true, includeDirectives: false });

        expect(content).toBeSimilarStringTo(`
        type Query {
          #  test
          fieldTest: String
        }
      `);
      });
    }

    it('Should print schema with directives when "includeDirectives" is set', async () => {
      const content = await plugin(schema, [], { includeDirectives: true });

      expect(content).toBeSimilarStringTo(`
        directive @modify(limit: Int) on FIELD_DEFINITION
      `);
      expect(content).toBeSimilarStringTo(`
        type Query {
          fieldTest: String @modify(limit: 1)
        }
      `);
    });

    it('Should print schema with introspection when "includeIntrospectionTypes" is set', async () => {
      const content = await plugin(schema, [], { includeIntrospectionTypes: true });

      expect(content).toBeSimilarStringTo(`
        type __Schema
      `);

      expect(content).toBeSimilarStringTo(`
        type Query {
          fieldTest: String
          __schema: __Schema!
          __type(name: String!): __Type
        }
      `);
    });

    it('Should print schema without introspection when "includeIntrospectionTypes" is unset', async () => {
      const content = await plugin(schema, [], { includeIntrospectionTypes: false });

      expect(content).not.toBeSimilarStringTo(`
        type __Schema
      `);

      expect(content).toBeSimilarStringTo(`
        type Query {
          fieldTest: String
        }
      `);
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
        filename: 'foo.graphql',
        schema: federatedSchema,
        documents: [],
        plugins: [
          {
            'schema-ast': {},
          },
        ],
        config: {
          federation: true,
        },
        pluginMap: {
          'schema-ast': {
            plugin,
            validate,
          },
        },
      });

      expect(content).not.toContain(`scalar _Any`);
      expect(content).not.toContain(`union _Entity`);
      expect(content).not.toContain(`type _Service`);

      expect(content).toBeSimilarStringTo(`
        type Character {
          id: ID
          name: String
        }

        type Jedi {
          id: ID
          side: String
        }

        type Droid {
          id: ID
          model: String
        }

        union People = Character | Jedi | Droid

        type Query {
          allPeople: [People]
        }
      `);
    });
  });
});
