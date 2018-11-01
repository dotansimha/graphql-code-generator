---
id: typescript-resolvers
title: TypeScript Resolvers
---

This template extends the basic TypeScript template [`graphql-codegen-typescript-template`](typescript-typings) and thus shares a similar configuration.

## Pre-Requirements

A TypeScript project with `@types/graphql` installed.

## Installation

Install using `npm` (or `yarn`):

    $ npm install graphql-codegen-typescript-resolvers-template

## Usage

Run `gql-gen` as usual:

    $ gql-gen --template graphql-codegen-typescript-resolvers-template --schema schema.json --out ./src/resolvers-types.ts

Import the types from the generated file and use in the resolver:

```typescript
import { QueryResolvers } from './resolvers-types';

export const resolvers: QueryResolvers.Resolvers = {
  myQuery: (root, args, context) => {}
};
```

This will make the resolver fully typed and compatible with typescript compiler, including the handler's arguments and return value.

## How It Works

It adds the generic resolvers signature to the top of the file:

```typescript
export type Resolver<Result, Parent = any, Context = any, Args = never> = (
  parent: Parent,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo
) => Promise<Result> | Result;

export interface ISubscriptionResolverObject<Result, Parent, Context, Args> {
  subscribe<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: Context,
    info: GraphQLResolveInfo
  ): AsyncIterator<R | Result>;
  resolve?<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: Context,
    info: GraphQLResolveInfo
  ): R | Result | Promise<R | Result>;
}

export type SubscriptionResolver<Result, Parent = any, Context = any, Args = never> =
  | ((...args: any[]) => ISubscriptionResolverObject<Result, Parent, Context, Args>)
  | ISubscriptionResolverObject<Result, Parent, Context, Args>;
```

Then, it creates a default TypeScript resolvers signature, according to your GraphQL schema:

```graphql
type Query {
  allUsers: [User]
  userById(id: Int!): User
}

type User {
  id: Int!
  name: String!
  email: String!
}
```

Given the schema above, the output should be the following:

```typescript
export namespace QueryResolvers {
  export interface Resolvers<Context = any> {
    allUsers?: AllUsersResolver<(User | null)[], any, Context>;
    userById?: UserByIdResolver<User | null, any, Context>;
  }

  export type AllUsersResolver<R = (User | null)[], Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type UserByIdResolver<R = User | null, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context,
    UserByIdArgs
  >;
  export interface UserByIdArgs {
    id: number;
  }
}

export namespace UserResolvers {
  export interface Resolvers<Context = any> {
    id?: IdResolver<number, any, Context>;
    name?: NameResolver<string, any, Context>;
    email?: EmailResolver<string, any, Context>;
  }

  export type IdResolver<R = number, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type NameResolver<R = string, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type EmailResolver<R = string, Parent = any, Context = any> = Resolver<R, Parent, Context>;
}
```

## Template Customization

The generated resolver's signature type can be overridden or modified by taking advantage of the generic deceleration feature. Here's an example of how we can use a different type for the context:

```typescript
import { QueryResolvers } from './resolvers-types';
import { MyContext } from './context';

export const resolvers: QueryResolvers.Resolvers<MyContext> = {
  myQuery: (root, args, context) => {}
};
```

Field resolvers can be overriden or modfied as well. For an instance, if we would like to override the behavior of the `id` field's resolver type, we can take advantage of its corresponding generic type like so: `UserResolvers.IdResolver<string, MyUser, MyContext>`.

## Custom Context Type

If you wish to use a custom type for your GraphQL context, yet you don't want to specify it each and every time you declare your resolvers, you can do it by creating a `gql-gen.json` file with the following contents:

```json
{
  "prepend": ["import { MyContext } from './context';"],
  "contextType": "MyContext"
}
```

The JSON above should be used to modify the context type of the resolver.
