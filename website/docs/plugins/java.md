---
id: java
title: Java
---

{@import ../generated-config/java.md}

## How to use

You can use it directly to transform your `input` in your resolvers:

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
