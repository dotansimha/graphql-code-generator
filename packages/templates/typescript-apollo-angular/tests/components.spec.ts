import './custom-matchers';
import { gql, introspectionToGraphQLSchema, schemaToTemplateContext, transformDocument } from 'graphql-codegen-core';
import { compileTemplate } from 'graphql-codegen-compiler';
import config from '../dist';
import * as fs from 'fs';

describe('Components', () => {
  it('should generate Component', async () => {
    const schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('./tests/files/schema.json').toString()));
    const context = schemaToTemplateContext(schema);

    const documents = gql`
      query MyFeed {
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
      import * as Apollo from 'apollo-angular';
    `);
    expect(content).toBeSimilarStringTo(`
      import gql from 'graphql-tag';
    `);
    expect(content).toBeSimilarStringTo(`
      export class MyFeed extends Apollo.Query
    `);
  });

  it('should generate correct Component when noNamespaces enabled', async () => {
    const schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('./tests/files/schema.json').toString()));
    const context = schemaToTemplateContext(schema);

    const documents = gql`
      query MyFeed {
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
    const compiled = await compileTemplate(
      { ...config, config: { noNamespaces: true } },
      context,
      [transformedDocument],
      { generateSchema: false }
    );
    const content = compiled[0].content;

    expect(content).toBeSimilarStringTo(`
      export class MyFeed extends Apollo.Query<MyFeedQuery, MyFeedVariables> {
    `);
  });

  it('should generate correct Component when noNamespaces disabled', async () => {
    const schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('./tests/files/schema.json').toString()));
    const context = schemaToTemplateContext(schema);

    const documents = gql`
      query MyFeed {
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
      export class MyFeed extends Apollo.Query<MyFeed.Query, MyFeed.Variables> {
    `);
  });
});
