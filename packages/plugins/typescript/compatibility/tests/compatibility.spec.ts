import { validateTs } from '@graphql-codegen/testing';
import { plugin } from '../src/index';
import { buildSchema, parse, GraphQLSchema, buildClientSchema } from 'graphql';
import { plugin as tsPlugin } from '../../typescript/src';
import { plugin as tsOperationPlugin } from '../../operations/src';
import { plugin as raPlugin } from '../../../typescript/react-apollo/src';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';

const validate = async (
  content: Types.PluginOutput,
  schema: GraphQLSchema,
  operations: Types.DocumentFile[],
  config = {},
  tsx = false,
  strict = false
) => {
  const tsPluginResult = await tsPlugin(schema, operations, config, { outputFile: '' });
  const tsOperationPluginResult = await tsOperationPlugin(schema, operations, config, { outputFile: '' });
  const mergedOutput = mergeOutputs([tsPluginResult, tsOperationPluginResult, content]);

  validateTs(mergedOutput, undefined, tsx, strict);
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

      const operations = [{ location: '', document: testQuery }];
      const config = { strict: true, noNamespaces: true };
      const result = await plugin(testSchema, operations, config);

      await validate(result, testSchema, operations, config, false);
      expect(mergeOutputs([result])).toMatchSnapshot();
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

        union UnitEventDetails =
            DamageReportEvent
          | CanErrorEvent
          | PrecheckEvent
          | ServiceCalendarEvent
          | ServiceHourEvent
          | ServiceKmEvent

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

      const result = await plugin(testSchema, [{ location: '', document: testQuery }], {});
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
      const ast = [{ location: '', document: testQuery }];
      const result = await plugin(testSchema, ast, {});
      expect(result).toContain('ServerChangeImacInlineFragment');
      expect(result).toContain('ServerDecomImacInlineFragment');
      expect(result).toContain('ServerSetupImacInlineFragment');
      await validate(result, testSchema, ast, {});
      expect(mergeOutputs([result])).toMatchSnapshot();
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

        union UnitEventDetails =
            DamageReportEvent
          | CanErrorEvent
          | PrecheckEvent
          | ServiceCalendarEvent
          | ServiceHourEvent
          | ServiceKmEvent

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

      const ast = [{ location: '', document: testQuery }];
      const result = await plugin(testSchema, ast, {});
      await validate(result, testSchema, ast, {});
      expect(mergeOutputs([result])).toMatchSnapshot();
    });
  });

  it('Should work with fragments and generate namespaces', async () => {
    const ast = [{ location: '', document: basicQuery }];
    const result = await plugin(schema, ast, {});

    expect(result).toBeSimilarStringTo(`export namespace UserFields {
      export type Fragment = UserFieldsFragment;
    }`);

    expect(result).toBeSimilarStringTo(`export namespace MoreUserFields {
      export type Fragment = MoreUserFieldsFragment;
      export type Friends = MoreUserFieldsFragment['friends'][number];
      export type _Friends = MoreUserFieldsFragment['friends'][number]['friends'][number];
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

    const ast = [{ location: '', document: basicQuery }];
    const result = await plugin(testSchema, ast, {});

    expect(result).toContain(`export type Query = Me4Query;`);
    expect(result).toContain(`export type Me = Me4Query['me'];`);
    await validate(result, testSchema, ast);
    expect(mergeOutputs([result])).toMatchSnapshot();
  });

  it('Should work with interfaces and inline fragments', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      interface Node {
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
        location: '',
        document: parse(/* GraphQL */ `
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
    await validate(result, testSchema, ast);
    expect(mergeOutputs([result])).toMatchSnapshot();
  });

  it('Should generate namepsace and the internal types correctly', async () => {
    const result = await plugin(schema, [{ location: '', document: basicQuery }], {});

    expect(result).toContain('export namespace Me {');
  });

  it('Should generate variables and point to the correct variables', async () => {
    const result = await plugin(schema, [{ location: '', document: basicQuery }], {});

    expect(result).toContain('export type Variables = MeQueryVariables;');
  });

  it('Should handle field name aliasing', async () => {
    const result = await plugin(schema, [{ location: '', document: basicQuery }], {});

    expect(result).toContain(`export type Query = AliasTestQuery;`);
    expect(result).toContain(`export type CurrentUser = AliasTestQuery['currentUser'];`);
  });

  it('Should generate mapping to 1.0 types according to fields usage and selection set', async () => {
    const result = await plugin(schema, [{ location: '', document: basicQuery }], {});

    expect(result).toContain('export type Query = MeQuery;');
    expect(result).toContain(`export type Me = MeQuery['me'];`);
  });

  it('Should generate mapping to 1.0 types according to fields usage and selection set when array is in use', async () => {
    const result = await plugin(schema, [{ location: '', document: basicQuery }], {});

    expect(result).toContain('export type Query = MeQuery;');
    expect(result).toContain(`export type Me = MeQuery['me'];`);
    expect(result).toContain(`export type Friends = MeQuery['me']['friends'][number];`);
  });

  it('Should generate mapping to 1.0 types according to fields usage and selection set when array is in use and have duplicate names', async () => {
    const ast = [{ location: '', document: basicQuery }];
    const result = await plugin(schema, ast, {});

    expect(result).toContain('export type Query = MeQuery;');
    expect(result).toContain(`export type Me = MeQuery['me'];`);
    expect(result).toContain(`export type Friends = MeQuery['me']['friends'][number];`);
    expect(result).toContain(`export type _Friends = MeQuery['me']['friends'][number]['friends'][number];`);
    expect(result).toContain(
      `export type __Friends = MeQuery['me']['friends'][number]['friends'][number]['friends'][number];`
    );
    await validate(result, schema, ast);
    expect(mergeOutputs([result])).toMatchSnapshot();
  });

  it('Should work with fragment spread', async () => {
    const ast = [{ location: '', document: basicQuery }];
    const result = await plugin(schema, ast, {});

    expect(result).toContain(`export type Me = MeQuery['me'];`);
    await validate(result, schema, ast, {});
  });

  it('Should work with inline fragment', async () => {
    const ast = [{ location: '', document: basicQuery }];
    const result = await plugin(schema, ast, {});

    expect(result).toContain('export type Query = Me3Query;');
    expect(result).toContain(
      `export type UserInlineFragment = ({ __typename: 'User' } & Pick<Me3Query['me'], 'id' | 'name' | 'friends'>);`
    );
    expect(result).toContain(
      `export type Friends = ({ __typename: 'User' } & Pick<Me3Query['me'], 'id' | 'name' | 'friends'>)['friends'][number];`
    );
    await validate(result, schema, ast, {});
  });

  it('Should work with inline fragment nested', async () => {
    const ast = [{ location: '', document: basicQuery }];
    const result = await plugin(schema, ast, {});

    expect(result).toContain('export type Query = Me3Query;');
    expect(result).toContain(
      `export type UserInlineFragment = ({ __typename: 'User' } & Pick<Me3Query['me'], 'id' | 'name' | 'friends'>);`
    );
    expect(result).toContain(
      `export type Friends = ({ __typename: 'User' } & Pick<Me3Query['me'], 'id' | 'name' | 'friends'>)['friends'][number];`
    );
    expect(result).toContain(
      `export type _UserInlineFragment = ({ __typename: 'User' } & Pick<({ __typename: 'User' } & Pick<Me4Query['me'], 'name' | 'friends'>)['friends'][number], 'id' | 'name'>);`
    );
    await validate(result, schema, ast, {});
  });

  it('Should produce valid ts code', async () => {
    const ast = [{ location: '', document: basicQuery }];
    const result = await plugin(schema, ast, {});
    const usage = `const myVar: Me.__Friends = { name: '1' }`; // Should refer to a single item and not to it's array

    await validate(result + '\n' + usage, schema, ast, {});
  });

  it('Should produce valid ts code with strict mode', async () => {
    const ast = [{ location: '', document: basicQuery }];
    const result = await plugin(schema, ast, { strict: true });

    await validate(result, schema, ast, {}, false, true);
  });

  it('Should produce valid ts code with strict mode and mutations returning arrays', async () => {
    const ast = [{ location: '', document: basicMutation }];
    const result = await plugin(schema, ast, { strict: true });

    await validate(result, schema, ast, {}, false, true);
  });

  describe('Config', () => {
    it('Should produce valid ts code with naming convention', async () => {
      const config = { namingConvention: 'lower-case#lowerCase' };
      const ast = [{ location: '', document: basicQuery }];
      const result = await plugin(schema, ast, config);
      const usage = `const myVar: me.__friends = { name: '1' }`;

      await validate(result + '\n' + usage, schema, ast, config);
    });

    it('Should produce valid ts code with prefix', async () => {
      const config = { typesPrefix: 'I' };
      const ast = [{ location: '', document: basicQuery }];
      const result = await plugin(schema, ast, config);
      const usage = `const myVar: IMe.__IFriends = { name: '1' }`;

      await validate(result + '\n' + usage, schema, ast, config);
    });

    it('Should produce valid ts code with noNamepsaces', async () => {
      const config = { noNamespaces: true };
      const ast = [{ location: '', document: basicQuery }];
      const result = await plugin(schema, ast, config);

      expect(result).toContain(`export type Me4Variables = Me4QueryVariables;`);
      expect(result).toContain(`export type Me4Me = Me4Query['me'];`);
      expect(result).toContain(
        `export type Me4UserInlineFragment = ({ __typename: 'User' } & Pick<Me4Query['me'], 'name' | 'friends'>);`
      );
      expect(result).toContain(
        `export type Me4Friends = ({ __typename: 'User' } & Pick<Me4Query['me'], 'name' | 'friends'>)['friends'][number];`
      );
      expect(result).toContain(
        `export type Me4_UserInlineFragment = ({ __typename: 'User' } & Pick<({ __typename: 'User' } & Pick<Me4Query['me'], 'name' | 'friends'>)['friends'][number], 'id' | 'name'>);`
      );

      await validate(result, schema, ast, config);
    });
  });

  describe('React Apollo', () => {
    it('Issue #1876 - should produce valid ts code with react-apollo', async () => {
      const config = {
        strict: true,
        maybeValue: 'T | undefined',
        withHooks: true,
        withHOC: false,
        withComponent: false,
        noNamespaces: true,
        preResolveTypes: true,
        namingConvention: { typeNames: 'pascal-case#pascalCase' },
        transformUnderscore: true,
      };
      const ast = [{ location: '', document: basicQuery }];
      const result = await plugin(schema, ast, config, {
        allPlugins: [
          {
            'typescript-react-apollo': config,
          },
        ],
      });

      const raPluginResult = await raPlugin(schema, ast, config, { outputFile: '' });
      await validate(mergeOutputs([raPluginResult, result]), schema, ast, config, true, true);
      expect(mergeOutputs([result])).toMatchSnapshot();
    });

    it('Should produce valid ts code with react-apollo', async () => {
      const config = {};
      const ast = [{ location: '', document: basicQuery }];
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
        export type Friends = ({ __typename: 'User' } & Pick<Me4Query['me'], 'name' | 'friends'>)['friends'][number];
        export type _UserInlineFragment = ({ __typename: 'User' } & Pick<({ __typename: 'User' } & Pick<Me4Query['me'], 'name' | 'friends'>)['friends'][number], 'id' | 'name'>);
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
      const ast = [{ location: '', document: basicQuery }];
      const result = await plugin(schema, ast, config, {
        allPlugins: [
          {
            'typescript-react-apollo': config,
          },
        ],
      });

      expect(result).toContain(`export type Me4Variables = Me4QueryVariables;`);
      expect(result).toContain(`export type Me4Me = Me4Query['me'];`);
      expect(result).toContain(
        `export type Me4UserInlineFragment = ({ __typename: 'User' } & Pick<Me4Query['me'], 'name' | 'friends'>);`
      );
      expect(result).toContain(
        `export type Me4Friends = ({ __typename: 'User' } & Pick<Me4Query['me'], 'name' | 'friends'>)['friends'][number];`
      );
      expect(result).toContain(
        `export type Me4_UserInlineFragment = ({ __typename: 'User' } & Pick<({ __typename: 'User' } & Pick<Me4Query['me'], 'name' | 'friends'>)['friends'][number], 'id' | 'name'>);`
      );
      expect(result).toContain(`export const Me4HOC = withMe4;`);
      expect(result).toContain(`export const useMe4 = useMe4Query;`);

      const raPluginResult = await raPlugin(schema, ast, config as any, { outputFile: '' });
      await validate(mergeOutputs([raPluginResult, result]), schema, ast, config, true);
    });

    it('Should produce valid ts code with react-apollo with hooks', async () => {
      const config = {
        withHooks: true,
      };
      const ast = [{ location: '', document: basicQuery }];
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
        export type Friends = ({ __typename: 'User' } & Pick<Me4Query['me'], 'name' | 'friends'>)['friends'][number];
        export type _UserInlineFragment = ({ __typename: 'User' } & Pick<({ __typename: 'User' } & Pick<Me4Query['me'], 'name' | 'friends'>)['friends'][number], 'id' | 'name'>);
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
      const ast = [{ location: '', document: basicQuery }];
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
        export type Friends = ({ __typename: 'User' } & Pick<Me4Query['me'], 'name' | 'friends'>)['friends'][number];
        export type _UserInlineFragment = ({ __typename: 'User' } & Pick<({ __typename: 'User' } & Pick<Me4Query['me'], 'name' | 'friends'>)['friends'][number], 'id' | 'name'>);
        export const Document = Me4Document;
        export const Component = Me4Component;
      }`);

      const raPluginResult = await raPlugin(schema, ast, config, { outputFile: '' });
      await validate(mergeOutputs([raPluginResult, result]), schema, ast, config, true);
    });
  });

  describe('multiple named fragments', () => {
    it('supports query fields', async () => {
      const query = parse(/* GraphQL */ `
        query multipleSpreads {
          me {
            id
            ...UserFields
            ...UserFriends
          }
        }

        fragment UserFields on User {
          id
          name
        }

        fragment UserFriends on User {
          friends {
            ...UserFields
          }
        }

        fragment FullUser on User {
          id
          ...UserFields
          ...UserFriends
        }
      `);

      const ast = [{ location: '', document: query }];
      const result = await plugin(schema, ast, {});

      expect(result).toContain(`export type Me = MultipleSpreadsQuery['me'];`);
    });

    it('supports named fragments', async () => {
      const query = parse(/* GraphQL */ `
        fragment UserFields on User {
          id
          name
        }

        fragment UserFriends on User {
          friends {
            id
          }
        }

        fragment FullUser on User {
          id
          ...UserFields
          ...UserFriends
        }
      `);

      const ast = [{ location: '', document: query }];
      const result = await plugin(schema, ast, {});

      expect(result).toBeSimilarStringTo(`
        export namespace FullUser {
          export type Fragment = FullUserFragment;
        }
      `);
    });

    it('supports inline fragments', async () => {
      const query = parse(/* GraphQL */ `
        query multipleSpreads {
          me {
            ... on User {
              id
              ...UserFields
              ...UserFriends
            }
          }
        }
      `);

      const ast = [{ location: '', document: query }];
      const result = await plugin(schema, ast, {});

      expect(result).toContain(
        `export type UserInlineFragment = ({ __typename: 'User' } & Pick<MultipleSpreadsQuery['me'], 'id' | keyof UserFieldsFragment | keyof UserFriendsFragment>);`
      );
    });

    it('throws on nested inline fragments', async () => {
      const query = parse(/* GraphQL */ `
        query multipleSpreads {
          me {
            ... on User {
              ... on User {
                id
                ...UserFields
                ...UserFriends
              }
            }
          }
        }
      `);

      const ast = [{ location: '', document: query }];
      await expect(plugin(schema, ast, {})).rejects.toThrow('Nested inline fragments');
    });

    it('supports inline fragments on unions and interfaces', async () => {
      const schema = buildSchema(/* GraphQL */ `
        interface User {
          id: ID!
          name: String
        }
        type SocialUser implements User {
          id: ID!
          name: String
          friends: [User!]!
        }
        type WorkplaceUser implements User {
          id: ID!
          name: String
          colleagues: [User!]!
        }

        type Query {
          me: User!
        }
      `);

      const query = parse(/* GraphQL */ `
        query multipleSpreads {
          me {
            id
            ... on SocialUser {
              friends {
                ...UserBasics
              }
            }
            ... on WorkplaceUser {
              colleagues {
                ...UserBasics
              }
            }
          }
        }

        fragment UserBasics on User {
          id
          name
        }

        fragment UserNetwork on User {
          ... on SocialUser {
            friends {
              ...UserBasics
            }
          }
          ... on WorkplaceUser {
            colleagues {
              ...UserBasics
            }
          }
        }
      `);

      const ast = [{ location: '', document: query }];
      const result = await plugin(schema, ast, {});

      expect(result).toBeSimilarStringTo(`
        export namespace MultipleSpreads {
          export type Variables = MultipleSpreadsQueryVariables;
          export type Query = MultipleSpreadsQuery;
          export type Me = MultipleSpreadsQuery['me'];
          export type SocialUserInlineFragment = (DiscriminateUnion<MultipleSpreadsQuery['me'], { __typename?: 'SocialUser' }>);
          export type Friends = (DiscriminateUnion<MultipleSpreadsQuery['me'], { __typename?: 'SocialUser' }>)['friends'][number];
          export type WorkplaceUserInlineFragment = (DiscriminateUnion<MultipleSpreadsQuery['me'], { __typename?: 'WorkplaceUser' }>);
          export type Colleagues = (DiscriminateUnion<MultipleSpreadsQuery['me'], { __typename?: 'WorkplaceUser' }>)['colleagues'][number];
        }
      `);
    });

    it('supports inline fragments on unions and interfaces with nonOptionalTypename:true', async () => {
      const schema = buildSchema(/* GraphQL */ `
        interface User {
          id: ID!
          name: String
        }
        type SocialUser implements User {
          id: ID!
          name: String
          friends: [User!]!
        }
        type WorkplaceUser implements User {
          id: ID!
          name: String
          colleagues: [User!]!
        }

        type Query {
          me: User!
        }
      `);

      const query = parse(/* GraphQL */ `
        query multipleSpreads {
          me {
            id
            ... on SocialUser {
              friends {
                ...UserBasics
              }
            }
            ... on WorkplaceUser {
              colleagues {
                ...UserBasics
              }
            }
          }
        }

        fragment UserBasics on User {
          id
          name
        }

        fragment UserNetwork on User {
          ... on SocialUser {
            friends {
              ...UserBasics
            }
          }
          ... on WorkplaceUser {
            colleagues {
              ...UserBasics
            }
          }
        }
      `);

      const ast = [{ location: '', document: query }];
      const result = await plugin(schema, ast, { nonOptionalTypename: true });

      expect(result).toBeSimilarStringTo(`
        export namespace MultipleSpreads {
          export type Variables = MultipleSpreadsQueryVariables;
          export type Query = MultipleSpreadsQuery;
          export type Me = MultipleSpreadsQuery['me'];
          export type SocialUserInlineFragment = (DiscriminateUnion<MultipleSpreadsQuery['me'], { __typename: 'SocialUser' }>);
          export type Friends = (DiscriminateUnion<MultipleSpreadsQuery['me'], { __typename: 'SocialUser' }>)['friends'][number];
          export type WorkplaceUserInlineFragment = (DiscriminateUnion<MultipleSpreadsQuery['me'], { __typename: 'WorkplaceUser' }>);
          export type Colleagues = (DiscriminateUnion<MultipleSpreadsQuery['me'], { __typename: 'WorkplaceUser' }>)['colleagues'][number];
        }
      `);
    });
  });
});
