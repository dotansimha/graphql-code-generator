---
'@graphql-codegen/visitor-plugin-common': patch
---

Fix type errors in `visitor-plugin-common` (`selection-set-to-object`, `client-side-base-visitor` and `base-documents-visitor`) under `strict: true`:

- `BaseDocumentsVisitor._selectionSetToObject` is optional, since it is only set by `setSelectionSetHandler`. `FragmentDefinition` and `OperationDefinition` throw a descriptive error when it is not set, and `FragmentDefinition` throws one when the fragment's type condition is not in the schema.
- `BaseDocumentsVisitor.FragmentDefinition` may return `null`, which it already returns when `generateOperationTypes` is `false`.
- `ClientSideBaseVisitor.buildOperation` may return `null`, which its base implementation already returns.
- `SelectionSetToObject.transformSelectionSet` declares its return type, and throws a descriptive error when the instance has no selection set.
- `LinkField`'s `alias` is optional, matching the link fields built for fields without an alias.
- `BaseSelectionSetProcessor.typeCache` is keyed by `Location | undefined`, since selection sets parsed with `noLocation` have no `loc`.
- `getPossibleTypes` accepts any `GraphQLType` or `undefined`, which it already handles by unwrapping lists and non-nulls and returning no types, and returns a copy of the schema's possible types instead of the schema's own readonly array.
- `OperationVariablesToObject.transform` accepts `undefined`, which it already handles by returning `null`.

Generated output is unchanged.
