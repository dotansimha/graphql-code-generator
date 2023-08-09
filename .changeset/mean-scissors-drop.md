---
'@graphql-codegen/client-preset': minor
---

Add `UnmaskResultOf` and `UnmaskFragmentType` utility types

Recursively flattens fragments by resolving ` $fragmentRefs` and merging them to the root fragment/operation.

Could be useful for incremental adoption of Fragment Masking or when unmasking is helpful, e.g., within utilities or tests.

For example:

```ts
const FilmItemFragment = graphql(`
  fragment FilmItem on Film {
    id
    title
  }
`);

const AllFilmsFragment = graphql(`
  fragment AllFilms on Root {
    allFilms {
      films {
        ...FilmItem
      }
    }
  }
`);

const myQuery = graphql(`
  query Films {
    ...AllFilms
  }
`); // DocumentTypeDecoration<R, V>

// Fragment references are all inlined rather than referring to ` $fragmentRefs`.
type UnmaskedData = UnmaskResultOf<typeof myQuery>;
//   ^? type UnmaskedData = {
//        __typename: 'Root' | undefined,
//        allFilms: {
//          films: {
//            __typename?: "Film" | undefined;
//            id: string;
//            title?: string | null | undefined;
//          }[] | null | undefined
//        } | null | undefined
//      }
```
