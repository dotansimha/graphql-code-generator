import '@graphql-codegen/testing';
import { plugin, StencilComponentType } from '../src/index';
import { buildClientSchema } from 'graphql';
import gql from 'graphql-tag';
import { readFileSync } from 'fs';
import { Types } from '@graphql-codegen/plugin-helpers';

describe('Components', () => {
  const schema = buildClientSchema(JSON.parse(readFileSync('../../../../dev-test/githunt/schema.json').toString()));
  it('should import dependencies if class components are generated', async () => {
    const documents = gql`
      query Feed {
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

    const content = (await plugin(schema, [{ filePath: '', content: documents }], { componentType: StencilComponentType.class }, { outputFile: '' })) as Types.ComplexPluginOutput;

    expect(content.prepend).toContain(`import 'stencil-apollo';`);
    expect(content.prepend).toContain(`import { Component, Prop, h } from '@stencil/core';`);
  });

  it('should generate Functional Component', async () => {
    const documents = gql`
      query Feed {
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

    const { content } = (await plugin(schema, [{ filePath: '', content: documents }], { componentType: StencilComponentType.functional }, { outputFile: '' })) as Types.ComplexPluginOutput;

    expect(content).toBeSimilarStringTo(`
        export type FeedProps = {
            variables ?: FeedQueryVariables;
            inlist ?: StencilApollo.QueryRenderer<FeedQuery, FeedQueryVariables>;
        };
    `);

    expect(content).toBeSimilarStringTo(`
        export const FeedComponent = (props: FeedProps, children: [StencilApollo.QueryRenderer<FeedQuery, FeedQueryVariables>]) => (
          <apollo-query query={ FeedDocument } { ...props } renderer={ children[0] } />
        );
    `);
  });

  it('should generate Class Component', async () => {
    const documents = gql`
      query Feed {
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

    const { content } = (await plugin(schema, [{ filePath: '', content: documents }], { componentType: StencilComponentType.class }, { outputFile: '' })) as Types.ComplexPluginOutput;

    expect(content).toBeSimilarStringTo(`
            @Component({
                tag: 'apollo-feed'
            })
            export class FeedComponent {
                @Prop() renderer: import('stencil-apollo').QueryRenderer<FeedQuery, FeedQueryVariables>;
                render() {
                    return <apollo-query query={ FeedDocument } renderer={ this.renderer } />;
                }
            }
      `);
  });
});
