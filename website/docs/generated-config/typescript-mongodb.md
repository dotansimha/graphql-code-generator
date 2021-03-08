## Installation



<img alt="typescript-mongodb plugin version" src="https://img.shields.io/npm/v/@graphql-codegen/typescript-mongodb?color=%23e15799&label=plugin&nbsp;version&style=for-the-badge"/>


    
:::shell Using `yarn`
    yarn add -D @graphql-codegen/typescript-mongodb
:::

## API Reference

### `dbTypeSuffix`

type: `string`
default: `DbObject`

Customize the suffix for the generated GraphQL `type`s.

#### Usage Examples

```yml
config:
  dbTypeSuffix: MyType
```

### `dbInterfaceSuffix`

type: `string`
default: `DbObject`

Customize the suffix for the generated GraphQL `interface`s.

#### Usage Examples

```yml
config:
  dbInterfaceSuffix: MyInterface
```

### `objectIdType`

type: `string`
default: `mongodb#ObjectId`

Customize the type of `_id` fields. You can either specify a type name, or specify `module#type`.

#### Usage Examples

```yml
config:
  objectIdType: ./my-models.ts#MyIdType
```

### `idFieldName`

type: `string`
default: `_id`

Customize the name of the id field generated after using `@id` directive over a GraphQL field.

#### Usage Examples

```yml
config:
  idFieldName: id
```

### `enumsAsString`

type: `boolean`
default: `true`

Replaces generated `enum` values with `string`.

#### Usage Examples

```yml
config:
  enumsAsString: false
```

### `avoidOptionals`

type: `boolean`
default: `false`

This will cause the generator to avoid using TypeScript optionals (`?`),
so the following definition: `type A { myField: String }` will output `myField: Maybe<string>`
instead of `myField?: Maybe<string>`.

#### Usage Examples

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
   - typescript-mongodb
 config:
   avoidOptionals: true
```

### `scalars`

type: `ScalarsMap`

Extends or overrides the built-in scalars and custom GraphQL scalars to a custom type.


### `namingConvention`

type: `NamingConvention`
default: `change-case-all#pascalCase`

Allow you to override the naming convention of the output.
You can either override all namings, or specify an object with specific custom naming convention per output.
The format of the converter must be a valid `module#method`.
Allowed values for specific output are: `typeNames`, `enumValues`.
You can also use "keep" to keep all GraphQL names as-is.
Additionally you can set `transformUnderscore` to `true` if you want to override the default behavior,
which is to preserves underscores.

Available case functions in `change-case-all` are `camelCase`, `capitalCase`, `constantCase`, `dotCase`, `headerCase`, `noCase`, `paramCase`, `pascalCase`, `pathCase`, `sentenceCase`, `snakeCase`, `lowerCase`, `localeLowerCase`, `lowerCaseFirst`, `spongeCase`, `titleCase`, `upperCase`, `localeUpperCase` and `upperCaseFirst`
[See more](https://github.com/btxtiger/change-case-all)


### `typesPrefix`

type: `string`
default: ``

Prefixes all the generated types.

#### Usage Examples

```yml
config:
  typesPrefix: I
```

### `typesSuffix`

type: `string`
default: ``

Suffixes all the generated types.

#### Usage Examples

```yml
config:
  typesSuffix: I
```

### `skipTypename`

type: `boolean`
default: `false`

Does not add __typename to the generated types, unless it was specified in the selection set.

#### Usage Examples

```yml
config:
  skipTypename: true
```

### `nonOptionalTypename`

type: `boolean`
default: `false`

Automatically adds `__typename` field to the generated types, even when they are not specified
in the selection set, and makes it non-optional

#### Usage Examples

```yml
config:
  nonOptionalTypename: true
```

### `useTypeImports`

type: `boolean`
default: `false`

Will use `import type {}` rather than `import {}` when importing only types. This gives
compatibility with TypeScript's "importsNotUsedAsValues": "error" option
