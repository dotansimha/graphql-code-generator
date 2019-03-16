import 'graphql-codegen-testing';
import gql from 'graphql-tag';
import { plugin, addToSchema } from '../src/index';
import { parse, GraphQLSchema, buildClientSchema, buildSchema, extendSchema } from 'graphql';
import { DocumentFile } from 'graphql-codegen-plugin-helpers';
import { plugin as tsPlugin } from '../../typescript/src/index';
import { plugin as tsDocumentsPlugin } from '../../typescript-operations/src/index';
import { validateTs } from '../../typescript/tests/validate';
import { readFileSync } from 'fs';

describe('Apollo Angular', () => {
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
    documents: DocumentFile[],
    config: any
  ) => {
    const tsOutput = await tsPlugin(testSchema, documents, config, { outputFile: '' });
    const tsDocumentsOutput = await tsDocumentsPlugin(testSchema, documents, config, { outputFile: '' });
    const merged = [tsOutput, tsDocumentsOutput, output].join('\n');
    validateTs(merged, undefined, true);
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
          outputFile: 'graphql.tsx'
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
          outputFile: 'graphql.tsx'
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
          outputFile: 'graphql.tsx'
        }
      );

      expect(content).toBeSimilarStringTo(`import Apollo from 'apollo-angular';`);
      expect(content).toBeSimilarStringTo(`import { Injectable } from '@angular/core';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it('Should import NgModules and remove NgModule directive', async () => {
      const modifiedSchema = extendSchema(schema, addToSchema);
      expect(modifiedSchema.getDirective('NgModule').name).toBe('NgModule');
      const modulePath = '../my/lazy-module';
      const moduleName = 'LazyModule';

      const myFeed = gql(`
        query MyFeed {
          feed @client @NgModule(module: "${modulePath}#${moduleName}") {
            id
          }
        }
      `);
      const docs = [{ filePath: '', content: myFeed }];
      const content = await plugin(
        modifiedSchema,
        docs,
        {},
        {
          outputFile: 'graphql.ts'
        }
      );

      expect(content).toMatch(`import { ${moduleName} } from '${modulePath}'`);
      expect(content).toBeSimilarStringTo(`
        @Injectable({
          providedIn: ${moduleName}
        })
        export class MyFeedGQL
      `);
      expect(content).toBeSimilarStringTo(`document = MyFeedDocument;`);
      expect(content).not.toContain('@NgModule');
      expect(content).toContain('@client');
      validateTypeScript(content, modifiedSchema, docs, {});
    });

    it('Should import namedClient and remove namedClient directive', async () => {
      const modifiedSchema = extendSchema(schema, addToSchema);
      expect(modifiedSchema.getDirective('namedClient').name).toBe('namedClient');

      const myFeed = gql(`
        query MyFeed {
          feed @namedClient(name: "custom") {
            id
          }
        }
      `);

      const docs = [{ filePath: '', content: myFeed }];
      const content = await plugin(
        modifiedSchema,
        docs,
        {},
        {
          outputFile: 'graphql.ts'
        }
      );

      expect(content).toBeSimilarStringTo(`document = MyFeedDocument;`);

      expect(content).toBeSimilarStringTo(`
        client = 'custom';
      `);
      expect(content).not.toContain('@namedClient');
      validateTypeScript(content, modifiedSchema, docs, {});
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
        @Injectable({
          providedIn: 'root'
        })
        export class TestGQL extends Apollo.Query
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

      expect(content).toBeSimilarStringTo(`document = MyFeedDocument;`);

      validateTypeScript(content, schema, docs, {});
    });
  });

  describe('configuration', () => {
    it('should be allow to define namedClient and NgModule in config', async () => {
      const modifiedSchema = extendSchema(schema, addToSchema);
      const myFeed = gql(`
        query MyFeed {
          feed {
            id
          }
        }
      `);
      const myExtraFeed = gql(`
        query MyExtraFeed {
          feed @NgModule(module: "./extra#ExtraModule") @namedClient(name: "extra") {
            id
          }
        }
      `);
      const docs = [{ filePath: '', content: myFeed }, { filePath: 'a.ts', content: myExtraFeed }];
      const content = await plugin(
        modifiedSchema,
        docs,
        {
          ngModule: './path/to/file#AppModule',
          namedClient: 'custom'
        },
        {
          outputFile: 'graphql.ts'
        }
      );

      // NgModule
      expect(content).toMatch(`import { AppModule } from './path/to/file'`);
      expect(content).toBeSimilarStringTo(`
        @Injectable({
          providedIn: AppModule
        })
        export class MyFeedGQL
      `);
      expect(content).toMatch(`import { ExtraModule } from './extra'`);
      expect(content).toBeSimilarStringTo(`
        @Injectable({
          providedIn: ExtraModule
        })
        export class MyExtraFeed
      `);
      expect(content).not.toContain('@NgModule');

      // NamedClient
      expect(content).toBeSimilarStringTo(`client = 'custom';`);
      expect(content).toBeSimilarStringTo(`client = 'extra';`);
      expect(content).not.toContain('@namedClient');

      validateTypeScript(content, modifiedSchema, docs, {});
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
