import { validateTs } from '@graphql-codegen/testing';
import { parse, buildClientSchema, GraphQLSchema } from 'graphql';
import { plugin } from '../src';
import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { plugin as tsPlugin } from '../../typescript/src/index';
import { plugin as tsDocumentsPlugin } from '../../operations/src/index';

const validateTypeScript = async (
  output: Types.PluginOutput,
  testSchema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: any,
  playground = false
) => {
  const tsOutput = await tsPlugin(testSchema, documents, config, { outputFile: '' });
  const tsDocumentsOutput = await tsDocumentsPlugin(testSchema, documents, config, { outputFile: '' });
  const merged = mergeOutputs([tsOutput, tsDocumentsOutput, output]);
  validateTs(merged, undefined, true, false, playground);

  return merged;
};

describe('React-Query', () => {
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
  const basicMutation = parse(/* GraphQL */ `
    mutation test($name: String) {
      submitRepository(repoFullName: $name) {
        id
      }
    }
  `);
  const basicFragment = parse(/* GraphQL */ `
    fragment EntryData on Entry {
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
  const docs = [
    {
      document: basicDoc,
    },
    {
      document: basicMutation,
    },
  ];
  const notOperationDocs = [
    {
      document: basicFragment,
    },
  ];

  it('should allow to override TError type', async () => {
    const config = {
      errorType: 'any',
    };

    const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;
    expect(out.content).not.toContain(`TError = unknown`);
    expect(out.content).toContain(`TError = any`);
  });

  describe('fetcher: custom-mapper', () => {
    it('Should generate query correctly with external mapper', async () => {
      const config = {
        fetcher: './my-file#myCustomFetcher',
        typesPrefix: 'T',
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

      expect(out.prepend).toContain(
        `import { useQuery, UseQueryOptions, useMutation, UseMutationOptions } from 'react-query';`
      );
      expect(out.prepend).toContain(`import { myCustomFetcher } from './my-file';`);
      expect(out.content).toBeSimilarStringTo(`export const useTestQuery = <
          TData = TTestQuery,
          TError = unknown
        >(
          variables?: TTestQueryVariables, 
          options?: UseQueryOptions<TTestQuery, TError, TData>
        ) => 
        useQuery<TTestQuery, TError, TData>(
          variables === undefined ? ['test', variables] : ['test'],
          myCustomFetcher<TTestQuery, TTestQueryVariables>(TestDocument, variables),
          options
        );`);
      expect(out.content).toBeSimilarStringTo(`export const useTestMutation = <
        TError = unknown,
        TContext = unknown
      >(options?: UseMutationOptions<TTestMutation, TError, TTestMutationVariables, TContext>) => 
      useMutation<TTestMutation, TError, TTestMutationVariables, TContext>(
        (variables?: TTestMutationVariables) => myCustomFetcher<TTestMutation, TTestMutationVariables>(TestDocument, variables)(),
        options
      );`);

      expect(out.content).toMatchSnapshot();
      await validateTypeScript(mergeOutputs(out), schema, docs, config, false);
    });

    it('Should generate query correctly with internal mapper', async () => {
      const config = {
        fetcher: 'myCustomFetcher',
        typesPrefix: 'T',
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

      expect(out.prepend).toContain(
        `import { useQuery, UseQueryOptions, useMutation, UseMutationOptions } from 'react-query';`
      );
      expect(out.content).toBeSimilarStringTo(`export const useTestQuery = <
        TData = TTestQuery,
        TError = unknown
      >(
        variables?: TTestQueryVariables, 
        options?: UseQueryOptions<TTestQuery, TError, TData>
      ) => 
      useQuery<TTestQuery, TError, TData>(
        variables === undefined ? ['test', variables] : ['test'],
        myCustomFetcher<TTestQuery, TTestQueryVariables>(TestDocument, variables),
        options
      );`);

      expect(out.content).toBeSimilarStringTo(`export const useTestMutation = <
        TError = unknown,
        TContext = unknown
      >(options?: UseMutationOptions<TTestMutation, TError, TTestMutationVariables, TContext>) => 
      useMutation<TTestMutation, TError, TTestMutationVariables, TContext>(
        (variables?: TTestMutationVariables) => myCustomFetcher<TTestMutation, TTestMutationVariables>(TestDocument, variables)(),
        options
      );`);

      expect(out.content).toMatchSnapshot();
      await validateTypeScript(mergeOutputs(out), schema, docs, config, false);
    });

    it('Should generate mutation correctly with lazy variables', async () => {
      const config = {
        fetcher: {
          func: './my-file#useCustomFetcher',
          isReactHook: true,
        },
        typesPrefix: 'T',
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

      expect(out.prepend).toContain(
        `import { useQuery, UseQueryOptions, useMutation, UseMutationOptions } from 'react-query';`
      );
      expect(out.prepend).toContain(`import { useCustomFetcher } from './my-file';`);
      expect(out.content).toBeSimilarStringTo(`export const useTestQuery = <
          TData = TTestQuery,
          TError = unknown
        >(
          variables?: TTestQueryVariables, 
          options?: UseQueryOptions<TTestQuery, TError, TData>
        ) => 
        useQuery<TTestQuery, TError, TData>(
          variables === undefined ? ['test', variables] : ['test'],
          useCustomFetcher<TTestQuery, TTestQueryVariables>(TestDocument).bind(null, variables),
          options
        );`);
      expect(out.content).toBeSimilarStringTo(`export const useTestMutation = <
        TError = unknown,
        TContext = unknown
      >(options?: UseMutationOptions<TTestMutation, TError, TTestMutationVariables, TContext>) => 
      useMutation<TTestMutation, TError, TTestMutationVariables, TContext>(
        useCustomFetcher<TTestMutation, TTestMutationVariables>(TestDocument),
        options
      );`);

      expect(out.content).toMatchSnapshot();
      await validateTypeScript(mergeOutputs(out), schema, docs, config, false);
    });
  });

  describe('fetcher: graphql-request', () => {
    it('Should generate query correctly with client', async () => {
      const config = {
        fetcher: 'graphql-request',
        typesPrefix: 'T',
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

      expect(out.prepend).toContain(
        `import { useQuery, UseQueryOptions, useMutation, UseMutationOptions } from 'react-query';`
      );
      expect(out.prepend).toContain(`import { GraphQLClient } from 'graphql-request';`);
      expect(out.prepend[2])
        .toBeSimilarStringTo(`    function fetcher<TData, TVariables>(client: GraphQLClient, query: string, variables?: TVariables) {
          return async (): Promise<TData> => client.request<TData, TVariables>(query, variables);
        }`);
      expect(out.content).toBeSimilarStringTo(`export const useTestQuery = <
          TData = TTestQuery,
          TError = unknown
        >(
          client: GraphQLClient, 
          variables?: TTestQueryVariables, 
          options?: UseQueryOptions<TTestQuery, TError, TData>
        ) => 
        useQuery<TTestQuery, TError, TData>(
          variables === undefined ? ['test', variables] : ['test'],
          fetcher<TTestQuery, TTestQueryVariables>(client, TestDocument, variables),
          options
        );`);
      expect(out.content).toBeSimilarStringTo(`export const useTestMutation = <
        TError = unknown,
        TContext = unknown
      >(
        client: GraphQLClient, 
        options?: UseMutationOptions<TTestMutation, TError, TTestMutationVariables, TContext>
      ) => 
      useMutation<TTestMutation, TError, TTestMutationVariables, TContext>(
        (variables?: TTestMutationVariables) => fetcher<TTestMutation, TTestMutationVariables>(client, TestDocument, variables)(),
        options
      );`);

      expect(out.content).toMatchSnapshot();
      await validateTypeScript(mergeOutputs(out), schema, docs, config, false);
    });
    it('Should support useTypeImports', async () => {
      const config = {
        fetcher: 'graphql-request',
        useTypeImports: true,
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

      expect(out.prepend).toContain(`import type { GraphQLClient } from 'graphql-request';`);
    });
  });

  describe('fetcher: hardcoded-fetch', () => {
    it('Should generate query correctly with hardcoded endpoint', async () => {
      const config = {
        fetcher: {
          endpoint: 'http://localhost:3000/graphql',
        },
        typesPrefix: 'T',
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

      expect(out.prepend).toContain(
        `import { useQuery, UseQueryOptions, useMutation, UseMutationOptions } from 'react-query';`
      );
      expect(out.prepend[1])
        .toBeSimilarStringTo(`    function fetcher<TData, TVariables>(query: string, variables?: TVariables) {
        return async (): Promise<TData> => {
          const res = await fetch("http://localhost:3000/graphql", {
            method: "POST",
            body: JSON.stringify({ query, variables }),
          });
      
          const json = await res.json();
      
          if (json.errors) {
            const { message } = json.errors[0];
      
            throw new Error(message);
          }
      
          return json.data;
        }
      }`);
      expect(out.content).toBeSimilarStringTo(`export const useTestQuery = <
        TData = TTestQuery,
        TError = unknown
      >(
        variables?: TTestQueryVariables, 
        options?: UseQueryOptions<TTestQuery, TError, TData>
      ) => 
      useQuery<TTestQuery, TError, TData>(
        variables === undefined ? ['test', variables] : ['test'],
        fetcher<TTestQuery, TTestQueryVariables>(TestDocument, variables),
        options
      );`);

      expect(out.content).toBeSimilarStringTo(`export const useTestMutation = <
        TError = unknown,
        TContext = unknown
      >(options?: UseMutationOptions<TTestMutation, TError, TTestMutationVariables, TContext>) => 
      useMutation<TTestMutation, TError, TTestMutationVariables, TContext>(
        (variables?: TTestMutationVariables) => fetcher<TTestMutation, TTestMutationVariables>(TestDocument, variables)(),
        options
      );`);

      expect(out.content).toMatchSnapshot();
      await validateTypeScript(mergeOutputs(out), schema, docs, config, false);
    });

    it('Should generate query correctly with fetch config', async () => {
      const config = {
        fetcher: {
          endpoint: 'http://localhost:3000/graphql',
          fetchParams: {
            headers: {
              Authorization: 'Bearer XYZ',
            },
          },
        },
        typesPrefix: 'T',
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

      expect(out.prepend[1])
        .toBeSimilarStringTo(`function fetcher<TData, TVariables>(query: string, variables?: TVariables) {
        return async (): Promise<TData> => {
          const res = await fetch("http://localhost:3000/graphql", {
            method: "POST",
            headers: {"Authorization":"Bearer XYZ"},
            body: JSON.stringify({ query, variables }),
          });
      
          const json = await res.json();
      
          if (json.errors) {
            const { message } = json.errors[0];
      
            throw new Error(message);
          }
      
          return json.data;
        }
      }`);

      expect(out.content).toMatchSnapshot();
      await validateTypeScript(mergeOutputs(out), schema, docs, config, false);
    });

    it('Should generate query correctly with hardcoded endpoint from env var', async () => {
      const config = {
        fetcher: {
          endpoint: 'process.env.ENDPOINT_URL',
        },
        typesPrefix: 'T',
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

      expect(out.prepend[1])
        .toBeSimilarStringTo(`function fetcher<TData, TVariables>(query: string, variables?: TVariables) {
        return async (): Promise<TData> => {
          const res = await fetch(process.env.ENDPOINT_URL as string, {
            method: "POST",
            body: JSON.stringify({ query, variables }),
          });
      
          const json = await res.json();
      
          if (json.errors) {
            const { message } = json.errors[0];
      
            throw new Error(message);
          }
      
          return json.data;
        }
      }`);

      expect(out.content).toMatchSnapshot();
      await validateTypeScript(mergeOutputs(out), schema, docs, config, false);
    });

    it('Should generate query correctly with hardcoded endpoint from just identifier', async () => {
      const config = {
        fetcher: {
          endpoint: 'myEndpoint',
        },
        typesPrefix: 'T',
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

      expect(out.prepend[1])
        .toBeSimilarStringTo(`    function fetcher<TData, TVariables>(query: string, variables?: TVariables) {
        return async (): Promise<TData> => {
          const res = await fetch(myEndpoint as string, {
            method: "POST",
            body: JSON.stringify({ query, variables }),
          });
      
          const json = await res.json();
      
          if (json.errors) {
            const { message } = json.errors[0];
      
            throw new Error(message);
          }
      
          return json.data;
        }
      }`);

      expect(out.content).toMatchSnapshot();
      await validateTypeScript(mergeOutputs(out), schema, docs, config, false);
    });
  });

  describe('fetcher: fetch', () => {
    it('Should generate query and mutation correctly', async () => {
      const config = {
        fetcher: 'fetch',
        typesPrefix: 'T',
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

      expect(out.prepend).toContain(
        `import { useQuery, UseQueryOptions, useMutation, UseMutationOptions } from 'react-query';`
      );

      expect(out.content).toBeSimilarStringTo(`export const useTestQuery = <
        TData = TTestQuery,
        TError = unknown
      >(
        dataSource: { endpoint: string, fetchParams?: RequestInit }, 
        variables?: TTestQueryVariables, 
        options?: UseQueryOptions<TTestQuery, TError, TData>
      ) => 
      useQuery<TTestQuery, TError, TData>(
        variables === undefined ? ['test', variables] : ['test'],
        fetcher<TTestQuery, TTestQueryVariables>(dataSource.endpoint, dataSource.fetchParams || {}, TestDocument, variables),
        options
      );`);

      expect(out.content).toBeSimilarStringTo(`export const useTestMutation = <
          TError = unknown,
          TContext = unknown
        >(
          dataSource: { endpoint: string, fetchParams?: RequestInit }, 
          options?: UseMutationOptions<TTestMutation, TError, TTestMutationVariables, TContext>
        ) => 
        useMutation<TTestMutation, TError, TTestMutationVariables, TContext>(
          (variables?: TTestMutationVariables) => fetcher<TTestMutation, TTestMutationVariables>(dataSource.endpoint, dataSource.fetchParams || {}, TestDocument, variables)(),
          options
        );`);

      expect(out.content).toMatchSnapshot();
      await validateTypeScript(mergeOutputs(out), schema, docs, config, false);
    });
  });

  describe('exposeQueryKeys: true', () => {
    it('Should generate getKey for each query', async () => {
      const config = {
        fetcher: 'fetch',
        exposeQueryKeys: true,
      };
      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;
      expect(out.content).toBeSimilarStringTo(
        `useTestQuery.getKey = (variables?: TestQueryVariables) => variables === undefined ? ['test', variables] : ['test'];`
      );
    });
  });

  it('Should not generate fetcher if there are no operations', async () => {
    const out = (await plugin(schema, notOperationDocs, {})) as Types.ComplexPluginOutput;
    expect(out.prepend).not.toBeSimilarStringTo(`function fetcher<TData, TVariables>(`);

    const config = {
      fetcher: 'graphql-request',
    };

    const outGraphqlRequest = (await plugin(schema, notOperationDocs, config)) as Types.ComplexPluginOutput;
    expect(outGraphqlRequest.prepend).not.toContain(`import { GraphQLClient } from 'graphql-request';`);
  });
});
