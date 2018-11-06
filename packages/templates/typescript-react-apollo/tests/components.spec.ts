import 'graphql-codegen-core/dist/testing';
import { gql, introspectionToGraphQLSchema, schemaToTemplateContext, transformDocument } from 'graphql-codegen-core';
import { compileTemplate } from 'graphql-codegen-compiler';
import { makeExecutableSchema } from 'graphql-tools';
import config from '../dist';
import * as fs from 'fs';

describe('Components', () => {
  it('should import React and ReactApollo dependencies', async () => {
    const schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('./tests/files/schema.json').toString()));
    const context = schemaToTemplateContext(schema);

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

    const transformedDocument = transformDocument(schema, documents);
    const compiled = await compileTemplate(config, context, [transformedDocument], { generateSchema: false });
    const content = compiled[0].content;

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
    const schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('./tests/files/schema.json').toString()));
    const context = schemaToTemplateContext(schema);

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

    const transformedDocument = transformDocument(schema, documents);
    const compiled = await compileTemplate(config, context, [transformedDocument], { generateSchema: false });
    const content = compiled[0].content;

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
    const schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('./tests/files/schema.json').toString()));
    const context = schemaToTemplateContext(schema);

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

    const transformedDocument = transformDocument(schema, documents);
    const compiled = await compileTemplate(config, context, [transformedDocument], { generateSchema: false });
    const content = compiled[0].content;

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
  it.skip('should generate HOCs', async () => {
    const schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('./tests/files/schema.json').toString()));
    const context = schemaToTemplateContext(schema);

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

    const transformedDocument = transformDocument(schema, documents);
    const compiled = await compileTemplate(config, context, [transformedDocument], { generateSchema: false });
    const content = compiled[0].content;

    expect(content).toBeSimilarStringTo(`
      export function HOC<TProps = any, OperationOptions = ReactApollo.OperationOption<TProps, Query, Variables>>(operationOptions: OperationOptions){
        return ReactApollo.graphql<TProps, Query, Variables>(
          Document, 
          operationOptions
        );
      };
    `);
  });
  it('should generate Document variables for inline fragments', async () => {
    const schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('./tests/files/schema.json').toString()));
    const context = schemaToTemplateContext(schema);

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

    const transformedDocument = transformDocument(schema, myFeed);
    const compiled = await compileTemplate(config, context, [transformedDocument], { generateSchema: false });
    const content = compiled[0].content;

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
    const schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('./tests/files/schema.json').toString()));
    const context = schemaToTemplateContext(schema);

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

    const transformedDocument = transformDocument(schema, myFeed);
    const compiled = await compileTemplate(config, context, [transformedDocument], { generateSchema: false });
    const content = compiled[0].content;

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
    const schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('./tests/files/schema.json').toString()));
    const context = schemaToTemplateContext(schema);
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
    const compiled = await compileTemplate(config, context, documents.map(doc => transformDocument(schema, doc)), {
      generateSchema: false
    });
    const content = compiled[0].content;
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
    const schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('./tests/files/schema.json').toString()));
    const context = schemaToTemplateContext(schema);
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
    const compiled = await compileTemplate(config, context, documents.map(doc => transformDocument(schema, doc)), {
      generateSchema: false
    });
    const content = compiled[0].content;
    const feedWithRepositoryPos = content.indexOf('fragment FeedWithRepository');
    const repositoryWithOwnerPos = content.indexOf('fragment RepositoryWithOwner');
    expect(repositoryWithOwnerPos).toBeLessThan(feedWithRepositoryPos);
  });

  it('Issue 702 - handle duplicated documents when fragment and query have the same name', async () => {
    const schema = makeExecutableSchema({
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
    const context = schemaToTemplateContext(schema);
    const documents = gql`
      fragment event on Event {
        name
      }

      query event {
        events {
          ...event
        }
      }
    `;
    const transformedDocument = transformDocument(schema, documents);
    const compiled = await compileTemplate(
      {
        ...config,
        config: {
          noNamespaces: false
        }
      },
      context,
      [transformedDocument],
      { generateSchema: false }
    );
    const content = compiled[0].content;

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
    const schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('./tests/files/schema.json').toString()));
    const context = schemaToTemplateContext(schema);

    const compiled = await compileTemplate({ ...config, config: { noNamespaces: true } }, context, [], {
      generateSchema: false
    });
    const content = compiled[0].content;

    expect(content).not.toContain(`import * as ReactApollo from 'react-apollo';`);
    expect(content).not.toContain(`import * as React from 'react';`);
    expect(content).not.toContain(`import gql from 'graphql-tag';`);
  });
});
