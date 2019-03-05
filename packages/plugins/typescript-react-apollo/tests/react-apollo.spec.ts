import 'graphql-codegen-core/dist/testing';
import { plugin } from '../src/index';
import { parse, buildSchema } from 'graphql';
import gql from 'graphql-tag';

describe('React Apollo', () => {
  const schema = buildSchema(`type Query { something: MyType } type MyType { a: String }`);
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

  it(`should skip if there's no operations`, async () => {
    const content = await plugin(
      schema,
      [],
      {},
      {
        outputFile: 'graphql.tsx'
      }
    );

    expect(content).not.toContain(`import * as ReactApollo from 'react-apollo';`);
    expect(content).not.toContain(`import * as React from 'react';`);
    expect(content).not.toContain(`import gql from 'graphql-tag';`);
  });

  describe('Imports', () => {
    it('should import React and ReactApollo dependencies', async () => {
      const content = await plugin(
        schema,
        [{ filePath: '', content: basicDoc }],
        {},
        {
          outputFile: 'graphql.tsx'
        }
      );

      expect(content).toBeSimilarStringTo(`import * as ReactApollo from 'react-apollo';`);
      expect(content).toBeSimilarStringTo(`import * as React from 'react';`);
      expect(content).toBeSimilarStringTo(`import gql from 'graphql-tag';`);
    });

    it(`should use gql import from gqlImport config option`, async () => {
      const content = await plugin(
        schema,
        [{ filePath: '', content: basicDoc }],
        { gqlImport: 'graphql.macro#gql' },
        {
          outputFile: 'graphql.tsx'
        }
      );

      expect(content).toContain(`import { gql } from 'graphql.macro';`);
    });

    it('should import ReactApolloHooks dependencies', async () => {
      const content = await plugin(
        schema,
        [{ filePath: '', content: basicDoc }],
        { withHooks: true },
        {
          outputFile: 'graphql.tsx'
        }
      );

      expect(content).toBeSimilarStringTo(`import * as ReactApolloHooks from 'react-apollo-hooks';`);
    });

    it('should import ReactApolloHooks from hooksImportFrom config option', async () => {
      const content = await plugin(
        schema,
        [{ filePath: '', content: basicDoc }],
        { withHooks: true, hooksImportFrom: 'custom-apollo-hooks' },
        {
          outputFile: 'graphql.tsx'
        }
      );

      expect(content).toBeSimilarStringTo(`import * as ReactApolloHooks from 'custom-apollo-hooks';`);
    });

    it('should skip import React and ReactApollo if only hooks are used', async () => {
      const content = await plugin(
        schema,
        [{ filePath: '', content: basicDoc }],
        {
          withHooks: true,
          withHOC: false,
          withComponent: false
        },
        {
          outputFile: 'graphql.tsx'
        }
      );

      expect(content).not.toBeSimilarStringTo(`import * as ReactApollo from 'react-apollo';`);
      expect(content).not.toBeSimilarStringTo(`import * as React from 'react';`);
    });
  });

  describe('Fragments', () => {
    it('Should generate basic fragments documents correctly', async () => {
      const result = await plugin(
        schema,
        [
          {
            filePath: 'a.graphql',
            content: parse(/* GraphQL */ `
              fragment MyFragment on MyType {
                a
              }

              query {
                a
              }
            `)
          }
        ],
        {},
        { outputFile: '' }
      );

      expect(result).toBeSimilarStringTo(`
      export const MyFragmentFragmentDoc = gql\`
      fragment MyFragment on MyType {
        a
      }
      \`;`);
    });

    it('Should generate fragments when they are refering to each other', async () => {
      const result = await plugin(
        schema,
        [
          {
            filePath: 'a.graphql',
            content: parse(/* GraphQL */ `
              fragment MyFragment on MyType {
                a
                ...MyOtherFragment
              }

              query {
                a
              }
            `)
          },
          {
            filePath: 'b.graphql',
            content: parse(/* GraphQL */ `
              fragment MyOtherFragment on MyType {
                a
              }
            `)
          }
        ],
        {},
        { outputFile: '' }
      );

      expect(result).toBeSimilarStringTo(`
      export const MyOtherFragmentFragmentDoc = gql\`
      fragment MyOtherFragment on MyType {
        a
      }
      \`;`);

      expect(result).toBeSimilarStringTo(`
      export const MyFragmentFragmentDoc = gql\`
      fragment MyFragment on MyType {
        a
        ...MyOtherFragment
      }
      \${MyOtherFragmentFragmentDoc}\`;`);
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
        fragment FeedWithRepository on FeedType {
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

      const content = await plugin(
        schema,
        [{ filePath: '', content: myFeed }],
        {},
        {
          outputFile: 'graphql.tsx'
        }
      );

      expect(content).toBeSimilarStringTo(`export const FeedWithRepositoryFragmentDoc = gql\`
fragment FeedWithRepository on FeedType {
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
    });

    it('should avoid generating duplicate fragments', async () => {
      const simpleFeed = gql`
        fragment SimpleFeed on FeedType {
          id
          commentCount
        }
      `;
      const myFeed = gql`
        query MyFeed {
          feed {
            ...SimpleFeed
          }
          allFeeds {
            ...SimpleFeed
          }
        }
      `;
      const documents = [simpleFeed, myFeed];
      const content = await plugin(
        schema,
        documents.map(content => ({ content, filePath: '' })),
        {},
        {
          outputFile: 'graphql.tsx'
        }
      );

      expect(content).toBeSimilarStringTo(`
        export const MyFeedDocument = gql\`
        query MyFeed {
            feed {
              ...SimpleFeed
            }
            allFeeds {
              ...SimpleFeed
            }
          }
          \${SimpleFeedFragmentDoc}\``);
      expect(content).toBeSimilarStringTo(`
        export const SimpleFeedFragmentDoc = gql\`
        fragment SimpleFeed on FeedType {
          id
          commentCount
        }
\`;`);
    });

    it('Should generate fragments in proper order (when one depends on other)', async () => {
      const myFeed = gql`
        fragment FeedWithRepository on FeedType {
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
      const content = await plugin(
        schema,
        documents.map(content => ({ content, filePath: '' })),
        {},
        {
          outputFile: 'graphql.tsx'
        }
      );

      const feedWithRepositoryPos = content.indexOf('fragment FeedWithRepository');
      const repositoryWithOwnerPos = content.indexOf('fragment RepositoryWithOwner');
      expect(repositoryWithOwnerPos).toBeLessThan(feedWithRepositoryPos);
    });
  });

  describe('Component', () => {
    it('should generate Document variable', async () => {
      const content = await plugin(
        schema,
        [{ filePath: '', content: basicDoc }],
        {},
        {
          outputFile: 'graphql.tsx'
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
    });

    it('should generate Component', async () => {
      const content = await plugin(
        schema,
        [{ filePath: '', content: basicDoc }],
        {},
        {
          outputFile: 'graphql.tsx'
        }
      );

      expect(content).toBeSimilarStringTo(`
      export class TestComponent extends React.Component<Partial<ReactApollo.QueryProps<TestQuery, TestQueryVariables>>> {
        render() {
            return (
                <ReactApollo.Query<TestQuery, TestQueryVariables>
                query={TestDocument}
                {...(this as any)['props'] as any}
                            />
                  );
                }
            }
          `);
    });

    it('should not generate Component', async () => {
      const content = await plugin(
        schema,
        [{ filePath: '', content: basicDoc }],
        { withComponent: false },
        {
          outputFile: 'graphql.tsx'
        }
      );

      expect(content).not.toContain(`export class TestComponent`);
    });
  });

  describe('HOC', () => {
    it('should generate HOCs', async () => {
      const content = await plugin(
        schema,
        [{ filePath: '', content: basicDoc }],
        {},
        {
          outputFile: 'graphql.tsx'
        }
      );

      expect(content).toBeSimilarStringTo(
        `export type TestProps<TChildProps = any> = Partial<ReactApollo.DataProps<TestQuery, TestQueryVariables>> & TChildProps;`
      );

      expect(content)
        .toBeSimilarStringTo(`export function TestHOC<TProps, TChildProps = any>(operationOptions: ReactApollo.OperationOption<
  TProps,
  TestQuery,
  TestQueryVariables,
  TestProps<TChildProps>> | undefined) {
    return ReactApollo.graphql<TProps, TestQuery, TestQueryVariables, TestProps<TChildProps>>(TestDocument, operationOptions);
};`);
    });

    it('should not generate HOCs', async () => {
      const content = await plugin(
        schema,
        [{ filePath: '', content: basicDoc }],
        { withHOC: false },
        {
          outputFile: 'graphql.tsx'
        }
      );

      expect(content).not.toContain(`export type TestProps`);
      expect(content).not.toContain(`export function TestHOC`);
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
          submitRepository(repoFullName: $name)
        }
      `);

      const content = await plugin(
        schema,
        [{ filePath: '', content: documents }],
        { withHooks: true, withComponent: false, withHOC: false },
        {
          outputFile: 'graphql.tsx'
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
    });

    it('Should not generate hooks for query and mutation', async () => {
      const content = await plugin(
        schema,
        [{ filePath: '', content: basicDoc }],
        { withHooks: false },
        {
          outputFile: 'graphql.tsx'
        }
      );

      expect(content).not.toContain(`export function useTestQuery`);
    });

    it('Should generate subscription hooks', async () => {
      const documents = parse(/* GraphQL */ `
        subscription ListenToComments($name: String) {
          commentAdded(repoFullName: $name) {
            id
          }
        }
      `);

      const content = await plugin(
        schema,
        [{ filePath: '', content: documents }],
        {
          withHooks: true,
          withComponent: false,
          withHOC: false
        },
        {
          outputFile: 'graphql.tsx'
        }
      );

      expect(content).toBeSimilarStringTo(`
export function useListenToCommentsSubscription(baseOptions?: ReactApolloHooks.SubscriptionHookOptions<ListenToCommentsSubscription, ListenToCommentsSubscriptionVariables>) {
  return ReactApolloHooks.useSubscription<ListenToCommentsSubscription, ListenToCommentsSubscriptionVariables>(ListenToCommentsDocument, baseOptions);
};`);
    });
  });
});
