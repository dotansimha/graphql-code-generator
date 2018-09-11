import './custom-matchers';
import {
  GeneratorConfig,
  gql,
  GraphQLSchema,
  introspectionToGraphQLSchema,
  makeExecutableSchema,
  SchemaTemplateContext,
  schemaToTemplateContext,
  transformDocument
} from 'graphql-codegen-core';
import { compileTemplate } from 'graphql-codegen-compiler';
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
        export const Document = gql\`
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
      export interface ComponentProps {
          query?: any;
          variables?: Variables;
          children: (result: ReactApollo.QueryResult<Query, Variables>) => React.ReactNode;
      };
    `);

    expect(content).toBeSimilarStringTo(`
    export class Component extends React.Component<ComponentProps> {
      render(){
          return (
              <ReactApollo.Query<Query, Variables>
              query={ Document }
              {...this.props}
                          />
                );
              }
          }
        `);
  });
  it('should generate HOCs', async () => {
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
      export function HOC<TProps = {}>(operationOptions?: ReactApollo.OperationOption<TProps, Query, Variables>){
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
        export const Document = gql\`
          fragment FeedWithRepository on FeedType {
            id
            commentCount
            repository(search: "phrase") {
              ...RepositoryWithOwner
            }
          }

          \${RepositoryWithOwner.Document}

        \`;
      }
      `);
    expect(content).toBeSimilarStringTo(`
      export namespace RepositoryWithOwner {
        export const Document = gql\`
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

          \${FeedWithRepository.Document}
        \`;
      `);
  });
});
