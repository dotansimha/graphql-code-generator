# TypeScript Resolvers Template

This template extends the [base TypeScript template](../typescript/) and adds Resolvers signature to the generated output.

## Requirements

To use this template, you need a TypeScript project. Also make sure to install `@types/graphql`.

## How to use?

Start by using the template like any other Codegen template:

```
gql-gen --template graphql-codegen-typescript-resolvers-template --schema schema.json --out ./src/resolvers-types.ts
```

> You don't need to specify GraphQL documents.

Then, in your code, write your resolvers, and specify the object type by importing it from the generated file, according to the resolver you are writing:

```typescript
import { QueryResolvers } from './resolvers-types';

export const resolvers: QueryResolvers.Resolvers = {
  myQuery: (root, args, context) => {}
};
```

Now, your `root, args, context` will be types, and you'll get static type checking for the fields names, type and for the resolver return value.

## How it works?

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
  ): AsyncIterator<R | Result> | Promise<AsyncIterator<R | Result>>;
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

Will output:

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

This template extends the [base TypeScript template](../typescript/), so you can use any configuration variables that supported there.

If you wish, you can customize the resolver signature by using the generic declaration and specifying other types.

To set the interface/type of your GraphQL `Context`, you can use the generic of the generated interface:

```typescript
import { QueryResolvers } from './resolvers-types';
import { MyContext } from './context';

export const resolvers: QueryResolvers.Resolvers<MyContext> = {
  myQuery: (root, args, context) => {}
};
```

> If you wish, refer to "Custom Context Type" section to read how to set the context type to all generated resolvers without overriding it each time.

Also, if you wish your field-resolver to return something else, you can override it like that: `UserResolvers.IdResolver<string, MyUser, MyContext>`.

## Custom Context Type

If you wish to use a custom type for your GraphQL context, and you don't want to specify it each time you declare your resolvers, you can do it by creating `gql-gen.json` file, and add the following:

```json
{
  "prepend": ["import { MyContext } from './context';"],
  "contextType": "MyContext"
}
```

And the codegen will set it automatically to this value instead of `any`.
