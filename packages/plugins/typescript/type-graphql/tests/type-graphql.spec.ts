import '@graphql-codegen/testing';
import { Types } from '@graphql-codegen/plugin-helpers';
import { buildSchema } from 'graphql';
import { plugin } from '../src/index';

describe('type-graphql', () => {
  it('should generate type-graphql imports', async () => {
    const schema = buildSchema(/* GraphQL */ `
      scalar A
    `);
    const result = await plugin(schema, [], {}, { outputFile: '' });

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
    const result = await plugin(schema, [], {}, { outputFile: '' });

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

  it('should generate type-graphql classes for object types', async () => {
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

    const result = await plugin(schema, [], {}, { outputFile: '' });

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

  it('should generate type-graphql classes implementing type-graphql interfaces for object types', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Test implements ITest {
        id: ID
        mandatoryStr: String!
      }
      interface ITest {
        id: ID
      }
    `);

    const result = await plugin(schema, [], {}, { outputFile: '' });

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

  it('should generate type-graphql classes for input types', async () => {
    const schema = buildSchema(/* GraphQL */ `
      input A {
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
      input B {
        id: ID
      }
    `);

    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.InputType()
      export class A {

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

  it('should generate an args type', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Mutation {
        test(
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
        ): Boolean!
      }

      input B {
        id: ID
      }
    `);

    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.ArgsType()
      export class MutationTestArgs {

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

  it('should generate type-graphql types as custom types', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Test {
        id: ID
        mandatoryStr: String!
      }
      interface ITest {
        id: ID
      }
    `);

    const result = (await plugin(
      schema,
      [],
      { decoratorName: { type: 'Foo', field: 'Bar', interface: 'FooBar' } },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
        @TypeGraphQL.Foo()
        export class Test {
          __typename?: 'Test';
          @TypeGraphQL.Bar(type => TypeGraphQL.ID, { nullable: true })
          id!: Maybe<Scalars['ID']>;
          @TypeGraphQL.Bar(type => String)
          mandatoryStr!: Scalars['String'];
        }
      `);
    expect(result.content).toBeSimilarStringTo(`
        @TypeGraphQL.FooBar()
        export abstract class ITest {
          
          @TypeGraphQL.Bar(type => TypeGraphQL.ID, { nullable: true })
          id!: Maybe<Scalars['ID']>;
        }
      `);
  });

  it('should generate custom scalar types', async () => {
    const schema = buildSchema(/* GraphQL */ `
      scalar DateTime

      type A {
        date: DateTime
        mandatoryDate: DateTime!
      }
    `);

    const result = (await plugin(
      schema,
      [],
      { scalars: { DateTime: 'Date' } },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.ObjectType()
      export class A {
        __typename?: 'A';
        @TypeGraphQL.Field(type => Date, { nullable: true })
        date!: Maybe<Scalars['DateTime']>;
        @TypeGraphQL.Field(type => Date)
        mandatoryDate!: Scalars['DateTime'];
      }
    `);
  });

  it('should fix `Maybe` only refers to a type, but is being used as a value here for array return type', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Guest {
        id: ID!
        name: String!
        phone: String!
      }

      type Query {
        guests: [Guest]
      }
    `);

    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
  /** All built-in and custom scalars, mapped to their actual values */
  export type Scalars = {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
  };
  
  @TypeGraphQL.ObjectType()
  export class Guest {
    __typename?: 'Guest';
  
    @TypeGraphQL.Field(type => TypeGraphQL.ID)
    id!: Scalars['ID'];
  
    @TypeGraphQL.Field(type => String)
    name!: Scalars['String'];
  
    @TypeGraphQL.Field(type => String)
    phone!: Scalars['String'];
  };
  
  export class Query {
    __typename?: 'Query';
  
    @TypeGraphQL.Field(type => [Guest], { nullable: true })
    guests!: Maybe<Array<Maybe<Guest>>>;
  };
  `);
  });
});
