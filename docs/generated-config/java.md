
### package (`string`)

Customize the Java package name. The default package name will be generated according to the output file path.


#### Usage Example

```yml
generates:
  src/main/java/my-org/my-app/Resolvers.java:
    plugins:
      - java
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

### className (`string`, default value: `Types`)

Allow you to customize the parent class name.


#### Usage Example

```yml
generates:
  src/main/java/my-org/my-app/MyGeneratedTypes.java:
    plugins:
      - java
    config:
      className: MyGeneratedTypes
```

### listType (`string`, default value: `Iterable`)

Allow you to customize the list type


#### Usage Example

```yml
generates:
  src/main/java/my-org/my-app/Types.java:
    plugins:
      - java
    config:
      listType: Map
```