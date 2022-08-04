import { validateTs } from '@graphql-codegen/testing';
import { parse, GraphQLSchema, buildClientSchema } from 'graphql';
import gql from 'graphql-tag';
import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { plugin as tsPlugin } from '@graphql-codegen/typescript';
import { plugin as tsDocumentsPlugin } from '@graphql-codegen/typescript-operations';
import { DocumentMode } from '@graphql-codegen/visitor-plugin-common';
import { extract } from 'jest-docblock';
import { VueApolloSmartOpsRawPluginConfig } from '../src/config.js';
import { plugin } from '../src/index.js';

describe('Vue Apollo Operations', () => {
  let spyConsoleError: jest.SpyInstance;
  beforeEach(() => {
    spyConsoleError = jest.spyOn(console, 'warn');
    spyConsoleError.mockImplementation();
  });

  afterEach(() => {
    spyConsoleError.mockRestore();
  });

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const schema = buildClientSchema(require('../../../../../dev-test/githunt/schema.json'));
  const basicDoc = parse(/* GraphQL */ `
    query test {
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
  `);
  const mutationDoc = parse(/* GraphQL */ `
    mutation test($name: String) {
      submitRepository(repoFullName: $name) {
        id
      }
    }
  `);

  const subscriptionDoc = parse(/* GraphQL */ `
    subscription test($name: String) {
      commentAdded(repoFullName: $name) {
        id
      }
    }
  `);

  const validateTypeScript = async (
    output: Types.PluginOutput,
    testSchema: GraphQLSchema,
    documents: Types.DocumentFile[],
    config: any
  ): Promise<void> => {
    const tsOutput = await tsPlugin(testSchema, documents, config, { outputFile: '' });
    const tsDocumentsOutput = await tsDocumentsPlugin(testSchema, documents, config, { outputFile: '' });
    const merged = mergeOutputs([tsOutput, tsDocumentsOutput, output]);
    validateTs(merged, undefined, true, false);
  };

  describe('Imports', () => {
    it('should import operation function dependencies', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(
        `import { createMutationFunction, createSmartQueryOptionsFunction, createSmartSubscriptionOptionsFunction } from 'vue-apollo-smart-ops';`
      );
      expect(content.prepend).toContain(`import gql from 'graphql-tag';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should import operation function dependencies from configured packages', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {
          vueApolloOperationFunctionsImportFrom: 'custom-operation-functions-package',
        },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(
        `import { createMutationFunction, createSmartQueryOptionsFunction, createSmartSubscriptionOptionsFunction } from 'custom-operation-functions-package';`
      );
      await validateTypeScript(content, schema, docs, {});
    });

    it('should import ApolloError type dependency', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import { ApolloError } from 'apollo-client';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should import ApolloError type dependency from configured package', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {
          vueApolloErrorType: 'CustomApolloError',
          vueApolloErrorTypeImportFrom: 'custom-error-package',
        },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import { CustomApolloError } from 'custom-error-package';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should import error handler function dependency from configured package', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {
          vueApolloErrorHandlerFunction: 'handleApolloError',
          vueApolloErrorHandlerFunctionImportFrom: 'custom-error-handler',
        },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import { handleApolloError } from 'custom-error-handler';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should import Vue app type dependency from configured package', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {
          vueAppType: 'CustomApp',
          vueAppTypeImportFrom: 'my-app',
        },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import { CustomApp } from 'my-app';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should import DocumentNode when using noGraphQLTag', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {
          noGraphQLTag: true,
        },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import { DocumentNode } from 'graphql';`);
      expect(content.prepend).not.toContain(`import gql from 'graphql-tag';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it(`should use gql import from gqlImport config option`, async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { gqlImport: 'graphql.macro#gql' },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import { gql } from 'graphql.macro';`);
      await validateTypeScript(content, schema, docs, {});
    });
  });

  describe('Fragments', () => {
    it('Should generate basic fragments documents correctly', async () => {
      const docs = [
        {
          location: 'a.graphql',
          document: parse(/* GraphQL */ `
            fragment MyFragment on Repository {
              full_name
            }

            query {
              feed {
                id
              }
            }
          `),
        },
      ];
      const result = await plugin(schema, docs, {}, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
      export const MyFragmentFragmentDoc = gql\`
      fragment MyFragment on Repository {
        full_name
      }
      \`;`);
      await validateTypeScript(result, schema, docs, {});
    });

    it('should generate Document variables for inline fragments', async () => {
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
      const myFeed = gql`
        query MyFeed {
          feed {
            ...FeedWithRepository
          }
        }

        ${feedWithRepository}
      `;

      const docs = [{ location: '', document: myFeed }];

      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`export const FeedWithRepositoryFragmentDoc = gql\`
fragment FeedWithRepository on Entry {
  id
  commentCount
  repository(search: "phrase") {
    ...RepositoryWithOwner
  }
}
\${RepositoryWithOwnerFragmentDoc}\`;`);
      expect(content.content).toBeSimilarStringTo(`export const RepositoryWithOwnerFragmentDoc = gql\`
fragment RepositoryWithOwner on Repository {
  full_name
  html_url
  owner {
    avatar_url
  }
}
\`;`);

      expect(content.content).toBeSimilarStringTo(`export const MyFeedDocument = gql\`
query MyFeed {
  feed {
    ...FeedWithRepository
  }
}
\${FeedWithRepositoryFragmentDoc}\`;`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should avoid generating duplicate fragments', async () => {
      const simpleFeed = gql`
        fragment Item on Entry {
          id
        }
      `;
      const myFeed = gql`
        query MyFeed {
          feed {
            ...Item
          }
          allFeeds: feed {
            ...Item
          }
        }
      `;
      const documents = [simpleFeed, myFeed];
      const docs = documents.map(document => ({ document, location: '' }));
      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`
        export const MyFeedDocument = gql\`
        query MyFeed {
            feed {
              ...Item
            }
            allFeeds: feed {
              ...Item
            }
          }
          \${ItemFragmentDoc}\``);
      expect(content.content).toBeSimilarStringTo(`
        export const ItemFragmentDoc = gql\`
        fragment Item on Entry {
          id
        }
\`;`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('Should generate fragments in proper order (when one depends on other)', async () => {
      const myFeed = gql`
        fragment FeedWithRepository on Entry {
          id
          repository {
            ...RepositoryWithOwner
          }
        }

        fragment RepositoryWithOwner on Repository {
          full_name
        }

        query MyFeed {
          feed {
            ...FeedWithRepository
          }
        }
      `;
      const documents = [myFeed];
      const docs = documents.map(document => ({ document, location: '' }));
      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      const feedWithRepositoryPos = content.content.indexOf('fragment FeedWithRepository');
      const repositoryWithOwnerPos = content.content.indexOf('fragment RepositoryWithOwner');
      expect(repositoryWithOwnerPos).toBeLessThan(feedWithRepositoryPos);
      await validateTypeScript(content, schema, docs, {});
    });
  });

  describe('Operation functions', () => {
    it('Should generate operation functions for query and mutation', async () => {
      const documents = parse(/* GraphQL */ `
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
      `);
      const docs = [{ location: '', document: documents }];

      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;
      expect(content.content).toBeSimilarStringTo(
        `export const useFeedQuery = createSmartQueryOptionsFunction<
  FeedQuery,
  FeedQueryVariables,
  ApolloError
>(FeedDocument);`
      );

      expect(content.content).toBeSimilarStringTo(
        `export const submitRepositoryMutation = createMutationFunction<
  SubmitRepositoryMutation,
  SubmitRepositoryMutationVariables,
  ApolloError
>(SubmitRepositoryDocument);`
      );
      await validateTypeScript(content, schema, docs, {});
    });

    it('Should use custom ApolloError type and handler for operation functions', async () => {
      const documents = parse(/* GraphQL */ `
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
      `);
      const docs = [{ location: '', document: documents }];

      const content = (await plugin(
        schema,
        docs,
        {
          vueApolloErrorType: 'CustomApolloError',
          vueApolloErrorTypeImportFrom: 'custom-error-type',
          vueApolloErrorHandlerFunction: 'handleApolloError',
          vueApolloErrorHandlerFunctionImportFrom: 'custom-error-handler',
        },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;
      expect(content.content).toBeSimilarStringTo(
        `export const useFeedQuery = createSmartQueryOptionsFunction<
  FeedQuery,
  FeedQueryVariables,
  CustomApolloError
>(FeedDocument, handleApolloError);`
      );

      expect(content.content).toBeSimilarStringTo(
        `export const submitRepositoryMutation = createMutationFunction<
  SubmitRepositoryMutation,
  SubmitRepositoryMutationVariables,
  CustomApolloError
>(SubmitRepositoryDocument, handleApolloError);`
      );
      await validateTypeScript(content, schema, docs, {});
    });

    it('Should use custom Vue app type for operation functions', async () => {
      const documents = parse(/* GraphQL */ `
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
      `);
      const docs = [{ location: '', document: documents }];

      const content = (await plugin(
        schema,
        docs,
        {
          vueAppType: 'CustomApp',
          vueAppTypeImportFrom: 'my-app',
        },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;
      expect(content.content).toBeSimilarStringTo(
        `export const useFeedQuery = createSmartQueryOptionsFunction<
  FeedQuery,
  FeedQueryVariables,
  ApolloError,
  CustomApp
>(FeedDocument);`
      );

      expect(content.content).toBeSimilarStringTo(
        `export const submitRepositoryMutation = createMutationFunction<
  SubmitRepositoryMutation,
  SubmitRepositoryMutationVariables,
  ApolloError,
  CustomApp
>(SubmitRepositoryDocument);`
      );
      await validateTypeScript(content, schema, docs, {});
    });

    it('Should generate deduped operation functions for query and mutation', async () => {
      const documents = parse(/* GraphQL */ `
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
      `);
      const docs = [{ location: '', document: documents }];
      const config = { dedupeOperationSuffix: true };

      const content = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(
        `export const useFeedQuery = createSmartQueryOptionsFunction<
  FeedQuery,
  FeedQueryVariables,
  ApolloError
>(FeedQueryDocument);`
      );

      expect(content.content).toBeSimilarStringTo(
        `export const submitRepositoryMutation = createMutationFunction<
  SubmitRepositoryMutation,
  SubmitRepositoryMutationVariables,
  ApolloError
>(SubmitRepositoryMutationDocument);`
      );
      await validateTypeScript(content, schema, docs, config);
    });

    it('Should not generate operation functions for query and mutation', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { withSmartOperationFunctions: false },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).not.toContain(`export const useTestQuery`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('Should generate subscription operation functions', async () => {
      const documents = parse(/* GraphQL */ `
        subscription ListenToComments($name: String) {
          commentAdded(repoFullName: $name) {
            id
          }
        }
      `);

      const docs = [{ location: '', document: documents }];

      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(
        `export const useListenToCommentsSubscription = createSmartSubscriptionOptionsFunction<
  ListenToCommentsSubscription,
  ListenToCommentsSubscriptionVariables,
  ApolloError
>(ListenToCommentsDocument);`
      );
      await validateTypeScript(content, schema, docs, {});
    });

    it('Should use custom ApolloError type and handler for subscription operation functions', async () => {
      const documents = parse(/* GraphQL */ `
        subscription ListenToComments($name: String) {
          commentAdded(repoFullName: $name) {
            id
          }
        }
      `);

      const docs = [{ location: '', document: documents }];

      const content = (await plugin(
        schema,
        docs,
        {
          vueApolloErrorType: 'CustomApolloError',
          vueApolloErrorTypeImportFrom: 'custom-error-type',
          vueApolloErrorHandlerFunction: 'handleApolloError',
          vueApolloErrorHandlerFunctionImportFrom: 'custom-error-handler',
        },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(
        `export const useListenToCommentsSubscription = createSmartSubscriptionOptionsFunction<
  ListenToCommentsSubscription,
  ListenToCommentsSubscriptionVariables,
  CustomApolloError
>(ListenToCommentsDocument, handleApolloError);`
      );
      await validateTypeScript(content, schema, docs, {});
    });

    it('Should not add typesPrefix to operation functions', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { typesPrefix: 'I' },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toContain(`export const useTestQuery`);
    });

    it('Should generate a mutation operation function with required variables if required in graphql document', async () => {
      const documents = parse(/* GraphQL */ `
        mutation submitRepository($name: String!) {
          submitRepository(repoFullName: $name) {
            id
          }
        }
      `);
      const docs = [{ location: '', document: documents }];

      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(
        `export const submitRepositoryMutation = createMutationFunction<
  SubmitRepositoryMutation,
  SubmitRepositoryMutationVariables,
  ApolloError
>(SubmitRepositoryDocument);`
      );

      await validateTypeScript(content, schema, docs, {});
    });

    it('Should generate a mutation operation function with no variables if not specified in graphql document', async () => {
      const documents = parse(/* GraphQL */ `
        mutation submitRepository {
          submitRepository {
            id
          }
        }
      `);
      const docs = [{ location: '', document: documents }];

      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(
        `export const submitRepositoryMutation = createMutationFunction<
  SubmitRepositoryMutation,
  SubmitRepositoryMutationVariables,
  ApolloError
>(SubmitRepositoryDocument);`
      );

      await validateTypeScript(content, schema, docs, {});
    });

    it('Should generate a mutation operation function with optional variables if optional in graphql document', async () => {
      const documents = parse(/* GraphQL */ `
        mutation submitRepository($name: String) {
          submitRepository(repoFullName: $name) {
            id
          }
        }
      `);
      const docs = [{ location: '', document: documents }];

      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(
        `export const submitRepositoryMutation = createMutationFunction<
  SubmitRepositoryMutation,
  SubmitRepositoryMutationVariables,
  ApolloError
>(SubmitRepositoryDocument);`
      );

      await validateTypeScript(content, schema, docs, {});
    });

    it('Should generate required variables if required in graphql document', async () => {
      const documents = parse(/* GraphQL */ `
        query feed($id: ID!, $name: String, $people: [String]!) {
          feed(id: $id) {
            id
          }
        }

        subscription test($name: String!) {
          commentAdded(repoFullName: $name) {
            id
          }
        }
      `);
      const docs = [{ location: '', document: documents }];

      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      // query with required variables
      expect(content.content).toBeSimilarStringTo(
        `export const useFeedQuery = createSmartQueryOptionsFunction<
  FeedQuery,
  FeedQueryVariables,
  ApolloError
>(FeedDocument);`
      );

      // subscription with required variables
      expect(content.content).toBeSimilarStringTo(
        `export const useTestSubscription = createSmartSubscriptionOptionsFunction<
  TestSubscription,
  TestSubscriptionVariables,
  ApolloError
>(TestDocument);`
      );

      await validateTypeScript(content, schema, docs, {});
    });

    it('Should generate optional variables if all optional in graphql document', async () => {
      const documents = parse(/* GraphQL */ `
        query feed($id: ID) {
          feed(id: $id) {
            id
          }
        }

        subscription test($name: String) {
          commentAdded(repoFullName: $name) {
            id
          }
        }
      `);

      const docs = [{ location: '', document: documents }];

      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      // query with optional variables
      expect(content.content).toBeSimilarStringTo(
        `export const useFeedQuery = createSmartQueryOptionsFunction<
  FeedQuery,
  FeedQueryVariables,
  ApolloError
>(FeedDocument);`
      );

      // subscription with optional variables
      expect(content.content).toBeSimilarStringTo(
        `export const useTestSubscription = createSmartSubscriptionOptionsFunction<
  TestSubscription,
  TestSubscriptionVariables,
  ApolloError
>(TestDocument);`
      );

      await validateTypeScript(content, schema, docs, {});
    });

    const queryDocBlockSnapshot = `/**
 * __useFeedQuery__
 *
 * To use a Smart Query within a Vue component, call \`useFeedQuery\` as the value for a query key
 * in the component's \`apollo\` config, passing any options required for the query.
 *
 * @param options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/core/ApolloClient/#ApolloClient.query
 *
 * @example
 * {
 *   apollo: {
 *     feed: useFeedQuery({
 *       variables: {
 *         id: // value for 'id'
 *       },
 *       loadingKey: 'loading',
 *       fetchPolicy: 'no-cache',
 *     }),
 *   }
 * }
 */`;

    const subscriptionDocBlockSnapshot = `/**
 * __useCommentAddedSubscription__
 *
 * To use a Smart Subscription within a Vue component, call \`useCommentAddedSubscription\` as the value for a \`$subscribe\` key
 * in the component's \`apollo\` config, passing any options required for the subscription.
 *
 * @param options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/core/ApolloClient/#ApolloClient.subscribe
 *
 * @example
 * {
 *   apollo: {
 *     $subscribe: {
 *       commentAdded: useCommentAddedSubscription({
 *         variables: {
 *           name: // value for 'name'
 *         },
 *         loadingKey: 'loading',
 *         fetchPolicy: 'no-cache',
 *       }),
 *     },
 *   }
 * }
 */`;

    const mutationDocBlockSnapshot = `/**
 * __submitRepositoryMutation__
 *
 * To run a mutation, you call \`submitRepositoryMutation\` within a Vue component and pass it
 * your Vue app instance along with any options that fit your needs.
 *
 * @param app, a reference to your Vue app instance (which must have a \`$apollo\` property)
 * @param options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/core/ApolloClient/#ApolloClient.mutate
 * @param client (optional), which can be an instance of \`DollarApollo\` or the \`mutate()\` function provided by an \`<ApolloMutation>\` component
 *
 * @example
 * const { success, data, errors } = submitRepositoryMutation(this, {
 *   variables: {
 *     name: // value for 'name'
 *   },
 * });
 */`;

    it('Should generate JSDoc docblocks for operation functions', async () => {
      const documents = parse(/* GraphQL */ `
        query feed($id: ID!) {
          feed(id: $id) {
            id
          }
        }
        mutation submitRepository($name: String) {
          submitRepository(repoFullName: $name) {
            id
          }
        }
        subscription commentAdded($name: String) {
          commentAdded(repoFullName: $name) {
            id
          }
        }
      `);

      const docs = [{ location: '', document: documents }];

      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      const queryDocBlock = extract(content.content.substr(content.content.indexOf('/**')));
      expect(queryDocBlock).toEqual(queryDocBlockSnapshot);

      const mutationDocBlock = extract(
        content.content.substr(content.content.indexOf('/**', content.content.indexOf('/**') + 1))
      );
      expect(mutationDocBlock).toEqual(mutationDocBlockSnapshot);

      const subscriptionDocBlock = extract(content.content.substr(content.content.lastIndexOf('/**')));
      expect(subscriptionDocBlock).toEqual(subscriptionDocBlockSnapshot);
    });

    it('Should NOT generate JSDoc docblocks for operation functions if addDocBlocks is false', async () => {
      const documents = parse(/* GraphQL */ `
        query feed($id: ID!) {
          feed(id: $id) {
            id
          }
        }
        mutation submitRepository($name: String) {
          submitRepository(repoFullName: $name) {
            id
          }
        }
      `);

      const docs = [{ location: '', document: documents }];

      const content = (await plugin(
        schema,
        docs,
        { addDocBlocks: false },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      const queryDocBlock = extract(content.content.substr(content.content.indexOf('/**')));

      expect(queryDocBlock).not.toEqual(queryDocBlockSnapshot);

      const mutationDocBlock = extract(content.content.substr(content.content.lastIndexOf('/**')));

      expect(mutationDocBlock).not.toEqual(mutationDocBlockSnapshot);
    });
  });

  describe('documentMode and importDocumentNodeExternallyFrom', () => {
    const multipleOperationDoc = parse(/* GraphQL */ `
      query testOne {
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

      mutation testTwo($name: String) {
        submitRepository(repoFullName: $name) {
          id
        }
      }

      subscription testThree($name: String) {
        commentAdded(repoFullName: $name) {
          id
        }
      }
    `);

    it('should import DocumentNode when documentMode is "documentNode"', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {
          documentMode: DocumentMode.documentNode,
        },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import { DocumentNode } from 'graphql';`);
      expect(content.prepend).not.toContain(`import gql from 'graphql-tag';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should generate Document variable when documentMode is "documentNode"', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {
          documentMode: DocumentMode.documentNode,
        },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`export const TestDocument`);

      // For issue #1599 - make sure there are not `loc` properties
      expect(content.content).not.toContain(`loc":`);
      expect(content.content).not.toContain(`loc':`);

      await validateTypeScript(content, schema, docs, {});
    });

    it('should NOT generate inline fragment docs for external mode: file with operation using inline fragment', async () => {
      const docs = [
        {
          location: '',
          document: parse(/* GraphQL */ `
            fragment feedFragment on Entry {
              id
              commentCount
            }
            query testOne {
              feed {
                ...feedFragment
              }
            }
          `),
        },
      ];
      const config = {
        documentMode: DocumentMode.external,
        importDocumentNodeExternallyFrom: 'path/to/documents.tsx',
      };
      const content = (await plugin(
        schema,
        docs,
        { ...config },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).not.toBeSimilarStringTo(`export const FeedFragmentFragmentDoc`);

      await validateTypeScript(content, schema, docs, {});
    });

    it('should NOT generate inline fragment docs for external mode: file with operation NOT using inline fragment', async () => {
      const docs = [
        {
          location: '',
          document: parse(/* GraphQL */ `
            fragment feedFragment on Entry {
              id
              commentCount
            }
            query testOne {
              feed {
                id
              }
            }
          `),
        },
      ];
      const config = {
        documentMode: DocumentMode.external,
        importDocumentNodeExternallyFrom: 'path/to/documents.tsx',
      };
      const content = (await plugin(
        schema,
        docs,
        {
          ...config,
        },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).not.toBeSimilarStringTo(`export const FeedFragmentFragmentDoc`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should NOT generate inline fragment docs for external mode: file with just fragment', async () => {
      const docs = [
        {
          location: '',
          document: parse(/* GraphQL */ `
            fragment feedFragment on Entry {
              id
              commentCount
            }
          `),
        },
      ];
      const config = {
        documentMode: DocumentMode.external,
        importDocumentNodeExternallyFrom: 'path/to/documents.tsx',
      };
      const content = (await plugin(
        schema,
        docs,
        {
          ...config,
        },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).not.toBeSimilarStringTo(`export const FeedFragmentFragmentDoc`);

      await validateTypeScript(content, schema, docs, { ...config });
    });

    it('should import Operations from one external file and use it in useQuery', async () => {
      const config: VueApolloSmartOpsRawPluginConfig = {
        documentMode: DocumentMode.external,
        importDocumentNodeExternallyFrom: 'path/to/documents',
      };

      const docs = [{ location: '', document: basicDoc }];

      const content = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as Operations from 'path/to/documents';`);
      expect(content.content).toBeSimilarStringTo(`export const useTestQuery`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should import Operations from one external file and use it in useMutation', async () => {
      const config: VueApolloSmartOpsRawPluginConfig = {
        documentMode: DocumentMode.external,
        importDocumentNodeExternallyFrom: 'path/to/documents.ts',
      };

      const docs = [{ location: '', document: mutationDoc }];

      const content = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as Operations from 'path/to/documents';`);
      expect(content.content).toBeSimilarStringTo(`export const testMutation`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should import Operations from one external file and use it in useSubscription', async () => {
      const config: VueApolloSmartOpsRawPluginConfig = {
        documentMode: DocumentMode.external,
        importDocumentNodeExternallyFrom: 'path/to/documents.tsx',
      };

      const docs = [{ location: '', document: subscriptionDoc }];

      const content = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as Operations from 'path/to/documents';`);
      expect(content.content).toBeSimilarStringTo(`export const useTestSubscription`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should import Operations from one external file and use it in multiple operation functions', async () => {
      const config: VueApolloSmartOpsRawPluginConfig = {
        documentMode: DocumentMode.external,
        importDocumentNodeExternallyFrom: 'path/to/documents.tsx',
      };

      const docs = [{ location: '', document: multipleOperationDoc }];

      const content = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as Operations from 'path/to/documents';`);
      expect(content.content).toBeSimilarStringTo(`export const useTestOneQuery`);
      expect(content.content).toBeSimilarStringTo(`export const testTwoMutation`);
      expect(content.content).toBeSimilarStringTo(`export const useTestThreeSubscription`);

      await validateTypeScript(content, schema, docs, {});
    });

    it('should import Operations from near operation file for useQuery', async () => {
      const config: VueApolloSmartOpsRawPluginConfig = {
        documentMode: DocumentMode.external,
        importDocumentNodeExternallyFrom: 'near-operation-file',
      };

      const docs = [{ location: 'path/to/document.graphql', document: basicDoc }];

      const content = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as Operations from './document.graphql.js';`);
      expect(content.content).toBeSimilarStringTo(`export const useTestQuery`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should import Operations from near operation file for useMutation', async () => {
      const config: VueApolloSmartOpsRawPluginConfig = {
        documentMode: DocumentMode.external,
        importDocumentNodeExternallyFrom: 'near-operation-file',
      };

      const docs = [{ location: 'path/to/document.graphql', document: mutationDoc }];

      const content = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as Operations from './document.graphql.js';`);
      expect(content.content).toBeSimilarStringTo(`export const testMutation`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should import Operations from near operation file for useSubscription', async () => {
      const config: VueApolloSmartOpsRawPluginConfig = {
        documentMode: DocumentMode.external,
        importDocumentNodeExternallyFrom: 'near-operation-file',
      };

      const docs = [{ location: 'path/to/document.graphql', document: subscriptionDoc }];

      const content = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as Operations from './document.graphql.js';`);
      expect(content.content).toBeSimilarStringTo(`export const useTestSubscription`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should import Operations from near operation file and use it in multiple operation functions', async () => {
      const config: VueApolloSmartOpsRawPluginConfig = {
        documentMode: DocumentMode.external,
        importDocumentNodeExternallyFrom: 'near-operation-file',
      };

      const docs = [{ location: 'path/to/document.graphql', document: multipleOperationDoc }];

      const content = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as Operations from './document.graphql.js';`);
      expect(content.content).toBeSimilarStringTo(`export const useTestOneQuery`);
      expect(content.content).toBeSimilarStringTo(`export const testTwoMutation`);
      expect(content.content).toBeSimilarStringTo(`export const useTestThreeSubscription`);

      await validateTypeScript(content, schema, docs, {});
    });

    it(`should NOT import Operations if no operation collected: external mode and one file`, async () => {
      const docs = [
        {
          location: 'path/to/document.graphql',
          document: parse(/* GraphQL */ `
            fragment feedFragment on Entry {
              id
              commentCount
            }
          `),
        },
      ];
      const content = (await plugin(
        schema,
        docs,
        {
          documentMode: DocumentMode.external,
          importDocumentNodeExternallyFrom: 'near-operation-file',
        },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).not.toBeSimilarStringTo(`import * as Operations`);
      await validateTypeScript(content, schema, docs, {});
    });

    it(`should NOT import Operations if no operation collected: external mode and multiple files`, async () => {
      const docs = [
        {
          location: 'a.graphql',
          document: parse(/* GraphQL */ `
            fragment feedFragment1 on Entry {
              id
              commentCount
            }
          `),
        },
        {
          location: 'b.graphql',
          document: parse(/* GraphQL */ `
            fragment feedFragment2 on Entry {
              id
              commentCount
            }
          `),
        },
      ];
      const content = (await plugin(
        schema,
        docs,
        {
          documentMode: DocumentMode.external,
          importDocumentNodeExternallyFrom: 'path/to/documents.tsx',
        },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).not.toBeSimilarStringTo(`import * as Operations`);
      await validateTypeScript(content, schema, docs, {});
    });
  });
});
