import { validateTs } from '@graphql-codegen/testing';
import { plugin } from '../src/index.js';
import { parse, GraphQLSchema, buildClientSchema } from 'graphql';
import gql from 'graphql-tag';
import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { plugin as tsPlugin } from '@graphql-codegen/typescript';
import { plugin as tsDocumentsPlugin } from '@graphql-codegen/typescript-operations';
import { DocumentMode } from '@graphql-codegen/visitor-plugin-common';

describe('urql', () => {
  let spyConsoleError: jest.SpyInstance;
  beforeEach(() => {
    spyConsoleError = jest.spyOn(console, 'warn');
    spyConsoleError.mockImplementation();
  });

  afterEach(() => {
    spyConsoleError.mockRestore();
  });

  const schema = buildClientSchema(require('../../../../../dev-test/githunt/schema.json'));
  const basicDoc = parse(/* GraphQL */ `
    query test {
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
  `);

  const validateTypeScript = async (
    output: Types.PluginOutput,
    testSchema: GraphQLSchema,
    documents: Types.DocumentFile[],
    config: any
  ) => {
    const tsOutput = await tsPlugin(testSchema, documents, config, { outputFile: '' });
    const tsDocumentsOutput = await tsDocumentsPlugin(testSchema, documents, config, { outputFile: '' });
    const merged = mergeOutputs([tsOutput, tsDocumentsOutput, output]);
    await validateTs(merged, undefined, true);
  };

  describe('Config', () => {
    it('should output warning if documentMode = external and importDocumentNodeExternallyFrom is not set', async () => {
      jest.spyOn(console, 'warn');
      const docs = [{ location: '', document: basicDoc }];
      await plugin(
        schema,
        docs,
        {
          documentMode: DocumentMode.external,
        },
        {
          outputFile: 'graphql.ts',
        }
      );

      // eslint-disable-next-line no-console
      expect(console.warn).toHaveBeenCalledWith(
        'importDocumentNodeExternallyFrom must be provided if documentMode=external'
      );
    });

    it('output warning if importOperationTypesFrom is set to something other than "Operations"', async () => {
      jest.spyOn(console, 'warn');
      const docs = [{ location: '', document: basicDoc }];
      await plugin(
        schema,
        docs,
        {
          documentMode: DocumentMode.external,
          importOperationTypesFrom: 'Whatever',
        },
        {
          outputFile: 'graphql.ts',
        }
      );

      // eslint-disable-next-line no-console
      expect(console.warn).toHaveBeenCalledWith(
        'importOperationTypesFrom only works correctly when left empty or set to "Operations"'
      );
    });

    it('output warning if importOperationTypesFrom is set and documentMode is not "external"', async () => {
      jest.spyOn(console, 'warn');
      const docs = [{ location: '', document: basicDoc }];
      await plugin(
        schema,
        docs,
        {
          importOperationTypesFrom: 'Operations',
        },
        {
          outputFile: 'graphql.ts',
        }
      );

      // eslint-disable-next-line no-console
      expect(console.warn).toHaveBeenCalledWith(
        '"importOperationTypesFrom" should be used with "documentMode=external" and "importDocumentNodeExternallyFrom"'
      );
    });

    it('output warning if importOperationTypesFrom is set and importDocumentNodeExternallyFrom is not', async () => {
      jest.spyOn(console, 'warn');
      const docs = [{ location: '', document: basicDoc }];
      await plugin(
        schema,
        docs,
        {
          documentMode: DocumentMode.external,
          importOperationTypesFrom: 'Operations',
        },
        {
          outputFile: 'graphql.ts',
        }
      );

      // eslint-disable-next-line no-console
      expect(console.warn).toHaveBeenCalledWith(
        '"importOperationTypesFrom" should be used with "documentMode=external" and "importDocumentNodeExternallyFrom"'
      );
    });
  });

  describe('Imports', () => {
    it('should import Vue Urql when composition is used', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {
          withComposition: true,
        },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as Urql from '@urql/vue';`);
      expect(content.prepend).toContain(`import gql from 'graphql-tag';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should import DocumentNode when using noGraphQLTag', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {
          noGraphQLTag: true,
        },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import { DocumentNode } from 'graphql';`);
      expect(content.prepend).not.toContain(`import gql from 'graphql-tag';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it(`should use gql import from gqlImport config option`, async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { gqlImport: 'graphql.macro#gql' },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import { gql } from 'graphql.macro';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should import Urql from urqlImportFrom config option', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { urqlImportFrom: 'custom-urql' },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as Urql from 'custom-urql';`);
      await validateTypeScript(content, schema, docs, {});
    });
  });

  describe('Fragments', () => {
    it('Should generate basic fragments documents correctly', async () => {
      const docs = [
        {
          location: 'a.graphql',
          document: parse(/* GraphQL */ `
            fragment MyFragment on Repository {
              full_name
            }

            query test {
              feed {
                id
              }
            }
          `),
        },
      ];
      const result = await plugin(schema, docs, {}, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
      export const MyFragmentFragmentDoc = gql\`
      fragment MyFragment on Repository {
        full_name
      }
      \`;`);
      await validateTypeScript(result, schema, docs, {});
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
        fragment FeedWithRepository on Entry {
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

      const docs = [{ location: '', document: myFeed }];

      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`export const FeedWithRepositoryFragmentDoc = gql\`
fragment FeedWithRepository on Entry {
  id
  commentCount
  repository(search: "phrase") {
    ...RepositoryWithOwner
  }
}
\${RepositoryWithOwnerFragmentDoc}\`;`);
      expect(content.content).toBeSimilarStringTo(`export const RepositoryWithOwnerFragmentDoc = gql\`
fragment RepositoryWithOwner on Repository {
  full_name
  html_url
  owner {
    avatar_url
  }
}
\`;`);

      expect(content.content).toBeSimilarStringTo(`export const MyFeedDocument = gql\`
query MyFeed {
  feed {
    ...FeedWithRepository
  }
}
\${FeedWithRepositoryFragmentDoc}\`;`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('should avoid generating duplicate fragments', async () => {
      const simpleFeed = gql`
        fragment Item on Entry {
          id
        }
      `;
      const myFeed = gql`
        query MyFeed {
          feed {
            ...Item
          }
          allFeeds: feed {
            ...Item
          }
        }
      `;
      const documents = [simpleFeed, myFeed];
      const docs = documents.map(document => ({ document, location: '' }));
      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`
        export const MyFeedDocument = gql\`
        query MyFeed {
            feed {
              ...Item
            }
            allFeeds: feed {
              ...Item
            }
          }
          \${ItemFragmentDoc}\``);
      expect(content.content).toBeSimilarStringTo(`
        export const ItemFragmentDoc = gql\`
        fragment Item on Entry {
          id
        }
\`;`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('Should generate fragments in proper order (when one depends on other)', async () => {
      const myFeed = gql`
        fragment FeedWithRepository on Entry {
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
      const docs = documents.map(document => ({ document, location: '' }));
      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      const feedWithRepositoryPos = content.content.indexOf('fragment FeedWithRepository');
      const repositoryWithOwnerPos = content.content.indexOf('fragment RepositoryWithOwner');
      expect(repositoryWithOwnerPos).toBeLessThan(feedWithRepositoryPos);
      await validateTypeScript(content, schema, docs, {});
    });
  });

  describe('Composition', () => {
    it('should generate Document variable', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`
          export const TestDocument =  gql\`
          query test {
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
      await validateTypeScript(content, schema, docs, {});
    });

    it('should generate Document variable with noGraphQlTag', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {
          noGraphQLTag: true,
        },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(
        `[{"kind":"Field","name":{"kind":"Name","value":"avatar_url"}}]}}]}}]}}]}}]} as unknown as DocumentNode;`
      );

      // For issue #1599 - make sure there are not `loc` properties
      expect(content.content).not.toContain(`loc":`);
      expect(content.content).not.toContain(`loc':`);

      await validateTypeScript(content, schema, docs, {});
    });

    it('Should generate composition functions for query and mutation', async () => {
      const documents = parse(/* GraphQL */ `
        query feed {
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

        mutation submitRepository($name: String) {
          submitRepository(repoFullName: $name) {
            id
          }
        }
      `);
      const docs = [{ location: '', document: documents }];

      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`
export function useFeedQuery(options: Omit<Urql.UseQueryArgs<never, FeedQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<FeedQuery>({ query: FeedDocument, ...options });
};`);

      expect(content.content).toBeSimilarStringTo(`
export function useSubmitRepositoryMutation() {
  return Urql.useMutation<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>(SubmitRepositoryDocument);
};`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('Should not generate composition functions for query and mutation', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { withComposition: false },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).not.toContain(`export function useTestQuery`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('Should generate subscription hooks', async () => {
      const documents = parse(/* GraphQL */ `
        subscription ListenToComments($name: String) {
          commentAdded(repoFullName: $name) {
            id
          }
        }
      `);

      const docs = [{ location: '', document: documents }];

      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`
      export function useListenToCommentsSubscription<R = ListenToCommentsSubscription>(options: Omit<Urql.UseSubscriptionArgs<never, ListenToCommentsSubscriptionVariables>, 'query'> = {}, handler?: Urql.SubscriptionHandlerArg<ListenToCommentsSubscription, R>) {
        return Urql.useSubscription<ListenToCommentsSubscription, R, ListenToCommentsSubscriptionVariables>({ query: ListenToCommentsDocument, ...options }, handler);
      };`);
      await validateTypeScript(content, schema, docs, {});
      expect(mergeOutputs([content])).toMatchSnapshot();
    });

    it('Should not add typesPrefix to hooks', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { typesPrefix: 'I' },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toContain(`export function useTestQuery`);
    });

    it('Should respect omitOperationSuffix for hooks', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { omitOperationSuffix: true },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toContain(`export function useTest(`);
    });

    it('should allow importing operations and documents from another file', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {
          documentMode: DocumentMode.external,
          importOperationTypesFrom: 'Operations',
          importDocumentNodeExternallyFrom: '@myproject/generated',
        },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as Operations from '@myproject/generated';`);

      expect(content.content).toContain('Operations.TestDocument');
      expect(content.content).toContain('Operations.TestQuery');
      expect(content.content).toContain('Operations.TestQueryVariables');

      expect(content.content).not.toContain('Urql.UseOperations');
      expect(content.content).toContain('Urql.UseQueryArgs');
      expect(content.content).toContain('Urql.useQuery');

      await validateTypeScript(content, schema, docs, {});

      expect(mergeOutputs([content])).toMatchSnapshot();
    });
  });
});
