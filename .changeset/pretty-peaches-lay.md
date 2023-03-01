---
'@graphql-codegen/plugin-helpers': minor
'@graphql-codegen/core': minor
'@graphql-codegen/cli': minor
---

Add `addToSchema` to Document Transform.

Now, before transforming `documents` with a document transform, you can extend a type in the schema using both `documents` and `schema`. With this change, you can generate type information for a local-only field in your document transform, thus avoiding validation errors.

For instance, the following is an example of a document transform that adds a field named `localOnlyFieldForMyTool` when a `@useMyTool` directive is used:

```ts
const directiveName = 'useMyTool';
const localOnlyFieldName = 'localOnlyFieldForMyTool
const documentTransform: Types.DocumentTransformObject = {
  transform: ({ documents }) => {
    return documents.map(documentFile => {
      documentFile.document = visit(documentFile.document, {
        Field: {
          leave(fieldNode) {
            if (!fieldNode.directives) return undefined;
            const addFieldDirective = fieldNode.directives.find(
              directive => directive.name.value === directiveName
            );
            if (!addFieldDirective) return undefine
            const localOnlyField: FieldNode = {
              kind: Kind.FIELD,
              name: { kind: Kind.NAME, value: localOnlyFieldName },
              directives: [{ kind: Kind.DIRECTIVE, name: { kind: Kind.NAME, value: 'client' } }],
            };
            return {
              ...fieldNode,
              selectionSet: {
                ...fieldNode.selectionSet!,
                selections: [...fieldNode.selectionSet!.selections, localOnlyField],
              },
            };
          },
        },
      });
      return documentFile;
    });
  },
  addToSchema: ({ schemaAst, documents }) => {
    const typeInfo = new TypeInfo(schemaAst);
    const typeNames = [];
    visit(
      concatAST(documents.map(file => file.document)),
      visitWithTypeInfo(typeInfo, {
        Field: {
          leave(fieldNode) {
            if (!fieldNode.directives) return;
            const addFieldDirective = fieldNode.directives.find(
              directive => directive.name.value === directiveName
            );
            if (!addFieldDirective) retur
            const type = typeInfo.getType();
            if (isNonNullType(type) && isObjectType(type.ofType)) {
              typeNames.push(type.ofType.name);
            }
          },
        },
      })
    );
    if (typeNames.length > 0) {
      return typeNames.map(name => `extend type ${name} { ${localOnlyFieldName}: String! }`).j('\n');
    }
    return '';
  },
};
```
