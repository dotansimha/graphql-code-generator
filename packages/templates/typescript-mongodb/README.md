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

    yarn add graphql-codegen-typescript-mongodb-template

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

    gql-gen --template graphql-codegen-typescript-mongodb-template --schema ./src/my-schema.js

> IMPORTANT: Because of GraphQL behavior, you have to use --schema and provide a JavaScript export, otherwise you will lose your GraphQL Directives usage

Now, add the directives to your GraphQL definitions, and generate your MongoDB models file.

## Directives

### `@entity(embedded: Boolean)` (on `TYPE`)

Use this directive to declare that a specific GraphQL type should have a generated MongoDB models.

* `embedded: Boolean` - specify this to declare that this entity turns into an object inside another entity. For example, if you want your structure to be `{ _id: string, username: string, profile: { name: string }}`, then your GraphQL type `Profile` should be an embedded type.

### `@column(overrideType: String, overrideIsArray: Boolean)` (on `FIELD`)

Use this directive to declare that a specific GraphQL field should be part of your generated MongoDB type.

* `overrideType: String` - use this to override the type of the field.
* `overrideIsArray: Boolean` - specify `true` to override the generated result and force it to generate an array type.

> Note that if your property is an embedded entity, you should use `@embedded` instead.

### `@id` (on `FIELD`)

Use this directive on your field that turns into your MongoDB `_id`. Usually it's your `id` field of the GraphQL `type`.

### `@link` (on `FIELD`)

Use this directive to declare that a specific field is a link to another type in another table. This will use the `ObjectID` type in your generated result.

### `@embedded` (on `FIELD`)

Use this directive to declare that a specific field is integrated into the parent entity, and should be an object inside it.

## Example

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
