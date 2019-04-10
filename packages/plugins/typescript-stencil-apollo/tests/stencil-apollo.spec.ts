import '@graphql-codegen/testing';
import { plugin, StencilComponentType } from '../src/index';
import { buildClientSchema } from 'graphql';
import gql from 'graphql-tag';
import { readFileSync } from 'fs';

describe('Components', () => {
  const schema = buildClientSchema(JSON.parse(readFileSync('../../../dev-test/githunt/schema.json').toString()));
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

    const content = await plugin(schema, [{ filePath: '', content: documents }], { componentType: StencilComponentType.class }, { outputFile: '' });

    expect(content).toBeSimilarStringTo(`
        import { QueryRenderer } from 'stencil-apollo';
        import { Component, Prop } from '@stencil/core';
      `);
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

    const content = await plugin(schema, [{ filePath: '', content: documents }], { componentType: StencilComponentType.functional }, { outputFile: '' });

    expect(content).toBeSimilarStringTo(`
        export type FeedProps = {
            variables ?: FeedQueryVariables;
            children ?: QueryRenderer<FeedQuery, FeedQueryVariables>;
        };
    `);

    expect(content).toBeSimilarStringTo(`
        export const FeedComponent = (props: FeedProps, children: [QueryRenderer<FeedQuery, FeedQueryVariables>]) => (
          <ApolloQuery<FeedQuery, FeedQueryVariables> query={ FeedDocument } { ...props }>
            {children[0]}
          </ApolloQuery>
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

    const content = await plugin(schema, [{ filePath: '', content: documents }], { componentType: StencilComponentType.class }, { outputFile: '' });

    expect(content).toBeSimilarStringTo(`
            @Component({
                tag: 'apollo-feed'
            })
            export class FeedComponent {
                @Prop() renderer: QueryRenderer<FeedQuery, FeedQueryVariables>;
                @Prop() variables: FeedQueryVariables;
                render() {
                    return <apollo-query query={ FeedDocument } renderer={ this.renderer } variables={ FeedQueryVariables } />;
                }
            }
      `);
  });
});
