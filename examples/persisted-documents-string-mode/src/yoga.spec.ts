import { graphql } from './gql/index';
import { makeYoga } from './yoga';
import persistedDocumentsDictionary from './gql/persisted-documents.json';

const persistedDocuments = new Map<string, string>(Object.entries(persistedDocumentsDictionary));

const HelloQuery = graphql(/* GraphQL */ `
  query HelloQuery {
    hello
  }
`);

describe('Persisted Documents', () => {
  it('execute document without persisted operation enabled', async () => {
    const yoga = makeYoga({ persistedDocuments: null });
    const result = await yoga.fetch('http://yoga/graphql', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        query: HelloQuery.document,
      }),
    });
    expect(await result.json()).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "hello": "Hello world!",
        },
      }
    `);
  });

  it('can not execute arbitrary operation with persisted operations enabled', async () => {
    const yoga = makeYoga({ persistedDocuments });
    const result = await yoga.fetch('http://yoga/graphql', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        query: HelloQuery.document,
      }),
    });
    expect(await result.json()).toMatchInlineSnapshot(`
      Object {
        "errors": Array [
          Object {
            "message": "PersistedQueryOnly",
          },
        ],
      }
    `);
  });

  it('can execute persisted operation with persisted operations enabled', async () => {
    const yoga = makeYoga({ persistedDocuments });
    const result = await yoga.fetch('http://yoga/graphql', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        extensions: {
          persistedQuery: {
            version: 1,
            sha256Hash: (HelloQuery as any)['__meta__']['hash'],
          },
        },
      }),
    });

    expect(await result.json()).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "hello": "Hello world!",
        },
      }
    `);
  });
});
