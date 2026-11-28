import { isEnumType, parse } from 'graphql';
import { mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { renderConfigExamples, type ConfigExample } from '@graphql-codegen/testing';
import { plugin } from '../src/index.js';

/**
 * Generated output examples for every documented config option.
 * See agents/config-option-examples.md for how to add or update an example.
 */

const HELLO_SCHEMA = /* GraphQL */ `
  type Query {
    hello: String
  }
`;
const HELLO_OPERATION = /* GraphQL */ `
  query Hello {
    hello
  }
`;
const USER_SCHEMA = /* GraphQL */ `
  type Query {
    user: User
  }
  type User {
    id: ID!
    name: String!
  }
`;
const FRIENDS_SCHEMA = /* GraphQL */ `
  type Query {
    user: User
  }
  type User {
    id: ID!
    friends: [User!]!
  }
`;
const FRIENDS_OPERATION = /* GraphQL */ `
  query GetUser {
    user {
      id
      friends {
        id
      }
    }
  }
`;
const ROLE_SCHEMA = /* GraphQL */ `
  type Query {
    role: Role
  }
  enum Role {
    ADMIN
    USER
  }
`;
const ROLE_OPERATION = /* GraphQL */ `
  query GetRole {
    role
  }
`;
const INPUT_SCHEMA = /* GraphQL */ `
  type Query {
    users(filter: UserFilter): [String!]
  }
  input UserFilter {
    name: String
  }
`;
const INPUT_OPERATION = /* GraphQL */ `
  query Users($filter: UserFilter) {
    users(filter: $filter)
  }
`;
const SEARCH_SCHEMA = /* GraphQL */ `
  type Query {
    search: [SearchResult!]!
  }
  union SearchResult = User | Post
  type User {
    id: ID!
    name: String!
  }
  type Post {
    id: ID!
    title: String!
  }
`;
const FRAGMENT_OPERATION = /* GraphQL */ `
  fragment UserFields on User {
    name
  }

  query GetUser {
    user {
      id
      ...UserFields
    }
  }
`;
const DATETIME_SCHEMA = /* GraphQL */ `
  scalar DateTime
  type Query {
    now: DateTime
  }
`;
const NOW_OPERATION = /* GraphQL */ `
  query Now {
    now
  }
`;
const EXTERNAL_FRAGMENT = /* GraphQL */ `
  fragment ExternalUserFields on User {
    name
  }
`;

const examples: ConfigExample[] = [
  {
    option: 'arrayInputCoercion',
    schema: /* GraphQL */ `
      type Query {
        users(ids: [ID!]): [String!]
      }
    `,
    operation: /* GraphQL */ `
      query Users($ids: [ID!]) {
        users(ids: $ids)
      }
    `,
    variants: [
      { label: 'arrayInputCoercion=true (default)', config: {} },
      { config: { arrayInputCoercion: false } },
    ],
  },
  {
    option: 'immutableTypes',
    schema: /* GraphQL */ `
      type Query {
        users(filter: UserFilter): [String!]!
      }
      input UserFilter {
        names: [String!]
      }
    `,
    operation: INPUT_OPERATION,
    variants: [
      { label: 'immutableTypes=false (default)', config: {} },
      { config: { immutableTypes: true } },
    ],
  },
  {
    option: 'flattenGeneratedTypes',
    schema: USER_SCHEMA,
    operation: FRAGMENT_OPERATION,
    variants: [
      { label: 'flattenGeneratedTypes=false (default)', config: {} },
      { config: { flattenGeneratedTypes: true } },
    ],
  },
  {
    option: 'flattenGeneratedTypesIncludeFragments',
    schema: USER_SCHEMA,
    operation: FRAGMENT_OPERATION,
    sharedConfig: { flattenGeneratedTypes: true },
    variants: [
      { label: 'flattenGeneratedTypesIncludeFragments=false (default)', config: {} },
      { config: { flattenGeneratedTypesIncludeFragments: true } },
    ],
  },
  {
    option: 'noExport',
    schema: HELLO_SCHEMA,
    operation: HELLO_OPERATION,
    variants: [{ label: 'noExport=false (default)', config: {} }, { config: { noExport: true } }],
  },
  {
    option: 'disableDescriptions',
    schema: /* GraphQL */ `
      type Query {
        role: Role
      }
      "User role"
      enum Role {
        "Administrator"
        ADMIN
        USER
      }
    `,
    operation: ROLE_OPERATION,
    variants: [
      { label: 'disableDescriptions=false (default)', config: {} },
      { config: { disableDescriptions: true } },
    ],
  },
  {
    option: 'addOperationExport',
    schema: HELLO_SCHEMA,
    operation: HELLO_OPERATION,
    variants: [
      { label: 'addOperationExport=false (default)', config: {} },
      { config: { addOperationExport: true } },
    ],
  },
  {
    option: 'maybeValue',
    schema: HELLO_SCHEMA,
    operation: HELLO_OPERATION,
    variants: [
      { label: "maybeValue='T | null' (default)", config: {} },
      { config: { maybeValue: 'T | null | undefined' } },
    ],
  },
  {
    option: 'inputMaybeValue',
    schema: INPUT_SCHEMA,
    operation: INPUT_OPERATION,
    variants: [
      { label: "inputMaybeValue='T | null | undefined' (default)", config: {} },
      { config: { inputMaybeValue: 'T | null' } },
      {
        config: {
          inputMaybeValue: 'T | null',
          avoidOptionals: { variableValue: true, inputValue: true },
        },
      },
    ],
  },
  {
    option: 'allowUndefinedQueryVariables',
    schema: /* GraphQL */ `
      type Query {
        user(id: ID!): String
      }
    `,
    operation: /* GraphQL */ `
      query GetUser($id: ID!) {
        user(id: $id)
      }
    `,
    variants: [
      { label: 'allowUndefinedQueryVariables=false (default)', config: {} },
      { config: { allowUndefinedQueryVariables: true } },
    ],
  },
  {
    option: 'nullability',
    note: 'Requires the `graphql-sock` peer dependency.',
    schema: /* GraphQL */ `
      directive @semanticNonNull(levels: [Int] = [0]) on FIELD_DEFINITION
      type Query {
        name: String @semanticNonNull
      }
    `,
    operation: /* GraphQL */ `
      query GetName {
        name
      }
    `,
    variants: [
      { label: 'nullability.errorHandlingClient=false (default)', config: {} },
      { config: { nullability: { errorHandlingClient: true } } },
    ],
  },
  {
    option: 'enumType',
    schema: ROLE_SCHEMA,
    operation: ROLE_OPERATION,
    variants: [
      { label: "enumType='string-literal' (default)", config: {} },
      { config: { enumType: 'native' } },
      { config: { enumType: 'native-numeric' } },
      { config: { enumType: 'const' } },
      { config: { enumType: 'native-const' } },
      { config: { enumType: 'native-with-string-values' } },
    ],
  },
  {
    option: 'enumValues',
    title: 'Custom values',
    schema: ROLE_SCHEMA,
    operation: ROLE_OPERATION,
    sharedConfig: { enumType: 'native' },
    variants: [
      { label: 'enumValues unset (default)', config: {} },
      { config: { enumValues: { Role: { ADMIN: 'admin', USER: 'user' } } } },
    ],
  },
  {
    option: 'enumValues',
    title: 'External enum',
    schema: ROLE_SCHEMA,
    operation: ROLE_OPERATION,
    variants: [
      { label: 'enumValues unset (default)', config: {} },
      { config: { enumValues: { Role: './my-enums#MyRole' } } },
    ],
  },
  {
    option: 'enumValues',
    title: 'Import all enums from a file',
    note: "Only the plain-string form `enumValues: './my-enums'` imports from the file. A per-enum path without `#` (`enumValues: { Role: './my-enums' }`) changes nothing.",
    schema: ROLE_SCHEMA,
    operation: ROLE_OPERATION,
    variants: [
      { label: 'enumValues unset (default)', config: {} },
      { config: { enumValues: './my-enums' } },
      { config: { enumValues: { Role: './my-enums' } } },
    ],
  },
  {
    option: 'ignoreEnumValuesFromSchema',
    note: "The schema gives `Role` internal values (`ADMIN → 'admin-internal'`, `USER → 'user-internal'`), like resolvers passed to `makeExecutableSchema` would.",
    schema: ROLE_SCHEMA,
    operation: ROLE_OPERATION,
    sharedConfig: { enumType: 'native' },
    prepareSchema: ({ schema }) => {
      const role = schema.getType('Role');
      if (!isEnumType(role)) {
        throw new Error('Expected Role to be an enum');
      }
      const internalValues: Record<string, string> = {
        ADMIN: 'admin-internal',
        USER: 'user-internal',
      };
      for (const enumValue of role.getValues()) {
        enumValue.value = internalValues[enumValue.name];
      }
    },
    variants: [
      { label: 'ignoreEnumValuesFromSchema=false (default)', config: {} },
      { config: { ignoreEnumValuesFromSchema: true } },
    ],
  },
  {
    option: 'futureProofEnums',
    schema: ROLE_SCHEMA,
    operation: ROLE_OPERATION,
    variants: [
      { label: 'futureProofEnums=false (default)', config: {} },
      { config: { futureProofEnums: true } },
    ],
  },
  {
    option: 'avoidOptionals',
    schema: /* GraphQL */ `
      type Query {
        users(filter: UserFilter, limit: Int = 10): [String!]
      }
      input UserFilter {
        name: String
        active: Boolean = true
      }
    `,
    operation: /* GraphQL */ `
      query Users($filter: UserFilter, $limit: Int = 10) {
        users(filter: $filter, limit: $limit)
      }
    `,
    variants: [
      { label: 'avoidOptionals=false (default)', config: {} },
      { config: { avoidOptionals: true } },
      { config: { avoidOptionals: { variableValue: true } } },
      { config: { avoidOptionals: { inputValue: true } } },
      { config: { avoidOptionals: { defaultValue: true } } },
    ],
  },
  {
    option: 'skipTypeNameForRoot',
    note: 'Only has an effect when `__typename` is added automatically (here via `nonOptionalTypename`). A root `__typename` you select explicitly is always kept.',
    schema: HELLO_SCHEMA,
    operation: HELLO_OPERATION,
    sharedConfig: { nonOptionalTypename: true },
    variants: [
      { label: 'skipTypeNameForRoot=false (default)', config: {} },
      { config: { skipTypeNameForRoot: true } },
    ],
  },
  {
    option: 'nonOptionalTypename',
    schema: USER_SCHEMA,
    operation: /* GraphQL */ `
      query GetUser {
        user {
          id
        }
      }
    `,
    variants: [
      { label: 'nonOptionalTypename=false (default)', config: {} },
      { config: { nonOptionalTypename: true } },
    ],
  },
  {
    option: 'globalNamespace',
    schema: HELLO_SCHEMA,
    operation: HELLO_OPERATION,
    showWholeOutput: true,
    variants: [
      { label: 'globalNamespace=false (default)', config: {} },
      { config: { globalNamespace: true } },
    ],
  },
  {
    option: 'operationResultSuffix',
    schema: HELLO_SCHEMA,
    operation: HELLO_OPERATION,
    variants: [
      { label: "operationResultSuffix='' (default)", config: {} },
      { config: { operationResultSuffix: 'Result' } },
    ],
  },
  {
    option: 'dedupeOperationSuffix',
    schema: HELLO_SCHEMA,
    operation: /* GraphQL */ `
      query HelloQuery {
        hello
      }
    `,
    variants: [
      { label: 'dedupeOperationSuffix=false (default)', config: {} },
      { config: { dedupeOperationSuffix: true } },
    ],
  },
  {
    option: 'omitOperationSuffix',
    schema: HELLO_SCHEMA,
    operation: HELLO_OPERATION,
    variants: [
      { label: 'omitOperationSuffix=false (default)', config: {} },
      { config: { omitOperationSuffix: true } },
    ],
  },
  {
    option: 'exportFragmentSpreadSubTypes',
    schema: SEARCH_SCHEMA,
    operation: /* GraphQL */ `
      fragment SearchResultFields on SearchResult {
        ... on User {
          name
        }
        ... on Post {
          title
        }
      }
    `,
    variants: [
      { label: 'exportFragmentSpreadSubTypes=false (default)', config: {} },
      { config: { exportFragmentSpreadSubTypes: true } },
    ],
  },
  {
    option: 'experimentalFragmentVariables',
    note: 'A fragment that declares arguments (graphql v17 `experimentalFragmentArguments` parser option) gets a Variables type whether or not this option is set.',
    schema: USER_SCHEMA,
    operation: /* GraphQL */ `
      fragment UserFields on User {
        name
      }

      query GetUser {
        user {
          ...UserFields
        }
      }
    `,
    variants: [
      { label: 'experimentalFragmentVariables=false (default)', config: {} },
      { config: { experimentalFragmentVariables: true } },
    ],
  },
  {
    option: 'mergeFragmentTypes',
    schema: SEARCH_SCHEMA,
    operation: /* GraphQL */ `
      query Search {
        search {
          ... on User {
            id
          }
          ... on Post {
            id
          }
        }
      }
    `,
    variants: [
      { label: 'mergeFragmentTypes=false (default)', config: {} },
      { config: { mergeFragmentTypes: true } },
    ],
  },
  {
    option: 'namespacedImportName',
    schema: INPUT_SCHEMA,
    operation: INPUT_OPERATION,
    sharedConfig: { importSchemaTypesFrom: './src/shared-types.ts' },
    variants: [
      { label: "namespacedImportName='Types' (default)", config: {} },
      { config: { namespacedImportName: 'Schema' } },
    ],
  },
  {
    option: 'customDirectives',
    schema: USER_SCHEMA,
    operation: /* GraphQL */ `
      fragment UserFields on User {
        name
      }

      query GetUser {
        user {
          id
          ...UserFields @unmask
        }
      }
    `,
    sharedConfig: { inlineFragmentTypes: 'mask' },
    variants: [
      { label: 'customDirectives unset (default)', config: {} },
      { config: { customDirectives: { apolloUnmask: true } } },
    ],
  },
  {
    option: 'generateOperationTypes',
    schema: INPUT_SCHEMA,
    operation: INPUT_OPERATION,
    variants: [
      { label: 'generateOperationTypes=true (default)', config: {} },
      { config: { generateOperationTypes: false } },
    ],
  },
  {
    option: 'importSchemaTypesFrom',
    note: 'The path is relative to the current working directory; the output file here is `src/types.ts`.',
    schema: INPUT_SCHEMA,
    operation: INPUT_OPERATION,
    variants: [
      { label: 'importSchemaTypesFrom unset (default)', config: {} },
      { config: { importSchemaTypesFrom: './src/shared-types.ts' } },
    ],
  },
  {
    option: 'extractAllFieldsToTypes',
    schema: FRIENDS_SCHEMA,
    operation: FRIENDS_OPERATION,
    variants: [
      { label: 'extractAllFieldsToTypes=false (default)', config: {} },
      { config: { extractAllFieldsToTypes: true } },
    ],
  },
  {
    option: 'extractAllFieldsToTypesCompact',
    schema: FRIENDS_SCHEMA,
    operation: FRIENDS_OPERATION,
    sharedConfig: { extractAllFieldsToTypes: true },
    variants: [
      { label: 'extractAllFieldsToTypesCompact=false (default)', config: {} },
      { config: { extractAllFieldsToTypesCompact: true } },
    ],
  },
  {
    option: 'declarationKind',
    schema: INPUT_SCHEMA,
    operation: INPUT_OPERATION,
    variants: [
      { label: "declarationKind='type' (default)", config: {} },
      { config: { declarationKind: 'interface' } },
      { config: { declarationKind: { input: 'interface', result: 'type' } } },
    ],
  },
  {
    option: 'strictScalars',
    schema: DATETIME_SCHEMA,
    operation: NOW_OPERATION,
    variants: [
      { label: 'strictScalars=false (default)', config: {} },
      { config: { strictScalars: true } },
      { config: { strictScalars: true, scalars: { DateTime: 'string' } } },
    ],
  },
  {
    option: 'defaultScalarType',
    schema: DATETIME_SCHEMA,
    operation: NOW_OPERATION,
    variants: [
      { label: "defaultScalarType='unknown' (default)", config: {} },
      { config: { defaultScalarType: 'string' } },
    ],
  },
  {
    option: 'scalars',
    schema: /* GraphQL */ `
      scalar DateTime
      type Query {
        events(after: DateTime): [DateTime!]
      }
    `,
    operation: /* GraphQL */ `
      query Events($after: DateTime) {
        events(after: $after)
      }
    `,
    variants: [
      { label: 'scalars unset (default)', config: {} },
      { config: { scalars: { DateTime: 'Date' } } },
      { config: { scalars: { DateTime: { input: 'string', output: 'Date' } } } },
      { config: { scalars: { DateTime: './scalars#DateTimeValue' } } },
    ],
  },
  {
    option: 'namingConvention',
    schema: ROLE_SCHEMA,
    operation: ROLE_OPERATION,
    sharedConfig: { enumType: 'native' },
    variants: [
      { label: "namingConvention='change-case-all#pascalCase' (default)", config: {} },
      { config: { namingConvention: 'change-case-all#lowerCase' } },
      { config: { namingConvention: { enumValues: 'keep' } } },
    ],
  },
  {
    option: 'typesPrefix',
    schema: ROLE_SCHEMA,
    operation: ROLE_OPERATION,
    variants: [{ label: "typesPrefix='' (default)", config: {} }, { config: { typesPrefix: 'I' } }],
  },
  {
    option: 'typesSuffix',
    schema: ROLE_SCHEMA,
    operation: ROLE_OPERATION,
    variants: [
      { label: "typesSuffix='' (default)", config: {} },
      { config: { typesSuffix: 'Type' } },
    ],
  },
  {
    option: 'enumPrefix',
    schema: ROLE_SCHEMA,
    operation: ROLE_OPERATION,
    sharedConfig: { enumType: 'native', typesPrefix: 'I' },
    variants: [
      { label: 'enumPrefix=true (default)', config: {} },
      { config: { enumPrefix: false } },
    ],
  },
  {
    option: 'enumSuffix',
    schema: ROLE_SCHEMA,
    operation: ROLE_OPERATION,
    sharedConfig: { enumType: 'native', typesSuffix: 'Type' },
    variants: [
      { label: 'enumSuffix=true (default)', config: {} },
      { config: { enumSuffix: false } },
    ],
  },
  {
    option: 'useTypeImports',
    note: 'The import of the `importSchemaTypesFrom` file is always `import type`. This option affects imports of external enums and scalars.',
    schema: ROLE_SCHEMA,
    operation: ROLE_OPERATION,
    sharedConfig: { enumValues: { Role: './my-enums#MyRole' } },
    variants: [
      { label: 'useTypeImports=false (default)', config: {} },
      { config: { useTypeImports: true } },
    ],
  },
  {
    option: 'inlineFragmentTypes',
    schema: USER_SCHEMA,
    operation: FRAGMENT_OPERATION,
    variants: [
      { label: "inlineFragmentTypes='inline' (default)", config: {} },
      { config: { inlineFragmentTypes: 'combine' } },
      { config: { inlineFragmentTypes: 'mask' } },
    ],
  },
  {
    option: 'importExtension',
    schema: INPUT_SCHEMA,
    operation: INPUT_OPERATION,
    sharedConfig: { importSchemaTypesFrom: './src/shared-types' },
    variants: [
      { label: "importExtension='' (default)", config: {} },
      { config: { importExtension: '.js' } },
    ],
  },
  {
    option: 'printFieldsOnNewLines',
    schema: USER_SCHEMA,
    operation: /* GraphQL */ `
      query GetUser {
        user {
          id
          name
        }
      }
    `,
    variants: [
      { label: 'printFieldsOnNewLines=false (default)', config: {} },
      { config: { printFieldsOnNewLines: true } },
    ],
  },
  {
    option: 'includeExternalFragments',
    note: 'This option has no effect in `typescript-operations`: external fragments passed via `externalFragments` are resolved into the operation types whether it is set or not. Both runs pass the fragment below via `externalFragments`.',
    schema: USER_SCHEMA,
    operation: /* GraphQL */ `
      query GetUser {
        user {
          id
          ...ExternalUserFields
        }
      }
    `,
    sharedConfig: {
      externalFragments: [
        {
          node: parse(EXTERNAL_FRAGMENT).definitions[0],
          name: 'ExternalUserFields',
          onType: 'User',
          isExternal: true,
        },
      ],
    },
    sharedConfigLabel: false,
    extraBlocks: [
      { label: 'External fragment (from another file)', lang: 'graphql', code: EXTERNAL_FRAGMENT },
    ],
    variants: [
      { label: 'includeExternalFragments=false (default)', config: {} },
      { config: { includeExternalFragments: true } },
    ],
  },
];

describe('TypeScript Operations Plugin - config examples', () => {
  it('matches the documented examples', async () => {
    const markdown = await renderConfigExamples({
      examples,
      title: '`typescript-operations` config examples',
      intro: [
        '<!-- Generated by tests/config-examples.spec.ts. Do not edit by hand: update the spec and run it with `-u`. -->',
        '',
        'Each section has a minimal schema and operation. The TypeScript shows only the declarations the option changes. Lines that differ appear once per setting with a `// option=value` comment.',
      ].join('\n'),
      generate: async ({ schema, document, config }) =>
        mergeOutputs([
          await plugin(schema, [{ document, location: 'doc.graphql' }], config, {
            outputFile: 'src/types.ts',
          }),
        ]),
    });

    await expect(markdown).toMatchFileSnapshot('./__examples__/config-examples.md');
  });
});
