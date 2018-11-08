import 'graphql-codegen-core/dist/testing';
import { gql, introspectionToGraphQLSchema, schemaToTemplateContext, transformDocument } from 'graphql-codegen-core';
import { makeExecutableSchema } from 'graphql-tools';
import { plugin } from '../dist';
import * as fs from 'fs';

describe('Components', () => {
  const schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('./tests/files/schema.json').toString()));

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

    const content = await plugin(schema, [{ filePath: '', content: documents }], {});

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

    const content = await plugin(schema, [{ filePath: '', content: documents }], {});

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

    const content = await plugin(schema, [{ filePath: '', content: documents }], {});

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

    const content = await plugin(schema, [{ filePath: '', content: documents }], {});

    expect(content).toBeSimilarStringTo(`
          export function HOC<TProps>(operationOptions:
              ReactApollo.OperationOption<
                  TProps,
                  Query,
                  Variables,
                  Props
              > | undefined){
          return ReactApollo.graphql<TProps, Query, Variables>(
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

    const content = await plugin(schema, [{ filePath: '', content: myFeed }], {});

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

    const content = await plugin(schema, [{ filePath: '', content: myFeed }], {});

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
    const content = await plugin(schema, documents.map(content => ({ content, filePath: '' })), {});

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
    const content = await plugin(schema, documents.map(content => ({ content, filePath: '' })), {});

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

    const content = await plugin(testSchema, [{ filePath: '', content: query }], {});

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
    const content = await plugin(schema, [], { noNamespaces: true });

    expect(content).not.toContain(`import * as ReactApollo from 'react-apollo';`);
    expect(content).not.toContain(`import * as React from 'react';`);
    expect(content).not.toContain(`import gql from 'graphql-tag';`);
  });
});
