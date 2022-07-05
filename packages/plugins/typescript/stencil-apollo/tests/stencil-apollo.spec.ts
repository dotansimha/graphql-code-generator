import '@graphql-codegen/testing';
import { StencilComponentType } from '../src/config.js';
import { plugin } from '../src/index.js';
import { buildClientSchema } from 'graphql';
import gql from 'graphql-tag';
import { Types } from '@graphql-codegen/plugin-helpers';

describe('Components', () => {
  const schema = buildClientSchema(require('../../../../../dev-test/githunt/schema.json'));
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

    const content = (await plugin(
      schema,
      [{ location: '', document: documents }],
      { componentType: StencilComponentType.class },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

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

    const { content } = (await plugin(
      schema,
      [{ location: '', document: documents }],
      { componentType: StencilComponentType.functional },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

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

    const { content } = (await plugin(
      schema,
      [{ location: '', document: documents }],
      { componentType: StencilComponentType.class },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(content).toBeSimilarStringTo(`
            @Component({
                tag: 'apollo-feed'
            })
            export class FeedComponent {
                @Prop() renderer: import('stencil-apollo').QueryRenderer<FeedQuery, FeedQueryVariables>;
                @Prop() variables: FeedQueryVariables;
                render() {
                    return <apollo-query query={ FeedDocument } variables={ this.variables } renderer={ this.renderer } />;
                }
            }
      `);
  });

  it('should generate Class Component with variables', async () => {
    const documents = gql`
      query Feed($limit: Int) {
        feed(limit: $limit) {
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

    const { content } = (await plugin(
      schema,
      [{ location: '', document: documents }],
      { componentType: StencilComponentType.class },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(content).toBeSimilarStringTo(`
            @Component({
                tag: 'apollo-feed'
            })
            export class FeedComponent {
                @Prop() renderer: import('stencil-apollo').QueryRenderer<FeedQuery, FeedQueryVariables>;
                @Prop() variables: FeedQueryVariables;
                render() {
                    return <apollo-query query={ FeedDocument } variables={ this.variables } renderer={ this.renderer } />;
                }
            }
      `);
  });
});
