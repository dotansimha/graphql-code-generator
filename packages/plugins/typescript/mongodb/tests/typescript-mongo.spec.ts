import '@graphql-codegen/testing';
import { plugin, addToSchema } from './../src/index';
import { buildSchema, print, GraphQLSchema } from 'graphql';
import { plugin as tsPlugin } from '../../typescript/src/index';
import { validateTs } from '../../typescript/tests/validate';
import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';

describe('TypeScript Mongo', () => {
  const validate = async (content: Types.PluginOutput, schema: GraphQLSchema, config: any) => {
    const tsPluginOutput = await tsPlugin(schema, [], config, { outputFile: '' });
    const result = mergeOutputs([tsPluginOutput, content]);
    await validateTs(result);
  };

  const schema = buildSchema(/* GraphQL */ `
    ${print(addToSchema)}

    type User @entity(additionalFields: [{ path: "nonSchemaField", type: "string" }]) {
      id: ID @id
      name: String @column
      gender: Gender @column
      someLink: LinkType @link
      someLinkWithOverride: Boolean @link(overrideType: "LinkType")
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

    type Machine @entity {
      documents(addPublic: Boolean = false): [Document] @link(overrideType: "MachineDocument")
    }

    type Document {
      id: ID!
    }

    type LinkType @entity {
      id: ID @id
    }

    type TEST @entity {
      id: ID! @id
      foo: String! @column
    }

    type Test2 @entity {
      testfield: TEST! @link
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

  describe('Config', () => {
    it('Should accept dbTypeSuffix', async () => {
      const result = await plugin(schema, [], { dbTypeSuffix: 'Obj' }, { outputFile: '' });
      expect(result).toContain('export type UserObj = {');
      expect(result).toContain('export type EmbeddedTypeObj = {');
      expect(result).toContain('export type LinkTypeObj = {');
      await validate(result, schema, {});
    });

    it('Should accept dbInterfaceSuffix', async () => {
      const result = await plugin(schema, [], { dbInterfaceSuffix: 'InterfaceObj' }, { outputFile: '' });
      expect(result).toContain(`export type FeedItemInterfaceObj = {`);
      expect(result).toContain(`export type PostDbObject = FeedItemInterfaceObj & {`);
      await validate(result, schema, {});
    });

    it('Should allow to customize objectIdType import with basic type', async () => {
      const result = await plugin(schema, [], { objectIdType: 'string' }, { outputFile: '' });
      expect(result).toContain(`_id: string`);
      expect(result).not.toContain(`ObjectID`);
      await validate(result, schema, {});
    });

    it('Should allow to customize objectIdType import with custom import', async () => {
      const result = await plugin(schema, [], { objectIdType: 'ObjectId#bson' }, { outputFile: '' });
      expect(result).toContain(`_id: ObjectId`);
      expect(result).not.toContain(`ObjectID`);
      expect(result).toContain(`import { ObjectId } from 'bson';`);
      await validate(result, schema, {});
    });

    it('Should allow to customize idFieldName', async () => {
      const result = await plugin(schema, [], { idFieldName: 'id' }, { outputFile: '' });
      expect(result).toContain(`id: ObjectID`);
      expect(result).not.toContain(`_id`);
      await validate(result, schema, {});
    });

    it('Should allow to customize enumsAsString', async () => {
      const result = await plugin(schema, [], { enumsAsString: false }, { outputFile: '' });
      expect(result).not.toContain('gender?: Maybe<string>');
      expect(result).toContain('gender?: Maybe<Gender>');
      await validate(result, schema, {});
    });

    it('Should allow to customize avoidOptionals', async () => {
      const result = await plugin(schema, [], { avoidOptionals: true }, { outputFile: '' });
      expect(result).not.toContain('?:');
      await validate(result, schema, {});
    });

    it('Should allow to customize namingConvention', async () => {
      const result = await plugin(schema, [], { namingConvention: 'change-case#lowerCase' }, { outputFile: '' });
      expect(result).toContain('export type userdbobject = {');
      expect(result).toContain(`export type feeditemdbinterface = {`);
      await validate(result, schema, {});
    });
  });

  describe('Output', () => {
    it('Should compile TypeScript correctly', async () => {
      const result = await plugin(schema, [], {}, { outputFile: '' });
      await validate(result, schema, {});
    });

    it('Should include only the relevant types', async () => {
      const result = await plugin(schema, [], {}, { outputFile: '' });
      expect(result).toContain('export type UserDbObject = {');
      expect(result).not.toContain('export type QueryDbObject = {');
    });

    it('Should generate output for interfaces with discriminatorField', async () => {
      const result = await plugin(schema, [], {}, { outputFile: '' });
      expect(result).toContain(`export type FeedItemDbInterface = {`);
      expect(result).toContain(`kind: string,`);
    });

    it('Should include a valid type when implementing interfaces', async () => {
      const result = await plugin(schema, [], {}, { outputFile: '' });
      expect(result).toContain(`export type FeedItemDbInterface = {`);
      expect(result).toContain(`export type PostDbObject = FeedItemDbInterface & {`);
    });

    it('Should include a valid union with discriminatorField', async () => {
      const result = await plugin(schema, [], {}, { outputFile: '' });
      expect(result).toBeSimilarStringTo(`
      export type SearchResultDbObject = (PostDbObject | UserDbObject) & {
        entityType: string,
      };`);
    });

    it('Should output the correct values for @id directive', async () => {
      const result = await plugin(schema, [], {}, { outputFile: '' });
      expect(result).toContain('_id?: Maybe<ObjectID>'); // optional id
      await validate(result, schema, {});
    });

    it('Should output the correct values for @column directive', async () => {
      const result = await plugin(schema, [], {}, { outputFile: '' });
      expect(result).toContain('name?: Maybe<string>'); // optional scalar
      expect(result).toContain('gender?: Maybe<string>'); // enum as string by default
      expect(result).toContain(`arrayColumn?: Maybe<Array<Maybe<number>>>`); // simple @column with array
      expect(result).toContain(`columnWithOverride?: number`); // override type
      await validate(result, schema, {});
    });

    it('Should output the correct values for @link directive', async () => {
      const result = await plugin(schema, [], {}, { outputFile: '' });
      expect(result).toContain(`someLink?: Maybe<LinkTypeDbObject['_id']>`); // link to another entity
      expect(result).toContain(`multipleLinks?: Maybe<Array<Maybe<LinkTypeDbObject['_id']>>>`); // links array
      await validate(result, schema, {});
    });

    it('Should output the correct values for @link directive and overrideType', async () => {
      const result = await plugin(schema, [], {}, { outputFile: '' });
      expect(result).toContain(`someLinkWithOverride?: Maybe<LinkTypeDbObject['_id']>`); // link to another entity
      await validate(result, schema, {});
    });

    it('Should prduce valid types when names are uppercase', async () => {
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`
      export type TestDbObject = {
        _id: ObjectID,
        foo: string,
      };
      
      export type Test2DbObject = {
        testfield: TestDbObject['_id'],
      };`);
      await validate(result, schema, {});
    });

    it('Should output the correct values for @link directive and overrideType and array type', async () => {
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result).toContain(`documents?: Maybe<Array<Maybe<MachineDocumentDbObject['_id']>>>`); // link to another entity with overwrite type and array
      await validate(result, schema, {});
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
      await validate(result, schema, {});
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
      await validate(result, schema, {});
    });
  });
});
