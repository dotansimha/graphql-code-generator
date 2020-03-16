
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
     object: true
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

### enumsAsConst (`boolean`, default value: `false`)

Generates enum as TypeScript `const assertions` instead of `enum`. This can even be used to enable enum-like patterns in plain JavaScript code if you choose not to use TypeScript’s enum construct.


#### Usage Example

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
 config:
   enumsAsConst: true
```

### fieldWrapperValue (`string`, default value: `T | Promise | (() = T | Promise)`)

Allow to override the type value of `FieldWrapper`.


#### Usage Example: Only allow values

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
 config:
   fieldWrapperValue: T
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
#### Usage Example: Allow `null` in resolvers:

```yml
generates:
 path/to/file.ts:
   plugins:
     - typescript
     - typescript-resolves
   config:
     maybeValue: 'T extends PromiseLike<infer U> ? Promise<U | null> : T | null'
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

### wrapFieldDefinitions (`boolean`, default value: `true`)

Set the to `true` in order to wrap field definitions with `FieldWrapper`. This is useful to allow return types such as Promises and functions.


#### Usage Example: Enable wrapping fields

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
 config:
   wrapFieldDefinitions: false
```