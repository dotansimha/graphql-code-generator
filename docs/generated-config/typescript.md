
### avoidOptionals (`boolean`, default value: `false`)

This will cause the generator to avoid using TypeScript optionals (`?`) on types, so the following definition: `type A { myField: String }` will output `myField: Maybe<string>` instead of `myField?: Maybe<string>`.


#### Usage Example: Override all definition types

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
 config:
   avoidOptionals: true
```

#### Usage Example: Override only specific definition types

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
 config:
   avoidOptionals:
     inputValue: true
```


### constEnums (`boolean`, default value: `false`)

Will prefix every generated `enum` with `const`, you can read more about const enums [here](https://www.typescriptlang.org/docs/handbook/enums.html).


#### Usage Example

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
 config:
   constEnums: true
```

### enumsAsTypes (`boolean`, default value: `false`)

Generates enum as TypeScript `type` instead of `enum`. Useful it you wish to genereate `.d.ts` declartion file instead of `.ts`


#### Usage Example

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
 config:
   enumsAsTypes: true
```

### immutableTypes (`boolean`, default value: `false`)

Generates immutable types by adding `readonly` to properties and uses `ReadonlyArray`.


#### Usage Example

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
 config:
   immutableTypes: true
```

### maybeValue (`string`, default value: `T | null`)

Allow to override the type value of `Maybe`.


#### Usage Example: Allow undefined

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
 config:
   maybeValue: T | null | undefined
```

### noExport (`boolean`, default value: `false`)

Set the to `true` in order to generate output without `export` modifier. This is useful if you are generating `.d.ts` file and want it to be globally available.


#### Usage Example: Disable all export from a file

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
 config:
   noExport: true
```