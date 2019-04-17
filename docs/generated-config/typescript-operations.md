### avoidOptionals (`boolean`, default value: `false`)

This will cause the generator to avoid using TypeScript optionals (`?`), so the following definition: `type A { myField: String }` will output `myField: Maybe<string>` instead of `myField?: Maybe<string>`.

#### Usage Example

```yml
generates:
path/to/file.ts:
  plugins:
    - typescript
    - typescript-operations
  config:
    avoidOptionals: true
```

### immutableTypes (`boolean`, default value: `false`)

Generates immutable types by adding `readonly` to properties and uses `ReadonlyArray`.

#### Usage Example

```yml
generates:
path/to/file.ts:
  plugins:
    - typescript
    - typescript-operations
  config:
    immutableTypes: true
```
