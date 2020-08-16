---
id: java-resolvers
title: Java Resolvers
---

The `java-resolvers` plugin creates Java `interface`s for the resolvers signature.

It works with `graphql-java` library and it uses it's `DataFetcher` API.

You can use this plugin to generate interfaces and later implement them, this way you can always tell if one of the fields is missing a resolvers:

```java
import com.my.app.generated.Resolvers;
import com.my.app.models.User;
import graphql.schema.DataFetcher;

export class QueryResolvers implements Resolvers.Query {
  public DataFetcher<String> id() {
        return environment -> environment.<User>getSource().getId();
    }
}
```

## Prepare your environment

{@import ../plugins/java-installation.md}

{@import ../generated-config/java-resolvers.md}

