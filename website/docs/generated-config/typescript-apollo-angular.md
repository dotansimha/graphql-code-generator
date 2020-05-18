
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




### querySuffix (`string`, default value: `'GQL'`)

Allows to define a custom suffix for query operations.


#### Usage Example: graphql.macro

```yml
config:
  querySuffix: 'QueryService'
```

### mutationSuffix (`string`, default value: `'GQL'`)

Allows to define a custom suffix for mutation operations.


#### Usage Example: graphql.macro

```yml
config:
  mutationSuffix: 'MutationService'
```

### subscriptionSuffix (`string`, default value: `'GQL'`)

Allows to define a custom suffix for Subscription operations.


#### Usage Example: graphql.macro

```yml
config:
  subscriptionSuffix: 'SubscriptionService'
```

### apolloAngularPackage (`string`, default value: `'apollo-angular'`)

Allows to define a custom Apollo-Angular package to import types from.


