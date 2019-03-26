---
id: typescript-resolvers
title: TypeScript Resolvers
---

This plugin generates types for resolve function.

## Pre-Requirements

A TypeScript project with `@types/graphql` installed.

## Installation

    $ yarn add @graphql-codegen/typescript-resolvers

## Usage

Run `graphql-codegen` as usual:

```yaml
schema: schema.json
generates:
  ./src/resolvers-types.ts:
    plugins:
      - typescript
      - typescript-resolvers
```

Import the types from the generated file and use in the resolver:

```typescript
import { QueryResolvers } from './resolvers-types';

export const resolvers: QueryResolvers = {
  myQuery: (root, args, context) => {},
};
```

This will make the resolver fully typed and compatible with typescript compiler, including the handler's arguments and return value.

## Configuration

{@import: ../docs/generated-config/base-visitor.md}
{@import: ../docs/generated-config/base-resolvers-visitor.md}
{@import: ../docs/generated-config/typescript-resolvers.md}

## How It Works

It adds the generic resolvers signature to the top of the file:

```typescript
export type ResolverFn<TResult, TParent, TContext, TArgs> = (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => Promise<TResult> | TResult;

export type StitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => TResult | Promise<TResult>;
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
export interface QueryResolvers<Context = any, ParentType = Query> {
  allUsers?: Resolver<Array<Maybe<User>>, ParentType, Context>;
  userById?: Resolver<Maybe<User>, ParentType, Context, QueryUserByIdArgs>;
}

export interface UserResolvers<Context = any, ParentType = User> {
  id?: Resolver<number, ParentType, Context>;
  name?: Resolver<string, ParentType, Context>;
  email?: Resolver<string, ParentType, Context>;
}
```

Let's talk what you get by default. Each resolver has 4 types for:

- an object that its parent resolved, we call it Parent.
- a value that resolver returns
- arguments
- a context

By default, the context is just an empty object `{}`.
Arguments are generated based on schema, so you don't have to think about them.
Types of a parent and a returned value are pretty interesting. Given the example schema:

```graphql
type Query {
  allUsers: [User]
  userById(id: Int!): User
}

type Profile {
  bio: String
}

type User {
  id: Int!
  name: String!
  email: String!
  profile: Profile
}
```

By default:

- all fields in `Profile` expects to get a `Profile` typed object as a parent
- fields in `User` receives a `User` as a parent
- `User.profile` returns `Profile`
- `Query.userById` expects to returns `User` typed object

This behavior might fit well with how your resolvers look like but in some cases you want to tweak it a bit.

## Plugin Customization

The generated resolver's signature type can be overridden or modified by taking advantage of the generic deceleration feature.

## Mappers - overwrite parents and resolved values

Remember the example we showed you, when the GraphQL type `User` expects to be resolved by `User` typed object? What if an object returned by `Query.userById` has `_id` property instead of `id`. It breaks the default behavior. Thats' why we implemented mappers.

The idea behind Mappers is to map an interface to a GraphQL Type so you overwrite that default logic.

Let's define one. This is what `Query.userById` passes on to the `User` type:

```typescript
// src/types.ts

export interface UserParent {
  _id: string;
  name: string;
  email: string;
  profile: {
    bio: text;
  };
}
```

This is how to map that interface with the according type:

```yaml
# ...
generates:
  path/to/file.ts:
    config:
      mappers:
        User: ./types#UserParent
    plugins:
      - typescript-resolvers
```

Inside of `config.mappers` we wired the `User` with `UserParent` from `./types.ts`. You can also define the interface inside of the config file or even use `any` and other primitive types.

> By typing `./types#UserParent` we tell codegen to create an import statement that includes `UserParent` and gets it from `./types` module
> Remember! The path have to be relative to the generated file.

Every other, not mapped type follows the default convention, so in order to overwrite it you can use the `defaultMapper` option:

```yaml
# ...
generates:
  path/to/file.ts:
    config:
      defaultMapper: any
      mappers:
        User: ./types#UserParent
    plugins:
      - typescript-resolvers
```

Given the above config, every other type then `User` will have `any` as its parent and resolved value. We don't recommend to do it but it might be very helpful when you try to slowly map all types.

## Custom Context Type

If you wish to use a custom type for your GraphQL context, yet you don't want to specify it each and every time you declare your resolvers, you can do it in the config file:

```yaml
# ...
generates:
  path/to/file.ts:
    config:
      contextType: ./context#MyContext
    plugins:
      - typescript-resolvers
```

```typescript
export interface MyContext {
  authToken: string;
}
```

The config above will make every resolver to have `MyContext` as a context type.

```typescript
import { QueryResolvers } from './resolvers-types';

export const resolvers: QueryResolvers = {
  myQuery: (root, args, context) => {
    const { authToken } = context;
    // ...
  },
};
```

Field resolvers will be modfied as well.
