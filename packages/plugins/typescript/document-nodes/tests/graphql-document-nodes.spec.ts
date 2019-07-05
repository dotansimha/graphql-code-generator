import '@graphql-codegen/testing';
import { parse } from 'graphql';

import { validateTs } from '@graphql-codegen/testing';

import { plugin } from '../src/index';

describe('graphql-codegen typescript-graphql-document-nodes', () => {
  it('Should generate simple module with one file', async () => {
    const result = plugin(
      null,
      [
        {
          filePath: 'some/file/my-query.graphql',
          content: parse(/* GraphQL */ `
            query MyQuery {
              field
            }
          `),
        },
      ],
      {},
      { outputFile: '' }
    ) as string;

    expect(result).toBeSimilarStringTo(`
      import { DocumentNode } from 'graphql';
      import gql from 'graphql-tag';

      export const MyQuery: DocumentNode = gql\`
        query MyQuery {
          field
        }
      \`;
    `);
    validateTs(result);
  });

  it('Should generate correctly for mutiple files', async () => {
    const result = (await plugin(
      null,
      [
        {
          filePath: 'some/file/my-query.graphql',
          content: parse(/* GraphQL */ `
            query MyQuery {
              field
            }
          `),
        },
        {
          filePath: 'some/file/my-other-query.graphql',
          content: parse(/* GraphQL */ `
            query OtherQuery {
              field
            }
          `),
        },
      ],
      {},
      { outputFile: '' }
    )) as string;

    expect(result).toBeSimilarStringTo(`
      import { DocumentNode } from 'graphql';
      import gql from 'graphql-tag';

      export const MyQuery: DocumentNode = gql\`
        query MyQuery {
          field
        }
      \`;

      export const OtherQuery: DocumentNode = gql\`
        query OtherQuery {
          field
        }
      \`;
    `);
    validateTs(result);
  });

  it('Should ignore unnamed documents', async () => {
    const result = (await plugin(
      null,
      [
        {
          filePath: 'some/file/my-query.graphql',
          content: parse(/* GraphQL */ `
            query {
              field
            }
          `),
        },
      ],
      {},
      { outputFile: '' }
    )) as string;

    expect(result).toBeSimilarStringTo('');
    validateTs(result);
  });

  it('Should generate simple module with two documents in one file', async () => {
    const result = (await plugin(
      null,
      [
        {
          filePath: 'some/file/my-query.graphql',
          content: parse(/* GraphQL */ `
            query MyQuery {
              field
            }

            query OtherQuery {
              field
            }
          `),
        },
      ],
      {},
      { outputFile: '' }
    )) as string;

    expect(result).toBeSimilarStringTo(`
      import { DocumentNode } from 'graphql';
      import gql from 'graphql-tag';

      export const MyQuery: DocumentNode = gql\`
        query MyQuery {
          field
        }
      \`;

      export const OtherQuery: DocumentNode = gql\`
        query OtherQuery {
          field
        }
      \`;
    `);
    validateTs(result);
  });

  it('Should generate module with a name as a camel case', async () => {
    const result = plugin(
      null,
      [
        {
          filePath: 'some/file/my-query.graphql',
          content: parse(/* GraphQL */ `
            query MyQuery {
              field
            }
          `),
        },
      ],
      { namingConvention: 'change-case#camelCase' },
      { outputFile: '' }
    ) as string;

    expect(result).toBeSimilarStringTo(`
      import { DocumentNode } from 'graphql';
      import gql from 'graphql-tag';

      export const myQuery: DocumentNode = gql\`
        query MyQuery {
          field
        }
      \`;
    `);
    validateTs(result);
  });

  it('Should generate module with a name as a pascal case with underscores', async () => {
    const result = plugin(
      null,
      [
        {
          filePath: 'some/file/my-query.graphql',
          content: parse(/* GraphQL */ `
            query My_Query {
              field
            }
          `),
        },
      ],
      { namingConvention: 'change-case#pascalCase', transformUnderscore: false },
      { outputFile: '' }
    ) as string;

    expect(result).toBeSimilarStringTo(`
      import { DocumentNode } from 'graphql';
      import gql from 'graphql-tag';

      export const My_Query: DocumentNode = gql\`
        query My_Query {
          field
        }
      \`;
    `);
    validateTs(result);
  });

  it('Should generate module with a name as a pascal case without underscores', async () => {
    const result = plugin(
      null,
      [
        {
          filePath: 'some/file/my-query.graphql',
          content: parse(/* GraphQL */ `
            query My_Query {
              field
            }
          `),
        },
      ],
      { namingConvention: 'change-case#pascalCase', transformUnderscore: true },
      { outputFile: '' }
    ) as string;

    expect(result).toBeSimilarStringTo(`
      import { DocumentNode } from 'graphql';
      import gql from 'graphql-tag';

      export const MyQuery: DocumentNode = gql\`
        query My_Query {
          field
        }
      \`;
    `);
    validateTs(result);
  });

  it('Should generate module with a name as a contant case', async () => {
    const result = plugin(
      null,
      [
        {
          filePath: 'some/file/my-query.graphql',
          content: parse(/* GraphQL */ `
            query MyQuery {
              field
            }
          `),
        },
      ],
      { namingConvention: 'change-case#constantCase' },
      { outputFile: '' }
    ) as string;

    expect(result).toBeSimilarStringTo(`
      import { DocumentNode } from 'graphql';
      import gql from 'graphql-tag';

      export const MY_QUERY: DocumentNode = gql\`
        query MyQuery {
          field
        }
      \`;
    `);
    validateTs(result);
  });

  it('Should generate module with prefix for a name', async () => {
    const result = plugin(
      null,
      [
        {
          filePath: 'some/file/my-query.graphql',
          content: parse(/* GraphQL */ `
            query MyQuery {
              field
            }
          `),
        },
      ],
      { namePrefix: 'Graphql' },
      { outputFile: '' }
    ) as string;

    expect(result).toBeSimilarStringTo(`
      import { DocumentNode } from 'graphql';
      import gql from 'graphql-tag';

      export const GraphqlMyQuery: DocumentNode = gql\`
        query MyQuery {
          field
        }
      \`;
    `);
    validateTs(result);
  });

  it('Should generate module with suffix for a name', async () => {
    const result = plugin(
      null,
      [
        {
          filePath: 'some/file/my-query.graphql',
          content: parse(/* GraphQL */ `
            query MyQuery {
              field
            }
          `),
        },
      ],
      { nameSuffix: 'Query' },
      { outputFile: '' }
    ) as string;

    expect(result).toBeSimilarStringTo(`
      import { DocumentNode } from 'graphql';
      import gql from 'graphql-tag';

      export const MyQueryQuery: DocumentNode = gql\`
        query MyQuery {
          field
        }
      \`;
    `);
    validateTs(result);
  });

  it('Should generate simple module without graphql-tag', async () => {
    const result = plugin(
      null,
      [
        {
          filePath: 'some/file/my-query.graphql',
          content: parse(/* GraphQL */ `
            query MyQuery {
              field
            }
          `),
        },
      ],
      { noGraphQLTag: true },
      { outputFile: '' }
    ) as string;

    expect(result).toBeSimilarStringTo(`
    import { DocumentNode } from 'graphql';

    export const MyQuery: DocumentNode = {
      "kind": "Document",
      "definitions": [
        {
          "kind": "OperationDefinition",
          "operation": "query",
          "name": {
            "kind": "Name",
            "value": "MyQuery"
          },
          "variableDefinitions": [],
          "directives": [],
          "selectionSet": {
            "kind": "SelectionSet",
            "selections": [
              {
                "kind": "Field",
                "name": {
                  "kind": "Name",
                  "value": "field"
                },
                "arguments": [],
                "directives": []
              }
            ]
          }
        }
      ]
    };
    `);
    validateTs(result);
  });
});
