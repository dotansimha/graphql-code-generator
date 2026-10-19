---
'@graphql-codegen/visitor-plugin-common': minor
---

Add the `inlineReferencedFragmentsInFragmentDocuments` option. With `documentMode: graphQLTag`, each fragment document then includes the fragments that it spreads, so you can use it on its own. The default is `false`, and operation documents do not change.

Refs #11040
