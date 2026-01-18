---
'@graphql-codegen/visitor-plugin-common': major
'@graphql-codegen/typescript-operations': major
'@graphql-codegen/typescript': major
'@graphql-codegen/typescript-resolvers': major
---

BREAKING CHANGE: visitors' config option are moved based on their use case

- addTypename/skipTypename: is only a types-visitor concern. This is moved to types-visitor from base-visitor
- nonOptionalTypename: is a documents-visitor and types-visitor concern. Moved from base-visitor there
- extractAllFieldsToTypes: is a documents-visitor concern. Moved from base-visitor there
- enumPrefix and enumSuffix: need to be in base-visitor as all 3 types of visitors need this to correctly sync the enum type names. This is moved to base visitor
- ignoreEnumValuesFromSchema: is a documents-visitor and types-visitor concern. Moved from base-visitor there.
- globalNamespace: is a documents-visitor concern. Moved from base-visitor there

Refactors

- documents-visitor no longer extends types-visitor _option types_ as they have two distinct usages now. The types now extend base-visitor types. This is now consistent with documents-visitor extending base-visitor
- Classes now handle config parsing and types at the same level e.g. if typescript-operations plugin parses configOne, then the types for configOne must be in that class, rather than in base-documents-visitor

Note: These visitors are rolled up into one type for simplicity

- base-visitor: includes `base-visitor`
- documents-visitor: includes `base-documents-visitor` and `typescript-operations` visitor
- types-visitor: includes `base-types-visitor` and `typescript` visitor
- resolvers-visitor: includes `base-resolvers-visitor` and `typescript-resolvers` visitor
