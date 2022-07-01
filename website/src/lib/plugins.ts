import type { Package } from '@guild-docs/server/npm';
import { existsSync, readFileSync } from 'fs';
import { transformDocs } from './transform';
import { canUseDOM } from '../utils';

export const ALL_TAGS = [
  'typescript',
  'csharp',
  'flow',
  'java',
  'utilities',
  'mongodb',
  'angular',
  'react',
  'svelte',
  'next',
  'apollo',
  'urql',
  'vue',
  'kotlin',
  'android',
  'reason',
  'relay',
  'jsdoc',
  'resolvers',
  'plugin',
  'preset',
  'hasura',
  'validation',
  'yup',
  'zod',
] as const;

export type Tags = typeof ALL_TAGS[number];

let generatedDocs: ReturnType<typeof transformDocs> | null = null;
let staticMapping: Record<string, string> | null = null;

function loadGeneratedReadme(options: { templateFile: string; pluginIdentifier: string }): string {
  if (!generatedDocs) {
    generatedDocs = transformDocs();
  }

  if (!staticMapping) {
    staticMapping = {
      '{@operationsNote}': readFileSync(`docs-templates/client-note.md`, 'utf-8'),
      '{@javaInstallation}': readFileSync(`docs-templates/java-installation.md`, 'utf-8'),
    };
  }

  let templateBase = '{@apiDocs}';

  if (existsSync(options.templateFile)) {
    templateBase = readFileSync(options.templateFile, 'utf-8');
  }

  let out = templateBase.replace('{@apiDocs}', generatedDocs.docs[options.pluginIdentifier] || '');

  Object.keys(staticMapping).forEach(key => {
    out = out.replace(key, staticMapping![key]);
  });

  return out;
}

const PACKAGES: Package<Tags>[] = [
  {
    identifier: 'near-operation-file-preset',
    title: 'near-operation-file-preset',
    npmPackage: '@graphql-codegen/near-operation-file-preset',
    iconUrl: '/assets/img/icons/codegen.svg',
    tags: ['preset', 'utilities'],
  },
  {
    identifier: 'graphql-modules-preset',
    title: 'graphql-modules-preset',
    npmPackage: '@graphql-codegen/graphql-modules-preset',
    iconUrl: 'https://www.graphql-modules.com/img/just-logo.svg',
    tags: ['preset', 'utilities', 'resolvers'],
  },
  {
    identifier: 'import-types-preset',
    title: 'import-types-preset',
    npmPackage: '@graphql-codegen/import-types-preset',
    iconUrl: '/assets/img/icons/codegen.svg',
    tags: ['preset', 'utilities'],
  },
  {
    identifier: 'gql-tag-operations-preset',
    title: 'gql-tag-operations-preset',
    npmPackage: '@graphql-codegen/gql-tag-operations-preset',
    iconUrl: '/assets/img/icons/codegen.svg',
    tags: ['preset', 'utilities', 'typescript'],
  },
  {
    identifier: 'named-operations-object',
    title: 'Named Operations Object',
    npmPackage: '@graphql-codegen/named-operations-object',
    iconUrl: '/assets/img/icons/typescript.svg',
    tags: ['plugin', 'typescript'],
  },
  {
    identifier: 'typed-document-node',
    title: 'TypedDocumentNode',
    npmPackage: '@graphql-codegen/typed-document-node',
    iconUrl: '/assets/img/icons/typescript.svg',
    tags: ['plugin', 'typescript'],
  },
  {
    identifier: 'typescript-apollo-angular',
    title: 'TypeScript Apollo Angular',
    npmPackage: '@graphql-codegen/typescript-apollo-angular',
    iconUrl: '/assets/img/icons/angular.svg',
    tags: ['plugin', 'typescript', 'apollo', 'angular'],
  },
  {
    identifier: 'typescript-msw',
    title: 'typescript-msw',
    npmPackage: '@graphql-codegen/typescript-msw',
    iconUrl: 'https://raw.githubusercontent.com/mswjs/msw/HEAD/media/msw-logo.svg',
    tags: ['plugin', 'typescript', 'utilities'],
  },
  {
    identifier: 'typescript-apollo-client-helpers',
    title: 'Apollo-Client Helpers',
    npmPackage: '@graphql-codegen/typescript-apollo-client-helpers',
    iconUrl: '/assets/img/icons/typescript.svg',
    tags: ['plugin', 'typescript', 'apollo'],
  },
  {
    identifier: 'typescript-apollo-next',
    title: 'Typescript Apollo Nextjs',
    npmPackage: 'graphql-codegen-apollo-next-ssr',
    iconUrl: '/assets/img/icons/apollo.svg',
    tags: ['plugin', 'typescript', 'apollo', 'next'],
  },
  {
    identifier: 'typescript-document-nodes',
    title: 'TypeScript document nodes',
    npmPackage: '@graphql-codegen/typescript-document-nodes',
    iconUrl: '/assets/img/icons/typescript.svg',
    tags: ['plugin', 'typescript'],
  },
  {
    identifier: 'typescript-generic-sdk',
    title: 'TypeScript Generic SDK',
    npmPackage: '@graphql-codegen/typescript-generic-sdk',
    iconUrl: '/assets/img/icons/typescript.svg',
    tags: ['plugin', 'typescript'],
  },
  {
    identifier: 'typescript-graphql-files-modules',
    title: 'TypeScript GraphQL Files Modules',
    npmPackage: '@graphql-codegen/typescript-graphql-files-modules',
    iconUrl: '/assets/img/icons/typescript.svg',
    tags: ['plugin', 'typescript'],
  },
  {
    identifier: 'typescript-graphql-request',
    title: 'TypeScript GraphQL-Request',
    npmPackage: '@graphql-codegen/typescript-graphql-request',
    iconUrl: '/assets/img/icons/typescript.svg',
    tags: ['plugin', 'typescript'],
  },
  {
    identifier: 'typescript-mongodb',
    title: 'TypeScript MongoDB',
    npmPackage: '@graphql-codegen/typescript-mongodb',
    iconUrl: '/assets/img/icons/mongodb.png',
    tags: ['plugin', 'typescript', 'mongodb'],
  },
  {
    identifier: 'typescript-oclif',
    title: 'TypeScript oclif',
    npmPackage: '@graphql-codegen/typescript-oclif',
    iconUrl: '/assets/img/icons/typescript.svg',
    tags: ['plugin', 'typescript'],
  },
  {
    identifier: 'typescript-operations',
    title: 'TypeScript Operations',
    npmPackage: '@graphql-codegen/typescript-operations',
    iconUrl: '/assets/img/icons/typescript.svg',
    tags: ['plugin', 'typescript'],
  },
  {
    identifier: 'typescript',
    title: 'TypeScript',
    npmPackage: '@graphql-codegen/typescript',
    iconUrl: '/assets/img/icons/typescript.svg',
    tags: ['plugin', 'typescript'],
  },
  {
    identifier: 'typescript-react-apollo',
    title: 'TypeScript React Apollo',
    npmPackage: '@graphql-codegen/typescript-react-apollo',
    iconUrl: '/assets/img/icons/apollo.svg',
    tags: ['plugin', 'typescript', 'react', 'apollo'],
  },
  {
    identifier: 'typescript-react-query',
    title: 'TypeScript React-Query',
    npmPackage: '@graphql-codegen/typescript-react-query',
    iconUrl: '/assets/img/icons/react-query.svg',
    tags: ['plugin', 'typescript', 'react'],
  },
  {
    identifier: 'typescript-resolvers',
    title: 'TypeScript Resolvers',
    npmPackage: '@graphql-codegen/typescript-resolvers',
    iconUrl: '/assets/img/icons/typescript.svg',
    tags: ['plugin', 'typescript'],
  },
  {
    identifier: 'typescript-rtk-query',
    title: 'TypeScript RTK-Query',
    npmPackage: '@graphql-codegen/typescript-rtk-query',
    iconUrl: '/assets/img/icons/typescript.svg',
    tags: ['plugin', 'typescript', 'react'],
  },
  {
    identifier: 'typescript-stencil-apollo',
    title: 'TypeScript Stencil Apollo',
    npmPackage: '@graphql-codegen/typescript-stencil-apollo',
    iconUrl: '/assets/img/icons/apollo.svg',
    tags: ['plugin', 'typescript', 'apollo'],
  },
  {
    identifier: 'typescript-svelte-apollo',
    title: 'Typescript Svelte Apollo',
    npmPackage: 'graphql-codegen-svelte-apollo',
    iconUrl: '/assets/img/icons/apollo.svg',
    tags: ['plugin', 'typescript', 'svelte', 'apollo'],
  },
  {
    identifier: 'typescript-type-graphql',
    title: 'TypeScript TypeGraphQL',
    npmPackage: '@graphql-codegen/typescript-type-graphql',
    iconUrl: '/assets/img/icons/type-graphql.png',
    tags: ['plugin', 'typescript'],
  },
  {
    identifier: 'typescript-urql',
    title: 'TypeScript Urql',
    npmPackage: '@graphql-codegen/typescript-urql',
    iconUrl: '/assets/img/icons/typescript.svg',
    tags: ['plugin', 'typescript', 'urql', 'react'],
  },
  {
    identifier: 'typescript-vue-apollo',
    title: 'TypeScript Vue Apollo Composition API',
    npmPackage: '@graphql-codegen/typescript-vue-apollo',
    iconUrl: '/assets/img/icons/vue.svg',
    tags: ['plugin', 'typescript', 'vue', 'apollo'],
  },
  {
    identifier: 'typescript-vue-apollo-smart-ops',
    title: 'TypeScript Vue Apollo Smart Operations',
    npmPackage: '@graphql-codegen/typescript-vue-apollo-smart-ops',
    iconUrl: '/assets/img/icons/vue.svg',
    tags: ['plugin', 'typescript', 'vue', 'apollo'],
  },
  {
    identifier: 'typescript-vue-urql',
    title: 'TypeScript Vue Urql',
    npmPackage: '@graphql-codegen/typescript-vue-urql',
    iconUrl: '/assets/img/icons/vue.svg',
    tags: ['plugin', 'typescript', 'vue', 'urql'],
  },
  {
    identifier: 'c-sharp-operations',
    title: 'C# Operations',
    npmPackage: '@graphql-codegen/c-sharp-operations',
    iconUrl: '/assets/img/icons/csharp.svg',
    tags: ['plugin', 'csharp'],
  },
  {
    identifier: 'flow-operations',
    title: 'Flow Operations',
    npmPackage: '@graphql-codegen/flow-operations',
    iconUrl: '/assets/img/icons/flow.svg',
    tags: ['plugin', 'flow'],
  },
  {
    identifier: 'flow-resolvers',
    title: 'Flow Resolvers',
    npmPackage: '@graphql-codegen/flow-resolvers',
    iconUrl: '/assets/img/icons/flow.svg',
    tags: ['plugin', 'flow'],
  },
  {
    identifier: 'java',
    title: 'Java',
    npmPackage: '@graphql-codegen/java',
    iconUrl: '/assets/img/icons/java.svg',
    tags: ['plugin', 'java'],
  },
  {
    identifier: 'java-apollo-android',
    title: 'Java Apollo Android',
    npmPackage: '@graphql-codegen/java-apollo-android',
    iconUrl: '/assets/img/icons/java.svg',
    tags: ['plugin', 'java', 'apollo', 'android'],
  },
  {
    identifier: 'java-resolvers',
    title: 'Java Resolvers',
    npmPackage: '@graphql-codegen/java-resolvers',
    iconUrl: '/assets/img/icons/java.svg',
    tags: ['plugin', 'java'],
  },
  {
    identifier: 'kotlin',
    title: 'Kotlin',
    npmPackage: '@graphql-codegen/kotlin',
    iconUrl: '/assets/img/icons/java.svg',
    tags: ['plugin', 'java', 'kotlin'],
  },
  {
    identifier: 'reason-client',
    title: 'Reason Client',
    npmPackage: 'graphql-codegen-reason-client',
    iconUrl: 'https://pbs.twimg.com/profile_images/1004185780313395200/ImZxrDWf_400x400.jpg',
    tags: ['plugin', 'reason'],
  },
  {
    identifier: 'add',
    title: 'Add',
    npmPackage: '@graphql-codegen/add',
    iconUrl: '/assets/img/icons/graphql.svg',
    tags: ['plugin'],
  },
  {
    identifier: 'fragment-matcher',
    title: 'Fragment Matcher',
    npmPackage: '@graphql-codegen/fragment-matcher',
    iconUrl: '/assets/img/icons/graphql.svg',
    tags: ['plugin', 'apollo'],
  },
  {
    identifier: 'introspection',
    title: 'Introspection',
    npmPackage: '@graphql-codegen/introspection',
    iconUrl: '/assets/img/icons/graphql.svg',
    tags: ['plugin', 'utilities'],
  },
  {
    identifier: 'jsdoc',
    title: 'JSDoc',
    npmPackage: '@graphql-codegen/jsdoc',
    iconUrl: '/assets/img/icons/graphql.svg',
    tags: ['plugin', 'jsdoc'],
  },
  {
    identifier: 'relay-operation-optimizer',
    title: 'Relay Operation Optimizer',
    npmPackage: '@graphql-codegen/relay-operation-optimizer',
    iconUrl: '/assets/img/icons/graphql.svg',
    tags: ['plugin', 'relay'],
  },
  {
    identifier: 'schema-ast',
    title: 'Schema AST',
    npmPackage: '@graphql-codegen/schema-ast',
    iconUrl: '/assets/img/icons/graphql.svg',
    tags: ['plugin', 'utilities'],
  },
  {
    identifier: 'time',
    title: 'Time',
    npmPackage: '@graphql-codegen/time',
    iconUrl: '/assets/img/icons/graphql.svg',
    tags: ['plugin', 'utilities'],
  },
  {
    identifier: 'urql-introspection',
    title: 'Urql Introspection for Schema Awareness',
    npmPackage: '@graphql-codegen/urql-introspection',
    iconUrl: '/assets/img/icons/graphql.svg',
    tags: ['plugin', 'urql', 'typescript'],
  },
  {
    identifier: 'typescript-validation-schema',
    title: 'TypeScript Validation Schema',
    npmPackage: 'graphql-codegen-typescript-validation-schema',
    iconUrl: '/assets/img/icons/graphql.svg',
    tags: ['plugin', 'validation', 'yup', 'zod', 'typescript'],
  },
  {
    identifier: 'hasura-allow-list',
    title: 'Hasura Allow List',
    npmPackage: '@graphql-codegen/hasura-allow-list',
    iconUrl: '/assets/img/icons/hasura.svg',
    tags: ['plugin', 'utilities', 'hasura'],
  },
];

export const packageList = PACKAGES.map(p => ({
  ...p,
  readme: canUseDOM
    ? ''
    : loadGeneratedReadme({
        pluginIdentifier: p.identifier,
        templateFile: `docs-templates/${p.identifier}.md`,
      }),
}));
