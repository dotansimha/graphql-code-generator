---
id: naming-convention
title: Naming Convention
---

GraphQL Code Generation provides a `namingConvention` option to control the naming convention of the different code elements generated (types, enum values, ...).

### `namingConvention`

type: `NamingConvention`
default: `change-case-all#pascalCase`

Allow you to override the naming convention of the output.

You can either override all namings or specify an object with a specific custom naming convention per output.
The converter format must be a valid `module#method`.

Allowed values for specific output are: `typeNames`, `enumValues`.
You can also use "keep" to keep all GraphQL names as-is.
Additionally, you can set `transformUnderscore` to `true` if you want to override the default behavior to preserve underscores.

#### Usage Examples

##### Override All Names

```yml
config:
  namingConvention: change-case-all#lowerCase
```

##### Upper-case enum values

```yml
config:
  namingConvention:
    typeNames: change-case-all#pascalCase
    enumValues: change-case-all#upperCase
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
    typeNames: change-case-all#pascalCase
    transformUnderscore: true
```

#### Using external modules

All the examples you saw so far were using `change-case-all` package.

The `change-case-all` package being a direct dependency of graphql-codegen, you can use it directly.

However, you can use any other package as long as it is installed as a dependency.
The same syntax needs to be used:

```
package-name#export-you-want-to-use
```

For example, if you want to use `camelCase` from lodash, given that you have it already installed, you will do it like this:

```yml
config:
  namingConvention: lodash#camelCase
```

#### Providing your own naming function

As you may have guessed already, there is nothing fancy about naming functions.
They are just functions that take a string as input and produce it as output.

If you stick to that signature, you can provide your own naming function.
You need to provide a CJS module with a default export of a function that takes a string and returns a string.

The following example provides a workaround to a limitation of `change-case-all`:

```js
// my-naming-fn.js
// Fix for https://github.com/dotansimha/graphql-code-generator/issues/6040
const { constantCase } = require('change-case-all')
/**
 * This function wraps constant case, that turns any string into CONSTANT_CASE
 * However, this function has a bug that, if you pass _ to it it will return an empty
 * string. This small module fixes that
 *
 * @param {string*} str
 * @return {string}
 */
function FixedConstantCase(str) {
  const result = constantCase(str)
  // If result is an empty string, just return the original string
  return result || str
}
module.exports = FixedConstantCase
```

Then, just provide the path to your custom naming module in the configuration:

```yml
config:
  namingConvention: ./my-naming-fn
```

This also applies when you want a specific custom naming convention per output.
Specify your custom naming function on the output or outputs you want to apply:

```yml
config:
  namingConvention:
    typeNames: ./my-naming-fn
```
