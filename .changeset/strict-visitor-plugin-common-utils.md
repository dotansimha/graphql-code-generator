---
'@graphql-codegen/visitor-plugin-common': patch
---

Fix type errors in `visitor-plugin-common` (`utils`, `imports`, `naming`, `mappers`, `enum-values`, `variables-to-object`, `convert-schema-enum-to-declaration-block-string`, `selection-set-processor/base` and `optimize-operations`) under `strict: true`:

- `transformComment` accepts `undefined` and `null`, which it already handles by returning an empty string.
- `block` declares its param as `string[] | null | undefined`, which it already handles by returning an empty string.
- `DeclarationBlock`'s fields are typed as `string | null` (`_name` as `string | NameNode | null`), and `withBlock` accepts `null`, which renders the same as no block.
- `buildScalars` accepts an `undefined` scalars mapping, which it already handles by using only the defaults and the schema.
- `buildTypeImport` accepts a nullish `identifier` and `source`, and throws a descriptive error when either is missing.
- `ParsedEnumValuesMap`'s `mappedValues`, `sourceIdentifier`, `sourceFile` and `importIdentifier` accept `null`, which `parseEnumValues` already emits.
- `transformMappers` defaults `rawMappers` to `{}`.
- `OperationVariablesToObject.getName`, `OperationVariablesToObject.transform` and `BaseSelectionSetProcessor.buildSelectionSetFromStrings` may return `null`, which they already return.
- `buildEnumValuesBlock` throws a descriptive error when an enum value is not defined on the schema's enum.
- `optimizeOperations` throws a descriptive error when a document file has no parsed document.
- `unique`'s default key uses `String(item)`.

Generated output is unchanged.
