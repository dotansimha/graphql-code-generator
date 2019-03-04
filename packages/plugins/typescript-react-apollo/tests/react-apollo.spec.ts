import 'graphql-codegen-core/dist/testing';
import { plugin } from '../src/index';
import { parse, buildSchema } from 'graphql';

describe('React Apollo', () => {
  const schema = buildSchema(`type Query { something: MyType } type MyType { a: String }`);
  const basicDoc = parse(/* GraphQL */ `
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
  `);

  describe('Imports', () => {
    it('should import React and ReactApollo dependencies', async () => {
      const content = await plugin(
        schema,
        [{ filePath: '', content: basicDoc }],
        {},
        {
          outputFile: 'graphql.tsx'
        }
      );

      expect(content).toBeSimilarStringTo(`import * as ReactApollo from 'react-apollo';`);
      expect(content).toBeSimilarStringTo(`import * as React from 'react';`);
      expect(content).toBeSimilarStringTo(`import gql from 'graphql-tag';`);
    });

    it(`should use gql import from gqlImport config option`, async () => {
      const content = await plugin(
        schema,
        [{ filePath: '', content: basicDoc }],
        { gqlImport: 'graphql.macro#gql' },
        {
          outputFile: 'graphql.tsx'
        }
      );

      expect(content).toContain(`import { gql } from 'graphql.macro';`);
    });

    it('should import ReactApolloHooks dependencies', async () => {
      const content = await plugin(
        schema,
        [{ filePath: '', content: basicDoc }],
        { withHooks: true },
        {
          outputFile: 'graphql.tsx'
        }
      );

      expect(content).toBeSimilarStringTo(`import * as ReactApolloHooks from 'react-apollo-hooks';`);
    });

    it('should import ReactApolloHooks from hooksImportFrom config option', async () => {
      const content = await plugin(
        schema,
        [{ filePath: '', content: basicDoc }],
        { withHooks: true, hooksImportFrom: 'custom-apollo-hooks' },
        {
          outputFile: 'graphql.tsx'
        }
      );

      expect(content).toBeSimilarStringTo(`import * as ReactApolloHooks from 'custom-apollo-hooks';`);
    });
  });

  describe('Fragments', () => {
    it('Should generate basic fragments documents correctly', async () => {
      const result = await plugin(
        schema,
        [
          {
            filePath: 'a.graphql',
            content: parse(/* GraphQL */ `
              fragment MyFragment on MyType {
                a
              }
            `)
          }
        ],
        {},
        { outputFile: '' }
      );

      expect(result).toBeSimilarStringTo(`
      export const MyFragmentFragmentDoc = gql\`
      fragment MyFragment on MyType {
        a
      }
      \`;`);
    });

    it('Should generate fragments when they are refering to each other', async () => {
      const result = await plugin(
        schema,
        [
          {
            filePath: 'a.graphql',
            content: parse(/* GraphQL */ `
              fragment MyFragment on MyType {
                a
                ...MyOtherFragment
              }
            `)
          },
          {
            filePath: 'b.graphql',
            content: parse(/* GraphQL */ `
              fragment MyOtherFragment on MyType {
                a
              }
            `)
          }
        ],
        {},
        { outputFile: '' }
      );

      expect(result).toBeSimilarStringTo(`
      export const MyOtherFragmentFragmentDoc = gql\`
      fragment MyOtherFragment on MyType {
        a
      }
      \`;`);

      expect(result).toBeSimilarStringTo(`
      export const MyFragmentFragmentDoc = gql\`
      fragment MyFragment on MyType {
        a
        ...MyOtherFragment
      }
      \${MyOtherFragmentFragmentDoc}\`;`);
    });
  });
});
