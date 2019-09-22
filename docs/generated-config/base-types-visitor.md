
### addUnderscoreToArgsType (`boolean`)

Adds `_` to generated `Args` types in order to avoid duplicate identifiers.


#### Usage Example: With Custom Values

```yml
  config:
    addUnderscoreToArgsType: true
```


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

#### Usage Example: Import All Enums from a file

```yml
  config:
    enumValues: ./my-file
```

### declarationKind (`DeclarationKindConfig`)

Overrides the default output for various GraphQL elements.


#### Usage Example: Override all declarations

```yml
  config:
    declarationKind: 'interface'
```

#### Usage Example: Override only specific declarations

```yml
  config:
    declarationKind:
      type: 'interface'
      input: 'interface'
```

### enumPrefix (`boolean`, default value: `true`)

Allow you to disable prefixing for generated enums, works in combination with `typesPrefix`.


#### Usage Example: Disable enum prefixes

```yml
  config:
    typesPrefix: I
    enumPrefix: false
```