import '@graphql-codegen/testing';
import { Types } from '@graphql-codegen/plugin-helpers';
import { buildSchema, parse } from 'graphql';
import { plugin } from '../src/index';

describe('type-graphql', () => {
  it('should generate type-graphql imports', async () => {
    const schema = buildSchema(/* GraphQL */ `
      scalar A
    `);
    const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

    expect(result.prepend).toContainEqual(`import * as TypeGraphQL from 'type-graphql';`);
  });

  it('should generate type-graphql enums', async () => {
    const schema = buildSchema(/* GraphQL */ `
      "custom enum"
      enum MyEnum {
        "this is a"
        A
        "this is b"
        B
      }
    `);
    const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
      /** custom enum */
      export enum MyEnum {
        /** this is a */
        A = 'A',
        /** this is b */
        B = 'B'
      }
      TypeGraphQL.registerEnumType(MyEnum, { name: 'MyEnum' });`);
  });

  it('should generate type-graphql classes', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type A {
        id: ID
        mandatoryId: ID!
        str: String
        mandatoryStr: String!
        bool: Boolean
        mandatoryBool: Boolean!
        int: Int
        mandatoryInt: Int!
        float: Float
        mandatoryFloat: Float!
        b: B
        mandatoryB: B!
        arr: [String!]
        mandatoryArr: [String!]!
      }
      type B {
        id: ID
      }
    `);

    const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.ObjectType()
      export class A {
        __typename?: 'A';
        @TypeGraphQL.Field(type => TypeGraphQL.ID, { nullable: true })
        id!: Maybe<Scalars['ID']>;
        @TypeGraphQL.Field(type => TypeGraphQL.ID)
        mandatoryId!: Scalars['ID'];
        @TypeGraphQL.Field(type => String, { nullable: true })
        str!: Maybe<Scalars['String']>;
        @TypeGraphQL.Field(type => String)
        mandatoryStr!: Scalars['String'];
        @TypeGraphQL.Field(type => Boolean, { nullable: true })
        bool!: Maybe<Scalars['Boolean']>;
        @TypeGraphQL.Field(type => Boolean)
        mandatoryBool!: Scalars['Boolean'];
        @TypeGraphQL.Field(type => TypeGraphQL.Int, { nullable: true })
        int!: Maybe<Scalars['Int']>;
        @TypeGraphQL.Field(type => TypeGraphQL.Int)
        mandatoryInt!: Scalars['Int'];
        @TypeGraphQL.Field(type => TypeGraphQL.Float, { nullable: true })
        float!: Maybe<Scalars['Float']>;
        @TypeGraphQL.Field(type => TypeGraphQL.Float)
        mandatoryFloat!: Scalars['Float'];
        @TypeGraphQL.Field(type => B, { nullable: true })
        b!: Maybe<B>;
        @TypeGraphQL.Field(type => B)
        mandatoryB!: FixDecorator<B>;
        @TypeGraphQL.Field(type => [String], { nullable: true })
        arr!: Maybe<Array<Scalars['String']>>;
        @TypeGraphQL.Field(type => [String])
        mandatoryArr!: Array<Scalars['String']>;
      }
    `);
  });

  it('should generate type-graphql classes implementing type-graphql interfaces', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Test implements ITest {
        id: ID
        mandatoryStr: String!
      }
      interface ITest {
        id: ID
      }
    `);

    const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.ObjectType({ implements: ITest })
      export class Test extends ITest {
        __typename?: 'Test';
        @TypeGraphQL.Field(type => TypeGraphQL.ID, { nullable: true })
        id!: Maybe<Scalars['ID']>;
        @TypeGraphQL.Field(type => String)
        mandatoryStr!: Scalars['String'];
      }
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.InterfaceType()
      export abstract class ITest {
        
        @TypeGraphQL.Field(type => TypeGraphQL.ID, { nullable: true })
        id!: Maybe<Scalars['ID']>;
      }
    `);
  });
});
