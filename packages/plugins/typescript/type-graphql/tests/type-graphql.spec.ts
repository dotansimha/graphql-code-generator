import '@graphql-codegen/testing';
import { Types } from '@graphql-codegen/plugin-helpers';
import { buildSchema } from 'graphql';
import { plugin } from '../src/index.js';

describe('type-graphql', () => {
  it('should expose Maybe', async () => {
    const schema = buildSchema(/* GraphQL */ `
      scalar A
    `);
    const result = await plugin(schema, [], {}, { outputFile: '' });
    expect(result.prepend).toBeSimilarStringTo('export type Maybe<T> =');
  });

  it('should expose Exact', async () => {
    const schema = buildSchema(/* GraphQL */ `
      scalar A
    `);
    const result = await plugin(schema, [], {}, { outputFile: '' });
    expect(result.prepend).toBeSimilarStringTo('export type Exact<');
  });

  it('should expose FixDecorator', async () => {
    const schema = buildSchema(/* GraphQL */ `
      scalar A
    `);
    const result = await plugin(schema, [], {}, { outputFile: '' });
    expect(result.prepend).toBeSimilarStringTo('export type FixDecorator<T> = T;');
  });

  it('should generate type-graphql import/export', async () => {
    const schema = buildSchema(/* GraphQL */ `
      scalar A
    `);
    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(result.prepend).toBeSimilarStringTo(`import * as TypeGraphQL from 'type-graphql';
    export { TypeGraphQL };`);
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
        id?: Maybe<Scalars['ID']>;
        @TypeGraphQL.Field(type => TypeGraphQL.ID)
        mandatoryId!: Scalars['ID'];
        @TypeGraphQL.Field(type => String, { nullable: true })
        str?: Maybe<Scalars['String']>;
        @TypeGraphQL.Field(type => String)
        mandatoryStr!: Scalars['String'];
        @TypeGraphQL.Field(type => Boolean, { nullable: true })
        bool?: Maybe<Scalars['Boolean']>;
        @TypeGraphQL.Field(type => Boolean)
        mandatoryBool!: Scalars['Boolean'];
        @TypeGraphQL.Field(type => TypeGraphQL.Int, { nullable: true })
        int?: Maybe<Scalars['Int']>;
        @TypeGraphQL.Field(type => TypeGraphQL.Int)
        mandatoryInt!: Scalars['Int'];
        @TypeGraphQL.Field(type => TypeGraphQL.Float, { nullable: true })
        float?: Maybe<Scalars['Float']>;
        @TypeGraphQL.Field(type => TypeGraphQL.Float)
        mandatoryFloat!: Scalars['Float'];
        @TypeGraphQL.Field(type => B, { nullable: true })
        b?: Maybe<B>;
        @TypeGraphQL.Field(type => B)
        mandatoryB!: FixDecorator<B>;
        @TypeGraphQL.Field(type => [String], { nullable: true })
        arr?: Maybe<Array<Scalars['String']>>;
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
        id?: Maybe<Scalars['ID']>;
        @TypeGraphQL.Field(type => String)
        mandatoryStr!: Scalars['String'];
      }
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.InterfaceType()
      export abstract class ITest {

        @TypeGraphQL.Field(type => TypeGraphQL.ID, { nullable: true })
        id?: Maybe<Scalars['ID']>;
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
        id?: Maybe<Scalars['ID']>;

        @TypeGraphQL.Field(type => TypeGraphQL.ID)
        mandatoryId!: Scalars['ID'];

        @TypeGraphQL.Field(type => String, { nullable: true })
        str?: Maybe<Scalars['String']>;

        @TypeGraphQL.Field(type => String)
        mandatoryStr!: Scalars['String'];

        @TypeGraphQL.Field(type => Boolean, { nullable: true })
        bool?: Maybe<Scalars['Boolean']>;

        @TypeGraphQL.Field(type => Boolean)
        mandatoryBool!: Scalars['Boolean'];

        @TypeGraphQL.Field(type => TypeGraphQL.Int, { nullable: true })
        int?: Maybe<Scalars['Int']>;

        @TypeGraphQL.Field(type => TypeGraphQL.Int)
        mandatoryInt!: Scalars['Int'];

        @TypeGraphQL.Field(type => TypeGraphQL.Float, { nullable: true })
        float?: Maybe<Scalars['Float']>;

        @TypeGraphQL.Field(type => TypeGraphQL.Float)
        mandatoryFloat!: Scalars['Float'];

        @TypeGraphQL.Field(type => B, { nullable: true })
        b?: Maybe<B>;

        @TypeGraphQL.Field(type => B)
        mandatoryB!: FixDecorator<B>;

        @TypeGraphQL.Field(type => [String], { nullable: true })
        arr?: Maybe<Array<Scalars['String']>>;

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
        id?: Maybe<Scalars['ID']>;

        @TypeGraphQL.Field(type => TypeGraphQL.ID)
        mandatoryId!: Scalars['ID'];

        @TypeGraphQL.Field(type => String, { nullable: true })
        str?: Maybe<Scalars['String']>;

        @TypeGraphQL.Field(type => String)
        mandatoryStr!: Scalars['String'];

        @TypeGraphQL.Field(type => Boolean, { nullable: true })
        bool?: Maybe<Scalars['Boolean']>;

        @TypeGraphQL.Field(type => Boolean)
        mandatoryBool!: Scalars['Boolean'];

        @TypeGraphQL.Field(type => TypeGraphQL.Int, { nullable: true })
        int?: Maybe<Scalars['Int']>;

        @TypeGraphQL.Field(type => TypeGraphQL.Int)
        mandatoryInt!: Scalars['Int'];

        @TypeGraphQL.Field(type => TypeGraphQL.Float, { nullable: true })
        float?: Maybe<Scalars['Float']>;

        @TypeGraphQL.Field(type => TypeGraphQL.Float)
        mandatoryFloat!: Scalars['Float'];

        @TypeGraphQL.Field(type => B, { nullable: true })
        b?: Maybe<B>;

        @TypeGraphQL.Field(type => B)
        mandatoryB!: FixDecorator<B>;

        @TypeGraphQL.Field(type => [String], { nullable: true })
        arr?: Maybe<Array<Scalars['String']>>;

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
          id?: Maybe<Scalars['ID']>;
          @TypeGraphQL.Bar(type => String)
          mandatoryStr!: Scalars['String'];
        }
      `);
    expect(result.content).toBeSimilarStringTo(`
        @TypeGraphQL.FooBar()
        export abstract class ITest {

          @TypeGraphQL.Bar(type => TypeGraphQL.ID, { nullable: true })
          id?: Maybe<Scalars['ID']>;
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
        date?: Maybe<Scalars['DateTime']>;
        @TypeGraphQL.Field(type => Date)
        mandatoryDate!: Scalars['DateTime'];
      }
    `);
  });

  it('should correctly set options for nullable types', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type MyType {
        str1: String
        str2: String!
        strArr1: [String]
        strArr2: [String]!
        strArr3: [String!]
        strArr4: [String!]!

        int1: Int
        int2: Int!
        intArr1: [Int]
        intArr2: [Int]!
        intArr3: [Int!]
        intArr4: [Int!]!

        custom1: MyType2
        custom2: MyType2!
        customArr1: [MyType2]
        customArr2: [MyType2]!
        customArr3: [MyType2!]
        customArr4: [MyType2!]!
      }

      input MyInputType {
        inputStr1: String
        inputStr2: String!
        inputStrArr1: [String]
        inputStrArr2: [String]!
        inputStrArr3: [String!]
        inputStrArr4: [String!]!

        inputInt1: Int
        inputInt2: Int!
        inputIntArr1: [Int]
        inputIntArr2: [Int]!
        inputIntArr3: [Int!]
        inputIntArr4: [Int!]!

        inputCustom1: MyType2
        inputCustom2: MyType2!
        inputCustomArr1: [MyType2]
        inputCustomArr2: [MyType2]!
        inputCustomArr3: [MyType2!]
        inputCustomArr4: [MyType2!]!
      }

      type MyType2 {
        id: ID!
      }
    `);

    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => String, { nullable: true })
      str1?: Maybe<Scalars['String']>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => String)
      str2!: Scalars['String'];
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => [String], { nullable: 'itemsAndList' })
      strArr1?: Maybe<Array<Maybe<Scalars['String']>>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => [String], { nullable: 'items' })
      strArr2!: Array<Maybe<Scalars['String']>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => [String], { nullable: true })
      strArr3?: Maybe<Array<Scalars['String']>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => [String])
      strArr4!: Array<Scalars['String']>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => TypeGraphQL.Int, { nullable: true })
      int1?: Maybe<Scalars['Int']>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => TypeGraphQL.Int)
      int2!: Scalars['Int'];
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => [TypeGraphQL.Int], { nullable: 'itemsAndList' })
      intArr1?: Maybe<Array<Maybe<Scalars['Int']>>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => [TypeGraphQL.Int], { nullable: 'items' })
      intArr2!: Array<Maybe<Scalars['Int']>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => [TypeGraphQL.Int], { nullable: true })
      intArr3?: Maybe<Array<Scalars['Int']>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => [TypeGraphQL.Int])
      intArr4!: Array<Scalars['Int']>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => MyType2, { nullable: true })
      custom1?: Maybe<MyType2>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => MyType2)
      custom2!: FixDecorator<MyType2>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => [MyType2], { nullable: 'itemsAndList' })
      customArr1?: Maybe<Array<Maybe<MyType2>>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => [MyType2], { nullable: 'items' })
      customArr2!: Array<Maybe<MyType2>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => [MyType2], { nullable: true })
      customArr3?: Maybe<Array<MyType2>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => [MyType2])
      customArr4!: Array<MyType2>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => String, { nullable: true })
      inputStr1?: Maybe<Scalars['String']>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => String)
      inputStr2!: Scalars['String'];
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => [String], { nullable: 'itemsAndList' })
      inputStrArr1?: Maybe<Array<Maybe<Scalars['String']>>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => [String], { nullable: 'items' })
      inputStrArr2!: Array<Maybe<Scalars['String']>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => [String], { nullable: true })
      inputStrArr3?: Maybe<Array<Scalars['String']>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => [String])
      inputStrArr4!: Array<Scalars['String']>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => TypeGraphQL.Int, { nullable: true })
      inputInt1?: Maybe<Scalars['Int']>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => TypeGraphQL.Int)
      inputInt2!: Scalars['Int'];
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => [TypeGraphQL.Int], { nullable: 'itemsAndList' })
      inputIntArr1?: Maybe<Array<Maybe<Scalars['Int']>>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => [TypeGraphQL.Int], { nullable: 'items' })
      inputIntArr2!: Array<Maybe<Scalars['Int']>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => [TypeGraphQL.Int], { nullable: true })
      inputIntArr3?: Maybe<Array<Scalars['Int']>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => [TypeGraphQL.Int])
      inputIntArr4!: Array<Scalars['Int']>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => MyType2, { nullable: true })
      inputCustom1?: Maybe<MyType2>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => MyType2)
      inputCustom2!: FixDecorator<MyType2>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => [MyType2], { nullable: 'itemsAndList' })
      inputCustomArr1?: Maybe<Array<Maybe<MyType2>>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => [MyType2], { nullable: 'items' })
      inputCustomArr2!: Array<Maybe<MyType2>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => [MyType2], { nullable: true })
      inputCustomArr3?: Maybe<Array<MyType2>>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.Field(type => [MyType2])
      inputCustomArr4!: Array<MyType2>;
    `);
  });

  it('should put the GraphQL description in the TypeGraphQL options', async () => {
    const schema = buildSchema(/* GraphQL */ `
      """
      Test type description
      """
      type Test implements ITest {
        """
        id field description
        inside Test class
        """
        id: ID

        """
        mandatoryStr field description
        """
        mandatoryStr: String!
      }

      """
      ITest interface description
      """
      interface ITest {
        """
        id field description
        inside ITest interface
        """
        id: ID
      }

      """
      TestInput input description
      """
      input TestInput {
        id: ID
      }
    `);

    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.ObjectType({ description: 'Test type description', implements: ITest })
      export class Test extends ITest {
        __typename?: 'Test';
        @TypeGraphQL.Field(type => TypeGraphQL.ID, { description: 'id field description\\ninside Test class', nullable: true })
        id?: Maybe<Scalars['ID']>;
        @TypeGraphQL.Field(type => String, { description: 'mandatoryStr field description' })
        mandatoryStr!: Scalars['String'];
      }
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.InterfaceType({ description: 'ITest interface description' })
      export abstract class ITest {

        @TypeGraphQL.Field(type => TypeGraphQL.ID, { description: 'id field description\\ninside ITest interface', nullable: true })
        id?: Maybe<Scalars['ID']>;
      }
    `);

    expect(result.content).toBeSimilarStringTo(`
      @TypeGraphQL.InputType({ description: 'TestInput input description' })
      export class TestInput {

        @TypeGraphQL.Field(type => TypeGraphQL.ID, { nullable: true })
        id?: Maybe<Scalars['ID']>;
      }
    `);
  });

  it('should only generate TypeGraphQL decorators for included types', async () => {
    const schema = buildSchema(/* GraphQL */ `
      enum RegularEnum {
        A
        B
      }

      enum TypeGraphQLEnum {
        A
        B
      }

      interface IRegularInterfaceType {
        id: ID
      }

      interface ITypeGraphQLInterfaceType {
        id: ID
      }

      type RegularType {
        id: ID
      }

      type TypeGraphQLType {
        id: ID
      }

      input RegularInputType {
        id: ID
      }

      input TypeGraphQLInputType {
        id: ID
      }

      type Query {
        regularFunction(mandatoryId: ID!, optionalId: ID): Boolean!
        typeGraphQLFunction(mandatoryId: ID!, optionalId: ID): Boolean!
      }
    `);

    const result = await plugin(
      schema,
      [],
      {
        decorateTypes: [
          'TypeGraphQLEnum',
          'ITypeGraphQLInterfaceType',
          'TypeGraphQLType',
          'TypeGraphQLInputType',
          'QueryTypeGraphQlFunctionArgs',
        ],
      },
      { outputFile: '' }
    );

    expect(result.content).not.toBeSimilarStringTo(
      `TypeGraphQL.registerEnumType(RegularEnum, { name: 'RegularEnum' });`
    );

    expect(result.content).toBeSimilarStringTo(
      `TypeGraphQL.registerEnumType(TypeGraphQlEnum, { name: 'TypeGraphQlEnum' });`
    );

    expect(result.content).toBeSimilarStringTo(
      `export type IRegularInterfaceType = {
        id?: Maybe<Scalars['ID']>;
      };`
    );

    expect(result.content).toBeSimilarStringTo(
      `
      @TypeGraphQL.InterfaceType()
      export abstract class ITypeGraphQlInterfaceType {
        @TypeGraphQL.Field(type => TypeGraphQL.ID, { nullable: true })
        id?: Maybe<Scalars['ID']>;
      }`
    );

    expect(result.content).toBeSimilarStringTo(
      `export type RegularType = {
        __typename?: 'RegularType';
        id?: Maybe<Scalars['ID']>;
      };`
    );

    expect(result.content).toBeSimilarStringTo(
      `@TypeGraphQL.ObjectType()
      export class TypeGraphQlType {
        __typename?: 'TypeGraphQLType';
        @TypeGraphQL.Field(type => TypeGraphQL.ID, { nullable: true })
        id?: Maybe<Scalars['ID']>;
      }`
    );

    expect(result.content).toBeSimilarStringTo(
      `export type RegularInputType = {
        id?: Maybe<Scalars['ID']>;
      };`
    );

    expect(result.content).toBeSimilarStringTo(
      `@TypeGraphQL.InputType()
      export class TypeGraphQlInputType {
        @TypeGraphQL.Field(type => TypeGraphQL.ID, { nullable: true })
        id?: Maybe<Scalars['ID']>;
      }`
    );

    expect(result.content).toBeSimilarStringTo(`
    export type Query = {
      __typename?: 'Query';
      regularFunction: Scalars['Boolean'];
      typeGraphQLFunction: Scalars['Boolean'];
    };`);

    expect(result.content).toBeSimilarStringTo(`export type QueryRegularFunctionArgs = {
        mandatoryId: Scalars['ID'];
        optionalId?: InputMaybe<Scalars['ID']>;
      };`);

    expect(result.content).toBeSimilarStringTo(` @TypeGraphQL.ArgsType()
       export class QueryTypeGraphQlFunctionArgs {

         @TypeGraphQL.Field(type => TypeGraphQL.ID)
         mandatoryId!: Scalars['ID'];

         @TypeGraphQL.Field(type => TypeGraphQL.ID, { nullable: true })
         optionalId?: Maybe<Scalars['ID']>;
       };`);
  });
});
