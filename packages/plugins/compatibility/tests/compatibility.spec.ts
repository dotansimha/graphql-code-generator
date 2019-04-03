import { plugin } from '../src/index';
import { buildSchema, parse, GraphQLSchema } from 'graphql';
import { validateTs } from '../../typescript/tests/validate';
import { plugin as tsPlugin } from '../../typescript/src';
import { plugin as tsOperationPlugin } from '../../typescript-operations/src';

const validate = async (content: string, schema: GraphQLSchema, operations, config = {}) => {
  const tsPluginResult = await tsPlugin(schema, operations, config, { outputFile: '' });
  const tsOperationPluginResult = await tsOperationPlugin(schema, operations, config, { outputFile: '' });
  const mergedOutput = [tsPluginResult, tsOperationPluginResult, content].join('\n');

  validateTs(mergedOutput);
};

describe('Compatibility Plugin', () => {
  const schema = buildSchema(/* GraphQL */ `
    type User {
      id: ID!
      name: String!
      friends: [User!]!
    }

    type Query {
      me: User!
    }
  `);

  const basicQuery = parse(/* GraphQL */ `
    query me {
      me {
        id
        name
        friends {
          name

          friends {
            name

            friends {
              name
            }
          }
        }
      }
    }

    query me2 {
      me {
        ...UserFields
      }
    }

    fragment UserFields on User {
      id
      name
    }
  `);

  it('Should generate namepsace and the internal types correctly', async () => {
    const result = await plugin(schema, [{ filePath: '', content: basicQuery }], {});

    expect(result).toContain('export namespace Me {');
  });

  it('Should generate variables and point to the correct variables', async () => {
    const result = await plugin(schema, [{ filePath: '', content: basicQuery }], {});

    expect(result).toContain('export type Variables = MeQueryVariables;');
  });

  it('Should generate mapping to 1.0 types according to fields usage and selection set', async () => {
    const result = await plugin(schema, [{ filePath: '', content: basicQuery }], {});

    expect(result).toContain('export type Query = MeQuery;');
    expect(result).toContain(`export type Me = MeQuery['me'];`);
  });

  it('Should generate mapping to 1.0 types according to fields usage and selection set when array is in use', async () => {
    const result = await plugin(schema, [{ filePath: '', content: basicQuery }], {});

    expect(result).toContain('export type Query = MeQuery;');
    expect(result).toContain(`export type Me = MeQuery['me'];`);
    expect(result).toContain(`export type Friends = MeQuery['me']['friends'][0];`);
  });

  it('Should generate mapping to 1.0 types according to fields usage and selection set when array is in use and have duplicate names', async () => {
    const ast = [{ filePath: '', content: basicQuery }];
    const result = await plugin(schema, ast, {});

    expect(result).toContain('export type Query = MeQuery;');
    expect(result).toContain(`export type Me = MeQuery['me'];`);
    expect(result).toContain(`export type Friends = MeQuery['me']['friends'][0];`);
    expect(result).toContain(`export type _Friends = MeQuery['me']['friends'][0]['friends'][0];`);
    expect(result).toContain(`export type __Friends = MeQuery['me']['friends'][0]['friends'][0]['friends'][0];`);
  });

  it('Should work with fragment spread', async () => {
    const ast = [{ filePath: '', content: basicQuery }];
    const result = await plugin(schema, ast, {});

    expect(result).toContain(`export type Me = UserFieldsFragment;`);
    await validate(result, schema, ast, {});
  });

  it('Should work with inline fragment', async () => {
    const ast = [{ filePath: '', content: basicQuery }];
    const result = await plugin(schema, ast, {});

    expect(result).toContain('export type Query = MeQuery;');
    expect(result).toContain(`export type Me = UserFieldsFragment;`);
    await validate(result, schema, ast, {});
  });

  it('Should produce valid ts code', async () => {
    const ast = [{ filePath: '', content: basicQuery }];
    const result = await plugin(schema, ast, {});
    const usage = `const myVar: Me.__Friends = { name: '1' }`; // Should refer to a single item and not to it's array

    await validate(result + '\n' + usage, schema, ast, {});
  });

  it('Should produce valid ts code with naming convention', async () => {
    const config = { namingConvention: 'change-case#lowerCase' };
    const ast = [{ filePath: '', content: basicQuery }];
    const result = await plugin(schema, ast, config);
    const usage = `const myVar: me.__friends = { name: '1' }`;

    await validate(result + '\n' + usage, schema, ast, config);
  });

  it('Should produce valid ts code with prefix', async () => {
    const config = { typesPrefix: 'I' };
    const ast = [{ filePath: '', content: basicQuery }];
    const result = await plugin(schema, ast, config);
    const usage = `const myVar: IMe.__IFriends = { name: '1' }`;

    await validate(result + '\n' + usage, schema, ast, config);
  });
});
