import gql from 'graphql-tag';
import { buildClientSchema } from 'graphql';
import { mockPlugin, yaml } from './mock-plugin';
import { plugin } from '../src';
import { plugin as tsPlugin } from '@graphql-codegen/typescript';
import { plugin as tsDocumentsPlugin } from '@graphql-codegen/typescript-operations';
import { Types } from '@graphql-codegen/plugin-helpers';

describe('Svelte Apollo', () => {
  let spyConsoleError: jest.SpyInstance;
  beforeEach(() => {
    spyConsoleError = jest.spyOn(console, 'warn');
    spyConsoleError.mockImplementation();
  });
  afterEach(() => {
    spyConsoleError.mockRestore();
  });

  const documents = (() => {
    const basicDoc = gql`
      query listFeed {
        feed {
          id
          commentCount
          repository {
            full_name
            html_url
            owner {
              avatar_url
            }
          }
        }
      }
    `;
    const unnamedQueryDoc = gql`
      fragment MyFragment on Repository {
        full_name
      }
      query {
        feed {
          id
        }
      }
    `;
    const repositoryWithOwner = gql`
      fragment RepositoryWithOwner on Repository {
        full_name
        html_url
        owner {
          avatar_url
        }
      }
    `;
    const feedWithRepository = gql`
      fragment FeedWithRepository on Entry {
        id
        commentCount
        repository(search: "phrase") {
          ...RepositoryWithOwner
        }
      }
      ${repositoryWithOwner}
    `;
    const simpleFeed = gql`
      fragment Item on Entry {
        id
      }
    `;
    const myFeed = gql`
      query MyFeed {
        feed {
          ...FeedWithRepository
        }
      }
      ${feedWithRepository}
    `;
    const mySecondFeed = gql`
      query MyFeed {
        feed {
          ...Item
        }
        allFeeds: feed {
          ...Item
        }
      }
    `;
    const myThirdFeed = gql`
      fragment FeedRepository on Entry {
        id
        repository {
          ...RepositoryOwner
        }
      }
      fragment RepositoryOwner on Repository {
        full_name
      }
      query MyFeed {
        feed {
          ...FeedRepository
        }
      }
    `;
    const submitter = gql`
      query feed {
        feed {
          id
          commentCount
          repository {
            full_name
            html_url
            owner {
              avatar_url
            }
          }
        }
      }
      mutation submitRepository($name: String) {
        submitRepository(repoFullName: $name) {
          id
        }
      }
    `;
    const documentDedupe = gql`
      query FeedQuery {
        feed {
          id
          commentCount
          repository {
            full_name
            html_url
            owner {
              avatar_url
            }
          }
        }
      }
      mutation SubmitRepositoryMutation($name: String) {
        submitRepository(repoFullName: $name) {
          id
        }
      }
    `;
    const mutationDoc = gql`
      mutation submitRepository($name: String) {
        submitRepository(repoFullName: $name) {
          id
        }
      }
    `;
    const subsComments = gql`
      subscription ListenToComments($name: String) {
        commentAdded(repoFullName: $name) {
          id
        }
      }
    `;
    const mutationNoVariableDoc = gql`
      mutation submitRepository {
        submitRepository {
          id
        }
      }
    `;

    return {
      basicDoc,
      unnamedQueryDoc,
      repositoryWithOwner,
      feedWithRepository,
      simpleFeed,
      myFeed,
      mySecondFeed,
      myThirdFeed,
      submitter,
      documentDedupe,
      mutationDoc,
      subsComments,
      mutationNoVariableDoc,
    } as const;
  })();

  const plugins = {
    typescript: tsPlugin,
    'typescript-operations': tsDocumentsPlugin,
    'typescript-svelte-apollo': plugin,
  } as const;

  const runPlugin = mockPlugin<Types.ComplexPluginOutput, keyof typeof documents, keyof typeof plugins>(
    buildClientSchema(require('../../../../../dev-test/githunt/schema.json')),
    documents,
    plugins,
    'typescript-svelte-apollo'
  );

  describe('Imports', () => {
    it('Should import SvelteApollo (from Microsoft) and ApolloClient dependencies', async () => {
      const { prepend } = await runPlugin(yaml`
        overwrite: true
        schema: data/src/**/*.graphql
        documents: basicDoc
        generates:
          src/graphql/generated.ts:
            plugins:
              - typescript
              - typescript-operations
              - typescript-svelte-apollo
      `);

      expect(prepend).toContain(`import gql from 'graphql-tag';`);
      expect(prepend).toContain('import type { ApolloClient, QueryOptions } from "@apollo/client";');
      expect(prepend).toContain('import { getContext, setContext } from "svelte";');
    });

    it('Should load getClient from a specified path', async () => {
      const path = './client';
      const { prepend } = await runPlugin(yaml`
        overwrite: true
        schema: data/src/**/*.graphql
        documents: basicDoc
        generates:
          src/graphql/generated.ts:
            plugins:
              - typescript
              - typescript-operations
              - typescript-svelte-apollo
            config:
              loadGetClientFrom: ${path}
      `);

      expect(prepend).toContain(`import gql from 'graphql-tag';`);
      expect(prepend).toContain('import type { QueryOptions } from "@apollo/client";');
      expect(prepend).toContain(`import { getClient } from "${path}";`);
    });

    it('Should import svelte context builder when using empty config', async () => {
      const { prepend } = await runPlugin(yaml`
        overwrite: true
        schema: data/src/**/*.graphql
        documents: basicDoc
        generates:
          src/graphql/generated.ts:
            plugins:
              - typescript
              - typescript-operations
              - typescript-svelte-apollo
      `);

      expect(prepend).toContain(`import gql from 'graphql-tag';`);
      expect(prepend).toContain('import type { ApolloClient, QueryOptions } from "@apollo/client";');
      expect(prepend).toContain('import { getContext, setContext } from "svelte";');
    });

    it('Should export only functions when using exportOnlyFunctions', async () => {
      const { content } = await runPlugin(yaml`
        overwrite: true
        schema: data/src/**/*.graphql
        documents: basicDoc
        generates:
          src/graphql/generated.ts:
            plugins:
              - typescript
              - typescript-operations
              - typescript-svelte-apollo
            config:
              exportOnlyFunctions: true
      `);

      expect(content).toBeSimilarStringTo(`
        const CLIENT = typeof Symbol !== "undefined" ? Symbol("client") : "@@client";

        export function getClient<TCache = any>() {
        	const client = getContext(CLIENT);
        	if (!client) {
        		throw new Error(
        			"ApolloClient has not been set yet, use setClient(new ApolloClient({ ... })) to define it"
        		);
        	}
        	return client as ApolloClient<TCache>;
        }

        export function setClient<TCache = any>(client: ApolloClient<TCache>): void {
        	setContext(CLIENT, client);
        }




         const ListFeedDocument = gql\`
            query listFeed {
          feed {
            id
            commentCount
            repository {
              full_name
              html_url
              owner {
                avatar_url
              }
            }
          }
        }
            \`;
        export const QueryListFeed = (
              options: Omit<QueryOptions<ListFeedQueryVariables>, "query">
            ) => getClient().query<ListFeedQuery>({ query: ListFeedDocument, ...options })
      `);
    });

    it('Should import DocumentNode when using noGraphQLTag', async () => {
      const { prepend, content } = await runPlugin(yaml`
        overwrite: true
        schema: data/src/**/*.graphql
        documents: basicDoc
        generates:
          src/graphql/generated.ts:
            plugins:
              - typescript
              - typescript-operations
              - typescript-svelte-apollo
            config:
              noGraphQLTag: true
      `);

      expect(prepend).toContain(`import { DocumentNode } from 'graphql';`);
      expect(prepend).not.toContain(`import gql from 'graphql-tag';`);
      expect(content).not.toContain(`gql`);
    });
  });

  describe('Fragments', () => {
    it('Should throw when operation is not named', async () => {
      const errorFn = () =>
        runPlugin(yaml`
        overwrite: true
        schema: data/src/**/*.graphql
        documents: unnamedQueryDoc
        generates:
          src/graphql/generated.ts:
            plugins:
              - typescript
              - typescript-operations
              - typescript-svelte-apollo
      `);

      expect(errorFn).rejects.toEqual(new Error('You should name all your operations'));
    });

    it('Should generate Document variables for inline fragments', async () => {
      const { content } = await runPlugin(yaml`
        overwrite: true
        schema: data/src/**/*.graphql
        documents: myFeed
        generates:
          src/graphql/generated.ts:
            plugins:
              - typescript
              - typescript-operations
              - typescript-svelte-apollo
      `);

      expect(content).toBeSimilarStringTo(`
        const CLIENT = typeof Symbol !== "undefined" ? Symbol("client") : "@@client";

        export function getClient<TCache = any>() {
          const client = getContext(CLIENT);
          if (!client) {
            throw new Error(
              "ApolloClient has not been set yet, use setClient(new ApolloClient({ ... })) to define it"
            );
          }
          return client as ApolloClient<TCache>;
        }

        export function setClient<TCache = any>(client: ApolloClient<TCache>): void {
          setContext(CLIENT, client);
        }


        export const RepositoryWithOwnerFragmentDoc = gql\`
            fragment RepositoryWithOwner on Repository {
          full_name
          html_url
          owner {
            avatar_url
          }
        }
            \`;
        export const FeedWithRepositoryFragmentDoc = gql\`
            fragment FeedWithRepository on Entry {
          id
          commentCount
          repository(search: "phrase") {
            ...RepositoryWithOwner
          }
        }
            \${RepositoryWithOwnerFragmentDoc}\`;

        export const MyFeedDocument = gql\`
            query MyFeed {
          feed {
            ...FeedWithRepository
          }
        }
            \${FeedWithRepositoryFragmentDoc}\`;
        export const QueryMyFeed = (
              options: Omit<QueryOptions<MyFeedQueryVariables>, "query">
            ) => getClient().query<MyFeedQuery>({ query: MyFeedDocument, ...options })
      `);
    });

    it('Should avoid generating duplicate fragments', async () => {
      const { content } = await runPlugin(yaml`
        overwrite: true
        schema: data/src/**/*.graphql
        documents:
          - simpleFeed
          - mySecondFeed
        generates:
          src/graphql/generated.ts:
            plugins:
              - typescript
              - typescript-operations
              - typescript-svelte-apollo
      `);

      expect(content).toBeSimilarStringTo(`
        export const ItemFragmentDoc = gql\`
            fragment Item on Entry {
          id
        }
            \`;

        export const MyFeedDocument = gql\`
            query MyFeed {
          feed {
            ...Item
          }
          allFeeds: feed {
            ...Item
          }
        }
            \${ItemFragmentDoc}\`;
        export const QueryMyFeed = (
              options: Omit<QueryOptions<MyFeedQueryVariables>, "query">
            ) => getClient().query<MyFeedQuery>({ query: MyFeedDocument, ...options })
      `);
    });

    it('Should generate fragments in proper order (when one depends on other)', async () => {
      const { content } = await runPlugin(yaml`
        overwrite: true
        schema: data/src/**/*.graphql
        documents: myThirdFeed
        generates:
          src/graphql/generated.ts:
            plugins:
              - typescript
              - typescript-operations
              - typescript-svelte-apollo
      `);

      const feedWithRepositoryPos = content.indexOf('fragment FeedRepository');
      const repositoryWithOwnerPos = content.indexOf('fragment RepositoryOwner');
      expect(repositoryWithOwnerPos).toBeLessThan(feedWithRepositoryPos);
    });

    it('Should translate graphql to DocumentNode when using noGraphQLTag', async () => {
      const { content } = await runPlugin(yaml`
        overwrite: true
        schema: data/src/**/*.graphql
        documents: basicDoc
        generates:
          src/graphql/generated.ts:
            plugins:
              - typescript
              - typescript-operations
              - typescript-svelte-apollo
            config:
              noGraphQLTag: true
      `);

      expect(content).toBeSimilarStringTo(`
        const ListFeedDocument: DocumentNode = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"listFeed"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"feed"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"commentCount"}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"full_name"}},{"kind":"Field","name":{"kind":"Name","value":"html_url"}},{"kind":"Field","name":{"kind":"Name","value":"owner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"avatar_url"}}]}}]}}]}}]}}]};
        export const QueryListFeed = (
              options: Omit<QueryOptions<ListFeedQueryVariables>, "query">
            ) => getClient().query<ListFeedQuery>({ query: ListFeedDocument, ...options })
      `);
    });
  });

  describe('Composition functions', () => {
    it('Should generate composition functions for query and mutation', async () => {
      const { content } = await runPlugin(yaml`
        overwrite: true
        schema: data/src/**/*.graphql
        documents: submitter
        generates:
          src/graphql/generated.ts:
            plugins:
              - typescript
              - typescript-operations
              - typescript-svelte-apollo
      `);
      expect(content).toBeSimilarStringTo(`
        export const FeedDocument = gql\`
            query feed {
          feed {
            id
            commentCount
            repository {
              full_name
              html_url
              owner {
                avatar_url
              }
            }
          }
        }
            \`;
        export const QueryFeed = (
              options: Omit<QueryOptions<FeedQueryVariables>, "query">
            ) => getClient().query<FeedQuery>({ query: FeedDocument, ...options })

        export const SubmitRepositoryDocument = gql\`
            mutation submitRepository($name: String) {
          submitRepository(repoFullName: $name) {
            id
          }
        }
            \`;
        export const MutationSubmitRepository = (
              options: Omit<MutationOptions<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>, "mutation">
            ) => getClient().mutate({ mutation: SubmitRepositoryDocument, ...options })
      `);
    });

    it('Should generate deduped composition functions for query and mutation', async () => {
      const { content } = await runPlugin(yaml`
        overwrite: true
        schema: data/src/**/*.graphql
        documents: documentDedupe
        generates:
          src/graphql/generated.ts:
            plugins:
              - typescript
              - typescript-operations
              - typescript-svelte-apollo
            config:
              dedupeOperationSuffix: true
      `);

      expect(content).toBeSimilarStringTo(`
        export const FeedQueryDocument = gql\`
            query FeedQuery {
          feed {
            id
            commentCount
            repository {
              full_name
              html_url
              owner {
                avatar_url
              }
            }
          }
        }
            \`;
        export const QueryFeedQuery = (
              options: Omit<QueryOptions<FeedQueryVariables>, "query">
            ) => getClient().query<FeedQuery>({ query: FeedQueryDocument, ...options })

        export const SubmitRepositoryMutationDocument = gql\`
            mutation SubmitRepositoryMutation($name: String) {
          submitRepository(repoFullName: $name) {
            id
          }
        }
            \`;
        export const MutationSubmitRepositoryMutation = (
              options: Omit<MutationOptions<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>, "mutation">
            ) => getClient().mutate({ mutation: SubmitRepositoryMutationDocument, ...options })
      `);
    });
    it('Should generate subscription composition functions', async () => {
      const { content } = await runPlugin(yaml`
        overwrite: true
        schema: data/src/**/*.graphql
        documents: subsComments
        generates:
          src/graphql/generated.ts:
            plugins:
              - typescript
              - typescript-operations
              - typescript-svelte-apollo
      `);

      expect(content).toBeSimilarStringTo(`
        const ListenToCommentsDocument = gql\`
            subscription ListenToComments($name: String) {
          commentAdded(repoFullName: $name) {
            id
          }
        }
            \`;
        export const SubscriptionListenToComments = (
              options: Omit<SubscriptionOptions<ListenToCommentsSubscriptionVariables>, "query">
            ) => getClient().subscribe<ListenToCommentsSubscription>({ query: ListenToCommentsDocument, ...options })
      `);
    });

    it('Should generate a mutation composition function with no variables if not specified in graphql document', async () => {
      const { content } = await runPlugin(yaml`
        overwrite: true
        schema: data/src/**/*.graphql
        documents: mutationNoVariableDoc
        generates:
          src/graphql/generated.ts:
            plugins:
              - typescript
              - typescript-operations
              - typescript-svelte-apollo
      `);

      expect(content).toBeSimilarStringTo(`
        export const SubmitRepositoryDocument = gql\`
            mutation submitRepository {
          submitRepository {
            id
          }
        }
            \`;
        export const MutationSubmitRepository = (
              options: Omit<MutationOptions<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>, "mutation">
            ) => getClient().mutate({ mutation: SubmitRepositoryDocument, ...options })
      `);
    });
  });
});
