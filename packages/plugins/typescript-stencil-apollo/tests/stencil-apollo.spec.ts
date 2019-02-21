import 'graphql-codegen-core/dist/testing';
import { makeExecutableSchema } from 'graphql-tools';
import { plugin } from '../dist';
import * as fs from 'fs';
import { buildClientSchema } from 'graphql';
import gql from 'graphql-tag';

describe('Components', () => {
  const schema = buildClientSchema(JSON.parse(fs.readFileSync('./tests/files/schema.json').toString()));

  it('should import dependencies', async () => {
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
        import { FunctionalComponent } from '@stencil/core';
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

    const content = await plugin(schema, [{ filePath: '', content: documents }], {}, { outputFile: '' });

    expect(content).toBeSimilarStringTo(`
        export interface ComponentProps {
          variables ?: Variables;
          onReady ?: import('stencil-apollo/dist/types/components/apollo-query/types').OnQueryReadyFn<Query, Variables>;
      }
      export const Component: FunctionalComponent<ComponentProps> = (props, children) => {
          return (
              <apollo-query
              query={ Document }
              {...props}
              >
                  {children}
              </apollo-query>
          );
      }
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

    expect(content).not.toContain(`import { FunctionalComponent } from '@stencil/core';`);
    expect(content).not.toContain(`import gql from 'graphql-tag';`);
  });
});
