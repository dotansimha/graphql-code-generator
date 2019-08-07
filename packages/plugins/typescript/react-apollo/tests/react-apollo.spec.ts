import { validateTs } from '@graphql-codegen/testing';
import { plugin, ReactApolloRawPluginConfig } from '../src/index';
import { parse, GraphQLSchema, buildClientSchema, buildASTSchema } from 'graphql';
import gql from 'graphql-tag';
import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { plugin as tsPlugin } from '../../typescript/src/index';
import { plugin as tsDocumentsPlugin } from '../../operations/src/index';
import { readFileSync } from 'fs';
import { DocumentMode } from '@graphql-codegen/visitor-plugin-common';

describe('React Apollo', () => {
  const schema = buildClientSchema(JSON.parse(readFileSync('../../../../dev-test/githunt/schema.json').toString()));
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

  const validateTypeScript = async (output: Types.PluginOutput, testSchema: GraphQLSchema, documents: Types.DocumentFile[], config: any) => {
    const tsOutput = await tsPlugin(testSchema, documents, config, { outputFile: '' });
    const tsDocumentsOutput = await tsDocumentsPlugin(testSchema, documents, config, { outputFile: '' });
    const merged = mergeOutputs([tsOutput, tsDocumentsOutput, output]);
    validateTs(merged, undefined, true);
  };

  describe('Issues', () => {
    it('Issue #2080 - noGraphQLTag does not work with fragments correctly', async () => {
      const docs = [
        {
          filePath: '',
          content: parse(/* GraphQL */ `
            query test {
              feed {
                id
                commentCount
                repository {
                  ...RepositoryFields
                }
              }
            }

            fragment RepositoryFields on Repository {
              full_name
              html_url
              owner {
                avatar_url
              }
            }
          `),
        },
      ];
      const content = (await plugin(
        schema,
        docs,
        {
          noGraphQLTag: true,
        },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;
      // make sure the fragment is there twice.
      expect(content.content.split('{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RepositoryFields"}').length).toBe(3);
    });
  });

  describe('Imports', () => {
    it('should import React and ReactApollo dependencies', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as ApolloReactCommon from '@apollo/react-common';`);
      expect(content.prepend).toContain(`import * as ApolloReactComponents from '@apollo/react-components';`);
      expect(content.prepend).toContain(`import * as React from 'react';`);
      expect(content.prepend).toContain(`import gql from 'graphql-tag';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should import DocumentNode when using noGraphQLTag', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {
          noGraphQLTag: true,
        },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import { DocumentNode } from 'graphql';`);
      expect(content.prepend).not.toContain(`import gql from 'graphql-tag';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it(`should use gql import from gqlImport config option`, async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { gqlImport: 'graphql.macro#gql' },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import { gql } from 'graphql.macro';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it(`tests for dedupeOperationSuffix`, async () => {
      const ast = parse(/* GraphQL */ `
        query notificationsQuery {
          notifications {
            id
          }
        }
      `);
      const ast2 = parse(/* GraphQL */ `
        query notifications {
          notifications {
            id
          }
        }
      `);

      expect(((await plugin(schema, [{ filePath: 'test-file.ts', content: ast }], {}, { outputFile: '' })) as any).content).toContain('ApolloReactCommon.QueryResult<NotificationsQueryQuery, NotificationsQueryQueryVariables>;');
      expect(((await plugin(schema, [{ filePath: 'test-file.ts', content: ast }], { dedupeOperationSuffix: false }, { outputFile: '' })) as any).content).toContain(
        'ApolloReactCommon.QueryResult<NotificationsQueryQuery, NotificationsQueryQueryVariables>'
      );
      expect(((await plugin(schema, [{ filePath: 'test-file.ts', content: ast }], { dedupeOperationSuffix: true }, { outputFile: '' })) as any).content).toContain('ApolloReactCommon.QueryResult<NotificationsQuery, NotificationsQueryVariables>');
      expect(((await plugin(schema, [{ filePath: 'test-file.ts', content: ast2 }], { dedupeOperationSuffix: true }, { outputFile: '' })) as any).content).toContain('ApolloReactCommon.QueryResult<NotificationsQuery, NotificationsQueryVariables>');
      expect(((await plugin(schema, [{ filePath: 'test-file.ts', content: ast2 }], { dedupeOperationSuffix: false }, { outputFile: '' })) as any).content).toContain('ApolloReactCommon.QueryResult<NotificationsQuery, NotificationsQueryVariables>');
    });

    it('should import ApolloReactHooks dependencies', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { withHooks: true },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as ApolloReactHooks from '@apollo/react-hooks';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should import ApolloReactHooks from apolloReactHooksImportFrom config option', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { withHooks: true, apolloReactHooksImportFrom: 'react-apollo-hooks' },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as ApolloReactHooks from 'react-apollo-hooks';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should import ApolloReactCommon from apolloReactCommonImportFrom config option', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { withHooks: true, apolloReactCommonImportFrom: 'custom-apollo-react-common' },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as ApolloReactCommon from 'custom-apollo-react-common';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should skip import React and ApolloReactComponents if only hooks are used', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {
          withHooks: true,
          withHOC: false,
          withComponent: false,
          withMutationFn: false,
          withResultType: false,
        },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).not.toContain(`import * as ApolloReactComponents from '@apollo/react-components';`);
      expect(content.prepend).not.toContain(`import * as React from 'react';`);
      await validateTypeScript(content, schema, docs, {});
    });
  });

  describe('Fragments', () => {
    it('Should generate basic fragments documents correctly', async () => {
      const docs = [
        {
          filePath: 'a.graphql',
          content: parse(/* GraphQL */ `
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
      const result = (await plugin(schema, docs, {}, { outputFile: '' })) as Types.ComplexPluginOutput;

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

      const docs = [{ filePath: '', content: myFeed }];

      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.tsx',
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
      const docs = documents.map(content => ({ content, filePath: '' }));
      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.tsx',
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
      const docs = documents.map(content => ({ content, filePath: '' }));
      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      const feedWithRepositoryPos = content.content.indexOf('fragment FeedWithRepository');
      const repositoryWithOwnerPos = content.content.indexOf('fragment RepositoryWithOwner');
      expect(repositoryWithOwnerPos).toBeLessThan(feedWithRepositoryPos);
      await validateTypeScript(content, schema, docs, {});
    });
  });

  describe('Component', () => {
    it('should generate Document variable', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`
          export const TestDocument =  gql\`
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
          \`;
        `);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should generate Document variable with noGraphQlTag', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {
          noGraphQLTag: true,
        },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`export const TestDocument: DocumentNode = {"kind":"Document","defin`);

      // For issue #1599 - make sure there are not `loc` properties
      expect(content.content).not.toContain(`loc":`);
      expect(content.content).not.toContain(`loc':`);

      await validateTypeScript(content, schema, docs, {});
    });

    it('should generate Component', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`
      export type TestComponentProps = Omit<ApolloReactComponents.QueryComponentOptions<TestQuery, TestQueryVariables>, 'query'>;
      `);

      expect(content.content).toBeSimilarStringTo(`
      export const TestComponent = (props: TestComponentProps) => 
      (
          <ApolloReactComponents.Query<TestQuery, TestQueryVariables> query={TestDocument} {...props} />
      );
      `);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should generate a component with a custom suffix when specified', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { componentSuffix: 'Q' },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`
      export type TestQProps = Omit<ApolloReactComponents.QueryComponentOptions<TestQuery, TestQueryVariables>, 'query'>;
      `);
      expect(content.content).toBeSimilarStringTo(`
      export const TestQ = (props: TestQProps) => 
      (
          <ApolloReactComponents.Query<TestQuery, TestQueryVariables> query={TestDocument} {...props} />
      );
      `);
      await validateTypeScript(content, schema, docs, { componentSuffix: 'Q' });
    });

    it('should not generate Component', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { withComponent: false },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).not.toContain(`export class TestComponent`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should make variables property required if any of variable definitions is non-null', async () => {
      const docs = [
        {
          filePath: '',
          content: gql`
            query Test($foo: String!) {
              test(foo: $foo)
            }
          `,
        },
      ];
      const schema = buildASTSchema(gql`
        type Query {
          test(foo: String!): Boolean
        }
      `);
      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`
      export type TestComponentProps = Omit<ApolloReactComponents.QueryComponentOptions<TestQuery, TestQueryVariables>, 'query'> & ({ variables: TestQueryVariables; skip?: boolean; } | { skip: boolean; });
      `);

      expect(content.content).toBeSimilarStringTo(`
      export const TestComponent = (props: TestComponentProps) => 
      (
          <ApolloReactComponents.Query<TestQuery, TestQueryVariables> query={TestDocument} {...props} />
      );
      `);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should make variables property optional if operationType is mutation', async () => {
      const docs = [
        {
          filePath: '',
          content: gql`
            mutation Test($foo: String!) {
              test(foo: $foo)
            }
          `,
        },
      ];
      const schema = buildASTSchema(gql`
        type Mutation {
          test(foo: String!): Boolean
        }
      `);
      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`
      export type TestComponentProps = Omit<ApolloReactComponents.MutationComponentOptions<TestMutation, TestMutationVariables>, 'mutation'>;
      `);
      expect(content.content).toBeSimilarStringTo(`
      export const TestComponent = (props: TestComponentProps) => (
        <ApolloReactComponents.Mutation<TestMutation, TestMutationVariables> mutation={TestDocument} {...props} />
      );`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should not add typesPrefix to Component', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { typesPrefix: 'I' },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).not.toContain(`export class ITestComponent`);
    });
  });

  describe('HOC', () => {
    it('should generate HOCs', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`export type TestProps<TChildProps = {}> = ApolloReactHoc.DataProps<TestQuery, TestQueryVariables> & TChildProps;`);

      expect(content.content).toBeSimilarStringTo(`export function withTest<TProps, TChildProps = {}>(operationOptions?: ApolloReactHoc.OperationOption<
  TProps,
  TestQuery,
  TestQueryVariables,
  TestProps<TChildProps>>) {
    return ApolloReactHoc.withQuery<TProps, TestQuery, TestQueryVariables, TestProps<TChildProps>>(TestDocument, {
      alias: 'withTest',
      ...operationOptions
    });
};`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should generate HOC props with correct operation result type name', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { operationResultSuffix: 'Response' },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`export type TestProps<TChildProps = {}> = ApolloReactHoc.DataProps<TestQueryResponse, TestQueryVariables> & TChildProps;`);

      await validateTypeScript(content, schema, docs, {});
    });

    it('should not generate HOCs', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { withHOC: false },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).not.toContain(`export type TestProps`);
      expect(content.content).not.toContain(`export function withTest`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should not add typesPrefix to HOCs', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { typesPrefix: 'I' },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toContain(`export type ITestProps`);
      expect(content.content).toContain(`export function withTest`);
    });
    it('should generate mutation function signature correctly', async () => {
      const docs = [
        {
          filePath: '',
          content: parse(/* GraphQL */ `
            mutation submitComment($repoFullName: String!, $commentContent: String!) {
              submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {
                id
              }
            }
          `),
        },
      ];
      const content = (await plugin(
        schema,
        docs,
        { withMutationFn: true },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toContain(`export type SubmitCommentMutationFn = ApolloReactCommon.MutationFunction<SubmitCommentMutation, SubmitCommentMutationVariables>;`);
      await validateTypeScript(content, schema, docs, {});
    });
  });

  describe('Hooks', () => {
    it('Should generate hooks for query and mutation', async () => {
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
      const docs = [{ filePath: '', content: documents }];

      const content = (await plugin(
        schema,
        docs,
        { withHooks: true, withComponent: false, withHOC: false },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`
export function useFeedQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<FeedQuery, FeedQueryVariables>) {
  return ApolloReactHooks.useQuery<FeedQuery, FeedQueryVariables>(FeedDocument, baseOptions);
};`);

      expect(content.content).toBeSimilarStringTo(`
export function useSubmitRepositoryMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>) {
  return ApolloReactHooks.useMutation<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>(SubmitRepositoryDocument, baseOptions);
};`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('Should not generate hooks for query and mutation', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { withHooks: false },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).not.toContain(`export function useTestQuery`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('Should generate subscription hooks', async () => {
      const documents = parse(/* GraphQL */ `
        subscription ListenToComments($name: String) {
          commentAdded(repoFullName: $name) {
            id
          }
        }
      `);

      const docs = [{ filePath: '', content: documents }];

      const content = (await plugin(
        schema,
        docs,
        {
          withHooks: true,
          withComponent: false,
          withHOC: false,
        },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`
export function useListenToCommentsSubscription(baseOptions?: ApolloReactHooks.SubscriptionHookOptions<ListenToCommentsSubscription, ListenToCommentsSubscriptionVariables>) {
  return ApolloReactHooks.useSubscription<ListenToCommentsSubscription, ListenToCommentsSubscriptionVariables>(ListenToCommentsDocument, baseOptions);
};`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('Should not add typesPrefix to hooks', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { withHooks: true, typesPrefix: 'I' },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toContain(`export function useTestQuery`);
    });

    it('should generate hook result', async () => {
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
      const docs = [{ filePath: '', content: documents }];

      const content = (await plugin(
        schema,
        docs,
        { withHooks: true, withComponent: false, withHOC: false },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`
      export type FeedQueryHookResult = ReturnType<typeof useFeedQuery>;
      `);

      expect(content.content).toBeSimilarStringTo(`
      export type SubmitRepositoryMutationHookResult = ReturnType<typeof useSubmitRepositoryMutation>;
      `);
      await validateTypeScript(content, schema, docs, {});
    });
  });

  describe('ResultType', () => {
    const config: ReactApolloRawPluginConfig = {
      withHOC: false,
      withComponent: false,
      withHooks: false,
      withMutationFn: false,
      withResultType: true,
      withMutationOptionsType: false,
    };

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

    it('should generate ResultType for Query if withResultType is true', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { ...config },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as ApolloReactCommon from '@apollo/react-common';`);
      expect(content.content).toContain(`export type TestQueryResult = ApolloReactCommon.QueryResult<TestQuery, TestQueryVariables>;`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should NOT generate ResultType for Query if withResultType is false', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { ...config, withResultType: false },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).not.toContain(`import * as ApolloReactCommon from '@apollo/react-common';`);
      expect(content.content).not.toContain(`export type TestQueryResult = ApolloReactCommon.QueryResult<TestQuery, TestQueryVariables>;`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should generate ResultType for Mutation if withResultType is true', async () => {
      const docs = [{ filePath: '', content: mutationDoc }];

      const content = (await plugin(
        schema,
        docs,
        { ...config },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as ApolloReactCommon from '@apollo/react-common';`);
      expect(content.content).toContain(`export type TestMutationResult = ApolloReactCommon.MutationResult<TestMutation>;`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should NOT generate ResultType for Mutation if withResultType is false', async () => {
      const docs = [{ filePath: '', content: mutationDoc }];

      const content = (await plugin(
        schema,
        docs,
        { ...config, withResultType: false },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).not.toContain(`import * as ApolloReactCommon from '@apollo/react-common';`);
      expect(content.content).not.toContain(`export type TestMutationResult = ApolloReactCommon.MutationResult<TestMutation>;`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should generate ResultType for Subscription if withResultType is true', async () => {
      const docs = [{ filePath: '', content: subscriptionDoc }];

      const content = (await plugin(
        schema,
        docs,
        { ...config },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as ApolloReactCommon from '@apollo/react-common';`);
      expect(content.content).toContain(`export type TestSubscriptionResult = ApolloReactCommon.SubscriptionResult<TestSubscription>;`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should NOT generate ResultType for Subscription if withResultType is false', async () => {
      const docs = [{ filePath: '', content: subscriptionDoc }];

      const content = (await plugin(
        schema,
        docs,
        { ...config, withResultType: false },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).not.toContain(`import * as ApolloReactCommon from '@apollo/react-common';`);
      expect(content.content).not.toContain(`export type TestSubscriptionResult = ApolloReactCommon.SubscriptionResult<TestSubscription>;`);
      await validateTypeScript(content, schema, docs, {});
    });
    it('should generate lazy query hooks', async () => {
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
      `);
      const docs = [{ filePath: '', content: documents }];

      const content = (await plugin(
        schema,
        docs,
        { withHooks: true, withComponent: false, withHOC: false },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`
  export function useLazyFeedQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<FeedQuery, FeedQueryVariables>) {
    return ApolloReactHooks.useLazyQuery<FeedQuery, FeedQueryVariables>(FeedDocument, baseOptions);
  };`);
      await validateTypeScript(content, schema, docs, {});
    });
  });

  describe('MutationOptions', () => {
    const config: ReactApolloRawPluginConfig = {
      withHOC: false,
      withComponent: false,
      withHooks: false,
      withMutationFn: false,
      withResultType: false,
      withMutationOptionsType: true,
    };

    it('should generate MutationOptions for Mutation if withMutationOptionsType is true', async () => {
      const docs = [{ filePath: '', content: mutationDoc }];

      const content = (await plugin(
        schema,
        docs,
        { ...config },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as ApolloReactCommon from '@apollo/react-common';`);
      expect(content.content).toContain(`export type TestMutationOptions = ApolloReactCommon.BaseMutationOptions<TestMutation, TestMutationVariables>;`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should NOT generate MutationOptions for Mutation if withMutationOptionsType is false', async () => {
      const docs = [{ filePath: '', content: mutationDoc }];

      const content = (await plugin(
        schema,
        docs,
        { ...config, withMutationOptionsType: false },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).not.toContain(`import * as ApolloReactCommon from '@apollo/react-common';`);
      expect(content.content).not.toContain(`export type TestMutationOptions = ApolloReactCommon.BaseMutationOptions<TestMutation, TestMutationVariables>;`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should NOT generate MutationOptions for Query if withMutationOptionsType is true', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { ...config },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).not.toContain(`import * as ApolloReactCommon from 'react-apollo';`);
      expect(content.content).not.toContain(`ApolloReactCommon.BaseMutationOptions`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should NOT generate MutationOptions for Query if withMutationOptionsType is false', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { ...config, withMutationOptionsType: false },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).not.toContain(`import * as ApolloReactCommon from 'react-apollo';`);
      expect(content.content).not.toContain(`ApolloReactCommon.BaseMutationOptions`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should NOT generate MutationOptions for Subscription if withMutationOptionsType is true', async () => {
      const docs = [{ filePath: '', content: subscriptionDoc }];

      const content = (await plugin(
        schema,
        docs,
        { ...config },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).not.toContain(`import * as ApolloReactCommon from 'react-apollo';`);
      expect(content.content).not.toContain(`ApolloReactCommon.BaseMutationOptions`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should NOT generate MutationOptions for Subscription if withMutationOptionsType is false', async () => {
      const docs = [{ filePath: '', content: subscriptionDoc }];

      const content = (await plugin(
        schema,
        docs,
        { ...config, withMutationOptionsType: false },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).not.toContain(`import * as ApolloReactCommon from 'react-apollo';`);
      expect(content.content).not.toContain(`ApolloReactCommon.BaseMutationOptions`);
      await validateTypeScript(content, schema, docs, {});
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
      const docs = [{ filePath: '', content: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {
          documentMode: DocumentMode.documentNode,
        },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import { DocumentNode } from 'graphql';`);
      expect(content.prepend).not.toContain(`import gql from 'graphql-tag';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should generate Document variable when documentMode is "documentNode"', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {
          documentMode: DocumentMode.documentNode,
        },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`export const TestDocument: DocumentNode = {"kind":"Document","defin`);

      // For issue #1599 - make sure there are not `loc` properties
      expect(content.content).not.toContain(`loc":`);
      expect(content.content).not.toContain(`loc':`);

      await validateTypeScript(content, schema, docs, {});
    });

    it('should import Operations from one external file and use it in Queries', async () => {
      const config: ReactApolloRawPluginConfig = {
        documentMode: DocumentMode.external,
        importDocumentNodeExternallyFrom: 'path/to/documents.tsx',
      };

      const docs = [{ filePath: '', content: basicDoc }];

      const content = (await plugin(schema, docs, config, {
        outputFile: 'graphql.tsx',
      })) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as Operations from 'path/to/documents.tsx';`);
      expect(content.content).toBeSimilarStringTo(`
        export const TestComponent = (props: TestComponentProps) => (
          <ApolloReactComponents.Query<TestQuery, TestQueryVariables> query={Operations.test} {...props} />
        );`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should import Operations from one external file and use it in Mutations', async () => {
      const config: ReactApolloRawPluginConfig = {
        documentMode: DocumentMode.external,
        importDocumentNodeExternallyFrom: 'path/to/documents.tsx',
      };

      const docs = [{ filePath: '', content: mutationDoc }];

      const content = (await plugin(schema, docs, config, {
        outputFile: 'graphql.tsx',
      })) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as Operations from 'path/to/documents.tsx';`);
      expect(content.content).toBeSimilarStringTo(`
        export const TestComponent = (props: TestComponentProps) => (
          <ApolloReactComponents.Mutation<TestMutation, TestMutationVariables> mutation={Operations.test} {...props} />
        );`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should import Operations from one external file and use it in Subscriptions', async () => {
      const config: ReactApolloRawPluginConfig = {
        documentMode: DocumentMode.external,
        importDocumentNodeExternallyFrom: 'path/to/documents.tsx',
      };

      const docs = [{ filePath: '', content: subscriptionDoc }];

      const content = (await plugin(schema, docs, config, {
        outputFile: 'graphql.tsx',
      })) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as Operations from 'path/to/documents.tsx';`);
      expect(content.content).toBeSimilarStringTo(`
        export const TestComponent = (props: TestComponentProps) => (
          <ApolloReactComponents.Subscription<TestSubscription, TestSubscriptionVariables> subscription={Operations.test} {...props} />
        );`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should import Operations from one external file and use it in multiple components', async () => {
      const config: ReactApolloRawPluginConfig = {
        documentMode: DocumentMode.external,
        importDocumentNodeExternallyFrom: 'path/to/documents.tsx',
      };

      const docs = [{ filePath: '', content: multipleOperationDoc }];

      const content = (await plugin(schema, docs, config, {
        outputFile: 'graphql.tsx',
      })) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as Operations from 'path/to/documents.tsx';`);
      expect(content.content).toBeSimilarStringTo(`
      export const TestOneComponent = (props: TestOneComponentProps) => (
        <ApolloReactComponents.Query<TestOneQuery, TestOneQueryVariables> query={Operations.testOne} {...props} />
      );`);
      expect(content.content).toBeSimilarStringTo(`
        export const TestTwoComponent = (props: TestTwoComponentProps) => (
          <ApolloReactComponents.Mutation<TestTwoMutation, TestTwoMutationVariables> mutation={Operations.testTwo} {...props} />
        );`);
      expect(content.content).toBeSimilarStringTo(`
        export const TestThreeComponent = (props: TestThreeComponentProps) => (
          <ApolloReactComponents.Subscription<TestThreeSubscription, TestThreeSubscriptionVariables> subscription={Operations.testThree} {...props} />
        );`);

      await validateTypeScript(content, schema, docs, {});
    });

    it('should import Operations from near operation file for Queries', async () => {
      const config: ReactApolloRawPluginConfig = {
        documentMode: DocumentMode.external,
        importDocumentNodeExternallyFrom: 'near-operation-file',
      };

      const docs = [{ filePath: 'path/to/document.graphql', content: basicDoc }];

      const content = (await plugin(schema, docs, config, {
        outputFile: 'graphql.tsx',
      })) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as Operations from './document.graphql';`);
      expect(content.content).toBeSimilarStringTo(`
        export const TestComponent = (props: TestComponentProps) => (
          <ApolloReactComponents.Query<TestQuery, TestQueryVariables> query={Operations.test} {...props} />
        );`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should import Operations from near operation file for Mutations', async () => {
      const config: ReactApolloRawPluginConfig = {
        documentMode: DocumentMode.external,
        importDocumentNodeExternallyFrom: 'near-operation-file',
      };

      const docs = [{ filePath: 'path/to/document.graphql', content: mutationDoc }];

      const content = (await plugin(schema, docs, config, {
        outputFile: 'graphql.tsx',
      })) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as Operations from './document.graphql';`);
      expect(content.content).toBeSimilarStringTo(`
      export const TestComponent = (props: TestComponentProps) => (
        <ApolloReactComponents.Mutation<TestMutation, TestMutationVariables> mutation={Operations.test} {...props} />
      );`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should import Operations from near operation file for Subscriptions', async () => {
      const config: ReactApolloRawPluginConfig = {
        documentMode: DocumentMode.external,
        importDocumentNodeExternallyFrom: 'near-operation-file',
      };

      const docs = [{ filePath: 'path/to/document.graphql', content: subscriptionDoc }];

      const content = (await plugin(schema, docs, config, {
        outputFile: 'graphql.tsx',
      })) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as Operations from './document.graphql';`);
      expect(content.content).toBeSimilarStringTo(`
      export const TestComponent = (props: TestComponentProps) => (
        <ApolloReactComponents.Subscription<TestSubscription, TestSubscriptionVariables> subscription={Operations.test} {...props} />
      );`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should import Operations from near operation file and use it in multiple components', async () => {
      const config: ReactApolloRawPluginConfig = {
        documentMode: DocumentMode.external,
        importDocumentNodeExternallyFrom: 'near-operation-file',
      };

      const docs = [{ filePath: 'path/to/document.graphql', content: multipleOperationDoc }];

      const content = (await plugin(schema, docs, config, {
        outputFile: 'graphql.tsx',
      })) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as Operations from './document.graphql';`);
      expect(content.content).toBeSimilarStringTo(`
      export const TestOneComponent = (props: TestOneComponentProps) => (
        <ApolloReactComponents.Query<TestOneQuery, TestOneQueryVariables> query={Operations.testOne} {...props} />
      );`);
      expect(content.content).toBeSimilarStringTo(`
        export const TestTwoComponent = (props: TestTwoComponentProps) => (
          <ApolloReactComponents.Mutation<TestTwoMutation, TestTwoMutationVariables> mutation={Operations.testTwo} {...props} />
        );`);
      expect(content.content).toBeSimilarStringTo(`
        export const TestThreeComponent = (props: TestThreeComponentProps) => (
          <ApolloReactComponents.Subscription<TestThreeSubscription, TestThreeSubscriptionVariables> subscription={Operations.testThree} {...props} />
        );`);

      await validateTypeScript(content, schema, docs, {});
    });
  });
});
