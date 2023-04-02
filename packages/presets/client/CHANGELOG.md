# @graphql-codegen/client-preset

## 3.0.0

### Major Changes

- [#9137](https://github.com/dotansimha/graphql-code-generator/pull/9137) [`2256c8b5d`](https://github.com/dotansimha/graphql-code-generator/commit/2256c8b5d0e13057d35692bbeba3b7b8f94d8712) Thanks [@beerose](https://github.com/beerose)! - Add `TypedDocumentNode` string alternative that doesn't require GraphQL AST on the client. This change requires `@graphql-typed-document-node/core` in version `3.2.0` or higher.

### Patch Changes

- [#9137](https://github.com/dotansimha/graphql-code-generator/pull/9137) [`2256c8b5d`](https://github.com/dotansimha/graphql-code-generator/commit/2256c8b5d0e13057d35692bbeba3b7b8f94d8712) Thanks [@beerose](https://github.com/beerose)! - dependencies updates:
  - Updated dependency [`@graphql-typed-document-node/core@3.2.0` ↗︎](https://www.npmjs.com/package/@graphql-typed-document-node/core/v/3.2.0) (from `3.1.2`, in `dependencies`)
- Updated dependencies [[`e56790104`](https://github.com/dotansimha/graphql-code-generator/commit/e56790104ae56d6c5b48ef71823345bd09d3b835), [`b7dacb21f`](https://github.com/dotansimha/graphql-code-generator/commit/b7dacb21fb0ed1173d1e45120dc072e29231ed29), [`f104619ac`](https://github.com/dotansimha/graphql-code-generator/commit/f104619acd27c9d62a06bc577737500880731087), [`92d86b009`](https://github.com/dotansimha/graphql-code-generator/commit/92d86b009579edf70f60b0b8e28658af93ff9fd1), [`2256c8b5d`](https://github.com/dotansimha/graphql-code-generator/commit/2256c8b5d0e13057d35692bbeba3b7b8f94d8712), [`acb647e4e`](https://github.com/dotansimha/graphql-code-generator/commit/acb647e4efbddecf732b6e55dc47ac40c9bdaf08), [`9f4d9c5a4`](https://github.com/dotansimha/graphql-code-generator/commit/9f4d9c5a479d34da25df8e060a8c2b3b162647dd)]:
  - @graphql-codegen/visitor-plugin-common@3.1.0
  - @graphql-codegen/plugin-helpers@4.2.0
  - @graphql-codegen/typescript@3.0.3
  - @graphql-codegen/typed-document-node@4.0.0
  - @graphql-codegen/gql-tag-operations@3.0.0
  - @graphql-codegen/typescript-operations@3.0.3

## 2.1.1

### Patch Changes

- [#9049](https://github.com/dotansimha/graphql-code-generator/pull/9049) [`9430c3811`](https://github.com/dotansimha/graphql-code-generator/commit/9430c38111579c8c0023cbabfae047156ae2df42) Thanks [@renovate](https://github.com/apps/renovate)! - dependencies updates:
  - Updated dependency [`@graphql-typed-document-node/core@3.1.2` ↗︎](https://www.npmjs.com/package/@graphql-typed-document-node/core/v/3.1.2) (from `3.1.1`, in `dependencies`)
- Updated dependencies [[`ba0610bbd`](https://github.com/dotansimha/graphql-code-generator/commit/ba0610bbd4578d8a82078014766f56d8ae5fcf7a), [`4b49f6fbe`](https://github.com/dotansimha/graphql-code-generator/commit/4b49f6fbed802907b460bfb7b6e9a85f88c555bc), [`b343626c9`](https://github.com/dotansimha/graphql-code-generator/commit/b343626c978b9ee0f14e314cea6c01ae3dad057c)]:
  - @graphql-codegen/visitor-plugin-common@3.0.2
  - @graphql-codegen/gql-tag-operations@2.0.2
  - @graphql-codegen/typescript-operations@3.0.2
  - @graphql-codegen/typed-document-node@3.0.2
  - @graphql-codegen/typescript@3.0.2

## 2.1.0

### Minor Changes

- [#8893](https://github.com/dotansimha/graphql-code-generator/pull/8893) [`a118c307a`](https://github.com/dotansimha/graphql-code-generator/commit/a118c307a35bbb97b7cbca0f178a88276032a26c) Thanks [@n1ru4l](https://github.com/n1ru4l)! - It is no longer mandatory to declare an empty plugins array when using a preset

- [#8723](https://github.com/dotansimha/graphql-code-generator/pull/8723) [`a3309e63e`](https://github.com/dotansimha/graphql-code-generator/commit/a3309e63efed880e6f74ce6fcbf82dd3d7857a15) Thanks [@kazekyo](https://github.com/kazekyo)! - Introduce a new feature called DocumentTransform.

  DocumentTransform is a functionality that allows you to modify `documents` before they are processed by plugins. You can use functions passed to the `documentTransforms` option to make changes to GraphQL documents.

  To use this feature, you can write `documentTransforms` as follows:

  ```ts
  import type { CodegenConfig } from '@graphql-codegen/cli';

  const config: CodegenConfig = {
    schema: 'https://localhost:4000/graphql',
    documents: ['src/**/*.tsx'],
    generates: {
      './src/gql/': {
        preset: 'client',
        documentTransforms: [
          {
            transform: ({ documents }) => {
              // Make some changes to the documents
              return documents;
            },
          },
        ],
      },
    },
  };
  export default config;
  ```

  For instance, to remove a `@localOnlyDirective` directive from `documents`, you can write the following code:

  ```js
  import type { CodegenConfig } from '@graphql-codegen/cli';
  import { visit } from 'graphql';

  const config: CodegenConfig = {
    schema: 'https://localhost:4000/graphql',
    documents: ['src/**/*.tsx'],
    generates: {
      './src/gql/': {
        preset: 'client',
        documentTransforms: [
          {
            transform: ({ documents }) => {
              return documents.map(documentFile => {
                documentFile.document = visit(documentFile.document, {
                  Directive: {
                    leave(node) {
                      if (node.name.value === 'localOnlyDirective') return null;
                    },
                  },
                });
                return documentFile;
              });
            },
          },
        ],
      },
    },
  };
  export default config;
  ```

  DocumentTransform can also be specified by file name. You can create a custom file for a specific transformation and pass it to `documentTransforms`.

  Let's create the document transform as a file:

  ```js
  module.exports = {
    transform: ({ documents }) => {
      // Make some changes to the documents
      return documents;
    },
  };
  ```

  Then, you can specify the file name as follows:

  ```ts
  import type { CodegenConfig } from '@graphql-codegen/cli';

  const config: CodegenConfig = {
    schema: 'https://localhost:4000/graphql',
    documents: ['src/**/*.tsx'],
    generates: {
      './src/gql/': {
        preset: 'client',
        documentTransforms: ['./my-document-transform.js'],
      },
    },
  };
  export default config;
  ```

### Patch Changes

- [#8879](https://github.com/dotansimha/graphql-code-generator/pull/8879) [`8206b268d`](https://github.com/dotansimha/graphql-code-generator/commit/8206b268dfb485a748fd7783a163cb0ee9931491) Thanks [@renovate](https://github.com/apps/renovate)! - dependencies updates:

  - Updated dependency [`tslib@~2.5.0` ↗︎](https://www.npmjs.com/package/tslib/v/2.5.0) (from `~2.4.0`, in `dependencies`)

- [#8995](https://github.com/dotansimha/graphql-code-generator/pull/8995) [`fe2e9c7a5`](https://github.com/dotansimha/graphql-code-generator/commit/fe2e9c7a5f2731e06dd285e391936608dfa3fb51) Thanks [@charpeni](https://github.com/charpeni)! - Use `gqlTagName` for generated examples

- [#8971](https://github.com/dotansimha/graphql-code-generator/pull/8971) [`6b6fe3cbc`](https://github.com/dotansimha/graphql-code-generator/commit/6b6fe3cbcc7de748754703adce0f62f3e070a098) Thanks [@n1ru4l](https://github.com/n1ru4l)! - Allow passing fragment documents to APIs like Apollos `readFragment`

- Updated dependencies [[`8206b268d`](https://github.com/dotansimha/graphql-code-generator/commit/8206b268dfb485a748fd7783a163cb0ee9931491), [`8206b268d`](https://github.com/dotansimha/graphql-code-generator/commit/8206b268dfb485a748fd7783a163cb0ee9931491), [`8206b268d`](https://github.com/dotansimha/graphql-code-generator/commit/8206b268dfb485a748fd7783a163cb0ee9931491), [`8206b268d`](https://github.com/dotansimha/graphql-code-generator/commit/8206b268dfb485a748fd7783a163cb0ee9931491), [`8206b268d`](https://github.com/dotansimha/graphql-code-generator/commit/8206b268dfb485a748fd7783a163cb0ee9931491), [`8206b268d`](https://github.com/dotansimha/graphql-code-generator/commit/8206b268dfb485a748fd7783a163cb0ee9931491), [`8206b268d`](https://github.com/dotansimha/graphql-code-generator/commit/8206b268dfb485a748fd7783a163cb0ee9931491), [`a118c307a`](https://github.com/dotansimha/graphql-code-generator/commit/a118c307a35bbb97b7cbca0f178a88276032a26c), [`fe2e9c7a5`](https://github.com/dotansimha/graphql-code-generator/commit/fe2e9c7a5f2731e06dd285e391936608dfa3fb51), [`6b6fe3cbc`](https://github.com/dotansimha/graphql-code-generator/commit/6b6fe3cbcc7de748754703adce0f62f3e070a098), [`6b6fe3cbc`](https://github.com/dotansimha/graphql-code-generator/commit/6b6fe3cbcc7de748754703adce0f62f3e070a098), [`a3309e63e`](https://github.com/dotansimha/graphql-code-generator/commit/a3309e63efed880e6f74ce6fcbf82dd3d7857a15)]:
  - @graphql-codegen/add@4.0.1
  - @graphql-codegen/gql-tag-operations@2.0.1
  - @graphql-codegen/plugin-helpers@4.1.0
  - @graphql-codegen/typed-document-node@3.0.1
  - @graphql-codegen/typescript@3.0.1
  - @graphql-codegen/typescript-operations@3.0.1
  - @graphql-codegen/visitor-plugin-common@3.0.1

## 2.0.0

### Major Changes

- [#8885](https://github.com/dotansimha/graphql-code-generator/pull/8885) [`fd0b0c813`](https://github.com/dotansimha/graphql-code-generator/commit/fd0b0c813015cae4f6f6bda5f4c5515e544eb76d) Thanks [@n1ru4l](https://github.com/n1ru4l)! - drop Node.js 12 support

### Patch Changes

- [#8885](https://github.com/dotansimha/graphql-code-generator/pull/8885) [`fd0b0c813`](https://github.com/dotansimha/graphql-code-generator/commit/fd0b0c813015cae4f6f6bda5f4c5515e544eb76d) Thanks [@n1ru4l](https://github.com/n1ru4l)! - dependencies updates:

  - Updated dependency [`@babel/helper-plugin-utils@^7.20.2` ↗︎](https://www.npmjs.com/package/@babel/helper-plugin-utils/v/7.20.2) (from `^7.14.5`, in `dependencies`)
  - Updated dependency [`@babel/template@^7.20.7` ↗︎](https://www.npmjs.com/package/@babel/template/v/7.20.7) (from `^7.15.4`, in `dependencies`)

- [#8871](https://github.com/dotansimha/graphql-code-generator/pull/8871) [`fc79b65d4`](https://github.com/dotansimha/graphql-code-generator/commit/fc79b65d4914fd25ae6bd5d58ebc7ded573a08a5) Thanks [@B2o5T](https://github.com/B2o5T)! - eslint fixes

- Updated dependencies [[`fc79b65d4`](https://github.com/dotansimha/graphql-code-generator/commit/fc79b65d4914fd25ae6bd5d58ebc7ded573a08a5), [`fd0b0c813`](https://github.com/dotansimha/graphql-code-generator/commit/fd0b0c813015cae4f6f6bda5f4c5515e544eb76d)]:
  - @graphql-codegen/visitor-plugin-common@3.0.0
  - @graphql-codegen/plugin-helpers@4.0.0
  - @graphql-codegen/add@4.0.0
  - @graphql-codegen/gql-tag-operations@2.0.0
  - @graphql-codegen/typescript-operations@3.0.0
  - @graphql-codegen/typed-document-node@3.0.0
  - @graphql-codegen/typescript@3.0.0

## 1.3.0

### Minor Changes

- [#8757](https://github.com/dotansimha/graphql-code-generator/pull/8757) [`4f290aa72`](https://github.com/dotansimha/graphql-code-generator/commit/4f290aa7279a05ffa40920c1c9e5e5b37c164335) Thanks [@n1ru4l](https://github.com/n1ru4l)! - Add support for persisted documents.

  You can now generate and embed a persisted documents hash for the executable documents.

  ```ts
  /** codegen.ts */
  import { CodegenConfig } from '@graphql-codegen/cli';

  const config: CodegenConfig = {
    schema: 'https://swapi-graphql.netlify.app/.netlify/functions/index',
    documents: ['src/**/*.tsx'],
    ignoreNoDocuments: true, // for better experience with the watcher
    generates: {
      './src/gql/': {
        preset: 'client',
        plugins: [],
        presetConfig: {
          persistedDocuments: true,
        },
      },
    },
  };

  export default config;
  ```

  This will generate `./src/gql/persisted-documents.json` (dictionary of hashes with their operation string).

  In addition to that each generated document node will have a `__meta__.hash` property.

  ```ts
  import { gql } from './gql.js';

  const allFilmsWithVariablesQueryDocument = graphql(/* GraphQL */ `
    query allFilmsWithVariablesQuery($first: Int!) {
      allFilms(first: $first) {
        edges {
          node {
            ...FilmItem
          }
        }
      }
    }
  `);

  console.log((allFilmsWithVariablesQueryDocument as any)['__meta__']['hash']);
  ```

- [#8757](https://github.com/dotansimha/graphql-code-generator/pull/8757) [`4f290aa72`](https://github.com/dotansimha/graphql-code-generator/commit/4f290aa7279a05ffa40920c1c9e5e5b37c164335) Thanks [@n1ru4l](https://github.com/n1ru4l)! - Add support for embedding metadata in the document AST.

  It is now possible to embed metadata (e.g. for your GraphQL client within the emitted code).

  ```ts
  /** codegen.ts */
  import { CodegenConfig } from '@graphql-codegen/cli';

  const config: CodegenConfig = {
    schema: 'https://swapi-graphql.netlify.app/.netlify/functions/index',
    documents: ['src/**/*.tsx'],
    ignoreNoDocuments: true, // for better experience with the watcher
    generates: {
      './src/gql/': {
        preset: 'client',
        plugins: [],
        presetConfig: {
          onExecutableDocumentNode(documentNode) {
            return {
              operation: documentNode.definitions[0].operation,
              name: documentNode.definitions[0].name.value,
            };
          },
        },
      },
    },
  };

  export default config;
  ```

  You can then access the metadata via the `__meta__` property on the document node.

  ```ts
  import { gql } from './gql.js';

  const allFilmsWithVariablesQueryDocument = graphql(/* GraphQL */ `
    query allFilmsWithVariablesQuery($first: Int!) {
      allFilms(first: $first) {
        edges {
          node {
            ...FilmItem
          }
        }
      }
    }
  `);

  console.log((allFilmsWithVariablesQueryDocument as any)['__meta__']);
  ```

### Patch Changes

- [#8757](https://github.com/dotansimha/graphql-code-generator/pull/8757) [`4f290aa72`](https://github.com/dotansimha/graphql-code-generator/commit/4f290aa7279a05ffa40920c1c9e5e5b37c164335) Thanks [@n1ru4l](https://github.com/n1ru4l)! - dependencies updates:
  - Added dependency [`@graphql-tools/documents@^0.1.0` ↗︎](https://www.npmjs.com/package/@graphql-tools/documents/v/0.1.0) (to `dependencies`)
- Updated dependencies [[`a98198524`](https://github.com/dotansimha/graphql-code-generator/commit/a9819852443884b43de7c15040ccffc205f9177a)]:
  - @graphql-codegen/visitor-plugin-common@2.13.8
  - @graphql-codegen/gql-tag-operations@1.6.2
  - @graphql-codegen/typescript-operations@2.5.13
  - @graphql-codegen/typed-document-node@2.3.13
  - @graphql-codegen/typescript@2.8.8

## 1.2.6

### Patch Changes

- [#8796](https://github.com/dotansimha/graphql-code-generator/pull/8796) [`902451601`](https://github.com/dotansimha/graphql-code-generator/commit/902451601b5edf9cb7768e57f332fe6ade79c20a) Thanks [@shmax](https://github.com/shmax)! - remove extra asterisk and add missing semicolon in generated output

- Updated dependencies [[`902451601`](https://github.com/dotansimha/graphql-code-generator/commit/902451601b5edf9cb7768e57f332fe6ade79c20a)]:
  - @graphql-codegen/gql-tag-operations@1.6.1

## 1.2.5

### Patch Changes

- Updated dependencies [[`eb454d06c`](https://github.com/dotansimha/graphql-code-generator/commit/eb454d06c977f11f7d4a7b0b07eb80f8fd590560), [`2a33fc774`](https://github.com/dotansimha/graphql-code-generator/commit/2a33fc7741f7a9532bef68606666d4e3db7785a3)]:
  - @graphql-codegen/visitor-plugin-common@2.13.7
  - @graphql-codegen/gql-tag-operations@1.6.0
  - @graphql-codegen/typescript-operations@2.5.12
  - @graphql-codegen/typed-document-node@2.3.12
  - @graphql-codegen/typescript@2.8.7

## 1.2.4

### Patch Changes

- [#8771](https://github.com/dotansimha/graphql-code-generator/pull/8771) [`ed87c782b`](https://github.com/dotansimha/graphql-code-generator/commit/ed87c782bf3292bfbee772c6962d6cbc43a9abe7) Thanks [@renovate](https://github.com/apps/renovate)! - dependencies updates:

  - Updated dependency [`@graphql-tools/utils@^9.0.0` ↗︎](https://www.npmjs.com/package/@graphql-tools/utils/v/9.0.0) (from `^8.8.0`, in `dependencies`)

- [#8752](https://github.com/dotansimha/graphql-code-generator/pull/8752) [`cbca5a7ea`](https://github.com/dotansimha/graphql-code-generator/commit/cbca5a7ea3591f7ccf42399842cddb3581b40cf7) Thanks [@pbrink231](https://github.com/pbrink231)! - add typescript `avoidOptionals` to forwarded config

- Updated dependencies [[`ed87c782b`](https://github.com/dotansimha/graphql-code-generator/commit/ed87c782bf3292bfbee772c6962d6cbc43a9abe7), [`ed87c782b`](https://github.com/dotansimha/graphql-code-generator/commit/ed87c782bf3292bfbee772c6962d6cbc43a9abe7), [`ed87c782b`](https://github.com/dotansimha/graphql-code-generator/commit/ed87c782bf3292bfbee772c6962d6cbc43a9abe7), [`6c6b6f2df`](https://github.com/dotansimha/graphql-code-generator/commit/6c6b6f2df88a3a37b437a25320dab5590f033316)]:
  - @graphql-codegen/gql-tag-operations@1.5.12
  - @graphql-codegen/plugin-helpers@3.1.2
  - @graphql-codegen/visitor-plugin-common@2.13.6
  - @graphql-codegen/typescript-operations@2.5.11
  - @graphql-codegen/typed-document-node@2.3.11
  - @graphql-codegen/typescript@2.8.6

## 1.2.3

### Patch Changes

- [`46f75304a`](https://github.com/dotansimha/graphql-code-generator/commit/46f75304a69a13e8b5f58303f65c81b30a2ad96a) Thanks [@saihaj](https://github.com/saihaj)! - fix the version of `@graphql-codegen/plugin-helpers@3.1.1`

- Updated dependencies [[`307a5d350`](https://github.com/dotansimha/graphql-code-generator/commit/307a5d350643dd065d228b04ef3b4bd70cac0e81), [`46f75304a`](https://github.com/dotansimha/graphql-code-generator/commit/46f75304a69a13e8b5f58303f65c81b30a2ad96a)]:
  - @graphql-codegen/plugin-helpers@3.1.1
  - @graphql-codegen/add@3.2.3
  - @graphql-codegen/visitor-plugin-common@2.13.5
  - @graphql-codegen/gql-tag-operations@1.5.11
  - @graphql-codegen/typescript-operations@2.5.10
  - @graphql-codegen/typed-document-node@2.3.10
  - @graphql-codegen/typescript@2.8.5

## 1.2.2

### Patch Changes

- [#8702](https://github.com/dotansimha/graphql-code-generator/pull/8702) [`0eb0dde8a`](https://github.com/dotansimha/graphql-code-generator/commit/0eb0dde8a0eb89805711287798561a0b14b6dd59) Thanks [@ithinkdancan](https://github.com/ithinkdancan)! - add config for nonOptionalTypename

- Updated dependencies [[`a6c2097f4`](https://github.com/dotansimha/graphql-code-generator/commit/a6c2097f4789c0cce4296ce349790ce29943ed22), [`a6c2097f4`](https://github.com/dotansimha/graphql-code-generator/commit/a6c2097f4789c0cce4296ce349790ce29943ed22), [`a6c2097f4`](https://github.com/dotansimha/graphql-code-generator/commit/a6c2097f4789c0cce4296ce349790ce29943ed22), [`f79a00e8a`](https://github.com/dotansimha/graphql-code-generator/commit/f79a00e8ae073eab426ca08795c924e716123482), [`c802a0c0b`](https://github.com/dotansimha/graphql-code-generator/commit/c802a0c0b775cfabc5ace3e7fb6655540c6c4d84)]:
  - @graphql-codegen/plugin-helpers@3.0.0
  - @graphql-codegen/typed-document-node@2.3.9
  - @graphql-codegen/visitor-plugin-common@2.13.4
  - @graphql-codegen/add@3.2.2
  - @graphql-codegen/gql-tag-operations@1.5.10
  - @graphql-codegen/typescript-operations@2.5.9
  - @graphql-codegen/typescript@2.8.4

## 1.2.1

### Patch Changes

- Updated dependencies [[`62f655452`](https://github.com/dotansimha/graphql-code-generator/commit/62f6554520955dd675e11c920f35ef9bf0aaeffe)]:
  - @graphql-codegen/visitor-plugin-common@2.13.3
  - @graphql-codegen/typescript-operations@2.5.8
  - @graphql-codegen/gql-tag-operations@1.5.9
  - @graphql-codegen/typed-document-node@2.3.8
  - @graphql-codegen/typescript@2.8.3

## 1.2.0

### Minor Changes

- [#8657](https://github.com/dotansimha/graphql-code-generator/pull/8657) [`4b96035a8`](https://github.com/dotansimha/graphql-code-generator/commit/4b96035a8e0abca6715db586e8915ae968c403c6) Thanks [@charlypoly](https://github.com/charlypoly)! - Export a testing helper: `makeFragmentData(data, fragment)`

## 1.1.5

### Patch Changes

- Updated dependencies [[`00ddc9368`](https://github.com/dotansimha/graphql-code-generator/commit/00ddc9368211a4511b9f80d543d57c85fff840cb)]:
  - @graphql-codegen/gql-tag-operations@1.5.8

## 1.1.4

### Patch Changes

- Updated dependencies [[`ef4c2c9c2`](https://github.com/dotansimha/graphql-code-generator/commit/ef4c2c9c233c68830f10eb4c167c7cceead27122)]:
  - @graphql-codegen/visitor-plugin-common@2.13.2
  - @graphql-codegen/typescript@2.8.2
  - @graphql-codegen/gql-tag-operations@1.5.7
  - @graphql-codegen/typescript-operations@2.5.7
  - @graphql-codegen/typed-document-node@2.3.7

## 1.1.3

### Patch Changes

- Updated dependencies [[`63dc8f205`](https://github.com/dotansimha/graphql-code-generator/commit/63dc8f2054e27b944f7d8dc59db8afa85760a127)]:
  - @graphql-codegen/visitor-plugin-common@2.13.1
  - @graphql-codegen/plugin-helpers@2.7.2
  - @graphql-codegen/gql-tag-operations@1.5.6
  - @graphql-codegen/typescript-operations@2.5.6
  - @graphql-codegen/typed-document-node@2.3.6
  - @graphql-codegen/typescript@2.8.1

## 1.1.2

### Patch Changes

- [#8545](https://github.com/dotansimha/graphql-code-generator/pull/8545) [`3e7792486`](https://github.com/dotansimha/graphql-code-generator/commit/3e7792486e088a0dc10a0e3e4f5e0dff2ca031de) Thanks [@tojump](https://github.com/tojump)! - Forward dedupeFragments config option

## 1.1.1

### Patch Changes

- [#8523](https://github.com/dotansimha/graphql-code-generator/pull/8523) [`3a3202fbb`](https://github.com/dotansimha/graphql-code-generator/commit/3a3202fbb671617d34075040e7aa8129650bbcb1) Thanks [@charlypoly](https://github.com/charlypoly)! - allow non-typescript plugins

## 1.1.0

### Minor Changes

- [#8498](https://github.com/dotansimha/graphql-code-generator/pull/8498) [`a46b8d99c`](https://github.com/dotansimha/graphql-code-generator/commit/a46b8d99c797283d773ec14163c62be9c84d4c2b) Thanks [@charlypoly](https://github.com/charlypoly)! - Fragment masking ` $fragmentName` and ` $fragmentRefs` are optionals

### Patch Changes

- [#8500](https://github.com/dotansimha/graphql-code-generator/pull/8500) [`71aae7a92`](https://github.com/dotansimha/graphql-code-generator/commit/71aae7a92f77ec5ce29631b292d84e066219ea35) Thanks [@charlypoly](https://github.com/charlypoly)! - Add warning and errors to prevent unwanted configuration

- Updated dependencies [[`a46b8d99c`](https://github.com/dotansimha/graphql-code-generator/commit/a46b8d99c797283d773ec14163c62be9c84d4c2b)]:
  - @graphql-codegen/visitor-plugin-common@2.13.0
  - @graphql-codegen/gql-tag-operations@1.5.5
  - @graphql-codegen/typescript-operations@2.5.5
  - @graphql-codegen/typed-document-node@2.3.5
  - @graphql-codegen/typescript@2.7.5

## 1.0.7

### Patch Changes

- [#8472](https://github.com/dotansimha/graphql-code-generator/pull/8472) [`a08fb6502`](https://github.com/dotansimha/graphql-code-generator/commit/a08fb6502f5dec6babcb78dbecd621f05a3e300c) Thanks [@panusoi](https://github.com/panusoi)! - The client preset now allows the use of the `enumsAsTypes` config option

## 1.0.6

### Patch Changes

- Updated dependencies [[`1bd7f771c`](https://github.com/dotansimha/graphql-code-generator/commit/1bd7f771ccb949a5a37395c7c57cb41c19340714)]:
  - @graphql-codegen/visitor-plugin-common@2.12.2
  - @graphql-codegen/gql-tag-operations@1.5.4
  - @graphql-codegen/typescript-operations@2.5.4
  - @graphql-codegen/typed-document-node@2.3.4
  - @graphql-codegen/typescript@2.7.4

## 1.0.5

### Patch Changes

- [#8457](https://github.com/dotansimha/graphql-code-generator/pull/8457) [`126194017`](https://github.com/dotansimha/graphql-code-generator/commit/1261940173b8266d17fa03c1775104aff6086d3c) Thanks [@charlypoly](https://github.com/charlypoly)! - typo in config mapping

## 1.0.4

### Patch Changes

- [#8455](https://github.com/dotansimha/graphql-code-generator/pull/8455) [`d19573d88`](https://github.com/dotansimha/graphql-code-generator/commit/d19573d889513abab77a99d5f75f25612a891446) Thanks [@charlypoly](https://github.com/charlypoly)! - The client preset now allows the use of the following `config`:
  - `scalars`
  - `defaultScalarType`
  - `strictScalars`
  - `namingConvention`
  - `useTypeImports`
  - `skipTypename`
  - `arrayInputCoercion`

## 1.0.3

### Patch Changes

- [#8443](https://github.com/dotansimha/graphql-code-generator/pull/8443) [`e2d115146`](https://github.com/dotansimha/graphql-code-generator/commit/e2d11514695ca56674983e8b3b7549cd3b440a5d) Thanks [@charlypoly](https://github.com/charlypoly)! - fix(gql-tag-operations): issues with "no documents" scenario

- Updated dependencies [[`e2d115146`](https://github.com/dotansimha/graphql-code-generator/commit/e2d11514695ca56674983e8b3b7549cd3b440a5d)]:
  - @graphql-codegen/gql-tag-operations@1.5.3

## 1.0.2

### Patch Changes

- [#8402](https://github.com/dotansimha/graphql-code-generator/pull/8402) [`a76c606e3`](https://github.com/dotansimha/graphql-code-generator/commit/a76c606e3b631ef903d4066e2643bc7f95457e30) Thanks [@charlypoly](https://github.com/charlypoly)! - dependencies updates:

  - Updated dependency [`@graphql-codegen/gql-tag-operations@1.5.1` ↗︎](https://www.npmjs.com/package/@graphql-codegen/gql-tag-operations/v/1.5.1) (from `^1.5.0`, in `dependencies`)

- [#8402](https://github.com/dotansimha/graphql-code-generator/pull/8402) [`a76c606e3`](https://github.com/dotansimha/graphql-code-generator/commit/a76c606e3b631ef903d4066e2643bc7f95457e30) Thanks [@charlypoly](https://github.com/charlypoly)! - update `@graphql-codegen/gql-tag-operations`

- Updated dependencies [[`a76c606e3`](https://github.com/dotansimha/graphql-code-generator/commit/a76c606e3b631ef903d4066e2643bc7f95457e30)]:
  - @graphql-codegen/gql-tag-operations@1.5.2

## 1.0.1

### Patch Changes

- [#8302](https://github.com/dotansimha/graphql-code-generator/pull/8302) [`876844e76`](https://github.com/dotansimha/graphql-code-generator/commit/876844e7644a917172f09b3c4eb54a2f4c90e4c6) Thanks [@charlypoly](https://github.com/charlypoly)! - **`@graphql-codegen/gql-tag-operations` and `@graphql-codegen/gql-tag-operations-preset`**

  Introduce a `gqlTagName` configuration option

  ***

  **`@graphql-codegen/client-preset`**

  New preset for GraphQL Code Generator v3, more information on the RFC: https://github.com/dotansimha/graphql-code-generator/issues/8296

  ***

  **`@graphql-codegen/cli`**

  Update init wizard with 3.0 recommendations (`codegen.ts`, `client` preset)

- Updated dependencies [[`876844e76`](https://github.com/dotansimha/graphql-code-generator/commit/876844e7644a917172f09b3c4eb54a2f4c90e4c6)]:
  - @graphql-codegen/gql-tag-operations@1.5.0
