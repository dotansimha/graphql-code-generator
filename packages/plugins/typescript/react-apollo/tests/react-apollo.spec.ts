import '@graphql-codegen/testing';
import { plugin } from '../src/index';
import { parse, GraphQLSchema, buildClientSchema, buildASTSchema } from 'graphql';
import gql from 'graphql-tag';
import { Types } from '@graphql-codegen/plugin-helpers';
import { plugin as tsPlugin } from '../../typescript/src/index';
import { plugin as tsDocumentsPlugin } from '../../operations/src/index';
import { validateTs } from '../../typescript/tests/validate';
import { readFileSync } from 'fs';

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

  const validateTypeScript = async (output: string, testSchema: GraphQLSchema, documents: Types.DocumentFile[], config: any) => {
    const tsOutput = await tsPlugin(testSchema, documents, config, { outputFile: '' });
    const tsDocumentsOutput = await tsDocumentsPlugin(testSchema, documents, config, { outputFile: '' });
    const merged = [tsOutput, tsDocumentsOutput, output].join('\n');
    validateTs(merged, undefined, true);
  };

  it(`should skip if there's no operations`, async () => {
    const content = await plugin(
      schema,
      [],
      {},
      {
        outputFile: 'graphql.tsx',
      }
    );

    expect(content).not.toContain(`import * as ReactApollo from 'react-apollo';`);
    expect(content).not.toContain(`import * as React from 'react';`);
    expect(content).not.toContain(`import gql from 'graphql-tag';`);
    await validateTypeScript(content, schema, [], {});
  });

  describe('Imports', () => {
    it('should import React and ReactApollo dependencies', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.tsx',
        }
      );

      expect(content).toBeSimilarStringTo(`import * as ReactApollo from 'react-apollo';`);
      expect(content).toBeSimilarStringTo(`import * as React from 'react';`);
      expect(content).toBeSimilarStringTo(`import gql from 'graphql-tag';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should import DocumentNode when using noGraphQLTag', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = await plugin(
        schema,
        docs,
        {
          noGraphQLTag: true,
        },
        {
          outputFile: 'graphql.tsx',
        }
      );

      expect(content).toContain(`import { DocumentNode } from 'graphql';`);
      expect(content).not.toBeSimilarStringTo(`import gql from 'graphql-tag';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it(`should use gql import from gqlImport config option`, async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = await plugin(
        schema,
        docs,
        { gqlImport: 'graphql.macro#gql' },
        {
          outputFile: 'graphql.tsx',
        }
      );

      expect(content).toContain(`import { gql } from 'graphql.macro';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should import ReactApolloHooks dependencies', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = await plugin(
        schema,
        docs,
        { withHooks: true },
        {
          outputFile: 'graphql.tsx',
        }
      );

      expect(content).toBeSimilarStringTo(`import * as ReactApolloHooks from 'react-apollo-hooks';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should import ReactApolloHooks from hooksImportFrom config option', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = await plugin(
        schema,
        docs,
        { withHooks: true, hooksImportFrom: 'custom-apollo-hooks' },
        {
          outputFile: 'graphql.tsx',
        }
      );

      expect(content).toBeSimilarStringTo(`import * as ReactApolloHooks from 'custom-apollo-hooks';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should import ReactApollo from reactApolloImportFrom config option', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = await plugin(
        schema,
        docs,
        { withHooks: true, reactApolloImportFrom: 'custom-apollo' },
        {
          outputFile: 'graphql.tsx',
        }
      );

      expect(content).toBeSimilarStringTo(`import * as ReactApollo from 'custom-apollo';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should skip import React and ReactApollo if only hooks are used', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = await plugin(
        schema,
        docs,
        {
          withHooks: true,
          withHOC: false,
          withComponent: false,
          withMutationFn: false
        },
        {
          outputFile: 'graphql.tsx',
        }
      );

      expect(content).not.toBeSimilarStringTo(`import * as ReactApollo from 'react-apollo';`);
      expect(content).not.toBeSimilarStringTo(`import * as React from 'react';`);
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
      const result = await plugin(schema, docs, {}, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`
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

      const content = await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.tsx',
        }
      );

      expect(content).toBeSimilarStringTo(`export const FeedWithRepositoryFragmentDoc = gql\`
fragment FeedWithRepository on Entry {
  id
  commentCount
  repository(search: "phrase") {
    ...RepositoryWithOwner
  }
}
\${RepositoryWithOwnerFragmentDoc}\`;`);
      expect(content).toBeSimilarStringTo(`export const RepositoryWithOwnerFragmentDoc = gql\`
fragment RepositoryWithOwner on Repository {
  full_name
  html_url
  owner {
    avatar_url
  }
}
\`;`);

      expect(content).toBeSimilarStringTo(`export const MyFeedDocument = gql\`
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
      const content = await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.tsx',
        }
      );

      expect(content).toBeSimilarStringTo(`
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
      expect(content).toBeSimilarStringTo(`
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
      const content = await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.tsx',
        }
      );

      const feedWithRepositoryPos = content.indexOf('fragment FeedWithRepository');
      const repositoryWithOwnerPos = content.indexOf('fragment RepositoryWithOwner');
      expect(repositoryWithOwnerPos).toBeLessThan(feedWithRepositoryPos);
      await validateTypeScript(content, schema, docs, {});
    });
  });

  describe('Component', () => {
    it('should generate Document variable', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.tsx',
        }
      );

      expect(content).toBeSimilarStringTo(`
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
      const content = await plugin(
        schema,
        docs,
        {
          noGraphQLTag: true,
        },
        {
          outputFile: 'graphql.tsx',
        }
      );

      expect(content).toBeSimilarStringTo(`export const TestDocument: DocumentNode = {"kind":"Document","defin`);

      // For issue #1599 - make sure there are not `loc` properties
      expect(content).not.toContain(`loc":`);
      expect(content).not.toContain(`loc':`);

      await validateTypeScript(content, schema, docs, {});
    });

    it('should generate Component', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.tsx',
        }
      );

      expect(content).toBeSimilarStringTo(`
      export const TestComponent = (props: Omit<Omit<ReactApollo.QueryProps<TestQuery, TestQueryVariables>, 'query'>, 'variables'> & { variables?: TestQueryVariables }) => 
      (
          <ReactApollo.Query<TestQuery, TestQueryVariables> query={TestDocument} {...props} />
      );
      `);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should not generate Component', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = await plugin(
        schema,
        docs,
        { withComponent: false },
        {
          outputFile: 'graphql.tsx',
        }
      );

      expect(content).not.toContain(`export class TestComponent`);
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
      const content = await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.tsx',
        }
      );

      expect(content).toBeSimilarStringTo(`
      export const TestComponent = (props: Omit<Omit<ReactApollo.QueryProps<TestQuery, TestQueryVariables>, 'query'>, 'variables'> & { variables: TestQueryVariables }) => (
        <ReactApollo.Query<TestQuery, TestQueryVariables> query={TestDocument} {...props} />
      );`);
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
      const content = await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.tsx',
        }
      );

      expect(content).toBeSimilarStringTo(`
      export const TestComponent = (props: Omit<Omit<ReactApollo.MutationProps<TestMutation, TestMutationVariables>, 'mutation'>, 'variables'> & { variables?: TestMutationVariables }) => (
        <ReactApollo.Mutation<TestMutation, TestMutationVariables> mutation={TestDocument} {...props} />
      );`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should not add typesPrefix to Component', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = await plugin(
        schema,
        docs,
        { typesPrefix: 'I' },
        {
          outputFile: 'graphql.tsx',
        }
      );

      expect(content).not.toContain(`export class ITestComponent`);
    });
  });

  describe('HOC', () => {
    it('should generate HOCs', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.tsx',
        }
      );

      expect(content).toBeSimilarStringTo(`export type TestProps<TChildProps = {}> = Partial<ReactApollo.DataProps<TestQuery, TestQueryVariables>> & TChildProps;`);

      expect(content).toBeSimilarStringTo(`export function withTest<TProps, TChildProps = {}>(operationOptions?: ReactApollo.OperationOption<
  TProps,
  TestQuery,
  TestQueryVariables,
  TestProps<TChildProps>>) {
    return ReactApollo.withQuery<TProps, TestQuery, TestQueryVariables, TestProps<TChildProps>>(TestDocument, {
      alias: 'withTest',
      ...operationOptions
    });
};`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should not generate HOCs', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = await plugin(
        schema,
        docs,
        { withHOC: false },
        {
          outputFile: 'graphql.tsx',
        }
      );

      expect(content).not.toContain(`export type TestProps`);
      expect(content).not.toContain(`export function withTest`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should not add typesPrefix to HOCs', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = await plugin(
        schema,
        docs,
        { typesPrefix: 'I' },
        {
          outputFile: 'graphql.tsx',
        }
      );

      expect(content).toContain(`export type ITestProps`);
      expect(content).toContain(`export function withTest`);
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
      const content = await plugin(
        schema,
        docs,
        { withMutationFn: true },
        {
          outputFile: 'graphql.tsx',
        }
      );

      expect(content).toContain(`export type SubmitCommentMutationFn = ReactApollo.MutationFn<SubmitCommentMutation, SubmitCommentMutationVariables>;`);
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

      const content = await plugin(
        schema,
        docs,
        { withHooks: true, withComponent: false, withHOC: false },
        {
          outputFile: 'graphql.tsx',
        }
      );

      expect(content).toBeSimilarStringTo(`
export function useFeedQuery(baseOptions?: ReactApolloHooks.QueryHookOptions<FeedQueryVariables>) {
  return ReactApolloHooks.useQuery<FeedQuery, FeedQueryVariables>(FeedDocument, baseOptions);
};`);

      expect(content).toBeSimilarStringTo(`
export function useSubmitRepositoryMutation(baseOptions?: ReactApolloHooks.MutationHookOptions<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>) {
  return ReactApolloHooks.useMutation<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>(SubmitRepositoryDocument, baseOptions);
};`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('Should not generate hooks for query and mutation', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = await plugin(
        schema,
        docs,
        { withHooks: false },
        {
          outputFile: 'graphql.tsx',
        }
      );

      expect(content).not.toContain(`export function useTestQuery`);
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

      const content = await plugin(
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
      );

      expect(content).toBeSimilarStringTo(`
export function useListenToCommentsSubscription(baseOptions?: ReactApolloHooks.SubscriptionHookOptions<ListenToCommentsSubscription, ListenToCommentsSubscriptionVariables>) {
  return ReactApolloHooks.useSubscription<ListenToCommentsSubscription, ListenToCommentsSubscriptionVariables>(ListenToCommentsDocument, baseOptions);
};`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('Should not add typesPrefix to hooks', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = await plugin(
        schema,
        docs,
        { withHooks: true, typesPrefix: 'I' },
        {
          outputFile: 'graphql.tsx',
        }
      );

      expect(content).toContain(`export function useTestQuery`);
    });
  });
});
