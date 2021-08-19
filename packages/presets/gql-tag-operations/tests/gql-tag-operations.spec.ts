import { executeCodegen } from '@graphql-codegen/cli';
import path from 'path';
import { preset } from '../src';

describe('gql-tag-operations-preset', () => {
  it('can generate simple examples uppercase names', async () => {
    const result = await executeCodegen({
      schema: [
        /* GraphQL */ `
          type Query {
            a: String
            b: String
            c: String
          }
        `,
      ],
      documents: path.join(__dirname, 'fixtures/simple-uppercase-operation-name.ts'),
      generates: {
        'out1.ts': {
          preset,
          plugins: [],
        },
      },
    });

    expect(result[0].content).toMatchInlineSnapshot(`
"/* eslint-disable */
import * as graphql from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

const documents = {
    \\"\\\\n  query A {\\\\n    a\\\\n  }\\\\n\\": graphql.ADocument,
    \\"\\\\n  query B {\\\\n    b\\\\n  }\\\\n\\": graphql.BDocument,
    \\"\\\\n  query C {\\\\n    c\\\\n  }\\\\n\\": graphql.CDocument,
};

export function gql(source: \\"\\\\n  query A {\\\\n    a\\\\n  }\\\\n\\"): (typeof documents)[\\"\\\\n  query A {\\\\n    a\\\\n  }\\\\n\\"];
export function gql(source: \\"\\\\n  query B {\\\\n    b\\\\n  }\\\\n\\"): (typeof documents)[\\"\\\\n  query B {\\\\n    b\\\\n  }\\\\n\\"];
export function gql(source: \\"\\\\n  query C {\\\\n    c\\\\n  }\\\\n\\"): (typeof documents)[\\"\\\\n  query C {\\\\n    c\\\\n  }\\\\n\\"];

export function gql(source: string): unknown;
export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<
  infer TType,
  any
>
  ? TType
  : never;
"
`);
  });

  it('can generate simple examples lowercase names', async () => {
    const result = await executeCodegen({
      schema: [
        /* GraphQL */ `
          type Query {
            a: String
            b: String
            c: String
          }
        `,
      ],
      documents: path.join(__dirname, 'fixtures/simple-lowercase-operation-name.ts'),
      generates: {
        'out1.ts': {
          preset,
          plugins: [],
        },
      },
    });
    expect(result[0].content).toMatchInlineSnapshot(`
"/* eslint-disable */
import * as graphql from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

const documents = {
    \\"\\\\n  query a {\\\\n    a\\\\n  }\\\\n\\": graphql.ADocument,
    \\"\\\\n  query b {\\\\n    b\\\\n  }\\\\n\\": graphql.BDocument,
    \\"\\\\n  query c {\\\\n    c\\\\n  }\\\\n\\": graphql.CDocument,
};

export function gql(source: \\"\\\\n  query a {\\\\n    a\\\\n  }\\\\n\\"): (typeof documents)[\\"\\\\n  query a {\\\\n    a\\\\n  }\\\\n\\"];
export function gql(source: \\"\\\\n  query b {\\\\n    b\\\\n  }\\\\n\\"): (typeof documents)[\\"\\\\n  query b {\\\\n    b\\\\n  }\\\\n\\"];
export function gql(source: \\"\\\\n  query c {\\\\n    c\\\\n  }\\\\n\\"): (typeof documents)[\\"\\\\n  query c {\\\\n    c\\\\n  }\\\\n\\"];

export function gql(source: string): unknown;
export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<
  infer TType,
  any
>
  ? TType
  : never;
"
`);
  });
});
