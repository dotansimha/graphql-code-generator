import 'graphql-codegen-testing';
import { plugin, addToSchema } from './../src/index';
import { buildSchema, print } from 'graphql';

describe('TypeScript Mongo', () => {
  describe('Output', () => {
    const schema = buildSchema(/* GraphQL */ `
      ${print(addToSchema)}

      type User @entity(additionalFields: [{ path: "nonSchemaField", type: "string" }]) {
        id: ID @id
        name: String @column
        gender: Gender @column
        someLink: LinkType @link
        linkWithoutDirective: LinkType
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
        changeName: String @column @map(path: "other_name")
      }

      type EmbeddedType @entity {
        eField: String @column
        eField2: Int! @column
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
        me: User!
        feed: [FeedItem!]!
        search: [SearchResult!]!
      }

      interface FeedItem @abstractEntity(discriminatorField: "kind") {
        id: ID! @id
        content: String! @column
      }

      type Post implements FeedItem @entity {
        id: ID! @id
        content: String! @column
        author: User! @link
      }

      union SearchResult @union(discriminatorField: "entityType") = Post | User
    `);

    it('Should include only the relevant types', async () => {
      const result = await plugin(schema, [], {}, { outputFile: '' });
      expect(result).toContain('export type UserDbObject = {');
      expect(result).not.toContain('export type QueryDbObject = {');
    });

    it('Should output the correct values for @id directive', async () => {
      const result = await plugin(schema, [], {}, { outputFile: '' });
      expect(result).toContain('_id?: Maybe<ObjectID>'); // optional id
    });

    it('Should output the correct values for @column directive', async () => {
      const result = await plugin(schema, [], {}, { outputFile: '' });
      expect(result).toContain('name?: Maybe<string>'); // optional scalar
      expect(result).toContain('gender?: Maybe<string>'); // enum as string by default
      expect(result).toContain(`arrayColumn?: Maybe<Array<Maybe<number>>>`); // simple @column with array
      expect(result).toContain(`columnWithOverride?: number`); // override type
    });

    it('Should output the correct values for @link directive', async () => {
      const result = await plugin(schema, [], {}, { outputFile: '' });
      expect(result).toContain(`someLink?: Maybe<LinkTypeDbObject['_id']>`); // link to another entity
      expect(result).toContain(`multipleLinks?: Maybe<Array<Maybe<LinkTypeDbObject['_id']>>>`); // links array
    });

    it('Should output the correct values for @map directive', async () => {
      const result = await plugin(schema, [], {}, { outputFile: '' });
      expect(result).toContain(`myInnerArray: Maybe<Array<Maybe<number>>>`); // simple @column with array and @map
      expect(result).toContain(`other_name: Maybe<string>`); // simple @map scalar
      expect(result).toBeSimilarStringTo(`
      profile: {
        inner: {
          field: Maybe<string>,
        },
      },`); // custom @map with inner fields
      expect(result).toBeSimilarStringTo(`
      innerEmbedded: {
        moreLevel: Maybe<EmbeddedTypeDbObject>,
      },`); // embedded with @map
    });

    it('Should output the correct values for @embedded directive', async () => {
      const result = await plugin(schema, [], {}, { outputFile: '' });
      expect(result).toContain(`basicEmbedded: EmbeddedTypeDbObject`); // embedded type
      expect(result).toContain(`arrayEmbedded: Array<EmbeddedTypeDbObject>`); // embedded array
      expect(result).toContain(`nullableEmbedded?: Maybe<Array<Maybe<EmbeddedTypeDbObject>>`); // optional array embedded
    });

    it('Should output the correct values with additionalFields', async () => {
      const result = await plugin(schema, [], {}, { outputFile: '' });
      expect(result).toContain(`nonSchemaField: string`); // additional field
    });
  });
});
