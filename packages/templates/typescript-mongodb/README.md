# TypeScript MongoDB Typings

## Overview

This package generates TypeScript types for MongoDB server-side developers.

It uses GraphQL directives to declare the types you want to generate and use in your MongoDB.

It take a declaration like this:

```graphql
type User @entity {
    id: String @id
    username: String! @column
    email: @column
}
```

And generates a TypeScript interface like this:

```typescript
import { ObjectID } from 'mongodb';

export interface UserDbObject {
  _id: ObjectID;
  username: string;
  email?: string | null;
}
```

So you can use it when you read/write to your database, and expect a specific structure.

## How to use?

To use this package, install is using Yarn into your project, as a dependency:

```
yarn add graphql-codegen-typescript-mongodb-template
```

Then, you need to add the directives declaration to your GraphQL Schema definition:

```typescript
import { makeExecutableSchema } from 'graphql-tools';
import { DIRECTIVES } from 'graphql-codegen-typescript-mongodb-template';

const schema = makeExecutableSchema({
  typeDefs: [
    DIRECTIVES
    // the rest of your GraphQL types
  ],
  resolvers
});
```

Now, use this template with the GraphQL code generator:

```
gql-gen --template graphql-codegen-typescript-mongodb-template --schema ./src/my-schema.js
```

> IMPORTANT: Because of GraphQL behavior, you have to use --schema and provide a JavaScript export, otherwise you will lose your GraphQL Directives usage

Now, add the directives to your GraphQL definitions, and generate your MongoDB models file.

## Directives

### `@entity(embedded: Boolean, additionalFields: [AdditionalEntityFields])` (on `OBJECT`)

Use this directive to declare that a specific GraphQL type should have a generated MongoDB models.

- `embedded: Boolean` - specify this to declare that this entity turns into an object inside another entity. For example, if you want your structure to be `{ _id: string, username: string, profile: { name: string }}`, then your GraphQL type `Profile` should be an embedded type.
- `additionalFields: [AdditionalEntityFields]` - specify any additional fields that you with to add to your MongoDB object, and are not part of your public GraphQL schema.

```graphql
type User @entity(additionalFields: [
 { path: "services.login.token", type: "string" }
]) {
 id: String @id
 email: @column
}
```

### `@column(name: string, overrideType: String, overrideIsArray: Boolean)` (on `FIELD_DEFINITION`)

Use this directive to declare that a specific GraphQL field should be part of your generated MongoDB type.

- `overrideType: String` - use this to override the type of the field, for example, if you persist dates as `Date` but expose them as `String`.
- `overrideIsArray: Boolean` - specify `true`/`false` to override the generated result and force it to generate an array type (or not).
- `name: String` - you can specify the name of the field as you wish to have it on your DB - it could be also a path (`a.b.c`). This is a shortcut for `@map` directive.

> Note that if your property is an embedded entity, you should use `@embedded` instead.

### `@id` (on `FIELD_DEFINITION`)

Use this directive on your field that turns into your MongoDB `_id`. Usually it's your `id` field of the GraphQL `type`.

### `@link` (on `FIELD_DEFINITION`)

Use this directive to declare that a specific field is a link to another type in another table. This will use the `ObjectID` type in your generated result.

### `@embedded` (on `FIELD_DEFINITION`)

Use this directive to declare that a specific field is integrated into the parent entity, and should be an object inside it.

### `@map(path: String)` (on `FIELD_DEFINITION`)

Use this directive to override the `path` or the name of the field. It's useful for creating a more complex object structure on the database.

For example, if you wish to expose a field as `username` on your schema, but persist it in `credentials.username` on your DB.

You can either specify the name of the field, or a `path` to it to generate an object.

```graphql
type User @entity {
  username: String @column @map(path: "credentials.username")
}
```

Will output:

```typescript
export interface UserDbObject {
  credentials: {
    username: string;
  };
}
```

### `@abstractEntity(discriminatorField: String!)` (on `INTERFACE`)

Use this directive on your GraphQL `interface`s to indicate that this interface is a common base for other database types.

Specify `discriminatorField` to tell the generator what is the name of the field you are using on your database to identify how which object is implementing the interface.

For example:

```graphql
interface BaseNotification @abstractEntity(discriminatorField: "notificationType") {
  id: ID! @id
  createdAt: String! @column(overrideType: "Date")
}

type TextNotification implements BaseNotification @entity {
  id: ID!
  createdAt: String!
  content: String! @column
}
```

This way, you will get:

```typescript
export interface BaseNotificationDbInterface {
  notificationType: string;
  _id: ObjectID;
  createdAt: Date;
}

export interface TextNotificationDbObject extends BaseNotificationDbInterface {
  content: string;
}
```

### `@union(discriminatorField: String)` (on `UNION`)

This directive is similar to `@abstractEntity`, but for unions (that not necessarily have common fields).

Specify `discriminatorField` to tell the generator what is the name of the field you are using on your database to identify how which object is implementing the interface.

```graphql
type A @entity {
    fieldA: String @column
}

type B @entity {
    fieldB: String @column
}

union PossibleType = A | B @union(discriminatorField: "entityType")
```

You will get:

```typescript
export interface ADbObject {
  fieldA: string;
}

export interface BDbObject {
  fieldB: string;
}

export type PossibleType = { entityType: string } & (ADbObject | BDbObject);
```

## Simple Example

For example, if you have a `User` (that matches to `users` table), `Profile` (which is part of your `User`) and `Friends` which is an array of `ObjectID` inside your user, use the following schema:

```
type User @entity {
    id: String! @id
    username: String! @column
    email: String! @column
    profile: Profile! @embedded
    friendsCount: Int! # this field won't get a generated MongoDB field
    friends: [User]! @link
}

type Profile @entity(embedded: true) {
    name: String! @column
    age: Int! @column
}
```

The output will be:

```typescript
import { ObjectID } from 'mongodb';

export interface UserDbObject {
  _id: ObjectID;
  username: string;
  email: string;
  profile: ProfileDbObject;
  friends: ObjectID[];
}

export interface ProfileDbObject {
  name: string;
  age: string;
}
```

## Generator Config

This generator supports custom config and output behavior. Use to following flags/environment variables to modify your output as you wish:

### `schemaNamespace` (or `CODEGEN_SCHEMA_NAMESPACE`, default value: `null`)

This will cause the codegen to wrap the generated schema typings with a TypeScript namespace.

Use this feature if you need to run the codegen on multiple schemas, but getting a unified types (read more [here](https://www.typescriptlang.org/docs/handbook/declaration-merging.html))
