
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

### fieldWrapperValue (`string`, default value: `T`)

Allow you to add wrapper for field type, use T as the generic value. Make sure to set `wrapFieldDefinitions` to `true` in order to make this flag work.


#### Usage Example: Allow Promise

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
 config:
   wrapFieldDefinitions: true
   fieldWrapperValue: T | Promise<T>
```

### wrapFieldDefinitions (`boolean`, default value: `false`)

Set the to `true` in order to wrap field definitions with `FieldWrapper`. This is useful to allow return types such as Promises and functions.


#### Usage Example: Enable wrapping fields

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
 config:
   wrapFieldDefinitions: true
```

### onlyOperationTypes (`boolean`, default value: `false`)

This will cause the generator to emit types for operations only (basically only enums and scalars)


#### Usage Example: Override all definition types

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
 config:
   onlyOperationTypes: true
```