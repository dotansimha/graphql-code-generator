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
    const compiled = await compileTemplate(
      {
        ...config,
        config: {
          noGraphqlTag: true
        }
      },
      context,
      [transformedDocument],
      { generateSchema: false }
    );
    const content = compiled[0].content;

    expect(content).toBeSimilarStringTo(`
      import * as Apollo from 'apollo-angular';
    `);
    expect(content).not.toBeSimilarStringTo(`
      import gql from 'graphql-tag';
    `);
    expect(content).toBeSimilarStringTo(`
      import { Injectable } from '@angular/core';
    `);
    expect(content).toBeSimilarStringTo(`
      @Injectable({
        providedIn: 'root'
      })
      export class MyFeedGQL extends Apollo.Query
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
      { ...config, config: { noNamespaces: true, noGraphqlTag: true } },
      context,
      [transformedDocument],
      { generateSchema: false }
    );
    const content = compiled[0].content;

    expect(content).toBeSimilarStringTo(`
      @Injectable({
        providedIn: 'root'
      })
      export class MyFeedGQL extends Apollo.Query<MyFeedQuery, MyFeedVariables> {
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
    const compiled = await compileTemplate(
      {
        ...config,
        config: {
          noGraphqlTag: true
        }
      },
      context,
      [transformedDocument],
      { generateSchema: false }
    );
    const content = compiled[0].content;

    expect(content).toBeSimilarStringTo(`
      @Injectable({
        providedIn: 'root'
      })
      export class MyFeedGQL extends Apollo.Query<MyFeed.Query, MyFeed.Variables> {
    `);
  });

  it('should use parsed document instead of graphql-tag', async () => {
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

    // location might be different so let's skip it
    delete documents.loc;

    const transformedDocument = transformDocument(schema, documents);
    const compiled = await compileTemplate(
      { ...config, config: { noNamespaces: true, noGraphqlTag: true } },
      context,
      [transformedDocument],
      { generateSchema: false }
    );
    // location might be different so let's remove it
    const content = compiled[0].content.replace(/,"loc":{"start":\d+,"end":\d+}}\s+}/, '}');

    expect(content).toBeSimilarStringTo(`
      @Injectable({
        providedIn: 'root'
      })
      export class MyFeedGQL extends Apollo.Query<MyFeedQuery, MyFeedVariables> {
    `);

    expect(content).toBeSimilarStringTo(`
      document: any = ${JSON.stringify(documents)}
    `);
  });

  it('should not escape html', async () => {
    const schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('./tests/files/schema.json').toString()));
    const context = schemaToTemplateContext(schema);

    const documents = gql`
      query MyFeed {
        feed(search: "phrase") {
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
      document: any = gql\` query MyFeed {
    `);

    expect(content.includes('&quot;')).toBe(false);
    expect(content.includes('"phrase"')).toBe(true);
  });
});
