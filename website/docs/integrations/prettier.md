---
id: prettier
title: Prettier & Linters
---

The codegen supports lifecycle hooks, and you can use those for integration with Prettier or other linters, to apply your custom code-style and formatting rules. Before adding hooks consider the alternative of having codegen ignored in your linting. Codegen files are not edited manually and formatting them slows down your codegen considerably. On a big project difference can be measured in several seconds for every run.

[You can read the complete documentation of lifecycle hooks here](../getting-started/lifecycle-hooks.md)

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

Prefer this method if you're using near-operation-file preset as this has better performance when writing many files.

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
