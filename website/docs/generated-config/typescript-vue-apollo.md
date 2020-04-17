
### withCompositionFunctions (`boolean`, default value: `true`)

Customized the output by enabling/disabling the generated Vue composition functions.


#### Usage Example

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
   - typescript-operations
   - typescript-vue-apollo
 config:
   withCompositionFunctions: true
```

### vueApolloComposableImportFrom (`string`, default value: `vue/apollo-composable`)





### addDocBlocks (`boolean`, default value: `true`)

Allows you to enable/disable the generation of docblocks in generated code. Some IDE's (like VSCode) add extra inline information with docblocks, you can disable this feature if your prefered IDE does not.


#### Usage Example

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
   - typescript-operations
   - typescript-vue-apollo
 config:
   addDocBlocks: true
```