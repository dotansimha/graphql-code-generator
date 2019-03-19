import '@graphql-codegen/testing';
import gql from 'graphql-tag';
import { plugin } from '../src/index';
import { parse, GraphQLSchema, buildClientSchema, buildSchema } from 'graphql';
import { Types } from '@graphql-codegen/plugin-helpers';
import { plugin as tsPlugin } from '../../typescript/src/index';
import { plugin as tsOperationsPlugin } from '../../typescript-operations/src/index';
import { validateTs } from '../../typescript/tests/validate';
import { readFileSync } from 'fs';

describe('AWS Amplify Angular', () => {
  const schema = buildClientSchema(JSON.parse(readFileSync('../../../dev-test/githunt/schema.json').toString()));
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
    output: string,
    testSchema: GraphQLSchema,
    documents: Types.DocumentFile[],
    config: any
  ) => {
    const tsOutput = await tsPlugin(testSchema, documents, config, { outputFile: '' });
    const tsDocumentsOutput = await tsOperationsPlugin(testSchema, documents, config, { outputFile: '' });
    const merged = [tsOutput, tsDocumentsOutput, output].join('\n');
    validateTs(merged, undefined, false);
  };

  it(`should skip if there's no operations`, async () => {
    const content = await plugin(
      schema,
      [],
      {},
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBe('');
    await validateTypeScript(content, schema, [], {});
  });

  describe('Imports', () => {
    it('should import DocumentNode when using noGraphQLTag', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = await plugin(
        schema,
        docs,
        {
          noGraphQLTag: true
        },
        {
          outputFile: 'graphql.ts'
        }
      );

      expect(content).toContain(`import { DocumentNode } from 'graphql';`);
      expect(content).not.toBeSimilarStringTo(`import gql from 'graphql-tag';`);

      await validateTypeScript(content, schema, docs, {});
    });

    it(`should use gql import from gqlImport config option`, async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = await plugin(
        schema,
        docs,
        { gqlImport: 'graphql.macro#gql' },
        {
          outputFile: 'graphql.ts'
        }
      );

      expect(content).toContain(`import { gql } from 'graphql.macro';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it(`should add the correct angular imports`, async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.ts'
        }
      );

      expect(content).toBeSimilarStringTo(`import API, { graphqlOperation } from '@aws-amplify/api';`);
      expect(content).toBeSimilarStringTo(`import { Injectable } from '@angular/core';`);
      expect(content).toBeSimilarStringTo(`import { GraphQLResult } from "@aws-amplify/api/lib/types";`);
      expect(content).toBeSimilarStringTo(`import * as Observable from 'zen-observable';`);

      await validateTypeScript(content, schema, docs, {});
    });
  });

  describe('Component', () => {
    it('Should be able to use root schema object', async () => {
      const rootSchema = buildSchema(`
        type RootQuery { f: String }
        schema { query: RootQuery }
      `);
      const query = gql`
        query test {
          f
        }
      `;
      const docs = [{ filePath: '', content: query }];
      const content = await plugin(
        rootSchema,
        docs,
        {},
        {
          outputFile: 'graphql.ts'
        }
      );

      expect(content).toBeSimilarStringTo(`
        export const TestDocument = gql\`
          query test {
            f
          }
        \`;
      `);

      expect(content).toBeSimilarStringTo(`
        async function TestApi(): Promise<TestQuery> {
          const response = (await API.graphql(graphqlOperation(TestDocument))) as any;
          return <TestQuery>response.data.f;
        }
      `);

      expect(content).toBeSimilarStringTo(`
        @Injectable({
          providedIn: 'root'
        })
        export class APIService {
          Test = TestApi;
        }
      `);

      validateTypeScript(content, rootSchema, docs, {});
    });

    it('Should handle @client', async () => {
      const myFeed = gql`
        query MyFeed {
          feed @client {
            id
          }
        }
      `;

      const docs = [{ filePath: '', content: myFeed }];
      const content = await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.ts'
        }
      );

      expect(content).toBeSimilarStringTo(`
        export const MyFeedDocument = gql\`
          query MyFeed {
            feed @client {
              id
            }
          }
        \`;
      `);

      expect(content).toBeSimilarStringTo(`graphqlOperation(MyFeedDocument)`);

      validateTypeScript(content, schema, docs, {});
    });
  });

  describe('others', () => {
    it('should handle fragments', async () => {
      const myFeed = gql`
        query MyFeed {
          feed {
            ...MyEntry
          }
        }

        fragment MyEntry on Entry {
          id
          commentCount
        }
      `;

      const docs = [{ filePath: '', content: myFeed }];
      const content = await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.ts'
        }
      );

      validateTypeScript(content, schema, docs, {});
    });
  });
});
