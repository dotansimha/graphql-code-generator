---
'@graphql-codegen/plugin-helpers': patch
---

Fix TS type error on strictNullChecks: true

Fix the compiler error:

```
node_modules/@graphql-codegen/plugin-helpers/oldVisit.d.ts:5:75 - error TS2339: Property 'enter' does not exist on type '{ readonly enter?: ASTVisitFn<NameNode> | undefined; readonly leave: ASTReducerFn<NameNode, unknown>; } | { readonly enter?: ASTVisitFn<DocumentNode> | undefined; readonly leave: ASTReducerFn<...>; } | ... 41 more ... | undefined'.

5     enter?: Partial<Record<keyof NewVisitor, NewVisitor[keyof NewVisitor]['enter']>>;
                                                                            ~~~~~~~

node_modules/@graphql-codegen/plugin-helpers/oldVisit.d.ts:6:75 - error TS2339: Property 'leave' does not exist on type '{ readonly enter?: ASTVisitFn<NameNode> | undefined; readonly leave: ASTReducerFn<NameNode, unknown>; } | { readonly enter?: ASTVisitFn<DocumentNode> | undefined; readonly leave: ASTReducerFn<...>; } | ... 41 more ... | undefined'.

6     leave?: Partial<Record<keyof NewVisitor, NewVisitor[keyof NewVisitor]['leave']>>;
                                                                            ~~~~~~~


Found 2 errors in the same file, starting at: node_modules/@graphql-codegen/plugin-helpers/oldVisit.d.ts:5
```

Only happens when TS compiler options `strictNullChecks: true` and `skipLibCheck: false`.

`Partial<T>` includes `{}`, therefore `NewVisitor[keyof NewVisitor]` includes `undefined`, and indexing `undefined` is error.
Eliminate `undefined` by wrapping it inside `NonNullable<...>`.

Related #7519 
