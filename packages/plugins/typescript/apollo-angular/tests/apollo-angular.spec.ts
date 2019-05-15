import '@graphql-codegen/testing';
import gql from 'graphql-tag';
import { plugin, addToSchema } from '../src/index';
import { parse, GraphQLSchema, buildClientSchema, buildSchema, extendSchema } from 'graphql';
import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { plugin as tsPlugin } from '../../typescript/src/index';
import { plugin as tsDocumentsPlugin } from '../../../typescript/operations/src/index';
import { validateTs } from '../../typescript/tests/validate';
import { readFileSync } from 'fs';

describe('Apollo Angular', () => {
  const schema = buildClientSchema(JSON.parse(readFileSync('../../../../dev-test/githunt/schema.json').toString()));
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

  const validateTypeScript = async (output: Types.PluginOutput, testSchema: GraphQLSchema, documents: Types.DocumentFile[], config: any) => {
    const tsOutput = await tsPlugin(testSchema, documents, config, { outputFile: '' });
    const tsDocumentsOutput = await tsDocumentsPlugin(testSchema, documents, config, { outputFile: '' });
    const merged = mergeOutputs([tsOutput, tsDocumentsOutput, output]);
    validateTs(merged, undefined, true);
  };

  describe('Imports', () => {
    it('should import DocumentNode when using noGraphQLTag', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {
          noGraphQLTag: true,
        },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import { DocumentNode } from 'graphql';`);
      expect(content.prepend).not.toContain(`import gql from 'graphql-tag';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it(`should use gql import from gqlImport config option`, async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { gqlImport: 'graphql.macro#gql' },
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import { gql } from 'graphql.macro';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it(`should add the correct angular imports`, async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as Apollo from 'apollo-angular';`);
      expect(content.prepend).toContain(`import { Injectable } from '@angular/core';`);
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
      const content = (await plugin(
        modifiedSchema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import { ${moduleName} } from '${modulePath}';`);
      expect(content.content).toBeSimilarStringTo(`
        @Injectable({
          providedIn: ${moduleName}
        })
        export class MyFeedGQL
      `);
      expect(content.content).toBeSimilarStringTo(`document = MyFeedDocument;`);
      expect(content.content).not.toContain('@NgModule');
      expect(content.content).toContain('@client');
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
      const content = (await plugin(
        modifiedSchema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`document = MyFeedDocument;`);

      expect(content.content).toBeSimilarStringTo(`
        client = 'custom';
      `);
      expect(content.content).not.toContain('@namedClient');
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
      const content = (await plugin(
        rootSchema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`
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
      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`document = MyFeedDocument;`);

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
      const content = (await plugin(
        modifiedSchema,
        docs,
        {
          ngModule: './path/to/file#AppModule',
          namedClient: 'custom',
        },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      // NgModule
      expect(content.prepend).toContain(`import { AppModule } from './path/to/file';`);
      expect(content.content).toBeSimilarStringTo(`
        @Injectable({
          providedIn: AppModule
        })
        export class MyFeedGQL
      `);
      expect(content.prepend).toContain(`import { ExtraModule } from './extra';`);

      expect(content.content).toBeSimilarStringTo(`
        @Injectable({
          providedIn: ExtraModule
        })
        export class MyExtraFeed
      `);
      expect(content.content).not.toContain('@NgModule');

      // NamedClient
      expect(content.content).toBeSimilarStringTo(`client = 'custom';`);
      expect(content.content).toBeSimilarStringTo(`client = 'extra';`);
      expect(content.content).not.toContain('@namedClient');

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
      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      validateTypeScript(content, schema, docs, {});
    });
  });
});
