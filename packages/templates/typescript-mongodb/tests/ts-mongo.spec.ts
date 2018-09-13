import {
  GraphQLSchema,
  makeExecutableSchema,
  SchemaTemplateContext,
  schemaToTemplateContext
} from 'graphql-codegen-core';
import { entityFields } from '../src/helpers/entity-fields';
import { directives } from '../src/graphql-directives';
import { print } from 'graphql';

describe('Types', () => {
  const compileAndBuildContext = (typeDefs: string): { context: SchemaTemplateContext; schema: GraphQLSchema } => {
    const schema = makeExecutableSchema({
      typeDefs: `
        ${print(directives)}
        
        type Query {
          dummy: String 
        }
       
        ${typeDefs}
        
        schema {
          query: Query
        }
    `,
      resolvers: {},
      allowUndefinedInResolve: true
    }) as GraphQLSchema;

    return {
      schema,
      context: schemaToTemplateContext(schema)
    };
  };

  const hbsContext = {
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
    const fieldsMapping = entityFields(type, hbsContext, true);

    expect(fieldsMapping).toEqual({
      _id: 'ObjectID | null',
      name: 'string | null',
      gender: 'string | null',
      someLink: 'ObjectID | null',
      multipleLinks: '(ObjectID | null)[] | null',
      profile: { inner: { field: 'string | null' } },
      columnWithOverride: 'number | null',
      arrayColumn: '(number | null)[] | null',
      myInnerArray: '(number | null)[] | null',
      basicEmbedded: 'EmbeddedTypeDbObject',
      arrayEmbedded: 'EmbeddedTypeDbObject[]',
      nullableEmbedded: '(EmbeddedTypeDbObject | null)[] | null',
      innerEmbedded: { moreLevel: 'EmbeddedTypeDbObject | null' },
      overriddedArray: 'string[] | null',
      other_name: 'string | null',
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
    const fieldsMappingInterface = entityFields(gqlInterface, hbsContext, true);
    const fieldsMappingType = entityFields(type1, hbsContext, true);

    expect(fieldsMappingInterface).toEqual({
      type: 'string',
      _id: 'ObjectID',
      title: 'string'
    });

    expect(fieldsMappingType).toEqual({
      _id: 'ObjectID',
      title: 'string'
    });

    const fieldsMappingTypeString = entityFields(type1, hbsContext, false);
    expect(fieldsMappingTypeString).toContain('extends BaseEntityDbInterface');
  });
});
