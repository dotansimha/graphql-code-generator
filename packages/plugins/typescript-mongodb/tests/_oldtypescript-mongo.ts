import 'graphql-codegen-testing';
import { SchemaTemplateContext, schemaToTemplateContext } from 'graphql-codegen-core';
import { entityFields } from '../src/helpers/entity-fields';
import { addToSchema, plugin } from '../src';
import { pascalCase } from 'change-case';
import { print, GraphQLSchema } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';

describe('Types', () => {
  const compileAndBuildContext = (typeDefs: string): { context: SchemaTemplateContext; schema: GraphQLSchema } => {
    const schema = makeExecutableSchema({
      typeDefs: `
          ${print(addToSchema)}
          
          type Query {
            dummy: String 
          }
         
          ${typeDefs}
      `
    }) as GraphQLSchema;

    return {
      schema,
      context: schemaToTemplateContext(schema)
    };
  };

  const hbsContext: any = {
    data: {
      root: {
        primitives: {
          String: 'string',
          Int: 'number',
          Float: 'number',
          Boolean: 'boolean',
          ID: 'string'
        }
      }
    }
  };

  it('should resolve type and fields correctly', async () => {
    const { context } = compileAndBuildContext(`
          type User @entity(additionalFields: [
            { path: "nonSchemaField", type: "string" }
          ]) {
              id: ID @id
              name: String @column
              gender: Gender @column
              someLink: LinkType @link
              multipleLinks: [LinkType] @link
              fieldWithMap: String @column @map(path: "profile.inner.field")
              columnWithOverride: String @column(overrideType: "number")
              requiredField: String!
              arrayColumn: [Int] @column
              arrayColumnMap: [Int] @column @map(path: "myInnerArray")
              basicEmbedded: EmbeddedType! @embedded
              arrayEmbedded: [EmbeddedType!]! @embedded
              nullableEmbedded: [EmbeddedType] @embedded
              mappedEmbedded: EmbeddedType @embedded @map(path: "innerEmbedded.moreLevel")
              overriddedArray: String @column(overrideIsArray: true)
              changeName: String @column(name: "other_name")
          }
          
          type EmbeddedType @entity(embedded: true) {
            eField: String
            eField2: Int!
          }
          
          type LinkType @entity {
            id: ID @id
          }
          
          enum Gender {
            MALE
            FEMALE
            OTHER
          }
        `);

    const type = context.types.find(t => t.name === 'User');
    const fieldsMapping = entityFields(pascalCase)(type, hbsContext, true);

    expect(fieldsMapping).toEqual({
      _id: 'Maybe<ObjectID>',
      name: 'Maybe<string>',
      gender: 'Maybe<string>',
      someLink: 'Maybe<ObjectID>',
      multipleLinks: 'Maybe<(Maybe<ObjectID>)[]>',
      profile: { inner: { field: 'Maybe<string>' } },
      columnWithOverride: 'Maybe<number>',
      arrayColumn: 'Maybe<(Maybe<number>)[]>',
      myInnerArray: 'Maybe<(Maybe<number>)[]>',
      basicEmbedded: 'EmbeddedTypeDbObject',
      arrayEmbedded: 'EmbeddedTypeDbObject[]',
      nullableEmbedded: 'Maybe<(Maybe<EmbeddedTypeDbObject>)[]>',
      innerEmbedded: { moreLevel: 'Maybe<EmbeddedTypeDbObject>' },
      overriddedArray: 'Maybe<string[]>',
      other_name: 'Maybe<string>',
      nonSchemaField: 'string'
    });
  });

  it('should resolve type and fields correctly with interfaces', async () => {
    const { context } = compileAndBuildContext(`
          interface BaseEntity @abstractEntity(discriminatorField: "type") {
            id: ID! @id
            title: String! @column
          }
          
          type Entity1 implements BaseEntity @entity {
            id: ID! @id
            title: String! @column
          }
        `);

    const gqlInterface = context.interfaces.find(t => t.name === 'BaseEntity');
    const type1 = context.types.find(t => t.name === 'Entity1');
    const fieldsMappingInterface = entityFields(pascalCase)(gqlInterface, hbsContext, true);
    const fieldsMappingType = entityFields(pascalCase)(type1, hbsContext, true);

    expect(fieldsMappingInterface).toEqual({
      type: 'string',
      _id: 'ObjectID',
      title: 'string'
    });

    expect(fieldsMappingType).toEqual({
      _id: 'ObjectID',
      title: 'string'
    });

    const fieldsMappingTypeString = entityFields(pascalCase)(type1, hbsContext, false);
    expect(fieldsMappingTypeString).toContain('extends BaseEntityDbInterface');
  });

  it('should', async () => {
    const { schema } = compileAndBuildContext(`
      type Entity1 @entity {
        id: ID! @id
        title: String! @column
      }
    `);

    const content = await plugin(
      schema,
      [],
      {},
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
      export interface Entity1DbObject {
        _id: ObjectID
        title: string
      }
    `);
  });
});
