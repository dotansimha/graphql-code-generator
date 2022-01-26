---
id: how-does-it-work
title: How does GraphQL Code Generator work?
---

In order to generate code and types, GraphQL Code Generator relies on 2 main core concepts of GraphQL:

- **GraphQL Introspection** allows fetching the types defined in the target GraphQL API
- **GraphQL AST** allows to navigate through both client-side operations and remote schema types

Once all GraphQL types (schema types and operations) are identified, GraphQL Code Generator relies on a set of plugins to generate specific code snippets and types.

This process, applied to the `@graphql-codegen/typescript` plugin, is illustrated below:


![Codegen flow example](/assets/illustrations/codegen_flow1.png)


## Example with `@graphql-codegen/typescript`


Given the following GraphQL schema:

```graphql
# schema.graphql

scalar Date

schema {
  query: Query
}

type Query {
  me: User!
  user(id: ID!): User
  allUsers: [User]
  search(term: String!): [SearchResult!]!
  myChats: [Chat!]!
}

enum Role {
  USER
  ADMIN
}

interface Node {
  id: ID!
}

union SearchResult = User | Chat | ChatMessage

type User implements Node {
  id: ID!
  username: String!
  email: String!
  role: Role!
}

type Chat implements Node {
  id: ID!
  users: [User!]!
  messages: [ChatMessage!]!
}

type ChatMessage implements Node {
  id: ID!
  content: String!
  time: Date!
  user: User!
}
```

And the following operation (Query) on client-side:

```graphql
# operation.graphql

query findUser($userId: ID!) {
  user(id: $userId) {
    ...UserFields
  }
}

fragment UserFields on User {
  id
  username
  role
}
```

And with the following `codegen.yml` configuration file:

```yml
# codegen.yml
schema: http://localhost:3333
generates:
  types-and-hooks.tsx:
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-query
```

`@graphql-codegen/typescript` plugin can generate the following TypeScript typings and React hooks files based on defined operations:

```ts
// ...

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
};

export type Query = {
  __typename?: 'Query';
  me: User;
  user?: Maybe<User>;
  allUsers?: Maybe<Array<Maybe<User>>>;
  search: Array<SearchResult>;
  myChats: Array<Chat>;
};


export type QueryUserArgs = {
  id: Scalars['ID'];
};


export type QuerySearchArgs = {
  term: Scalars['String'];
};

export enum Role {
  User = 'USER',
  Admin = 'ADMIN'
}

export type Node = {
  id: Scalars['ID'];
};

export type SearchResult = User | Chat | ChatMessage;

export type User = Node & {
  __typename?: 'User';
  id: Scalars['ID'];
  username: Scalars['String'];
  email: Scalars['String'];
  role: Role;
};

export type Chat = Node & {
  __typename?: 'Chat';
  id: Scalars['ID'];
  users: Array<User>;
  messages: Array<ChatMessage>;
};

export type ChatMessage = Node & {
  __typename?: 'ChatMessage';
  id: Scalars['ID'];
  content: Scalars['String'];
  time: Scalars['Date'];
  user: User;
};

export type FindUserQueryVariables = Exact<{
  userId: Scalars['ID'];
}>;


export type FindUserQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string, username: string, role: Role } | null | undefined };

export type UserFieldsFragment = { __typename?: 'User', id: string, username: string, role: Role };

export const UserFieldsFragmentDoc = `
    fragment UserFields on User {
  id
  username
  role
}
    `;
export const FindUserDocument = `
    query findUser($userId: ID!) {
  user(id: $userId) {
    ...UserFields
  }
}
    ${UserFieldsFragmentDoc}`;
export const useFindUserQuery = <
      TData = FindUserQuery,
      TError = unknown
    >(
      dataSource: { endpoint: string, fetchParams?: RequestInit },
      variables: FindUserQueryVariables,
      options?: UseQueryOptions<FindUserQuery, TError, TData>
    ) =>
    useQuery<FindUserQuery, TError, TData>(
      ['findUser', variables],
      fetcher<FindUserQuery, FindUserQueryVariables>(dataSource.endpoint, dataSource.fetchParams || {}, FindUserDocument, variables),
      options
    );
```

Now our React components can use the type-safe `useFindUserQuery()` hook to query the GraphQL API.

<p>&nbsp;</p>
