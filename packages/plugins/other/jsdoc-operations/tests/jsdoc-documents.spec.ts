import { buildSchema, parse } from 'graphql';
import { plugin } from '../src/index';

describe('JSDoc Operations Plugin', () => {
  const schema = buildSchema(/* GraphQL */ `
    union FooBar = Foo | Bar

    type Foo {
      id: String!
    }

    type Bar {
      amount: Int!
    }

    type Query {
      foo: Foo
      bar: Bar
      foos: [Foo]
      bars: [Bar!]!
      foobar: FooBar!
      fooOrbar: FooBar
    }

    schema {
      query: Query
    }
  `);

  it('should ...', async () => {
    const ast = parse(/* GraphQL */ `
      query foo {
        myField
      }
    `);

    const config = {};
    const result = await plugin(schema, [{ filePath: 'test-file.ts', content: ast }], config, { outputFile: '' });

    expect(result).toEqual('test');
  });
});
