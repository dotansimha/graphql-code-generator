
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