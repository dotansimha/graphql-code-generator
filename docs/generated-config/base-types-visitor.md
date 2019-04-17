### enumValues (`EnumValuesMap`)

Overrides the default value of enum values declared in your GraphQL schema. You can also map the entire enum to an external type by providing a string that of `module#type`.

#### Usage Example: With Custom Values

```yml
config:
  enumValues:
    MyEnum:
      A: 'foo'
```

#### Usage Example: With External Enum

```yml
config:
  enumValues:
    MyEnum: ./my-file#MyCustomEnum
```
