---
'@graphql-codegen/visitor-plugin-common': major
'@graphql-codegen/typescript-resolvers': major
'@graphql-codegen/plugin-helpers': major
---

Ensure Federation Interfaces have `__resolveReference` if they are resolvable entities

BREAKING CHANGES: Deprecate `onlyResolveTypeForInterfaces` because majority of use cases cannot implement resolvers in Interfaces.
BREAKING CHANGES: Deprecate `generateInternalResolversIfNeeded.__resolveReference` because types do not have `__resolveReference` if they are not Federation entities or are not resolvable. Users should not have to manually set this option. This option was put in to wait for this major version.
