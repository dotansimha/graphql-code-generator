---
'@graphql-codegen/visitor-plugin-common': patch
---

Fix isNativeNamedType to handle types from remote schemas correctly

Previously, we assumed that if a name type does note have `astNode`, it is a native named type because it is not declared in user's schema.

However, this is a wrong assumption because remote schemas do not have `astNode`. This causes all user declared types are wrongly recognised as native types e.g. Input
