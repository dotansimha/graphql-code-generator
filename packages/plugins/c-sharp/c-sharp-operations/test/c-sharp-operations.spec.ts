import '@graphql-codegen/testing';
import { buildSchema, parse } from 'graphql';
import { plugin } from '../src/index.js';
import { CSharpOperationsRawPluginConfig } from '../src/config.js';
import { Types } from '@graphql-codegen/plugin-helpers';

describe('C# Operations', () => {
  describe('Namespaces', () => {
    it('Should wrap generated code block in namespace using default name', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          me: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query findMe {
          me
        }
      `);
      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toContain('namespace GraphQLCodeGen {');
    });

    it('Should wrap generated code block in namespace using a custom name', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          me: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query findMe {
          me
        }
      `);
      const config: CSharpOperationsRawPluginConfig = {
        namespaceName: 'MyCompany.MyGeneratedGql',
      };
      const result = (await plugin(schema, [{ location: '', document: operation }], config, {
        outputFile: '',
      })) as Types.ComplexPluginOutput;
      expect(result.content).toContain('namespace MyCompany.MyGeneratedGql {');
    });
  });

  describe('Query', () => {
    it('Should wrap each query operation in a class', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          me: Int!
          you: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query findMe {
          me
        }
        query findYou {
          you
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toContain('public class FindMeGQL {');
      expect(result.content).toContain('public class FindYouGQL {');
    });

    it('Should escape string constants in c#', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          me(a: String!): Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query findMe {
          me(a: "test")
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toContain('me(a: ""test"")');
    });

    it('Should generate a document string containing original query operation', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          me: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query findMe {
          me
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public static string FindMeDocument = @"
          query findMe {
            me
          }
        ";
      `);
    });

    it('Should generate request method for query operations without input variables', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          me: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query findMe {
          me
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public static GraphQLRequest Request() {
          return new GraphQLRequest {
            Query = FindMeDocument,
            OperationName = "findMe"
          };
        }
      `);
    });

    it('Should generate request method for query operations with input variables', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          mine(id: Int): Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query findMine($id: Int!) {
          mine(id: $id)
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public static GraphQLRequest Request(object variables = null) {
          return new GraphQLRequest {
            Query = FindMineDocument,
            OperationName = "findMine",
            Variables = variables
          };
        }
      `);
    });

    it('Should mark original method signature obsolete', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          me: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query findMe {
          me
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        /// <remarks>This method is obsolete. Use Request instead.</remarks>
        public static GraphQLRequest getFindMeGQL() {
      `);
    });
    it('Should generate scalar response class', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          me: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query findMe {
          me
        }
      `);
      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        { typesafeOperation: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public class Response {
          [JsonProperty("me")]
          public int me { get; set; }
        }
      `);
    });
    it('Should generate nested response class', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          me: Person!
        }
        type Person {
          name: String!
          friendIds: [Int!]!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query findMe {
          me {
            friendIds
          }
        }
      `);
      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        { typesafeOperation: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public class Response {
          public class PersonSelection {
            [JsonProperty("friendIds")]
            public System.Collections.Generic.List<int> friendIds { get; set; }
          }
          [JsonProperty("me")]
          public PersonSelection me { get; set; }
        }
      `);
    });
    it('Should generate variable class', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          mine(id: Int): Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query findMine($id: Int!) {
          mine(id: $id)
        }
      `);
      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        { typesafeOperation: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public class Variables {
          [JsonProperty("id")]
          public int id { get; set; }
        }
      `);
    });
    it('Should generate proxy method without input variables', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          me: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query findMe {
          me
        }
      `);
      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        { typesafeOperation: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public static System.Threading.Tasks.Task<GraphQLResponse<Response>> SendQueryAsync(IGraphQLClient client, System.Threading.CancellationToken cancellationToken = default) {
          return client.SendQueryAsync<Response>(Request(), cancellationToken);
        }
      `);
    });
    it('Should generate proxy method with input variables', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          mine(id: Int): Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query findMine($id: Int!) {
          mine(id: $id)
        }
      `);
      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        { typesafeOperation: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public static System.Threading.Tasks.Task<GraphQLResponse<Response>> SendQueryAsync(IGraphQLClient client, Variables variables, System.Threading.CancellationToken cancellationToken = default) {
          return client.SendQueryAsync<Response>(Request(variables), cancellationToken);
        }
      `);
    });
    it('Should prefix with @ when name is a reserved keyword', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          case(record: ID!): CourtCase!
        }
        type CourtCase {
          operator: String!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query findOperator($record: ID!) {
          case(record: $record) {
            operator
          }
        }
      `);
      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        { typesafeOperation: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public class Variables {
          [JsonProperty("record")]
          public string @record { get; set; }
        }
        public class Response {
          public class CourtCaseSelection {
            [JsonProperty("operator")]
            public string @operator { get; set; }
          }
          [JsonProperty("case")]
          public CourtCaseSelection @case { get; set; }
        }
      `);
    });
  });

  describe('Mutation', () => {
    it('Should wrap each mutation operation in a class', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Mutation {
          me: Int!
          you: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        mutation updateMe {
          me
        }
        mutation updateYou {
          you
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toContain('public class UpdateMeGQL {');
      expect(result.content).toContain('public class UpdateYouGQL {');
    });

    it('Should generate a document string containing original mutation operation', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Mutation {
          me: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        mutation updateMe {
          me
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public static string UpdateMeDocument = @"
          mutation updateMe {
            me
          }
        ";
      `);
    });

    it('Should generate request method for mutation operations without input variables', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Mutation {
          me: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        mutation updateMe {
          me
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public static GraphQLRequest Request() {
          return new GraphQLRequest {
            Query = UpdateMeDocument,
            OperationName = "updateMe"
          };
        }
      `);
    });

    it('Should generate request method for mutation operations with input variables', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Mutation {
          mine(id: Int): Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        mutation updateMine($id: Int) {
          mine(id: $id)
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public static GraphQLRequest Request(object variables = null) {
          return new GraphQLRequest {
            Query = UpdateMineDocument,
            OperationName = "updateMine",
            Variables = variables
          };
        }
      `);
    });

    it('Should mark original method signature obsolete', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Mutation {
          me: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        mutation updateMe {
          me
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        /// <remarks>This method is obsolete. Use Request instead.</remarks>
        public static GraphQLRequest getUpdateMeGQL() {
      `);
    });
    it('Should generate scalar response class', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Mutation {
          me: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        mutation updateMe {
          me
        }
      `);
      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        { typesafeOperation: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public class Response {
          [JsonProperty("me")]
          public int me { get; set; }
        }
      `);
    });
    it('Should generate nested response class', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Mutation {
          me: Person!
        }
        type Person {
          name: String!
          friendIds: [Int!]!
        }
      `);
      const operation = parse(/* GraphQL */ `
        mutation updateMe {
          me {
            friendIds
          }
        }
      `);
      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        { typesafeOperation: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public class Response {
          public class PersonSelection {
            [JsonProperty("friendIds")]
            public System.Collections.Generic.List<int> friendIds { get; set; }
          }
          [JsonProperty("me")]
          public PersonSelection me { get; set; }
        }
      `);
    });
    it('Should generate variable class', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Mutation {
          mine(id: Int): Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        mutation updateMine($id: Int) {
          mine(id: $id)
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        { typesafeOperation: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public class Variables {
          [JsonProperty("id")]
          public int? id { get; set; }
        }
      `);
    });
    it('Should generate proxy method without variables', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Mutation {
          me: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        mutation updateMe {
          me
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        { typesafeOperation: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public static System.Threading.Tasks.Task<GraphQLResponse<Response>> SendMutationAsync(IGraphQLClient client, System.Threading.CancellationToken cancellationToken = default) {
          return client.SendMutationAsync<Response>(Request(), cancellationToken);
        }
      `);
    });
    it('Should generate proxy method with input variables', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Mutation {
          mine(id: Int): Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        mutation updateMine($id: Int) {
          mine(id: $id)
        }
      `);
      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        { typesafeOperation: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public static System.Threading.Tasks.Task<GraphQLResponse<Response>> SendMutationAsync(IGraphQLClient client, Variables variables, System.Threading.CancellationToken cancellationToken = default) {
          return client.SendMutationAsync<Response>(Request(variables), cancellationToken);
        }
      `);
    });
    it('Should prefix with @ when name is a reserved keyword', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Mutation {
          case(record: ID!): CourtCase!
        }
        type CourtCase {
          operator: String!
        }
      `);
      const operation = parse(/* GraphQL */ `
        mutation updateCase($record: ID!) {
          case(record: $record) {
            operator
          }
        }
      `);
      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        { typesafeOperation: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public class Variables {
          [JsonProperty("record")]
          public string @record { get; set; }
        }
        public class Response {
          public class CourtCaseSelection {
            [JsonProperty("operator")]
            public string @operator { get; set; }
          }
          [JsonProperty("case")]
          public CourtCaseSelection @case { get; set; }
        }
      `);
    });
  });

  describe('Subscription', () => {
    it('Should wrap each subscription operation in a class', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Subscription {
          you: Int!
          them: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        subscription onNotifyYou {
          you
        }
        subscription onNotifyThem {
          them
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toContain('public class OnNotifyYouGQL {');
      expect(result.content).toContain('public class OnNotifyThemGQL {');
    });

    it('Should generate a document string containing original subscription operation', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Subscription {
          them: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        subscription onNotifyThem {
          them
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public static string OnNotifyThemDocument = @"
          subscription onNotifyThem {
            them
          }
        ";
      `);
    });

    it('Should generate request method for subscription operations without input variables', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Subscription {
          them: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        subscription onNotifyThem {
          them
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public static GraphQLRequest Request() {
          return new GraphQLRequest {
            Query = OnNotifyThemDocument,
            OperationName = "onNotifyThem"
          };
        }
      `);
    });

    it('Should generate request method for subscription operations with input variables', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Subscription {
          those(id: Int): Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        subscription onNotifyThose($id: Int!) {
          those(id: $id)
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public static GraphQLRequest Request(object variables = null) {
          return new GraphQLRequest {
            Query = OnNotifyThoseDocument,
            OperationName = "onNotifyThose",
            Variables = variables
          };
        }
      `);
    });

    it('Should mark original method signature obsolete', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Subscription {
          them: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        subscription onNotifyThem {
          them
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        /// <remarks>This method is obsolete. Use Request instead.</remarks>
        public static GraphQLRequest getOnNotifyThemGQL() {
      `);
    });
    it('Should generate scalar response class', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Subscription {
          you: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        subscription onNotifyYou {
          you
        }
      `);
      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        { typesafeOperation: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public class Response {
          [JsonProperty("you")]
          public int you { get; set; }
        }
      `);
    });
    it('Should generate nested response class', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Subscription {
          you: Person!
        }
        type Person {
          name: String!
          friendIds: [Int!]!
        }
      `);
      const operation = parse(/* GraphQL */ `
        subscription onNotifyYou {
          you {
            friendIds
          }
        }
      `);
      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        { typesafeOperation: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public class Response {
          public class PersonSelection {
            [JsonProperty("friendIds")]
            public System.Collections.Generic.List<int> friendIds { get; set; }
          }
          [JsonProperty("you")]
          public PersonSelection you { get; set; }
        }
      `);
    });
    it('Should generate variable class', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Subscription {
          those(id: Int): Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        subscription onNotifyThose($id: Int!) {
          those(id: $id)
        }
      `);
      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        { typesafeOperation: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public class Variables {
          [JsonProperty("id")]
          public int id { get; set; }
        }
      `);
    });
    it('Should generate proxy method without variables', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Subscription {
          you: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        subscription onNotifyYou {
          you
        }
      `);
      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        { typesafeOperation: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public static System.IObservable<GraphQLResponse<Response>> CreateSubscriptionStream(IGraphQLClient client) {
          return client.CreateSubscriptionStream<Response>(Request());
        }

        public static System.IObservable<GraphQLResponse<Response>> CreateSubscriptionStream(IGraphQLClient client, System.Action<System.Exception> exceptionHandler) {
          return client.CreateSubscriptionStream<Response>(Request(), exceptionHandler);
        }
      `);
    });
    it('Should generate proxy method with input variables', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Subscription {
          those(id: Int): Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        subscription onNotifyThose($id: Int!) {
          those(id: $id)
        }
      `);
      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        { typesafeOperation: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public static System.IObservable<GraphQLResponse<Response>> CreateSubscriptionStream(IGraphQLClient client, Variables variables) {
          return client.CreateSubscriptionStream<Response>(Request(variables));
        }

        public static System.IObservable<GraphQLResponse<Response>> CreateSubscriptionStream(IGraphQLClient client, Variables variables, System.Action<System.Exception> exceptionHandler) {
          return client.CreateSubscriptionStream<Response>(Request(variables), exceptionHandler);
        }
      `);
    });
    it('Should prefix with @ when name is a reserved keyword', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Subscription {
          case(record: ID!): CourtCase!
        }
        type CourtCase {
          operator: String!
        }
      `);
      const operation = parse(/* GraphQL */ `
        subscription onUpdate($record: ID!) {
          case(record: $record) {
            operator
          }
        }
      `);
      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        { typesafeOperation: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public class Variables {
          [JsonProperty("record")]
          public string @record { get; set; }
        }
        public class Response {
          public class CourtCaseSelection {
            [JsonProperty("operator")]
            public string @operator { get; set; }
          }
          [JsonProperty("case")]
          public CourtCaseSelection @case { get; set; }
        }
      `);
    });
  });

  describe('Fragments', () => {
    it('Should generate request method for each subscription operation', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type User {
          id: ID!
          username: String!
          email: String!
        }
        type Query {
          user: User!
          allWorking: [User!]
        }
      `);
      const operation = parse(/* GraphQL */ `
        query user {
          user {
            ...UserFields
          }
          allWorking {
            ...UserFields
          }
        }

        fragment UserFields on User {
          id
          username
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toContain('Query = UserDocument');
      expect(result.content).toBeSimilarStringTo(`
        public static string UserDocument = @"
          query user {
            user {
              ...UserFields
            }
            allWorking {
              ...UserFields
            }
          }

          fragment UserFields on User {
            id
            username
          }"
      `);
    });

    it('Should generate response class', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          me: Person!
        }
        type Person {
          name: String!
          age: Int!
          friends: [Friend!]!
        }
        type Friend {
          id: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query findMe {
          me {
            name
            ...PersonFragment1
            ...PersonFragment2
          }
        }
        fragment PersonFragment1 on Person {
          age
        }
        fragment PersonFragment2 on Person {
          friends {
            ...FriendFragment
          }
        }
        fragment FriendFragment on Friend {
          id
        }
      `);
      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        { typesafeOperation: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public class Response {
          public class PersonSelection {
            [JsonProperty("name")]
            public string name { get; set; }
            [JsonProperty("age")]
            public int age { get; set; }

            public class FriendSelection {
              [JsonProperty("id")]
              public int id { get; set; }
            }

            [JsonProperty("friends")]
            public System.Collections.Generic.List<FriendSelection> friends { get; set; }
          }

          [JsonProperty("me")]
          public PersonSelection me { get; set; }
        }
      `);
    });

    it('Should prefix with @ when name is a reserved keyword', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          case(record: ID!): CourtCase!
        }
        type CourtCase {
          operator: String!
          public: String!
          private: String!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query findCase($record: ID!) {
          case(record: $record) {
            private
            ...Fragment1
            ...Fragment2
          }
        }
        fragment Fragment1 on CourtCase {
          public
        }
        fragment Fragment2 on CourtCase {
          operator
        }
      `);
      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        { typesafeOperation: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        public class Variables {
          [JsonProperty("record")]
          public string @record { get; set; }
        }
        public class Response {
          public class CourtCaseSelection {
            [JsonProperty("private")]
            public string @private { get; set; }
            [JsonProperty("public")]
            public string @public { get; set; }
            [JsonProperty("operator")]
            public string @operator { get; set; }
          }
          [JsonProperty("case")]
          public CourtCaseSelection @case { get; set; }
        }
      `);
    });
  });

  describe('Method summary header', () => {
    it('Should generate a summary with required and optional scalar variables', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          runScalar(
            id: Int
            idr: Int!
            name: String
            namer: String!
            flag: Boolean
            flagr: Boolean!
            flt: Float
            fltr: Float!
          ): Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query RunScalar(
          $id: Int
          $idr: Int!
          $name: String
          $namer: String!
          $flag: Boolean
          $flagr: Boolean!
          $flt: Float
          $fltr: Float!
        ) {
          runScalar(id: $id, idr: $idr, name: $name, namer: $namer, flagr: $flagr, flt: $flt, fltr: $fltr)
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        /// <summary>
        /// RunScalarGQL.Request
        /// <para>Required variables:<br/> { idr=(int), namer=(string), flagr=(bool), fltr=(double)  }</para>
        /// <para>Optional variables:<br/> { id=(int), name=(string), flag=(bool), flt=(double) }</para>
        /// </summary>
      `);
    });

    it('Should generate a summary with required and optional for complex variables', async () => {
      const schema = buildSchema(/* GraphQL */ `
        enum SortBy {
          Asc
          Desc
        }
        type Data {
          flag: Boolean
        }
        type Query {
          runComplex(sort: SortBy, complex: Data, arr: [ID!]!, multi: [[[String]]]): Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query RunComplex($sort: SortBy, $complex: Data, $arr: [ID!]!, $multi: [[[String]]]) {
          runComplex(sort: $sort, complex: $complex, arr: $arr, multi: $multi)
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        /// <summary>
        /// RunComplexGQL.Request
        /// <para>Required variables:<br/> { arr=(string[]) }</para>
        /// <para>Optional variables:<br/> { sort=(SortBy), complex=(Data), multi=(string[][][]) }</para>
        /// </summary>
      `);
    });

    it('Should generate a summary without variables if query does not have variables', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          runSimple: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query RunSimple {
          runSimple
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
        /// <summary>
        /// RunSimpleGQL.Request
        /// </summary>
      `);
    });
  });

  describe('Issues', () => {
    it('#4221 - suffix query mutation subscription', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          me: Int!
        }
        type Mutation {
          you: Int!
          them: Int!
        }
        type Subscription {
          them: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query findMe {
          me
        }
        mutation updateYou {
          you
        }
        subscription onNotifyThem {
          them
        }
      `);

      const config: CSharpOperationsRawPluginConfig = {
        querySuffix: 'Query',
        mutationSuffix: 'Mutation',
        subscriptionSuffix: 'Subscription',
      };
      const result = (await plugin(schema, [{ location: '', document: operation }], config, {
        outputFile: '',
      })) as Types.ComplexPluginOutput;

      expect(result.content).toContain('public class FindMeQuery {');
      expect(result.content).toContain('public class UpdateYouMutation {');
      expect(result.content).toContain('public class OnNotifyThemSubscription {');

      expect(result.content).toContain('public static GraphQLRequest getFindMeQuery() {');
      expect(result.content).toContain('public static GraphQLRequest getUpdateYouMutation() {');
      expect(result.content).toContain('public static GraphQLRequest getOnNotifyThemSubscription() {');
    });

    it('#4260 - operation name casing', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          me: Int!
        }
      `);
      const operation = parse(/* GraphQL */ `
        query findMe1 {
          me
        }
        query FindMe2 {
          me
        }
        query findme3 {
          me
        }
        query FINDME4 {
          me
        }
      `);

      const result = (await plugin(
        schema,
        [{ location: '', document: operation }],
        {},
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toContain('OperationName = "findMe1"');
      expect(result.content).toContain('OperationName = "FindMe2"');
      expect(result.content).toContain('OperationName = "findme3"');
      expect(result.content).toContain('OperationName = "FINDME4"');
    });
  });
});
