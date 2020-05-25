## Installation

:::shell Using `yarn`

    $ yarn add -D @graphql-codegen/java

:::

## API Reference

### `package`

type: `string`


Customize the Java package name. The default package name will be generated according to the output file path.

#### Usage Examples

```yml
generates:
  src/main/java/my-org/my-app/Resolvers.java:
    plugins:
      - java-resolvers
    config:
      package: custom.package.name
```


### `mappers`

type: `object`


Allow you to replace specific GraphQL types with your custom model classes. This is useful when you want to make sure your resolvers returns the correct class.
The default value is the values set by `defaultMapper` configuration.
You can use a direct path to the package, or use `package#class` syntax to have it imported.

#### Usage Examples

```yml
generates:
  src/main/java/my-org/my-app/Resolvers.java:
    plugins:
      - java-resolvers
    config:
      mappers:
        User: com.app.models#UserObject
```


### `defaultMapper`

type: `string`

default: `Object`

Sets the default mapper value in case it's not specified by `mappers`.
You can use a direct path to the package, or use `package#class` syntax to have it imported.
The default mapper is Java's `Object`.

#### Usage Examples

```yml
generates:
  src/main/java/my-org/my-app/Resolvers.java:
    plugins:
      - java-resolvers
    config:
      defaultMapper: my.app.models.BaseEntity
```


### `className`

type: `string`

default: `Resolvers`

Allow you to customize the parent class name.

#### Usage Examples

```yml
generates:
  src/main/java/my-org/my-app/Resolvers.java:
    plugins:
      - java-resolvers
    config:
      className: MyResolvers
```


### `listType`

type: `string`

default: `Iterable`

Allow you to customize the list type.

#### Usage Examples

```yml
generates:
  src/main/java/my-org/my-app/Resolvers.java:
    plugins:
      - java-resolvers
    config:
      listType: Map
```


### `scalars`

type: `ScalarsMap`


Extends or overrides the built-in scalars and custom GraphQL scalars to a custom type.

#### Usage Examples

```yml
config:
  scalars:
    DateTime: Date
    JSON: "{ [key: string]: any }"
```


### `namingConvention`

type: `NamingConvention`

default: `pascal-case#pascalCase`

Allow you to override the naming convention of the output.
You can either override all namings, or specify an object with specific custom naming convention per output.
The format of the converter must be a valid `module#method`.
Allowed values for specific output are: `typeNames`, `enumValues`.
You can also use "keep" to keep all GraphQL names as-is.
Additionally you can set `transformUnderscore` to `true` if you want to override the default behavior,
which is to preserves underscores.

#### Usage Examples

##### Override All Names
```yml
config:
  namingConvention: lower-case#lowerCase
```

##### Upper-case enum values
```yml
config:
  namingConvention:
    typeNames: pascal-case#pascalCase
    enumValues: upper-case#upperCase
```

##### Keep names as is
```yml
config:
  namingConvention: keep
```

##### Remove Underscores
```yml
config:
  namingConvention:
    typeNames: pascal-case#pascalCase
    transformUnderscore: true
```


### `typesPrefix`

type: `string`

default: ``

Prefixes all the generated types.

#### Usage Examples

```yml
config:
  typesPrefix: I
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
