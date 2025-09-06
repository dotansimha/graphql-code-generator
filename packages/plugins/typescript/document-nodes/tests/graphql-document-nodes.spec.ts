import { mergeOutputs, Types } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import { parse } from 'graphql';
import { plugin } from '../src/index.js';

describe('graphql-codegen typescript-graphql-document-nodes', () => {
  it('Should generate simple module with one file', async () => {
    const result = plugin(
      null,
      [
        {
          location: 'some/file/my-query.graphql',
          document: parse(/* GraphQL */ `
            query MyQuery {
              field
            }
          `),
        },
      ],
      {},
      { outputFile: '' }
    ) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
      export const MyQuery = gql\`
        query MyQuery {
          field
        }
      \`;
    `);
    validateTs(mergeOutputs([result]));
  });

  it('Should generate correctly for mutiple files', async () => {
    const result = (await plugin(
      null,
      [
        {
          location: 'some/file/my-query.graphql',
          document: parse(/* GraphQL */ `
            query MyQuery {
              field
            }
          `),
        },
        {
          location: 'some/file/my-other-query.graphql',
          document: parse(/* GraphQL */ `
            query OtherQuery {
              field
            }
          `),
        },
      ],
      {},
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
      export const MyQuery = gql\`
        query MyQuery {
          field
        }
      \`;

      export const OtherQuery = gql\`
        query OtherQuery {
          field
        }
      \`;
    `);
    validateTs(mergeOutputs([result]));
  });

  it('Should ignore unnamed documents', async () => {
    const result = (await plugin(
      null,
      [
        {
          location: 'some/file/my-query.graphql',
          document: parse(/* GraphQL */ `
            query {
              field
            }
          `),
        },
      ],
      {},
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo('');
    validateTs(mergeOutputs([result]));
  });

  it('Should generate simple module with two documents in one file', async () => {
    const result = (await plugin(
      null,
      [
        {
          location: 'some/file/my-query.graphql',
          document: parse(/* GraphQL */ `
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
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
      export const MyQuery = gql\`
        query MyQuery {
          field
        }
      \`;

      export const OtherQuery = gql\`
        query OtherQuery {
          field
        }
      \`;
    `);
    validateTs(mergeOutputs([result]));
  });

  it('Should generate module with a name as a camel case', async () => {
    const result = plugin(
      null,
      [
        {
          location: 'some/file/my-query.graphql',
          document: parse(/* GraphQL */ `
            query MyQuery {
              field
            }
          `),
        },
      ],
      { namingConvention: 'change-case-all#camelCase' },
      { outputFile: '' }
    ) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
      export const myQuery = gql\`
        query MyQuery {
          field
        }
      \`;
    `);
    validateTs(mergeOutputs([result]));
  });

  it('Should generate module with a name as a pascal case with underscores', async () => {
    const result = plugin(
      null,
      [
        {
          location: 'some/file/my-query.graphql',
          document: parse(/* GraphQL */ `
            query My_Query {
              field
            }
          `),
        },
      ],
      { namingConvention: 'change-case-all#pascalCase', transformUnderscore: false } as any,
      { outputFile: '' }
    ) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
      export const My_Query = gql\`
        query My_Query {
          field
        }
      \`;
    `);
    validateTs(mergeOutputs([result]));
  });

  it('Should generate module with a name as a pascal case without underscores', async () => {
    const result = plugin(
      null,
      [
        {
          location: 'some/file/my-query.graphql',
          document: parse(/* GraphQL */ `
            query My_Query {
              field
            }
          `),
        },
      ],
      {
        namingConvention: {
          typeNames: 'change-case-all#pascalCase',
          transformUnderscore: true,
        },
      },
      { outputFile: '' }
    ) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
      export const MyQuery = gql\`
        query My_Query {
          field
        }
      \`;
    `);
    validateTs(mergeOutputs([result]));
  });

  it('Should generate module with a name as a contant case', async () => {
    const result = plugin(
      null,
      [
        {
          location: 'some/file/my-query.graphql',
          document: parse(/* GraphQL */ `
            query MyQuery {
              field
            }
          `),
        },
      ],
      { namingConvention: 'change-case-all#constantCase' },
      { outputFile: '' }
    ) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
      export const MY_QUERY = gql\`
        query MyQuery {
          field
        }
      \`;
    `);
    validateTs(mergeOutputs([result]));
  });

  it('Should generate module with prefix for a name', async () => {
    const result = plugin(
      null,
      [
        {
          location: 'some/file/my-query.graphql',
          document: parse(/* GraphQL */ `
            query MyQuery {
              field
            }
          `),
        },
      ],
      { namePrefix: 'Graphql' },
      { outputFile: '' }
    ) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
      export const GraphqlMyQuery = gql\`
        query MyQuery {
          field
        }
      \`;
    `);
    validateTs(mergeOutputs([result]));
  });

  it('Should generate module with suffix for a name', async () => {
    const result = plugin(
      null,
      [
        {
          location: 'some/file/my-query.graphql',
          document: parse(/* GraphQL */ `
            query MyQuery {
              field
            }
          `),
        },
      ],
      { nameSuffix: 'Query' },
      { outputFile: '' }
    ) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
      export const MyQueryQuery = gql\`
        query MyQuery {
          field
        }
      \`;
    `);
    validateTs(mergeOutputs([result]));
  });

  it('should contain fragment definitions', async () => {
    const result = plugin(
      null,
      [
        {
          location: 'some/file/my-query.graphql',
          document: parse(/* GraphQL */ `
            # Put your operations here
            fragment fragment1 on User {
              id
              username
            }

            query user {
              user(id: 1) {
                ...fragment1
              }
            }

            query user2 {
              user2: user(id: 1) {
                ...fragment1
                email
              }
            }
          `),
        },
      ],
      {},
      { outputFile: '' }
    ) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
    export const Fragment1 = gql\`
      fragment fragment1 on User {
        id
        username
      }
    \`;
    
    export const User = gql\`
      query user {
        user(id: 1) {
          ...fragment1
        }
      }
    \${Fragment1}\`;
    
    export const User2 = gql\`
      query user2 {
        user2: user(id: 1) {
          ...fragment1
          email
        }
      }
    \${Fragment1}\`;
    `);
    validateTs(mergeOutputs([result]));
  });
});
