---
id: prettier
title: Prettier & Linters
---

The codegen supports lifecycle hooks, and you can use those for integration with Prettier or other linters, to apply your custom code style and formatting rules.

Before adding a hook, consider the alternative of having codegen ignored in your linting.
Codegen files should not be edited manually and formatting them slows down your codegen considerably.
Differences can be measured in several seconds for every run on big projects.

[You can read the complete documentation of lifecycle hooks here](/docs/config-reference/lifecycle-hooks)

## Prettier

You can run it per each file:

```yml
hooks:
  afterOneFileWrite:
    - prettier --write
```

Or, for all files together:

```yml
hooks:
  afterAllFileWrite:
    - prettier --write
```

Consider this method if you're using `near-operation-file` preset as this has better performance when writing many files.

## TSLint

You can run it per each file:

```yml
hooks:
  afterOneFileWrite:
    - tslint --fix
```

Or, for all files together:

```yml
hooks:
  afterAllFileWrite:
    - tslint --fix
```

## ESLint

```yml
hooks:
  afterOneFileWrite:
    - eslint --fix
```

Or, for all files together:

```yml
hooks:
  afterAllFileWrite:
    - eslint --fix
```
