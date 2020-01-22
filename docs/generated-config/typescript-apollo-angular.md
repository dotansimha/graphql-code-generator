
### ngModule (`string`)

Allows to define `ngModule` as part of the plugin's config so it's globally available.


#### Usage Example: graphql.macro

```yml
config:
  ngModule: ./path/to/module#MyModule
```

### namedClient (`string`)

Defined the global value of `namedClient`.


#### Usage Example: graphql.macro

```yml
config:
  namedClient: 'customName'
```

### serviceName (`string`)

Defined the global value of `serviceName`.


#### Usage Example: graphql.macro

```yml
config:
  serviceName: 'MySDK'
```

### serviceProvidedInRoot (`string`)

Defined the global value of `serviceProvidedInRoot`.


#### Usage Example: graphql.macro

```yml
config:
  serviceProvidedInRoot: false
```

### sdkClass (`boolean`, default value: `false`)

Set to `true` in order to generate a SDK service class that uses all generated services.


