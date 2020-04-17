
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
  src/main/c-sharp/my-org/my-app/MyGeneratedTypes.cs:
    plugins:
      - c-sharp
    config:
      className: MyGeneratedTypes
```

### listType (`string`, default value: `IEnumberable`)

Allow you to customize the list type


#### Usage Example

```yml
generates:
  src/main/c-sharp/my-org/my-app/Types.cs:
    plugins:
      - c-sharp
    config:
      listType: Map
```