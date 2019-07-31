
### package (`string`)

Customize the Java package name. The default package name will be generated according to the output file path.


#### Usage Example

```yml
generates:
  src/main/java/my-org/my-app/Resolvers.java:
    plugins:
      - java-resolvers
    config:
      package: custom.package.name
```

### mappers (`Object`)

Allow you to replace specific GraphQL types with your custom model classes. This is useful when you want to make sure your resolvers returns the correct class. The default value is the values set by `defaultMapper` configuration. You can use a direct path to the package, or use `package#class` syntax to have it imported.


#### Usage Example

```yml
generates:
  src/main/java/my-org/my-app/Resolvers.java:
    plugins:
      - java-resolvers
    config:
      mappers:
        User: com.app.models#UserObject
```

### defaultMapper (`string`, default value: `Object`)

Sets the default mapper value in case it's not specified by `mappers`. You can use a direct path to the package, or use `package#class` syntax to have it imported. The default mapper is Java's `Object`.


#### Usage Example

```yml
generates:
  src/main/java/my-org/my-app/Resolvers.java:
    plugins:
      - java-resolvers
    config:
      defaultMapper: my.app.models.BaseEntity
```

### className (`string`, default value: `Resolvers`)

Allow you to customize the parent class name.


#### Usage Example

```yml
generates:
  src/main/java/my-org/my-app/Resolvers.java:
    plugins:
      - java-resolvers
    config:
      className: MyResolvers
```

### listType (`string`, default value: `Iterable`)

Allow you to customize the list type.


#### Usage Example

```yml
generates:
  src/main/java/my-org/my-app/Resolvers.java:
    plugins:
      - java-resolvers
    config:
      listType: Map
```