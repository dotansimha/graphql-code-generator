import { executeCodegen } from '@graphql-codegen/cli';
import { preset } from '../src/index.js';

describe('client-preset - Enum', () => {
  it('does not generate enum if not used in operations', async () => {
    const { result } = await executeCodegen({
      schema: [
        /* GraphQL */ `
          enum Color {
            RED
            BLUE
          }
        `,
      ],

      generates: {
        'out1/': {
          preset,
        },
      },
    });

    const graphqlFile = result.find(file => file.filename === 'out1/graphql.ts');
    expect(graphqlFile.content).toMatchInlineSnapshot(`
      "/* eslint-disable */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };"
    `);
  });

  it('generates enum if used in operation Variables', async () => {
    const { result } = await executeCodegen({
      schema: [
        /* GraphQL */ `
          type Query {
            shape(shape: Shape): ShapeObj!
          }

          enum Color {
            RED
            BLUE
          }

          enum Shape {
            ROUND
            SQUARE
          }

          type ShapeObj {
            id: ID!
            shape: Shape!
          }
        `,
      ],
      documents: /* GraphQL */ `
        query Shape($shape: Shape) {
          shape(shape: $shape) {
            id
          }
        }
      `,

      generates: {
        'out1/': {
          preset,
        },
      },
    });

    const graphqlFile = result.find(file => file.filename === 'out1/graphql.ts');
    expect(graphqlFile.content).toMatchInlineSnapshot(`
      "/* eslint-disable */
      import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type Shape =
        | 'ROUND'
        | 'SQUARE';

      export type ShapeQueryVariables = Exact<{
        shape?: Shape | null;
      }>;


      export type ShapeQuery = { __typename?: 'Query', shape: { __typename?: 'ShapeObj', id: string } };


      export const ShapeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Shape"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"shape"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Shape"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shape"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"shape"},"value":{"kind":"Variable","name":{"kind":"Name","value":"shape"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ShapeQuery, ShapeQueryVariables>;"
    `);
  });

  it('generates enum if used in operation Result', async () => {
    const { result } = await executeCodegen({
      schema: [
        /* GraphQL */ `
          type Query {
            shape(shape: Shape): ShapeObj!
          }

          enum Color {
            RED
            BLUE
          }

          enum Shape {
            ROUND
            SQUARE
          }

          type ShapeObj {
            id: ID!
            shape: Shape!
          }
        `,
      ],
      documents: /* GraphQL */ `
        query Shape {
          shape {
            id
            shape
          }
        }
      `,

      generates: {
        'out1/': {
          preset,
        },
      },
    });

    const graphqlFile = result.find(file => file.filename === 'out1/graphql.ts');
    expect(graphqlFile.content).toMatchInlineSnapshot(`
      "/* eslint-disable */
      import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type Shape =
        | 'ROUND'
        | 'SQUARE';

      export type ShapeQueryVariables = Exact<{ [key: string]: never; }>;


      export type ShapeQuery = { __typename?: 'Query', shape: { __typename?: 'ShapeObj', id: string, shape: Shape } };


      export const ShapeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Shape"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shape"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"shape"}}]}}]}}]} as unknown as DocumentNode<ShapeQuery, ShapeQueryVariables>;"
    `);
  });

  it('supports config.enumType=const', async () => {
    const { result } = await executeCodegen({
      schema: [
        /* GraphQL */ `
          type Query {
            shape(shape: Shape): ShapeObj!
          }

          enum Shape {
            ROUND
            SQUARE
          }

          type ShapeObj {
            id: ID!
            shape: Shape!
          }
        `,
      ],
      documents: /* GraphQL */ `
        query Shape($shape: Shape) {
          shape(shape: $shape) {
            id
          }
        }
      `,

      generates: {
        'out1/': {
          preset,
          config: {
            enumType: 'const',
          },
        },
      },
    });

    const graphqlFile = result.find(file => file.filename === 'out1/graphql.ts');
    expect(graphqlFile.content).toMatchInlineSnapshot(`
      "/* eslint-disable */
      import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export const Shape = {
        Round: 'ROUND',
        Square: 'SQUARE'
      } as const;

      export type Shape = typeof Shape[keyof typeof Shape];
      export type ShapeQueryVariables = Exact<{
        shape?: Shape | null;
      }>;


      export type ShapeQuery = { __typename?: 'Query', shape: { __typename?: 'ShapeObj', id: string } };


      export const ShapeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Shape"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"shape"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Shape"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shape"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"shape"},"value":{"kind":"Variable","name":{"kind":"Name","value":"shape"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<ShapeQuery, ShapeQueryVariables>;"
    `);
  });
});
