import { buildSchema } from 'graphql';
import { plugin } from '../src/index.js';

const schema = buildSchema(/* GraphQL */ `
  type Query {
    foo: String
  }
`);

describe('Time', () => {
  it('Should use default comment when extension is unknown', async () => {
    const result = await plugin(schema, [], {}, {});
    expect(result).toContain('// Generated on');
  });

  it('Should use # prefix for comment when extension is graphql', async () => {
    const result = await plugin(schema, [], {}, { outputFile: 'schema.graphql' });
    expect(result).toContain('# Generated on');
  });
});
