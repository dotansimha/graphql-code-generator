---
'@graphql-codegen/plugin-helpers': patch
'@graphql-codegen/typescript': patch
'@graphql-codegen/typescript-operations': patch
---

Fix type errors in `plugin-helpers` under `strict: true`:

- `@graphql-codegen/plugin-helpers`: `ProfilerEvent.cat` is optional, matching the Trace Event format and `Profiler.run`'s optional `cat`. `FederationMeta`'s reference selection sets are typed recursively (`{ [field: string]: true | ReferenceSelectionSet }`), matching the nested selections `@key`/`@requires`/`@provides` produce. `oldVisit`'s `visitor` param is typed as `OldVisitor`: `enter` and `leave` maps keyed by AST node kind, whose callbacks receive the typed node plus graphql's `key`, `parent`, `path` and `ancestors`. Federation directives missing their `fields` argument, and operations whose root type is missing from the schema, throw a descriptive error.
- `@graphql-codegen/typescript` and `@graphql-codegen/typescript-operations`: the `InputValueDefinition` visitor methods take `path` and `ancestors` as required params, since the visitor always passes them.

Generated output is unchanged.
