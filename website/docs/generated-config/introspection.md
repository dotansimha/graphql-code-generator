
### minify (`boolean`, default value: `false`)

Set to `true` in order to minify the JSON output.


#### Usage Example

```yml
generates:
introspection.json:
  plugins:
    - introspection
  config:
    minify: true
```