import { executeCodegen } from '@graphql-codegen/cli';
import { preset } from '../src/index.js';

describe('client-preset documentVariableSuffix', () => {
  it('respects documentVariableSuffix in generated graphql.ts', async () => {
    const { result } = await executeCodegen({
      schema: [
        /* GraphQL */ `
          type Query {
            a: String
          }
        `,
      ],
      documents: [
        /* GraphQL */ `
          query A {
            a
          }
        `,
      ],
      generates: {
        'out1/': {
          preset,
          config: {
            documentVariableSuffix: '',
          },
        },
      },
    });

    const gqlFile = result.find(file => file.filename === 'out1/gql.ts');
    expect(gqlFile?.content).toContain('types.A');

    const graphqlFile = result.find(file => file.filename === 'out1/graphql.ts');
    expect(graphqlFile?.content).toContain('export const A = ');
    expect(graphqlFile?.content).not.toContain('export const ADocument = ');
  });
});
