import { codegen } from '@graphql-codegen/core';
import { buildSchema, introspectionFromSchema, IntrospectionObjectType, IntrospectionQuery, parse } from 'graphql';
import { plugin } from '../src/index.js';

describe('Introspection template', () => {
  it('should output a JSON file', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        fieldTest: String
      }

      schema {
        query: Query
      }
    `);

    const content = await plugin(schema, [], {}, { outputFile: '' });
    const introspection = JSON.stringify(
      introspectionFromSchema(schema, { descriptions: true, schemaDescription: false, specifiedByUrl: false }),
      null,
      2
    );
    expect(introspection).toEqual(content);
  });

  it('should output a JSON file minified', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        fieldTest: String
      }

      schema {
        query: Query
      }
    `);

    const content = await plugin(schema, [], { minify: true }, { outputFile: '' });
    const introspection = JSON.stringify(
      introspectionFromSchema(schema, { descriptions: true, schemaDescription: false, specifiedByUrl: false })
    );
    expect(introspection).toEqual(content);
  });

  it('should support Apollo Federation', async () => {
    const schema = parse(/* GraphQL */ `
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
      schema,
      documents: [],
      plugins: [
        {
          introspection: {},
        },
      ],
      config: {
        federation: true,
      },
      pluginMap: {
        introspection: {
          plugin,
        },
      },
    });

    const introspection: IntrospectionQuery = JSON.parse(content);
    const { types } = introspection.__schema;
    const queryType = types.find(
      type => type.name === introspection.__schema.queryType.name
    ) as IntrospectionObjectType;

    // scalar _Any
    expect(types.some(type => type.name === '_Any')).toBe(false);
    // union _Entity
    expect(types.some(type => type.name === '_Entity')).toBe(false);
    // type _Service
    expect(types.some(type => type.name === '_Service')).toBe(false);
    // type Query { _entities, _service }
    expect(queryType.fields.some(f => f.name === '_entities')).toBe(false);
    expect(queryType.fields.some(f => f.name === '_service')).toBe(false);
  });
});
