import { buildSchema } from 'graphql';

export const schema = buildSchema(/* GraphQL */ `
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
