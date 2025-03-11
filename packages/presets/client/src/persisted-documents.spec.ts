import { parse } from 'graphql';
import { normalizeAndPrintDocumentNode } from './persisted-documents';

describe('normalizeAndPrintDocumentNode', () => {
  it('should remove client specific directives/fields from the document', () => {
    const document = parse(/* GraphQL */ `
      query myQuery {
        regularField
        clientSideOnlyField @client
      }
    `);
    const result = normalizeAndPrintDocumentNode(document);
    expect(result).toMatchInlineSnapshot(`"query myQuery { regularField }"`);
  });

  it('should remove @client when it is specified on an fragment spread', () => {
    const document = parse(/* GraphQL */ `
      query myQuery {
        regularField
        clientSideOnlyField @client
        ...myFrag @client
        ...myOtherFrag
      }

      fragment myFrag on Query {
        someField
      }
    `);
    const result = normalizeAndPrintDocumentNode(document);
    expect(result).toMatchInlineSnapshot(
      `"fragment myFrag on Query { someField } query myQuery { regularField ...myOtherFrag }"`
    );
  });

  it('should remove @client when it is specified on an inline fragment', () => {
    const document = parse(/* GraphQL */ `
      query myQuery {
        regularField
        clientSideOnlyField @client
        ...myFrag @client
        ... on Query @client {
          someField
        }
        ... on Query {
          regularField
        }
      }

      fragment myFrag on Query {
        someField
      }
    `);
    const result = normalizeAndPrintDocumentNode(document);
    expect(result).toMatchInlineSnapshot(
      `"fragment myFrag on Query { someField } query myQuery { regularField ... on Query { regularField } }"`
    );
  });
});
