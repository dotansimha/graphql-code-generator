
### dbTypeSuffix (`string`, default value: `DbObject`)

Customize the suffix for the generated GraphQL `type`s.


#### Usage Example

```yml
config:
  dbTypeSuffix: MyType
```

### dbInterfaceSuffix (`string`, default value: `DbObject`)

Customize the suffix for the generated GraphQL `interface`s.


#### Usage Example

```yml
config:
  dbInterfaceSuffix: MyInterface
```

### objectIdType (`string`, default value: `mongodb#ObjectId`)

Customize the type of `_id` fields. You can either specify a type name, or specify `module#type`.


#### Usage Example

```yml
config:
  objectIdType: ./my-models.ts#MyIdType
```

### idFieldName (`string`, default value: `_id`)

Customize the name of the id field generated after using `@id` directive over a GraphQL field.


#### Usage Example

```yml
config:
  idFieldName: id
```

### enumsAsString (`boolean`, default value: `true`)

Replaces generated `enum` values with `string`.


#### Usage Example

```yml
config:
  enumsAsString: false
```

### avoidOptionals (`boolean`, default value: `false`)

This will cause the generator to avoid using TypeScript optionals (`?`), so the following definition: `type A { myField: String }` will output `myField: Maybe<string>` instead of `myField?: Maybe<string>`.


#### Usage Example

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
   - typescript-mongodb
 config:
   avoidOptionals: true
```