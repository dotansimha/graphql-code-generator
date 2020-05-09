
### package (`string`)

Customize the Java package name. The default package name will be generated according to the output file path.


#### Usage Example

```yml
generates:
  src/main/kotlin/my-org/my-app/Resolvers.kt:
    plugins:
      - kotlin
    config:
      package: custom.package.name
```

### enumValues (`EnumValuesMap`)

Overrides the default value of enum values declared in your GraphQL schema.


#### Usage Example: With Custom Values

```yml
  config:
    enumValues:
      MyEnum:
        A: 'foo'
```

### listType (`string`, default value: `Iterable`)

Allow you to customize the list type


#### Usage Example

```yml
generates:
  src/main/kotlin/my-org/my-app/Types.kt:
    plugins:
      - kotlin
    config:
      listType: Map
```

### withTypes (`boolean`, default value: `false`)

Allow you to enable generation for the types


#### Usage Example

```yml
generates:
  src/main/kotlin/my-org/my-app/Types.kt:
    plugins:
      - kotlin
    config:
      withTypes: true
```