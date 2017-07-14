import { EInputType, GeneratorConfig } from '../src/types';
import { gql, introspectionToGraphQLSchema, schemaToTemplateContext, transformDocument } from 'graphql-codegen-core';
import * as fs from 'fs';
import { compileTemplate } from '../src/compile';

describe('generateProject', () => {
  it('should handle templates correctly and return the correct result path', () => {
    const config: GeneratorConfig = {
      inputType: EInputType.PROJECT,
      flattenTypes: true,
      primitives: {
        String: 'string',
        Int: 'number',
        Float: 'number',
        Boolean: 'boolean',
        ID: 'string'
      },
      templates: {
        'prefix.js.operation.template': `{{ name }}`,
      },
    };

    const schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('../../dev-test/githunt/schema.json').toString()));
    const context = schemaToTemplateContext(schema);
    const documents = gql`
      query myFeed {
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
    const compiled = compileTemplate(config, context, [transformedDocument], { generateSchema: false });

    expect(compiled[0].filename).toBe('prefix.myfeed.query.js');
    expect(compiled[0].content).toBe('myFeed');
  });

  it('should handle templates correctly and return the correct result path when using all context', () => {
    const config: GeneratorConfig = {
      inputType: EInputType.PROJECT,
      flattenTypes: true,
      primitives: {
        String: 'string',
        Int: 'number',
        Float: 'number',
        Boolean: 'boolean',
        ID: 'string'
      },
      templates: {
        'prefix.js.all.template': `{{ name }}`,
      },
    };

    const schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('../../dev-test/githunt/schema.json').toString()));
    const context = schemaToTemplateContext(schema);


    const documents = gql`
      query myFeed {
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
    const compiled = compileTemplate(config, context, [transformedDocument], { generateSchema: false });

    expect(compiled[0].filename).toBe('prefix.js');
  });

  it('should handle templates correctly and return the correct result path with prefix ', () => {
    const config: GeneratorConfig = {
      inputType: EInputType.PROJECT,
      flattenTypes: true,
      primitives: {
        String: 'string',
        Int: 'number',
        Float: 'number',
        Boolean: 'boolean',
        ID: 'string'
      },
      templates: {
        'prefix-test.asdasdasd.js.operation.template': `{{ name }}`,
      },
    };

    const schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('../../dev-test/githunt/schema.json').toString()));
    const context = schemaToTemplateContext(schema);


    const documents = gql`
      query myFeed {
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
    const compiled = compileTemplate(config, context, [transformedDocument], { generateSchema: false });

    expect(compiled[0].filename).toBe('prefix-test.asdasdasd.myfeed.query.js');
    expect(compiled[0].content).toBe('myFeed');
  });
});
