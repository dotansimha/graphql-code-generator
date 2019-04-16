---
id: java-resolvers
title: Java Resolvers
---

The `java-resolvers` plugin creates Java `interface`s for the resolvers signature.

It works with `graphql-java` library and it uses it's `DataFetcher` API.

You can use this plugin to generate interfaces and later implement them, this way you can always tell if one of the fields is missing a resolvers:

```
import com.my.app.generated.Resolvers;
import com.my.app.models.User;
import graphql.schema.DataFetcher;

export class QueryResolvers implements Resolvers.Query {
  public DataFetcher<String> id() {
        return environment -> environment.<User>getSource().getId();
    }
}
```

## Installation

{@import: ../docs/plugins/java-installation.md}

## Configuration

{@import: ../docs/generated-config/java-resolvers.md}
{@import: ../docs/generated-config/base-visitor.md}
