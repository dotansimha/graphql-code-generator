import React from 'react';
import classes from './styles.module.css';

export const EXAMPLES_ICONS = {
  'react-query': k => (
    <img alt={'React-Query'} className={classes.exampleIcon} key={k} src={'/img/icons/react-query.svg'} />
  ),
  typescript: k => <img alt={'TypeScript'} className={classes.exampleIcon} key={k} src={'/img/icons/typescript.svg'} />,
  react: k => <img alt={'React'} className={classes.exampleIcon} key={k} src={'/img/icons/react.svg'} />,
  apollo: k => <img alt={'Apollo GraphQL'} className={classes.exampleIcon} key={k} src={'/img/icons/apollo.svg'} />,
  csharp: k => <img alt={'C#'} className={classes.exampleIcon} key={k} src={'/img/icons/csharp.svg'} />,
  graphql: k => <img alt={'GraphQL'} className={classes.exampleIcon} key={k} src={'/img/icons/graphql.svg'} />,
  vue: k => <img alt={'VueJS'} className={classes.exampleIcon} key={k} src={'/img/icons/vue.svg'} />,
  java: k => <img alt={'Java'} className={classes.exampleIcon} key={k} src={'/img/icons/java.svg'} />,
  flow: k => <img alt={'FlowJS'} className={classes.exampleIcon} key={k} src={'/img/icons/flow.svg'} />,
  angular: k => <img alt={'Angular'} className={classes.exampleIcon} key={k} src={'/img/icons/angular.svg'} />,
  urql: k => <img alt={'urql'} className={classes.exampleIcon} key={k} src={'/img/icons/urql.svg'} />,
  nodejs: k => <img alt={'NodeJS'} className={classes.exampleIcon} key={k} src={'/img/icons/nodejs.svg'} />,
  'type-graphql': k => (
    <img alt={'type-graphql'} className={classes.exampleIcon} key={k} src={'/img/icons/type-graphql.png'} />
  ),
  mongodb: k => <img alt={'MongoDB'} className={classes.exampleIcon} key={k} src={'/img/icons/mongodb.png'} />,
};

const TS_SCHEMA = `scalar Date

schema {
  query: Query
}

type Query {
  me: User!
  user(id: ID!): User
  allUsers: [User]
  search(term: String!): [SearchResult!]!
  myChats: [Chat!]!
}

enum Role {
  USER,
  ADMIN,
}

interface Node {
  id: ID!
}

union SearchResult = User | Chat | ChatMessage

type User implements Node {
  id: ID!
  username: String!
  email: String!
  role: Role!
}

type Chat implements Node {
  id: ID!
  users: [User!]!
  messages: [ChatMessage!]!
}

type ChatMessage implements Node {
  id: ID!
  content: String!
  time: Date!
  user: User!
}
`;

const TS_QUERY = `query findUser($userId: ID!) {
  user(id: $userId) {
    ...UserFields
  }
}

fragment UserFields on User {
  id
  username
  role
}`;

export const EXAMPLES = {
  TypeScript: [
    {
      name: 'Schema types',
      description: `This is the simplest example of generating output based on a GraphQL Schema. Codegen will generate the compatible base type, based on your schema. These type declarations are 1:1 to your schema, and it will be used as base types for other Codegen plugins (such as \`typescript-operations\`), while combined into the same file.`,
      tags: ['typescript', 'frontend', 'backend'],
      config: `generates:
  types.ts:
    plugins:
      - typescript`,
      schema: TS_SCHEMA,
      documents: '',
    },
    {
      name: 'Operations types',
      description: `This examples uses the based types from \`typescript\` plugin, and generates TypeScript signature based on your GraphQL operations (query/mutation/subscription/fragment) and the selection set you choose in each operation.`,
      tags: ['typescript', 'frontend'],
      config: `generates:
  operations-types.ts:
    plugins:
      - typescript
      - typescript-operations`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
    {
      name: 'Operations types (near-operation-file)',
      description: `This examples uses the based types from \`typescript\` plugin, and generates TypeScript signature based on your GraphQL operations (query/mutation/subscription/fragment) and the selection set you choose in each operation. It uses Presets feature to manipulate the output of the codegen, and generate multiple files. In this example, it will generate a file per each operation, near the source file.`,
      tags: ['typescript', 'frontend'],
      config: `generates:
  ./types.ts:
    plugins:
      - typescript
  ./:
    preset: near-operation-file
    presetConfig:
      extension: .generated.tsx
      baseTypesPath: types.ts
    plugins:
      - typescript-operations
      - typescript-react-apollo`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
    {
      name: 'Operations types (without Pick)',
      description: `This is a similar output to regular usage of \`typescript-operations\`, but instead of using \`Pick\`, it will use the primitive value when possible, and reduce the output to the minimal types possible.`,
      tags: ['typescript', 'frontend'],
      config: `generates:
  operations-types.ts:
    config:
      onlyOperationTypes: true
      preResolveTypes: true
    plugins:
      - typescript
      - typescript-operations`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
    {
      name: 'TypedDocumentNode',
      description: `This plugin generates a per-compiled version of \`DocumentNode\`, with the result and variables types bundled into the object, using this library: https://github.com/dotansimha/graphql-typed-document-node`,
      tags: ['typescript', 'frontend'],
      config: `generates:
  operations-types.ts:
    plugins:
      - typescript
      - typescript-operations
      - typed-document-node`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
    {
      name: 'Apollo-Client v3 TypePolicies',
      description: 'This plugin generates fully-typed `keyFields` and Type-Policies for Apollo-Client v3.',
      tags: ['typescript', 'apollo'],
      config: `generates:
      type-policies.ts:
        plugins:
          - typescript-apollo-client-helpers`,
      schema: TS_SCHEMA,
    },
    {
      name: 'React-Query Hooks',
      description: `This example uses types generated by \`typescript\` and \`typescript-operations\`, and creates a fully type-safe React Hooks, based on your GraphQL operations, that wraps "react-query" hooks.`,
      tags: ['typescript', 'react', 'react-query', 'frontend'],
      config: `generates:
  types-and-hooks.tsx:
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-query`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
    {
      name: 'React-Apollo Hooks',
      description: `This example uses types generated by \`typescript\` and \`typescript-operations\`, and creates a fully type-safe React Hooks, based on your GraphQL operations.`,
      tags: ['typescript', 'react', 'apollo', 'frontend'],
      config: `generates:
  types-and-hooks.tsx:
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-apollo`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
    {
      name: 'React-Apollo Data Components (deprecated)',
      description: `This example uses types generated by \`typescript\` and \`typescript-operations\`, and creates a fully type-safe React Components, based on your GraphQL operations.`,
      tags: ['typescript', 'react', 'apollo', 'frontend'],
      config: `generates:
  types-and-components.tsx:
    config:
      withComponent: true
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-apollo`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
    {
      name: 'React-Apollo Data HOC (deprecated)',
      description: `This example uses types generated by \`typescript\` and \`typescript-operations\`, and creates a fully type-safe React HOC, based on your GraphQL operations.`,
      tags: ['typescript', 'react', 'apollo', 'frontend'],
      config: `generates:
  types-and-hoc.tsx:
    config:
      withHOC: true
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-apollo`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
    {
      name: 'Vue-Apollo composition functions',
      description: `This example uses types generated by \`typescript\` and \`typescript-operations\`, and creates a fully type-safe Vue composition components, based on your GraphQL operations.`,
      tags: ['typescript', 'vue', 'apollo', 'frontend'],
      config: `generates:
  composition-functions.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-vue-apollo`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
    {
      name: 'Apollo-Angular Components',
      description: `This example uses types generated by \`typescript\` and \`typescript-operations\`, and creates a fully type-safe Angular \`Service\`, based on your GraphQL operations.`,
      tags: ['typescript', 'angular', 'apollo', 'frontend'],
      config: `generates:
  components.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-apollo-angular`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
    {
      name: 'Urql',
      description: `This example uses types generated by \`typescript\` and \`typescript-operations\`, and creates a fully type-safe Urql Hooks, based on your GraphQL operations.`,
      tags: ['typescript', 'urql', 'react', 'frontend'],
      config: `generates:
  components.tsx:
    config:
      withHooks: true
    plugins:
      - typescript
      - typescript-operations
      - typescript-urql`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
    {
      name: 'Stencil-Apollo Components',
      description: `This example uses types generated by \`typescript\` and \`typescript-operations\`, and creates a fully Stencil Components, based on your GraphQL operations.`,
      tags: ['typescript', 'apollo', 'stencil', 'frontend'],
      config: `generates:
  components.tsx:
    plugins:
      - typescript
      - typescript-operations
      - typescript-stencil-apollo`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
    {
      name: 'Resolvers Signature',
      description: `This example demonstrate how to generate a basic resolver signature, based on your GraphQL schema. With the default setup, you'll need to adjust your models types to the same structure of your GraphQL schema (see mappers example for more advanced usage).
      
[You can read more about using this plugin here](https://the-guild.dev/blog/better-type-safety-for-resolvers-with-graphql-codegen)`,
      tags: ['nodejs', 'backend'],
      config: `generates:
  resolvers.ts:
    plugins:
      - typescript
      - typescript-resolvers`,
      schema: TS_SCHEMA,
      documents: '',
    },
    {
      name: 'Resolvers Signature (with custom models)',
      description: `This example demonstrate how to generate resolvers signature, based on your GraphQL schema, with your model types (\`mappers\` configuration)
      
[You can read more about using this plugin here](https://the-guild.dev/blog/better-type-safety-for-resolvers-with-graphql-codegen)`,
      tags: ['nodejs', 'backend'],
      config: `generates:
  resolvers.ts:
    config:
      mappers:
        User: ./models#UserDbObject
        Chat: ./models#ChatModel
    plugins:
      - typescript
      - typescript-resolvers`,
      schema: TS_SCHEMA,
      documents: '',
    },
    {
      name: 'graphql-request typed SDK',
      tags: ['nodejs', 'backend', 'frontend'],
      config: `generates:
  sdk.ts:
    plugins:
      - typescript
      - typescript-graphql-request`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
    {
      name: 'Generic SDK',
      tags: ['nodejs', 'backend'],
      config: `generates:
  sdk.ts:
    plugins:
      - typescript
      - typescript-generic-sdk`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
    {
      name: 'type-graphql',
      tags: ['type-graphql', 'nodejs', 'backend'],
      config: `generates:
  types.ts:
    plugins:
      - typescript-type-graphql`,
      schema: TS_SCHEMA,
      documents: '',
    },
    {
      name: 'MongoDB Models',
      tags: ['mongodb', 'nodejs', 'backend'],
      config: `generates:
    models.ts:
      plugins:
        - typescript-mongodb`,
      schema: `type User @entity {
    id: ID! @id
    username: String! @column
    email: String! @column @map(
      path: "login.email"
    )
    profile: Profile! @column
    chats: [Chat!]! @link
  }
  
  type Profile @entity(embedded: true,
    additionalFields: [
      { path: "dateOfBirth", type: "string" }
    ]) {
    name: String! @column
    age: Int
  }
  
  type Chat @entity {
    id: ID! @id
    users: [User!]! @link
    messages: [ChatMessage!]!
  }
  
  type ChatMessage @entity {
    id: ID! @id
    chat: Chat! @link
    content: String! @column
    author: User! @link
  }
  `,
      documents: '',
    },
  ],
  '.NET': [
    {
      name: 'C# Schema types',
      tags: ['csharp', 'frontend', 'backend'],
      config: `generates:
  src/main/c-sharp/my-org/my-app/Types.cs:
    plugins:
      - c-sharp`,
      schema: TS_SCHEMA,
      documents: '',
    },
    {
      name: 'C# Operations',
      tags: ['csharp', 'frontend'],
      config: `generates:
  src/main/c-sharp/my-org/my-app/Operations.cs:
    plugins:
      - c-sharp-operations`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
  ],
  Python: [
    {
      name: 'Types',
      config: `generates:
  src/main/python/my/app/generated/types.py:
    plugins:
      - typescript`,
      schema: TS_SCHEMA,
      documents: '',
    },
  ],
  Java: [
    {
      name: 'Types (Enum & Input)',
      tags: ['java', 'backend'],
      config: `generates:
  src/main/java/my/app/generated/Types.java:
    plugins:
      - java`,
      schema: TS_SCHEMA,
      documents: '',
    },
    {
      name: 'Resolvers Signature',
      tags: ['java', 'backend'],
      config: `generates:
  src/main/java/my/app/generated/Resolvers.java:
    plugins:
      - java-resolvers`,
      schema: TS_SCHEMA,
      documents: '',
    },
    {
      name: 'Apollo Android',
      tags: ['java', 'apollo', 'frontend'],
      config: `generates:
  ./app/src/main/java/:
    preset: java-apollo-android
    config:
      package: "com.my.paackage.generated.graphql"
      typePackage: "com.my.paackage.generated.Types"
      fragmentPackage: "com.my.paackage.generated.Fragment"
    plugins:
      - java-apollo-android`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
  ],
  Flow: [
    {
      name: 'Schema types',
      tags: ['flow', 'frontend', 'backend'],
      config: `generates:
  types.flow.js:
    plugins:
      - flow
    `,
      schema: TS_SCHEMA,
      documents: '',
    },
    {
      name: 'Resolvers Signature',
      tags: ['flow', 'backend'],
      config: `generates:
  resolvers.flow.js:
    plugins:
      - flow
      - flow-resolvers
    `,
      schema: TS_SCHEMA,
      documents: '',
    },
    {
      name: 'Operations types',
      tags: ['flow', 'frontend'],
      config: `generates:
  types.flow.js:
    plugins:
      - flow
      - flow-operations
    `,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
  ],
  Other: [
    {
      name: 'JSDoc',
      config: `generates:
  schema.js:
    plugins:
      - jsdoc`,
      schema: TS_SCHEMA,
      documents: '',
    },
    {
      name: 'Introspection JSON',
      tags: ['graphql'],
      config: `generates:
  schema.json:
    plugins:
      - introspection`,
      schema: TS_SCHEMA,
      documents: '',
    },
    {
      name: 'Schema AST',
      tags: ['graphql'],
      config: `generates:
  schema.graphql:
    plugins:
      - schema-ast`,
      schema: TS_SCHEMA,
      documents: '',
    },
    {
      name: 'Fragment Matcher',
      tags: ['typescript', 'apollo', 'frontend'],
      config: `generates:
  fragment-matcher.json:
    plugins:
      - fragment-matcher`,
      schema: TS_SCHEMA,
      documents: '',
    },
  ],
};
