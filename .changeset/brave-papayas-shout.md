---
'@graphql-codegen/plugin-helpers': minor
'@graphql-codegen/cli': minor
---

Add `watchPattern` config option for `generates` sections.

By default, `watch` mode automatically watches all GraphQL schema and document files. This means when a change is detected, Codegen CLI is run.

A user may want to run Codegen CLI when non-schema and non-document files are changed. Each `generates` section now has a `watchPattern` option to allow more file patterns to be added to the list of patterns to watch.

In the example below, mappers are exported from `schema.mappers.ts` files. We want to re-run Codegen if the content of `*.mappers.ts` files change because they change the generated types file. To solve this, we can add mapper file patterns to watch using the glob pattern used for schema and document files.

```ts
// codegen.ts
const config: CodegenConfig = {
  schema: 'src/schema/**/*.graphql',
  generates: {
    'src/schema/types.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        mappers: {
          User: './user/schema.mappers#UserMapper',
          Book: './book/schema.mappers#BookMapper',
        },
      }
      watchPattern: 'src/schema/**/*.mappers.ts', // Watches mapper files in `watch` mode. Use an array for multiple patterns e.g. `['src/*.pattern1.ts','src/*.pattern2.ts']`
    },
  },
};
```

Then, run Codegen CLI in `watch` mode:

```shell
yarn graphql-codegen --watch
```

Now, updating `*.mappers.ts` files re-runs Codegen! 🎉

Note: `watchPattern` is only used in `watch` mode i.e. running CLI with `--watch` flag.
