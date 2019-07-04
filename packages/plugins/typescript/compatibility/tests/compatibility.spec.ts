import { compileTs, validateTs } from '@graphql-codegen/testing';
import { plugin } from '../src/index';
import { buildSchema, parse, GraphQLSchema, buildClientSchema } from 'graphql';
import { plugin as tsPlugin } from '../../typescript/src';
import { plugin as tsOperationPlugin } from '../../operations/src';
import { plugin as raPlugin } from '../../../typescript/react-apollo/src';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';

const validate = async (content: Types.PluginOutput, schema: GraphQLSchema, operations, config = {}, tsx = false, strict = false) => {
  const tsPluginResult = await tsPlugin(schema, operations, config, { outputFile: '' });
  const tsOperationPluginResult = await tsOperationPlugin(schema, operations, config, { outputFile: '' });
  const mergedOutput = mergeOutputs([tsPluginResult, tsOperationPluginResult, content]);

  validateTs(mergedOutput, undefined, tsx, strict);
};

const validateAndCompile = async (content: Types.PluginOutput, schema: GraphQLSchema, operations, config = {}, tsx = false) => {
  const tsPluginResult = await tsPlugin(schema, operations, config, { outputFile: '' });
  const tsOperationPluginResult = await tsOperationPlugin(schema, operations, config, { outputFile: '' });
  const mergedOutput = mergeOutputs([tsPluginResult, tsOperationPluginResult, content]);

  compileTs(mergedOutput, undefined, tsx);
};

describe('Compatibility Plugin', () => {
  const schema = buildSchema(/* GraphQL */ `
    type User {
      id: ID!
      name: String
      friends: [User!]!
      testField: [User]
    }

    type Query {
      me: User!
      user(id: ID!): User
    }
    type Mutation {
      createUsers(name: String!): [User]
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

    fragment MoreUserFields on User {
      id
      name
      friends {
        id
        name
        friends {
          id
        }
      }
    }

    query me5 {
      user(id: "1") {
        id
        name
        testField {
          id
        }
        friends {
          id
          name
        }
      }
    }
  `);

  const basicMutation = parse(/* GraphQL */ `
    mutation CreateUsers($name: String!) {
      createUsers(name: $name) {
        id
        name
        friends {
          name
        }
        testField {
          name
        }
      }
    }
  `);

  describe('Issues', () => {
    it('Issue #1943 - Missing DiscriminateUnion on interface types with strict mode', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        interface Book {
          title: String
          author: String
        }

        type TextBook implements Book {
          title: String
          author: String
          classes: [String]
        }

        type ColoringBook implements Book {
          title: String
          author: String
          colors: [String]
        }

        type Query {
          schoolBooks: [Book]
        }
      `);
      const testQuery = parse(/* GraphQL */ `
        query GetBooks {
          schoolBooks {
            title
            ... on TextBook {
              classes
            }
            ... on ColoringBook {
              colors
            }
          }
        }
      `);

      const operations = [{ filePath: '', content: testQuery }];
      const config = { strict: true, noNamespaces: true };
      const result = await plugin(testSchema, operations, config);

      await validateAndCompile(result, testSchema, operations, config, false);
    });
    it('Issue #1686 - Inline fragments on a union', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        schema {
          query: Query
        }

        type Query {
          machine: Machine
        }

        type Machine {
          id: Int!
          unit: Unit
        }

        type Unit {
          id: Int!
          events(active: Boolean!): [UnitEvent!]
        }

        enum UnitEventType {
          DAMAGE_REPORT
          PRE_CHECK
          SERVICE_KM
          SERVICE_HOUR
          SERVICE_HOUR2
          SERVICE_CALENDAR
          CAN_ERROR
          UNKNOWN
        }

        type UnitEvent {
          id: String!
          details: UnitEventDetails
        }

        union UnitEventDetails = DamageReportEvent | CanErrorEvent | PrecheckEvent | ServiceCalendarEvent | ServiceHourEvent | ServiceKmEvent

        type DamageReportEvent {
          state: Int
        }

        type CanErrorEvent {
          id: String
          canErrorId: String
          suspectParameterNumber: Int
          failureModeIdentifier: Int
          canbusNumber: Int
          sourceAddress: Int
          unitId: Int
        }

        type PrecheckEvent {
          count: Int
          failedCount: Int
        }

        type ServiceCalendarEvent {
          date: String
        }

        type ServiceHourEvent {
          serviceRun: Int
          currentRun: Int
        }

        type ServiceKmEvent {
          serviceKm: Int
          currentKm: Int
        }
      `);

      const testQuery = parse(/* GraphQL */ `
        query GetMachineActiveEvents {
          machine {
            id
            unit {
              id
              events(active: true) {
                details {
                  ... on CanErrorEvent {
                    suspectParameterNumber
                  }
                  ... on DamageReportEvent {
                    state
                  }
                  ... on PrecheckEvent {
                    count
                    failedCount
                  }
                  ... on ServiceKmEvent {
                    serviceKm
                    currentKm
                  }
                  ... on ServiceHourEvent {
                    serviceRun
                    currentRun
                  }
                  ... on ServiceCalendarEvent {
                    date
                  }
                }
              }
            }
          }
        }
      `);

      const result = await plugin(testSchema, [{ filePath: '', content: testQuery }], {});
      expect(result).toContain('CanErrorEventInlineFragment');
      expect(result).toContain('DamageReportEventInlineFragment');
      expect(result).toContain('PrecheckEventInlineFragment');
      expect(result).toContain('ServiceKmEventInlineFragment');
      expect(result).toContain('ServiceHourEventInlineFragment');
      expect(result).toContain('ServiceCalendarEventInlineFragment');
    });

    it('Issue #1775 - Inline fragments', async () => {
      const testSchema = buildClientSchema(JSON.parse(readFileSync(join(__dirname, './1775.schema.json'), 'utf-8')));
      const testQuery = parse(/* GraphQL */ `
        query fetchServerAnalyticsData($uid: String!) {
          process {
            servers(where: { uid: $uid }) {
              uid
              sources
              getHostVirtualMachines {
                id
                uid
              }
              imacs {
                ... on ServerChangeImac {
                  __typename
                  requestedAt
                }
                ... on ServerDecomImac {
                  requestedAt
                }
                ... on ServerSetupImac {
                  backupUser
                  serverSize {
                    name
                    cpu
                    memory
                    disk
                  }
                  sla {
                    application
                    platform
                  }
                }
              }
            }
          }
        }
      `);
      const ast = [{ filePath: '', content: testQuery }];
      const result = await plugin(testSchema, ast, {});
      expect(result).toContain('ServerChangeImacInlineFragment');
      expect(result).toContain('ServerDecomImacInlineFragment');
      expect(result).toContain('ServerSetupImacInlineFragment');
      await validateAndCompile(result, testSchema, ast, {});
    });

    it('Issue #1762 - __typename issues', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        schema {
          query: Query
        }

        type Query {
          machine: Machine
        }

        type Machine {
          id: Int!
          unit: Unit
        }

        type Unit {
          id: Int!
          events(active: Boolean!): [UnitEvent!]
        }

        enum UnitEventType {
          DAMAGE_REPORT
          PRE_CHECK
          SERVICE_KM
          SERVICE_HOUR
          SERVICE_HOUR2
          SERVICE_CALENDAR
          CAN_ERROR
          UNKNOWN
        }

        type UnitEvent {
          id: String!
          details: UnitEventDetails
        }

        union UnitEventDetails = DamageReportEvent | CanErrorEvent | PrecheckEvent | ServiceCalendarEvent | ServiceHourEvent | ServiceKmEvent

        type DamageReportEvent {
          state: Int
        }

        type CanErrorEvent {
          id: String
          canErrorId: String
          suspectParameterNumber: Int
          failureModeIdentifier: Int
          canbusNumber: Int
          sourceAddress: Int
          unitId: Int
        }

        type PrecheckEvent {
          count: Int
          failedCount: Int
        }

        type ServiceCalendarEvent {
          date: String
        }

        type ServiceHourEvent {
          serviceRun: Int
          currentRun: Int
        }

        type ServiceKmEvent {
          serviceKm: Int
          currentKm: Int
        }
      `);

      const testQuery = parse(/* GraphQL */ `
        query GetMachineActiveEvents($id: Int!) {
          machine(input: { id: $id }) {
            id
            unit {
              id
              events(active: true) {
                id
                details {
                  ... on CanErrorEvent {
                    suspectParameterNumber
                  }
                  ... on DamageReportEvent {
                    state
                  }
                  ... on PrecheckEvent {
                    count
                    failedCount
                  }
                  ... on ServiceKmEvent {
                    serviceKm
                    currentKm
                  }
                  ... on ServiceHourEvent {
                    serviceRun
                    currentRun
                  }
                  ... on ServiceCalendarEvent {
                    date
                  }
                }
              }
            }
          }
        }
      `);

      const ast = [{ filePath: '', content: testQuery }];
      const result = await plugin(testSchema, ast, {});
      await validateAndCompile(result, testSchema, ast, {});
    });
  });

  it('Should work with fragments and generate namespaces', async () => {
    const ast = [{ filePath: '', content: basicQuery }];
    const result = await plugin(schema, ast, {});

    expect(result).toBeSimilarStringTo(`export namespace UserFields {
      export type Fragment = UserFieldsFragment;
    }`);

    expect(result).toBeSimilarStringTo(`export namespace MoreUserFields {
      export type Fragment = MoreUserFieldsFragment;
      export type Friends = MoreUserFieldsFragment['friends'][0];
      export type _Friends = MoreUserFieldsFragment['friends'][0]['friends'][0];
    }`);

    await validate(result, schema, ast, {});
  });

  it('Should work with custom Query root type', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type User {
        id: ID!
        name: String!
        friends: [User!]!
        testField: [User]
      }

      type QueryRoot {
        me: User!
        user(id: ID!): User
      }

      schema {
        query: QueryRoot
      }
    `);

    const ast = [{ filePath: '', content: basicQuery }];
    const result = await plugin(testSchema, ast, {});

    expect(result).toContain(`export type Query = Me4Query;`);
    expect(result).toContain(`export type Me = Me4Query['me'];`);
    await validateAndCompile(result, testSchema, ast);
  });

  it('Should work with interfaces and inline fragments', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type Node {
        id: ID!
      }

      type A implements Node {
        id: ID!
        a: String
      }

      type B implements Node {
        id: ID!
        a: String
      }

      type Query {
        node: Node
      }
    `);

    const ast = [
      {
        filePath: '',
        content: parse(/* GraphQL */ `
          query something {
            node {
              ... on A {
                a
              }

              ... on B {
                a
              }
            }
          }
        `),
      },
    ];
    const result = await plugin(testSchema, ast, {});
    await validateAndCompile(result, testSchema, ast);
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
    await validateAndCompile(result, schema, ast);
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

  it('Should produce valid ts code with strict mode', async () => {
    const ast = [{ filePath: '', content: basicQuery }];
    const result = await plugin(schema, ast, { strict: true });

    await validate(result, schema, ast, {}, false, true);
  });

  it('Should produce valid ts code with strict mode and mutations returning arrays', async () => {
    const ast = [{ filePath: '', content: basicMutation }];
    const result = await plugin(schema, ast, { strict: true });

    await validate(result, schema, ast, {}, false, true);
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
        export const Document = Me4Document;
        export type Props = Me4Props;
        export const HOC = withMe4;
        export const Component = Me4Component;
      }`);

      const raPluginResult = await raPlugin(schema, ast, config, { outputFile: '' });
      await validate(mergeOutputs([raPluginResult, result]), schema, ast, config, true);
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
      await validate(mergeOutputs([raPluginResult, result]), schema, ast, config, true);
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
        export const Document = Me4Document;
        export type Props = Me4Props;
        export const HOC = withMe4;
        export const Component = Me4Component;
        export const use = useMe4Query;
      }`);

      const raPluginResult = await raPlugin(schema, ast, config, { outputFile: '' });
      await validate(mergeOutputs([raPluginResult, result]), schema, ast, config, true);
    });

    it('Should not refer to Props and HOC type when withHOC = false', async () => {
      const config = {
        withHOC: false,
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
        export const Document = Me4Document;
        export const Component = Me4Component;
      }`);

      const raPluginResult = await raPlugin(schema, ast, config, { outputFile: '' });
      await validate(mergeOutputs([raPluginResult, result]), schema, ast, config, true);
    });
  });
});
