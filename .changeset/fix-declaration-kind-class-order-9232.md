---
'@graphql-codegen/typescript': patch
---

Sort type definitions topologically by inheritance so base interfaces/classes precede derived classes when using `declarationKind: 'class'`, preventing TypeScript error `TS2449: Class used before its declaration`.
