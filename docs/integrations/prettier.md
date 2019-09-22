---
id: prettier
title: Prettier & Linters
---

The codegen supports lifecycle hooks, and you can use those for integration with Prettier or other linters, to apply your custom code-style and formatting rules.

[You can read the complete documentation of lifecycle hooks here](../getting-started/lifecycle-hooks)

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