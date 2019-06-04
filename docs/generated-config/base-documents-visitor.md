### skipTypename (`boolean`, default value: `false`)

When `false`, automatically adds an optional `__typename` field to the generated types, even when not specified in the selection set.

#### Usage Example

```yml
config:
  skipTypename: true
```

### nonOptionalTypename (`boolean`, default value: `false`)

When `true`, makes the `__typename` field non-optional on generated types, even when not specified in the selection set.

#### Usage Example

```yml
config:
  nonOptionalTypename: true
```
