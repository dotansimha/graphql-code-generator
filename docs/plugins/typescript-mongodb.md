---
id: typescript-mongodb
title: Typescript MongoDB
---

This plugin would generate TypeScript types for MongoDB models, which makes it relevant for server-side development only. It uses GraphQL directives to declare the types you want to generate and use in your MongoDB backend.

Given the following GraphQL declaration:

```graphql
type User @entity {
    id: String @id
    username: String! @column
    email: @column
}
```

We can have the following Typescript output:

```typescript
import { ObjectID } from 'mongodb';

export interface UserDbObject {
  _id: ObjectID;
  username: string;
  email?: string | null;
}
```

This interface can be used for db read/write purposes, thus making communication with the db much more consistent.

## Installation

Install using `npm` (or `yarn`):

    $ npm install graphql-codegen-typescript-mongodb

## Usage

Once installed, add the directives declaration to your GraphQL Schema definition:

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

And generate code using `gql-gen`:

```yaml
schema: ./src/my-schema.js
require:
  - ts-node/register
overwrite: true
generates:
  ./src/generated/graphql.ts:
    plugins:
      - typescript-mongodb
```

At this point, you can add the directives to your GraphQL definitions, and generate your MongoDB models file.

## Directives

#### `@entity(embedded: Boolean, additionalFields: [AdditionalEntityFields])` (on `OBJECT`)

Use this directive to specify which GraphQL type should have generated MongoDB models.

- `embedded: Boolean` - use this option to declare target entity as child of a greater entity. For example, given the following structure `{ _id: string, username: string, profile: { name: string }}`, the GraphQL type `Profile` should be declared as embedded.
- `additionalFields: [AdditionalEntityFields]` - specify any additional fields that you would like to add to your MongoDB object, and are not a part of your public GraphQL schema.

```graphql
type User @entity(additionalFields: [
 { path: "services.login.token", type: "string" }
]) {
 id: String @id
 email: @column
}
```

#### `@column(name: string, overrideType: String, overrideIsArray: Boolean)` (on `FIELD_DEFINITION`)

Use this directive to declare a specific GraphQL field as part of your generated MongoDB type.

- `overrideType: String` - use this to override the type of the field; for example, if you store dates as `Date` but expose them as `String`.
- `overrideIsArray: Boolean` - if true, override generated result and force generate it as an array type.
- `name: String` - a projection field name that would appear in the DB. This can be either a consistent string or a path (`a.b.c`). This is a shortcut for the `@map` directive.

> ⚠ If target property is an embedded entity, you should use `@embedded` instead.

#### `@id` (on `FIELD_DEFINITION`)

Use this directive on the filed that should be mapped to a MongoDB `_id`. By default, it should be the `id` field of the GraphQL `type`.

#### `@link` (on `FIELD_DEFINITION`)

Use this directive to declare that a specific field is a link to another type in another table. This will use the `ObjectID` type in the generated result.

#### `@embedded` (on `FIELD_DEFINITION`)

use this option to declare target entity as child of a greater entity.

#### `@map(path: String)` (on `FIELD_DEFINITION`)

Use this directive to override the path or the name of the target field. This would come in handy whenever we would like to create a more complex object structure in the database;
for example, if you wish to project a field as `username` on your schema, but store it as `credentials.username` in your DB.
You can either specify the name of the field, or a path to which will lead to its corresponding field in the DB.

Given the following GraphQL schema:

```graphql
type User @entity {
  username: String @column @map(path: "credentials.username")
}
```

The output should be:

```typescript
export interface UserDbObject {
  credentials: {
    username: string;
  };
}
```

#### `@abstractEntity(discriminatorField: String!)` (on `INTERFACE`)

Use this directive on a GraphQL interface to mark it as a basis for other database types.
The `discriminatorField` argument is mandatory and will tell the generator what field name in the database determines what interface the target object is implementing.

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

#### `@union(discriminatorField: String)` (on `UNION`)

This directive is similar to `@abstractEntity`, but for unions (that don't necessarily have any common fields).
The `discriminatorField` argument is mandatory and will tell the generator what field name in the database determines what interface the target object is implementing.

Given the following GraphQL schema:

```graphql
type A @entity {
    fieldA: String @column
}

type B @entity {
    fieldB: String @column
}

union PossibleType = A | B @union(discriminatorField: "entityType")
```

The output should be:

```typescript
export interface ADbObject {
  fieldA: string;
}

export interface BDbObject {
  fieldB: string;
}

export type PossibleType = { entityType: string } & (ADbObject | BDbObject);
```

## Example

Given the following GraphQL types:

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

The generated MongoDB models should look like so:

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

## Configuration

The output of this template can be controlled using a specified config file which consists of the fields below. Each config field is followed by its matching environment variable, which can be used as an alternative method to control the template's behavior:

#### `schemaNamespace`, `CODEGEN_SCHEMA_NAMESPACE` (default value: `null`)

This will tell the codegen to wrap the generated schema typings with a TypeScript namespace. Note that even though we run this command on multiple schemas, the output types will be merged and not separated. For more information regards declaration merging, see [reference](https://www.typescriptlang.org/docs/handbook/declaration-merging.html).
