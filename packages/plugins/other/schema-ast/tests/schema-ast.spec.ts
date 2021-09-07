import { validate, plugin, transformSchemaAST } from '../src/index';
import { buildSchema, parse } from 'graphql';
import '@graphql-codegen/testing';
import { Types } from '@graphql-codegen/plugin-helpers';

import { codegen } from '@graphql-codegen/core';

const SHOULD_THROW_ERROR = 'SHOULD_THROW_ERROR';

describe('Schema AST', () => {
  describe('Issues', () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        d: String
        z: String
        a: String
      }

      type User {
        aa: String
        a: String
      }

      type A {
        s: String
        b: String
      }
    `);

    it('#4919 - should support sorting the schema', async () => {
      const content = await plugin(schema, [], { sort: true });
      expect(content).toBeSimilarStringTo(`
      type A {
        b: String
        s: String
      }
      
      type Query {
        a: String
        d: String
        z: String
      }
      
      type User {
        a: String
        aa: String
      }`);
    });

    it('#6624 - transformSchemaAST should support sorting the schema', () => {
      expect(JSON.stringify(transformSchemaAST(schema, { sort: true }))).toBeSimilarStringTo(
        `{"schema":{"extensionASTNodes":[],"_queryType":"Query","_directives":["@deprecated","@include","@skip","@specifiedBy"],"_typeMap":{"A":"A","Boolean":"Boolean","Query":"Query","String":"String","User":"User","__Directive":"__Directive","__DirectiveLocation":"__DirectiveLocation","__EnumValue":"__EnumValue","__Field":"__Field","__InputValue":"__InputValue","__Schema":"__Schema","__Type":"__Type","__TypeKind":"__TypeKind"},"_subTypeMap":{},"_implementationsMap":{}},"ast":{"kind":"Document","definitions":[{"kind":"SchemaDefinition","operationTypes":[{"kind":"OperationTypeDefinition","operation":"query","type":{"kind":"NamedType","name":{"kind":"Name","value":"Query"}}}],"directives":[]},{"kind":"ObjectTypeDefinition","name":{"kind":"Name","value":"A"},"fields":[{"kind":"FieldDefinition","name":{"kind":"Name","value":"b"},"arguments":[],"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"directives":[]},{"kind":"FieldDefinition","name":{"kind":"Name","value":"s"},"arguments":[],"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"directives":[]}],"interfaces":[],"directives":[]},{"kind":"ObjectTypeDefinition","name":{"kind":"Name","value":"Query"},"fields":[{"kind":"FieldDefinition","name":{"kind":"Name","value":"a"},"arguments":[],"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"directives":[]},{"kind":"FieldDefinition","name":{"kind":"Name","value":"d"},"arguments":[],"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"directives":[]},{"kind":"FieldDefinition","name":{"kind":"Name","value":"z"},"arguments":[],"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"directives":[]}],"interfaces":[],"directives":[]},{"kind":"ObjectTypeDefinition","name":{"kind":"Name","value":"User"},"fields":[{"kind":"FieldDefinition","name":{"kind":"Name","value":"a"},"arguments":[],"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"directives":[]},{"kind":"FieldDefinition","name":{"kind":"Name","value":"aa"},"arguments":[],"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"directives":[]}],"interfaces":[],"directives":[]}]}}`
      );
      expect(JSON.stringify(transformSchemaAST(schema, { sort: false }))).toBeSimilarStringTo(
        `{"schema":{"extensionASTNodes":[],"_queryType":"Query","_directives":["@include","@skip","@deprecated","@specifiedBy"],"_typeMap":{"Query":"Query","String":"String","User":"User","A":"A","Boolean":"Boolean","__Schema":"__Schema","__Type":"__Type","__TypeKind":"__TypeKind","__Field":"__Field","__InputValue":"__InputValue","__EnumValue":"__EnumValue","__Directive":"__Directive","__DirectiveLocation":"__DirectiveLocation"},"_subTypeMap":{},"_implementationsMap":{}},"ast":{"kind":"Document","definitions":[{"kind":"SchemaDefinition","operationTypes":[{"kind":"OperationTypeDefinition","operation":"query","type":{"kind":"NamedType","name":{"kind":"Name","value":"Query"}}}],"directives":[]},{"kind":"ObjectTypeDefinition","name":{"kind":"Name","value":"Query"},"fields":[{"kind":"FieldDefinition","name":{"kind":"Name","value":"d"},"arguments":[],"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"directives":[]},{"kind":"FieldDefinition","name":{"kind":"Name","value":"z"},"arguments":[],"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"directives":[]},{"kind":"FieldDefinition","name":{"kind":"Name","value":"a"},"arguments":[],"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"directives":[]}],"interfaces":[],"directives":[]},{"kind":"ObjectTypeDefinition","name":{"kind":"Name","value":"User"},"fields":[{"kind":"FieldDefinition","name":{"kind":"Name","value":"aa"},"arguments":[],"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"directives":[]},{"kind":"FieldDefinition","name":{"kind":"Name","value":"a"},"arguments":[],"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"directives":[]}],"interfaces":[],"directives":[]},{"kind":"ObjectTypeDefinition","name":{"kind":"Name","value":"A"},"fields":[{"kind":"FieldDefinition","name":{"kind":"Name","value":"s"},"arguments":[],"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"directives":[]},{"kind":"FieldDefinition","name":{"kind":"Name","value":"b"},"arguments":[],"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"directives":[]}],"interfaces":[],"directives":[]}]}}`
      );
    });
  });
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
        expect(e.message).toBe('Plugin "schema-ast" requires extension to be ".graphql"!');
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
      } catch (e) {
        expect(true).toBeFalsy();
      }
    });

    it('Should allow graphql extension when its the only plugin', async () => {
      const fileName = 'output.graphql';
      const plugins: Types.ConfiguredPlugin[] = [
        {
          'schema-ast': {},
        },
      ];

      try {
        await validate(null, null, null, fileName, plugins);
      } catch (e) {
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
