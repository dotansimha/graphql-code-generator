import { mergeOutputs, Types } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import { buildClientSchema, buildSchema } from 'graphql';
import { plugin as tsPlugin } from '../../typescript/src/index.js';

describe('TypeScript Operations Plugin', () => {
  const gitHuntSchema = buildClientSchema(require('../../../../../dev-test/githunt/schema.json'));

  const schema = buildSchema(/* GraphQL */ `
    scalar DateTime

    input InputType {
      t: String
    }

    type User {
      id: ID!
      username: String!
      email: String!
      profile: Profile
      role: Role
    }

    type Profile {
      age: Int
      firstName: String!
    }

    type Mutation {
      test: String
      login(username: String!, password: String!): User
    }

    type Subscription {
      userCreated: User
    }

    interface Notifiction {
      id: ID!
      createdAt: String!
    }

    type TextNotification implements Notifiction {
      id: ID!
      text: String!
      createdAt: String!
    }

    type ImageNotification implements Notifiction {
      id: ID!
      imageUrl: String!
      metadata: ImageMetadata!
      createdAt: String!
    }

    type ImageMetadata {
      createdBy: String!
    }

    enum Role {
      USER
      ADMIN
    }

    union MyUnion = User | Profile

    union AnyNotification = TextNotification | ImageNotification
    union SearchResult = TextNotification | ImageNotification | User

    type Query {
      me: User
      unionTest: MyUnion
      notifications: [Notifiction!]!
      mixedNotifications: [AnyNotification!]!
      search(term: String!): [SearchResult!]!
      dummy: String
      dummyNonNull: String!
      dummyArray: [String]
      dummyNonNullArray: [String]!
      dummyNonNullArrayWithValues: [String!]!
      dummyWithType: Profile
    }

    schema {
      query: Query
      mutation: Mutation
      subscription: Subscription
    }
  `);

  const validate = async (
    content: Types.PluginOutput,
    config: any = {},
    pluginSchema = schema,
    usage = '',
    suspenseErrors = []
  ) => {
    const m = mergeOutputs([await tsPlugin(pluginSchema, [], config, { outputFile: '' }), content, usage]);
    validateTs(m, undefined, undefined, undefined, suspenseErrors);

    return m;
  };

  describe('Config', () => {});
});
