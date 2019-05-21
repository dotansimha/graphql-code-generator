import { parse, buildSchema } from 'graphql';
import { plugin } from '../src/plugin';
import { mergeOutputs } from '@graphql-codegen/plugin-helpers';

describe('Operations Visitor', () => {
  const schema = buildSchema(/* GraphQL */ `
    type Query {
      getTodo(id: ID!): Todo!
    }

    type Todo {
      id: ID!
      content: String!
    }
  `);

  it('Should handle Query correctly', async () => {
    const ast = {
      content: parse(/* GraphQL */ `
        query getTodo($id: ID!) {
          getTodo(id: $id) {
            id
            content
          }
        }
      `),
      filePath: '',
    };

    const result = await plugin(schema, [ast], { package: 'app.test.generated.graphql' });
    const output = mergeOutputs([result]);

    // console.log(output);
  });
});
