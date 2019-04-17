---
id: java
title: Java
---

The `java` plugin generates Java `class`es for for Enums and Input types.

It works with `graphql-java` library.

You can use this plugin to generate Java enums based on your GraphQL schema, and it also generates a type-safe Java transfomer for GraphQL `input` types.

Then, you can use it directly to transofmr your `input` in your resolvers:

```graphql
type Query {
  user(id: ID!): User!
}

type User {
  id: ID
}
```

Then, in your resolver:

```java
import com.my.app.generated.Types;
import com.my.app.models.User;
import graphql.schema.DataFetcher;

export class QueryResolvers {
  public DataFetcher<User> user() {
        return env -> {
            Types.QueryUserArgs args = new Types.QueryUserArgs(env.getArguments());
            String userId = args.getId();

            // rest of the code
        };
    }
}
```

## Installation

{@import: ../docs/plugins/java-installation.md|java|Types}

## Configuration

{@import: ../docs/generated-config/java.md}
{@import: ../docs/generated-config/base-visitor.md}
