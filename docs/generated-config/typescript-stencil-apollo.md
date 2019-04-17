### componentType (`functional / class`, default value: `functional`)

Customize the output of the plugin - you can choose to generate a Component class or a function component.

#### Usage Example

```yml
generates:
path/to/file.ts:
  plugins:
    - typescript
    - typescript-operations
    - typescript-stencil-apollo
  config:
    componentType: class
```
