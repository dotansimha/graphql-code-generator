import 'graphql-codegen-core/dist/testing';
import { makeExecutableSchema } from 'graphql-tools';
import { plugin } from '../dist';
import * as fs from 'fs';
import gql from 'graphql-tag';
import { buildClientSchema } from 'graphql';

describe('Components', () => {
  const schema = buildClientSchema(JSON.parse(fs.readFileSync('./tests/files/schema.json').toString()));

  it('should import React and ReactApollo dependencies', async () => {
    const documents = gql`
      query {
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

    const content = await plugin(
      schema,
      [{ filePath: '', content: documents }],
      {},
      {
        outputFile: 'graphql.tsx'
      }
    );

    expect(content).toBeSimilarStringTo(`
            import * as ReactApollo from 'react-apollo';
          `);

    expect(content).toBeSimilarStringTo(`
            import * as React from 'react';
          `);

    expect(content).toBeSimilarStringTo(`
        import gql from 'graphql-tag';
      `);
  });

  it('should generate Document variable', async () => {
    const documents = gql`
      query {
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

    const content = await plugin(
      schema,
      [{ filePath: '', content: documents }],
      {},
      {
        outputFile: 'graphql.tsx'
      }
    );

    expect(content).toBeSimilarStringTo(`
        export const Document =  gql\`
           {
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
    const documents = gql`
      query {
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

    const content = await plugin(
      schema,
      [{ filePath: '', content: documents }],
      {},
      {
        outputFile: 'graphql.tsx'
      }
    );

    expect(content).toBeSimilarStringTo(`
    export class Component extends React.Component<Partial<ReactApollo.QueryProps<Query, Variables>>> {
      render(){
          return (
              <ReactApollo.Query<Query, Variables>
              query={ Document }
              {...(this as any)['props'] as any}
                          />
                );
              }
          }
        `);
  });

  it('should generate HOCs', async () => {
    const documents = gql`
      query {
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

    const content = await plugin(
      schema,
      [{ filePath: '', content: documents }],
      {},
      {
        outputFile: 'graphql.tsx'
      }
    );

    expect(content).toBeSimilarStringTo(`
          export function HOC<TProps, TChildProps = any>(operationOptions:
              ReactApollo.OperationOption<
                  TProps,
                  Query,
                  Variables,
                  Props<TChildProps>
              > | undefined){
          return ReactApollo.graphql<TProps, Query, Variables, Props<TChildProps>>(
              Document,
              operationOptions
          );
        };
    `);
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

    expect(content).toBeSimilarStringTo(`
      export namespace FeedWithRepository {
        export const FragmentDoc = gql\`
          fragment FeedWithRepository on FeedType {
            id
            commentCount
            repository(search: "phrase") {
              ...RepositoryWithOwner
            }
          }

          \${RepositoryWithOwner.FragmentDoc}

        \`;
      }
      `);
    expect(content).toBeSimilarStringTo(`
      export namespace RepositoryWithOwner {
        export const FragmentDoc = gql\`
          fragment RepositoryWithOwner on Repository {
            full_name
            html_url
            owner {
              avatar_url
            }
          }
        \`;
      }
    `);
  });

  it('should embed inline fragments inside query document', async () => {
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

    expect(content).toBeSimilarStringTo(`
        export const Document = gql\`
          query MyFeed {
            feed {
              ...FeedWithRepository
            }
          }

          \${FeedWithRepository.FragmentDoc}
        \`;
      `);
  });
  it('no duplicated fragments', async () => {
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
      const Document = gql\` query MyFeed {
          feed {
            ...SimpleFeed
          }
          allFeeds {
            ...SimpleFeed
          }
        }
        \${SimpleFeed.FragmentDoc}
      \`
    `);
    expect(content).toBeSimilarStringTo(`
      const FragmentDoc = gql\` fragment SimpleFeed on FeedType {
        id
        commentCount
      }
      \`;
    `);
  });

  it('write fragments in proper order (when one depends on other)', async () => {
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

  it('Issue 702 - handle duplicated documents when fragment and query have the same name', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: `
        type Event {
          type: String!
          name: String!
        }

        type Query {
          events: [Event]
        }

        schema {
          query: Query
        }
      `
    });

    const query = gql`
      fragment event on Event {
        name
      }

      query event {
        events {
          ...event
        }
      }
    `;

    const content = await plugin(
      testSchema,
      [{ filePath: '', content: query }],
      {},
      {
        outputFile: 'graphql.tsx'
      }
    );

    expect(content).toBeSimilarStringTo(`
      export namespace Event {
        export const FragmentDoc = gql\`
          fragment event on Event {
            name
          }
        \`;
      }
    `);

    expect(content).toBeSimilarStringTo(`
      export namespace Event {
        export const FragmentDoc = gql\`
          fragment event on Event {
            name
          }
        \`;
      }
    `);

    expect(content).toBeSimilarStringTo(`
      export namespace Event {
        export const Document = gql\`
          query event {
            events {
              ...event
            }
          }

          \${Event.FragmentDoc}
      \`;
    `);
  });

  it(`should skip if there's no operations`, async () => {
    const content = await plugin(
      schema,
      [],
      { noNamespaces: true },
      {
        outputFile: 'graphql.tsx'
      }
    );

    expect(content).not.toContain(`import * as ReactApollo from 'react-apollo';`);
    expect(content).not.toContain(`import * as React from 'react';`);
    expect(content).not.toContain(`import gql from 'graphql-tag';`);
  });

  it('should import ReactApolloHooks dependencies', async () => {
    const documents = gql`
      query {
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

    const content = await plugin(
      schema,
      [{ filePath: '', content: documents }],
      { withHooks: true },
      {
        outputFile: 'graphql.tsx'
      }
    );

    expect(content).toBeSimilarStringTo(`
        import * as ReactApolloHooks from 'react-apollo-hooks';
    `);
  });

  it('should generate Hooks', async () => {
    const documents = gql`
      query {
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

      mutation($name: String) {
        submitRepository(repoFullName: $name)
      }
    `;

    const content = await plugin(
      schema,
      [{ filePath: '', content: documents }],
      { withHooks: true },
      {
        outputFile: 'graphql.tsx'
      }
    );

    expect(content).toBeSimilarStringTo(`
          export function use(baseOptions?: ReactApolloHooks.QueryHookOptions<
                Variables
            >) {
          return ReactApolloHooks.useQuery<
            Query, 
            Variables
          >(Document, baseOptions);
        };
    `);

    expect(content).toBeSimilarStringTo(`
          export function use(baseOptions?: ReactApolloHooks.MutationHookOptions<
                Mutation,
                Variables
            >) {
          return ReactApolloHooks.useMutation<
            Mutation, 
            Variables
          >(Document, baseOptions);
        };
    `);
  });

  it('should generate Subscription Hooks if config is enabled', async () => {
    const documents = gql`
      subscription ListenToComments($name: String) {
        commentAdded(repoFullName: $name) {
          id
        }
      }
    `;

    const content = await plugin(
      schema,
      [{ filePath: '', content: documents }],
      {
        noNamespaces: true,
        withHooks: true,
        withSubscriptionHooks: true,
        importUseSubscriptionFrom: './addons/ras'
      },
      {
        outputFile: 'graphql.tsx'
      }
    );

    expect(content).toBeSimilarStringTo(`
          export function useListenToComments(baseOptions?: SubscriptionHooks.SubscriptionHookOptions<
              ListenToCommentsSubscription,
              ListenToCommentsVariables
            >) {
          return SubscriptionHooks.useSubscription<
            ListenToCommentsSubscription, 
            ListenToCommentsVariables
          >(ListenToCommentsDocument, baseOptions);
        };
    `);

    expect(content).toBeSimilarStringTo(`
      import * as SubscriptionHooks from './addons/ras';
    `);
  });

  it('should skip import React and ReactApollo if only hooks are used', async () => {
    const documents = gql`
      query {
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

    const content = await plugin(
      schema,
      [{ filePath: '', content: documents }],
      {
        withHooks: true,
        noHOC: true,
        noComponents: true
      },
      {
        outputFile: 'graphql.tsx'
      }
    );

    expect(content).not.toBeSimilarStringTo(`
      import * as ReactApollo from 'react-apollo';
    `);

    expect(content).not.toBeSimilarStringTo(`
      import * as React from 'react';
    `);
  });
});
