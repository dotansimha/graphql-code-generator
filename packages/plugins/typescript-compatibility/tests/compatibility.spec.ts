import '@graphql-codegen/testing';
import { plugin } from '../src/index';
import { buildSchema, parse, GraphQLSchema } from 'graphql';
import { validateTs } from '../../typescript/tests/validate';
import { plugin as tsPlugin } from '../../typescript/src';
import { plugin as tsOperationPlugin } from '../../typescript-operations/src';
import { plugin as raPlugin } from '../../typescript-react-apollo/src';

const validate = async (content: string, schema: GraphQLSchema, operations, config = {}, tsx = false) => {
  const tsPluginResult = await tsPlugin(schema, operations, config, { outputFile: '' });
  const tsOperationPluginResult = await tsOperationPlugin(schema, operations, config, { outputFile: '' });
  const mergedOutput = [tsPluginResult, tsOperationPluginResult, content].join('\n');

  validateTs(mergedOutput, undefined, tsx);
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

    query aliasTest {
      currentUser: me {
        id
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

    query me3 {
      me {
        ... on User {
          id
          name
          friends {
            id
            name
          }
        }
      }
    }

    query me4 {
      me {
        id
        ... on User {
          name
          friends {
            ... on User {
              id
              name
            }
          }
        }
      }
    }
  `);

  it('Should work with custom Query root type', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type User {
        id: ID!
        name: String!
        friends: [User!]!
      }

      type QueryRoot {
        me: User!
      }

      schema {
        query: QueryRoot
      }
    `);

    const result = await plugin(testSchema, [{ filePath: '', content: basicQuery }], {});

    expect(result).toContain(`export type Query = Me4Query;`);
    expect(result).toContain(`export type Me = Me4Query['me'];`);
  });

  it('Should generate namepsace and the internal types correctly', async () => {
    const result = await plugin(schema, [{ filePath: '', content: basicQuery }], {});

    expect(result).toContain('export namespace Me {');
  });

  it('Should generate variables and point to the correct variables', async () => {
    const result = await plugin(schema, [{ filePath: '', content: basicQuery }], {});

    expect(result).toContain('export type Variables = MeQueryVariables;');
  });

  it('Should handle field name aliasing', async () => {
    const result = await plugin(schema, [{ filePath: '', content: basicQuery }], {});

    expect(result).toContain(`export type Query = AliasTestQuery;`);
    expect(result).toContain(`export type CurrentUser = AliasTestQuery['currentUser'];`);
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

    expect(result).toContain('export type Query = Me3Query;');
    expect(result).toContain(`export type UserInlineFragment = ({ __typename: 'User' } & Pick<Me3Query['me'], 'id' | 'name' | 'friends'>);`);
    expect(result).toContain(`export type Friends = ({ __typename: 'User' } & Pick<Me3Query['me'], 'id' | 'name' | 'friends'>)['friends'][0];`);
    await validate(result, schema, ast, {});
  });

  it('Should work with inline fragment nested', async () => {
    const ast = [{ filePath: '', content: basicQuery }];
    const result = await plugin(schema, ast, {});

    expect(result).toContain('export type Query = Me3Query;');
    expect(result).toContain(`export type UserInlineFragment = ({ __typename: 'User' } & Pick<Me3Query['me'], 'id' | 'name' | 'friends'>);`);
    expect(result).toContain(`export type Friends = ({ __typename: 'User' } & Pick<Me3Query['me'], 'id' | 'name' | 'friends'>)['friends'][0];`);
    expect(result).toContain(`export type _UserInlineFragment = ({ __typename: 'User' } & Pick<({ __typename: 'User' } & Pick<Me4Query['me'], 'name' | 'friends'>)['friends'][0], 'id' | 'name'>);`);
    await validate(result, schema, ast, {});
  });

  it('Should produce valid ts code', async () => {
    const ast = [{ filePath: '', content: basicQuery }];
    const result = await plugin(schema, ast, {});
    const usage = `const myVar: Me.__Friends = { name: '1' }`; // Should refer to a single item and not to it's array

    await validate(result + '\n' + usage, schema, ast, {});
  });

  describe('Config', () => {
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

    it('Should produce valid ts code with noNamepsaces', async () => {
      const config = { noNamespaces: true };
      const ast = [{ filePath: '', content: basicQuery }];
      const result = await plugin(schema, ast, config);

      expect(result).toContain(`export type Me4Variables = Me4QueryVariables;`);
      expect(result).toContain(`export type Me4Me = Me4Query['me'];`);
      expect(result).toContain(`export type Me4UserInlineFragment = ({ __typename: 'User' } & Pick<Me4Query['me'], 'name' | 'friends'>);`);
      expect(result).toContain(`export type Me4Friends = ({ __typename: 'User' } & Pick<Me4Query['me'], 'name' | 'friends'>)['friends'][0];`);
      expect(result).toContain(`export type Me4_UserInlineFragment = ({ __typename: 'User' } & Pick<({ __typename: 'User' } & Pick<Me4Query['me'], 'name' | 'friends'>)['friends'][0], 'id' | 'name'>);`);

      await validate(result, schema, ast, config);
    });
  });

  describe('React Apollo', () => {
    it('Should produce valid ts code with react-apollo', async () => {
      const config = {};
      const ast = [{ filePath: '', content: basicQuery }];
      const result = await plugin(schema, ast, config, {
        allPlugins: [
          {
            'typescript-react-apollo': {},
          },
        ],
      });

      expect(result).toBeSimilarStringTo(`export namespace Me4 {
        export type Variables = Me4QueryVariables;
        export type Query = Me4Query;
        export type Me = Me4Query['me'];
        export type UserInlineFragment = ({ __typename: 'User' } & Pick<Me4Query['me'], 'name' | 'friends'>);
        export type Friends = ({ __typename: 'User' } & Pick<Me4Query['me'], 'name' | 'friends'>)['friends'][0];
        export type _UserInlineFragment = ({ __typename: 'User' } & Pick<({ __typename: 'User' } & Pick<Me4Query['me'], 'name' | 'friends'>)['friends'][0], 'id' | 'name'>);
        export type Props = Me4Props;
        export const Document = Me4Document;
        export const HOC = withMe4;
        export const Component = Me4Component;
      }`);

      const raPluginResult = await raPlugin(schema, ast, config, { outputFile: '' });
      await validate(raPluginResult + '\n' + result, schema, ast, config, true);
    });

    it('Should produce valid ts code with react-apollo and noNamespaces', async () => {
      const config = { noNamespaces: true, withHooks: true };
      const ast = [{ filePath: '', content: basicQuery }];
      const result = await plugin(schema, ast, config, {
        allPlugins: [
          {
            'typescript-react-apollo': config,
          },
        ],
      });

      expect(result).toContain(`export type Me4Variables = Me4QueryVariables;`);
      expect(result).toContain(`export type Me4Me = Me4Query['me'];`);
      expect(result).toContain(`export type Me4UserInlineFragment = ({ __typename: 'User' } & Pick<Me4Query['me'], 'name' | 'friends'>);`);
      expect(result).toContain(`export type Me4Friends = ({ __typename: 'User' } & Pick<Me4Query['me'], 'name' | 'friends'>)['friends'][0];`);
      expect(result).toContain(`export type Me4_UserInlineFragment = ({ __typename: 'User' } & Pick<({ __typename: 'User' } & Pick<Me4Query['me'], 'name' | 'friends'>)['friends'][0], 'id' | 'name'>);`);
      expect(result).toContain(`export const Me4HOC = withMe4;`);
      expect(result).toContain(`export const useMe4 = useMe4Query;`);

      const raPluginResult = await raPlugin(schema, ast, config as any, { outputFile: '' });
      await validate(raPluginResult + '\n' + result, schema, ast, config, true);
    });

    it('Should produce valid ts code with react-apollo with hooks', async () => {
      const config = {
        withHooks: true,
      };
      const ast = [{ filePath: '', content: basicQuery }];
      const result = await plugin(schema, ast, config as any, {
        allPlugins: [
          {
            'typescript-react-apollo': config,
          },
        ],
      });

      expect(result).toBeSimilarStringTo(`export namespace Me4 {
        export type Variables = Me4QueryVariables;
        export type Query = Me4Query;
        export type Me = Me4Query['me'];
        export type UserInlineFragment = ({ __typename: 'User' } & Pick<Me4Query['me'], 'name' | 'friends'>);
        export type Friends = ({ __typename: 'User' } & Pick<Me4Query['me'], 'name' | 'friends'>)['friends'][0];
        export type _UserInlineFragment = ({ __typename: 'User' } & Pick<({ __typename: 'User' } & Pick<Me4Query['me'], 'name' | 'friends'>)['friends'][0], 'id' | 'name'>);
        export type Props = Me4Props;
        export const Document = Me4Document;
        export const HOC = withMe4;
        export const Component = Me4Component;
        export const use = useMe4Query;
      }`);

      const raPluginResult = await raPlugin(schema, ast, config, { outputFile: '' });
      await validate(raPluginResult + '\n' + result, schema, ast, config, true);
    });
  });
});
