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
          import * as ReactApollo from 'react-apollo';
        `);

    expect(content).toBeSimilarStringTo(`
          import * as React from 'react';
        `);

    expect(content).toBeSimilarStringTo(`
      import gql from 'graphql-tag';
    `);

    expect(content).toBeSimilarStringTo(`
      export interface ComponentProps {
          query?: any;
          variables?: Variables;
          children: (result: ReactApollo.QueryResult<Query, Variables>) => React.ReactNode;
      };
    `);

    expect(content).toBeSimilarStringTo(`
    export const Document = gql\`{
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
    }\`;
    `);

    expect(content).toBeSimilarStringTo(`
        export class Component extends React.Component<ComponentProps> {
            render(){
                return (
                    <ReactApollo.Query<Query, Variables>
                    query={ DocumentWithFragments }
                          {...this.props}
                          />
                );
              }
          }
        `);
  });
});
