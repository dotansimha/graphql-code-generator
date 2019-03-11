import { plugin, addToSchema } from './../src/index';
import { buildSchema, print } from 'graphql';

describe('TypeScript Mongo', () => {
  const schema = buildSchema(/* GraphQL */ `
    ${print(addToSchema)}

    type User @entity(additionalFields: [{ path: "nonSchemaField", type: "string" }]) {
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

    type Query {
      me: User
    }
  `);

  // console.log(schema.getType('User').astNode.directives);

  it('Should generate the correct name for type', async () => {
    const result = await plugin(schema, [], {}, { outputFile: '' });
    // console.log(result);
  });
});
