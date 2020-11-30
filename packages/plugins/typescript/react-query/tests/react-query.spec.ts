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
  const docs = [
    {
      document: basicDoc,
    },
    {
      document: basicMutation,
    },
  ];

  describe('fetcher: custom-mapper', () => {
    it('Should generate query correctly with external mapper', async () => {
      const config = {
        fetcher: './my-file#myCustomFetcher',
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

      expect(out.prepend).toContain(
        `import { useQuery, QueryConfig, useMutation, MutationConfig } from 'react-query';`
      );
      expect(out.prepend).toContain(`import { myCustomFetcher } from './my-file';`);
      expect(out.content)
        .toBeSimilarStringTo(`export const useTestQuery = (variables?: TestQueryVariables, options?: QueryConfig<TestQuery>) => 
      useQuery<TestQuery>(
        ['test', variables],
        myCustomFetcher<TestQuery, TestQueryVariables>(TestDocument, variables),
        options
      );`);
      expect(out.content)
        .toBeSimilarStringTo(`    export const useTestMutation = (variables?: TestMutationVariables, options?: MutationConfig<TestMutation, unknown, TestMutationVariables>) => 
    useMutation<TestMutation, unknown, TestMutationVariables>(
      myCustomFetcher<TestMutation, TestMutationVariables>(TestDocument, variables),
      options
    );`);

      expect(out.content).toMatchSnapshot();
      await validateTypeScript(mergeOutputs(out), schema, docs, config, false);
    });

    it('Should generate query correctly with internal mapper', async () => {
      const config = {
        fetcher: 'myCustomFetcher',
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

      expect(out.prepend).toContain(
        `import { useQuery, QueryConfig, useMutation, MutationConfig } from 'react-query';`
      );
      expect(out.content)
        .toBeSimilarStringTo(`export const useTestQuery = (variables?: TestQueryVariables, options?: QueryConfig<TestQuery>) => 
      useQuery<TestQuery>(
        ['test', variables],
        myCustomFetcher<TestQuery, TestQueryVariables>(TestDocument, variables),
        options
      );`);

      expect(out.content)
        .toBeSimilarStringTo(`    export const useTestMutation = (variables?: TestMutationVariables, options?: MutationConfig<TestMutation, unknown, TestMutationVariables>) => 
    useMutation<TestMutation, unknown, TestMutationVariables>(
      myCustomFetcher<TestMutation, TestMutationVariables>(TestDocument, variables),
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
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

      expect(out.prepend).toContain(
        `import { useQuery, QueryConfig, useMutation, MutationConfig } from 'react-query';`
      );
      expect(out.prepend).toContain(`import { GraphQLClient } from 'graphql-request';`);
      expect(out.prepend[2])
        .toBeSimilarStringTo(`    function fetcher<TData, TVariables>(client: GraphQLClient, query: string, variables?: TVariables) {
          return async (): Promise<TData> => client.request<TData, TVariables>(query, variables);
        }`);
      expect(out.content)
        .toBeSimilarStringTo(`export const useTestQuery = (client: GraphQLClient, variables?: TestQueryVariables, options?: QueryConfig<TestQuery>) => 
      useQuery<TestQuery>(
        ['test', variables],
        fetcher<TestQuery, TestQueryVariables>(client, TestDocument, variables),
        options
      );`);
      expect(out.content)
        .toBeSimilarStringTo(`    export const useTestMutation = (client: GraphQLClient, variables?: TestMutationVariables, options?: MutationConfig<TestMutation, unknown, TestMutationVariables>) => 
    useMutation<TestMutation, unknown, TestMutationVariables>(
      fetcher<TestMutation, TestMutationVariables>(client, TestDocument, variables),
      options
    );`);

      expect(out.content).toMatchSnapshot();
      await validateTypeScript(mergeOutputs(out), schema, docs, config, false);
    });
  });

  describe('fetcher: hardcoded-fetch', () => {
    it('Should generate query correctly with hardcoded endpoint', async () => {
      const config = {
        fetcher: {
          endpoint: 'http://localhost:3000/graphql',
        },
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

      expect(out.prepend).toContain(
        `import { useQuery, QueryConfig, useMutation, MutationConfig } from 'react-query';`
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
      expect(out.content)
        .toBeSimilarStringTo(`export const useTestQuery = (variables?: TestQueryVariables, options?: QueryConfig<TestQuery>) => 
      useQuery<TestQuery>(
        ['test', variables],
        fetcher<TestQuery, TestQueryVariables>(TestDocument, variables),
        options
      );`);

      expect(out.content)
        .toBeSimilarStringTo(`    export const useTestMutation = (variables?: TestMutationVariables, options?: MutationConfig<TestMutation, unknown, TestMutationVariables>) => 
    useMutation<TestMutation, unknown, TestMutationVariables>(
      fetcher<TestMutation, TestMutationVariables>(TestDocument, variables),
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
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

      expect(out.prepend[1])
        .toBeSimilarStringTo(`    function fetcher<TData, TVariables>(query: string, variables?: TVariables) {
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
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

      expect(out.prepend[1])
        .toBeSimilarStringTo(`    function fetcher<TData, TVariables>(query: string, variables?: TVariables) {
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
      };

      const out = (await plugin(schema, docs, config)) as Types.ComplexPluginOutput;

      expect(out.prepend).toContain(
        `import { useQuery, QueryConfig, useMutation, MutationConfig } from 'react-query';`
      );

      expect(out.content)
        .toBeSimilarStringTo(`export const useTestQuery = (dataSource: { endpoint: string, fetchParams?: RequestInit }, variables?: TestQueryVariables, options?: QueryConfig<TestQuery>) => 
      useQuery<TestQuery>(
        ['test', variables],
        fetcher<TestQuery, TestQueryVariables>(dataSource.endpoint, dataSource.fetchParams || {}, TestDocument, variables),
        options
      );`);

      expect(out.content)
        .toBeSimilarStringTo(`    export const useTestMutation = (dataSource: { endpoint: string, fetchParams?: RequestInit }, variables?: TestMutationVariables, options?: MutationConfig<TestMutation, unknown, TestMutationVariables>) => 
      useMutation<TestMutation, unknown, TestMutationVariables>(
        fetcher<TestMutation, TestMutationVariables>(dataSource.endpoint, dataSource.fetchParams || {}, TestDocument, variables),
        options
      );`);

      expect(out.content).toMatchSnapshot();
      await validateTypeScript(mergeOutputs(out), schema, docs, config, false);
    });
  });
});
