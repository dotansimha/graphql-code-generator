import { DocumentNode, Kind, OperationTypeNode, print } from 'graphql';
import {
  createSDK,
  SDKFieldArgumentSymbol,
  SDKSelectionSet,
  SDKUnionResultSymbol,
  SDKUnionSelectionSet,
} from './sdk-base';

describe('SDKLogic', () => {
  it('anonymous query operation', () => {
    const sdk = createSDK<
      {},
      SDKSelectionSet<{
        __typename?: true;
      }>,
      {},
      {
        __typename: 'Query';
      }
    >();
    const operation = sdk.query({
      selection: {
        __typename: true,
      },
    });

    expect(print(operation)).toMatchInlineSnapshot(`
      "{
        __typename
      }"
    `);

    expect(operation).toStrictEqual({
      kind: Kind.DOCUMENT,
      definitions: [
        {
          kind: Kind.OPERATION_DEFINITION,
          name: undefined,
          operation: OperationTypeNode.QUERY,
          variableDefinitions: [],
          selectionSet: {
            kind: Kind.SELECTION_SET,
            selections: [
              {
                kind: Kind.FIELD,
                name: {
                  kind: Kind.NAME,
                  value: '__typename',
                },
              },
            ],
          },
        },
      ],
    });
  });

  it('named query operation', () => {
    const sdk = createSDK<
      {},
      SDKSelectionSet<{
        __typename?: true;
      }>,
      {},
      {
        __typename?: 'Query';
      }
    >();
    const operation = sdk.query({
      name: 'Brrt',
      selection: {
        __typename: true,
      },
    });

    expect(print(operation)).toMatchInlineSnapshot(`
      "query Brrt {
        __typename
      }"
    `);

    expect(operation).toStrictEqual({
      kind: Kind.DOCUMENT,
      definitions: [
        {
          kind: Kind.OPERATION_DEFINITION,
          name: {
            kind: Kind.NAME,
            value: 'Brrt',
          },
          operation: OperationTypeNode.QUERY,
          variableDefinitions: [],
          selectionSet: {
            kind: Kind.SELECTION_SET,
            selections: [
              {
                kind: Kind.FIELD,
                name: {
                  kind: Kind.NAME,
                  value: '__typename',
                },
              },
            ],
          },
        },
      ],
    });
  });

  it('simple mutation operation', () => {
    type SelectionType = SDKSelectionSet<{
      __typename?: true;
    }>;
    type ArgumentType = {};
    type ResultType = {
      __typename?: 'Query';
    };

    const sdk = createSDK<{}, SelectionType, ArgumentType, ResultType, SelectionType, ArgumentType, ResultType>();
    const operation = sdk.mutation({
      selection: {
        __typename: true,
      },
    });

    expect(print(operation)).toMatchInlineSnapshot(`
      "mutation {
        __typename
      }"
    `);

    expect(operation).toStrictEqual({
      kind: Kind.DOCUMENT,
      definitions: [
        {
          kind: Kind.OPERATION_DEFINITION,
          name: undefined,
          operation: OperationTypeNode.MUTATION,
          variableDefinitions: [],
          selectionSet: {
            kind: Kind.SELECTION_SET,
            selections: [
              {
                kind: Kind.FIELD,
                name: {
                  kind: Kind.NAME,
                  value: '__typename',
                },
              },
            ],
          },
        },
      ],
    });
  });

  it('simple subscription operation', () => {
    type SelectionType = SDKSelectionSet<{
      __typename?: true;
    }>;
    type ArgumentType = {};
    type ResultType = {
      __typename?: 'Query';
    };

    const sdk = createSDK<
      {},
      SelectionType,
      ArgumentType,
      ResultType,
      SelectionType,
      ArgumentType,
      ResultType,
      SelectionType,
      ArgumentType,
      ResultType
    >();
    const operation = sdk.subscription({
      selection: {
        __typename: true,
      },
    });

    expect(print(operation)).toMatchInlineSnapshot(`
      "subscription {
        __typename
      }"
    `);

    expect(operation).toStrictEqual({
      kind: Kind.DOCUMENT,
      definitions: [
        {
          kind: Kind.OPERATION_DEFINITION,
          name: undefined,
          operation: OperationTypeNode.SUBSCRIPTION,
          variableDefinitions: [],
          selectionSet: {
            kind: Kind.SELECTION_SET,
            selections: [
              {
                kind: Kind.FIELD,
                name: {
                  kind: Kind.NAME,
                  value: '__typename',
                },
              },
            ],
          },
        },
      ],
    });
  });

  it('nested operation', () => {
    const sdk = createSDK<
      {},
      SDKSelectionSet<{
        __typename?: true;
        foo?: {
          a?: true;
        };
      }>,
      {},
      {
        __typename: 'Query';
        foo: {
          a: boolean;
        };
      }
    >();

    const operation = sdk.query({
      selection: {
        __typename: true,
        foo: {
          a: true,
        },
      },
    });

    expect(print(operation)).toMatchInlineSnapshot(`
      "{
        __typename
        foo {
          a
        }
      }"
    `);

    expect(operation).toStrictEqual({
      kind: Kind.DOCUMENT,
      definitions: [
        {
          kind: Kind.OPERATION_DEFINITION,
          name: undefined,
          operation: OperationTypeNode.QUERY,
          variableDefinitions: [],
          selectionSet: {
            kind: Kind.SELECTION_SET,
            selections: [
              {
                kind: Kind.FIELD,
                name: {
                  kind: Kind.NAME,
                  value: '__typename',
                },
              },
              {
                kind: Kind.FIELD,
                name: {
                  kind: Kind.NAME,
                  value: 'foo',
                },
                selectionSet: {
                  kind: Kind.SELECTION_SET,
                  selections: [
                    {
                      kind: Kind.FIELD,
                      name: {
                        kind: Kind.NAME,
                        value: 'a',
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    });
  });

  it('query with primitive variables', () => {
    type InputTypes = {
      String: string;
      Int: number;
      Boolean: number;
    };

    type SelectionType = SDKSelectionSet<{
      __typename?: boolean;
      user?: SDKSelectionSet<{
        id?: boolean;
        login?: boolean;
      }> & {
        [SDKFieldArgumentSymbol]?: {
          id?: string | never;
        };
      };
      string?: true;
    }>;

    type ArgumentType = {
      user: {
        [SDKFieldArgumentSymbol]: {
          id: 'String';
        };
      };
    };

    type ResultType = {
      __typename?: 'Query';
      user?: {
        id?: InputTypes['String'];
        login?: InputTypes['String'];
      };
    };

    const sdk = createSDK<InputTypes, SelectionType, ArgumentType, ResultType>();

    const document = sdk.query({
      name: 'UserById',
      variables: {
        idVariableName: 'String',
      },
      selection: {
        user: {
          [SDKFieldArgumentSymbol]: {
            id: 'idVariableName',
          },
          id: true,
        },
      },
    });

    expect(print(document)).toMatchInlineSnapshot(`
      "query UserById($idVariableName: String) {
        user(id: $idVariableName) {
          id
        }
      }"
    `);

    const expectedDocument: DocumentNode = {
      kind: Kind.DOCUMENT,
      definitions: [
        {
          kind: Kind.OPERATION_DEFINITION,
          name: {
            kind: Kind.NAME,
            value: 'UserById',
          },
          operation: OperationTypeNode.QUERY,
          variableDefinitions: [
            {
              kind: Kind.VARIABLE_DEFINITION,
              type: {
                kind: Kind.NAMED_TYPE,
                name: {
                  kind: Kind.NAME,
                  value: 'String',
                },
              },
              variable: {
                kind: Kind.VARIABLE,
                name: {
                  kind: Kind.NAME,
                  value: 'idVariableName',
                },
              },
            },
          ],
          selectionSet: {
            kind: Kind.SELECTION_SET,
            selections: [
              {
                kind: Kind.FIELD,
                name: {
                  kind: Kind.NAME,
                  value: 'user',
                },
                arguments: [
                  {
                    kind: Kind.ARGUMENT,
                    name: {
                      kind: Kind.NAME,
                      value: 'id',
                    },
                    value: {
                      kind: Kind.VARIABLE,
                      name: {
                        kind: Kind.NAME,
                        value: 'idVariableName',
                      },
                    },
                  },
                ],
                selectionSet: {
                  kind: Kind.SELECTION_SET,
                  selections: [
                    {
                      kind: Kind.FIELD,
                      name: {
                        kind: Kind.NAME,
                        value: 'id',
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    };

    expect(document).toStrictEqual(expectedDocument);
  });

  it('query with non nullable variables', () => {
    type InputTypes = {
      String: string;
      Int: number;
      Boolean: number;
    };

    type SelectionType = SDKSelectionSet<{
      __typename?: true;
      user?: SDKSelectionSet<{
        id?: boolean;
        login?: boolean;
      }> & {
        [SDKFieldArgumentSymbol]: {
          id: string | never;
        };
      };
    }>;

    type ArgumentType = {
      user: {
        [SDKFieldArgumentSymbol]: {
          id: 'String!';
        };
      };
    };

    type ResultType = {
      __typename?: 'Query';
      user?: {
        id?: InputTypes['String'];
        login?: InputTypes['String'];
      };
    };

    const sdk = createSDK<InputTypes, SelectionType, ArgumentType, ResultType>();

    const document = sdk.query({
      name: 'UserById',
      variables: {
        idVariableName: 'String!',
      },
      selection: {
        user: {
          [SDKFieldArgumentSymbol]: {
            id: 'idVariableName',
          },
          id: true,
        },
      },
    });

    expect(print(document)).toMatchInlineSnapshot(`
      "query UserById($idVariableName: String!) {
        user(id: $idVariableName) {
          id
        }
      }"
    `);

    const expectedDocument: DocumentNode = {
      kind: Kind.DOCUMENT,
      definitions: [
        {
          kind: Kind.OPERATION_DEFINITION,
          name: {
            kind: Kind.NAME,
            value: 'UserById',
          },
          operation: OperationTypeNode.QUERY,
          variableDefinitions: [
            {
              kind: Kind.VARIABLE_DEFINITION,
              type: {
                kind: Kind.NON_NULL_TYPE,
                type: {
                  kind: Kind.NAMED_TYPE,
                  name: {
                    kind: Kind.NAME,
                    value: 'String',
                  },
                },
              },
              variable: {
                kind: Kind.VARIABLE,
                name: {
                  kind: Kind.NAME,
                  value: 'idVariableName',
                },
              },
            },
          ],
          selectionSet: {
            kind: Kind.SELECTION_SET,
            selections: [
              {
                kind: Kind.FIELD,
                name: {
                  kind: Kind.NAME,
                  value: 'user',
                },
                arguments: [
                  {
                    kind: Kind.ARGUMENT,
                    name: {
                      kind: Kind.NAME,
                      value: 'id',
                    },
                    value: {
                      kind: Kind.VARIABLE,
                      name: {
                        kind: Kind.NAME,
                        value: 'idVariableName',
                      },
                    },
                  },
                ],
                selectionSet: {
                  kind: Kind.SELECTION_SET,
                  selections: [
                    {
                      kind: Kind.FIELD,
                      name: {
                        kind: Kind.NAME,
                        value: 'id',
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    };

    expect(document).toStrictEqual(expectedDocument);
  });

  it('query with list variables', () => {
    type InputTypes = {
      String: string;
      Int: number;
      Boolean: number;
    };

    type SelectionType = SDKSelectionSet<{
      __typename?: true;
      user?: SDKSelectionSet<{
        id?: boolean;
        login?: boolean;
      }> & {
        [SDKFieldArgumentSymbol]: {
          id: string | never;
        };
      };
    }>;
    type ArgumentType = {
      user: {
        [SDKFieldArgumentSymbol]: {
          id: '[String]';
        };
      };
    };
    type ResultType = {
      __typename?: 'Query';
      user?: {
        id?: InputTypes['String'];
        login?: InputTypes['String'];
      };
    };

    const sdk = createSDK<InputTypes, SelectionType, ArgumentType, ResultType>();

    const document = sdk.query({
      name: 'UserById',
      variables: {
        idVariableName: '[String]',
      },
      selection: {
        user: {
          [sdk.arguments]: {
            id: 'idVariableName',
          },
          id: true,
        },
      },
    });

    const expectedDocument: DocumentNode = {
      kind: Kind.DOCUMENT,
      definitions: [
        {
          kind: Kind.OPERATION_DEFINITION,
          name: {
            kind: Kind.NAME,
            value: 'UserById',
          },
          operation: OperationTypeNode.QUERY,
          variableDefinitions: [
            {
              kind: Kind.VARIABLE_DEFINITION,
              type: {
                kind: Kind.LIST_TYPE,
                type: {
                  kind: Kind.NAMED_TYPE,
                  name: {
                    kind: Kind.NAME,
                    value: 'String',
                  },
                },
              },
              variable: {
                kind: Kind.VARIABLE,
                name: {
                  kind: Kind.NAME,
                  value: 'idVariableName',
                },
              },
            },
          ],
          selectionSet: {
            kind: Kind.SELECTION_SET,
            selections: [
              {
                kind: Kind.FIELD,
                name: {
                  kind: Kind.NAME,
                  value: 'user',
                },
                arguments: [
                  {
                    kind: Kind.ARGUMENT,
                    name: {
                      kind: Kind.NAME,
                      value: 'id',
                    },
                    value: {
                      kind: Kind.VARIABLE,
                      name: {
                        kind: Kind.NAME,
                        value: 'idVariableName',
                      },
                    },
                  },
                ],
                selectionSet: {
                  kind: Kind.SELECTION_SET,
                  selections: [
                    {
                      kind: Kind.FIELD,
                      name: {
                        kind: Kind.NAME,
                        value: 'id',
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    };

    expect(document).toStrictEqual(expectedDocument);
  });

  it('query with list variables (variance)', () => {
    type InputTypes = {
      String: string;
      Int: number;
      Boolean: number;
    };

    // this holds the selection set
    type QuerySelectionType = SDKSelectionSet<{
      __typename?: boolean;
      user?: SDKSelectionSet<{
        __typename?: boolean;
        id?: boolean;
        login?: boolean;
      }> & {
        [SDKFieldArgumentSymbol]: {
          id: string | never;
          number?: string | never;
        };
      };
    }>;

    // this holds the actual argument types
    type QueryArgumentType = {
      user: {
        [SDKFieldArgumentSymbol]: {
          id: '[String!]';
          number?: 'Int';
        };
      };
    };

    // this holds the result
    type QueryResultType = {
      __typename: 'Query';
      user: {
        __typename: 'User';
        id: InputTypes['String'];
        login: InputTypes['String'];
      } | null;
    };

    const sdk = createSDK<InputTypes, QuerySelectionType, QueryArgumentType, QueryResultType>();

    const document = sdk.query({
      name: 'UserById',
      variables: {
        idVariableName: '[String!]',
        a: 'Int',
      },
      selection: {
        user: {
          [sdk.arguments]: {
            id: 'idVariableName',
            number: 'a',
          },
          id: true,
        },
      },
    });

    expect(print(document)).toMatchInlineSnapshot(`
      "query UserById($idVariableName: [String!], $a: Int) {
        user(id: $idVariableName, number: $a) {
          id
        }
      }"
    `);

    const expectedDocument: DocumentNode = {
      kind: Kind.DOCUMENT,
      definitions: [
        {
          kind: Kind.OPERATION_DEFINITION,
          name: {
            kind: Kind.NAME,
            value: 'UserById',
          },
          operation: OperationTypeNode.QUERY,
          variableDefinitions: [
            {
              kind: Kind.VARIABLE_DEFINITION,
              type: {
                kind: Kind.LIST_TYPE,
                type: {
                  kind: Kind.NON_NULL_TYPE,
                  type: {
                    kind: Kind.NAMED_TYPE,
                    name: {
                      kind: Kind.NAME,
                      value: 'String',
                    },
                  },
                },
              },
              variable: {
                kind: Kind.VARIABLE,
                name: {
                  kind: Kind.NAME,
                  value: 'idVariableName',
                },
              },
            },
            {
              kind: Kind.VARIABLE_DEFINITION,
              type: {
                kind: Kind.NAMED_TYPE,
                name: {
                  kind: Kind.NAME,
                  value: 'Int',
                },
              },
              variable: {
                kind: Kind.VARIABLE,
                name: {
                  kind: Kind.NAME,
                  value: 'a',
                },
              },
            },
          ],
          selectionSet: {
            kind: Kind.SELECTION_SET,
            selections: [
              {
                kind: Kind.FIELD,
                name: {
                  kind: Kind.NAME,
                  value: 'user',
                },
                arguments: [
                  {
                    kind: Kind.ARGUMENT,
                    name: {
                      kind: Kind.NAME,
                      value: 'id',
                    },
                    value: {
                      kind: Kind.VARIABLE,
                      name: {
                        kind: Kind.NAME,
                        value: 'idVariableName',
                      },
                    },
                  },
                  {
                    kind: Kind.ARGUMENT,
                    name: {
                      kind: Kind.NAME,
                      value: 'number',
                    },
                    value: {
                      kind: Kind.VARIABLE,
                      name: {
                        kind: Kind.NAME,
                        value: 'a',
                      },
                    },
                  },
                ],
                selectionSet: {
                  kind: Kind.SELECTION_SET,
                  selections: [
                    {
                      kind: Kind.FIELD,
                      name: {
                        kind: Kind.NAME,
                        value: 'id',
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    };

    expect(document).toStrictEqual(expectedDocument);
  });

  it('query primitive field with variables', () => {
    type InputTypes = {
      String: string;
    };
    type GeneratedSDKSelectionSetHello = SDKSelectionSet<{
      __typename?: true;
      a?:
        | true
        | SDKSelectionSet<{
            [SDKFieldArgumentSymbol]?: {
              arg?: string | never;
            };
          }>;
    }>;
    type GeneratedSDKArgumentsHello = {
      a: GeneratedSDKArgumentsHello & {
        [SDKFieldArgumentSymbol]: {
          arg: 'String';
        };
      };
    };
    type GeneratedSDKResultHello = {
      a: InputTypes['String'];
    };

    const sdk = createSDK<
      InputTypes,
      GeneratedSDKSelectionSetHello,
      GeneratedSDKArgumentsHello,
      GeneratedSDKResultHello
    >();

    const document = sdk.query({
      name: 'Foo',
      variables: {
        myString: 'String',
      },
      selection: {
        a: {
          [sdk.arguments]: {
            arg: 'myString',
          },
        },
      },
    });

    expect(print(document)).toMatchInlineSnapshot(`
      "query Foo($myString: String) {
        a(arg: $myString)
      }"
    `);
  });

  it('union types', () => {
    type InputTypes = {
      String: string;
      ID: string;
      Boolean: number;
      Int: number;
    };

    type SelectionType = SDKSelectionSet<{
      __typename?: true;
      user?: SDKUnionSelectionSet<{
        '...User': SDKSelectionSet<{
          __typename?: boolean;
          id?: boolean;
          login?: boolean;
        }>;
        '...Error': SDKSelectionSet<{
          __typename?: true;
          reason?: boolean;
        }>;
      }> & {
        [SDKFieldArgumentSymbol]: {
          id: string | never;
          number?: string | never;
        };
      };
    }>;

    type ArgumentType = {
      user: {
        [SDKUnionResultSymbol]: true;
        [SDKFieldArgumentSymbol]: {
          id: 'ID!';
          number?: 'Int';
        };
      };
    };

    type ResultType = {
      __typename?: 'Query';
      user: {
        [SDKUnionResultSymbol]: true;
        User: {
          __typename: 'User';
          id: InputTypes['String'];
          login: InputTypes['String'];
        };
        Error: {
          __typename: 'Error';
          reason: InputTypes['String'];
        };
      };
    };

    const sdk = createSDK<InputTypes, SelectionType, ArgumentType, ResultType>();

    const document = sdk.query({
      name: 'Foo',
      variables: {
        id: 'ID!',
        someNumber: 'Int',
      },
      selection: {
        user: {
          [sdk.arguments]: {
            id: 'id',
            number: 'someNumber',
          },
          '...User': {
            __typename: true,
            id: true,
          },
          '...Error': {
            __typename: true,
            reason: true,
          },
        },
      },
    });

    expect(print(document)).toMatchInlineSnapshot(`
      "query Foo($id: ID!, $someNumber: Int) {
        user(id: $id, number: $someNumber) {
          ... on User {
            __typename
            id
          }
          ... on Error {
            __typename
            reason
          }
        }
      }"
    `);

    const expectedDocument: DocumentNode = {
      kind: Kind.DOCUMENT,
      definitions: [
        {
          kind: Kind.OPERATION_DEFINITION,
          operation: OperationTypeNode.QUERY,
          name: {
            kind: Kind.NAME,
            value: 'Foo',
          },
          variableDefinitions: [
            {
              kind: Kind.VARIABLE_DEFINITION,
              type: {
                kind: Kind.NON_NULL_TYPE,
                type: {
                  kind: Kind.NAMED_TYPE,
                  name: {
                    kind: Kind.NAME,
                    value: 'ID',
                  },
                },
              },
              variable: {
                kind: Kind.VARIABLE,
                name: {
                  kind: Kind.NAME,
                  value: 'id',
                },
              },
            },
            {
              kind: Kind.VARIABLE_DEFINITION,
              type: {
                kind: Kind.NAMED_TYPE,
                name: {
                  kind: Kind.NAME,
                  value: 'Int',
                },
              },
              variable: {
                kind: Kind.VARIABLE,
                name: {
                  kind: Kind.NAME,
                  value: 'someNumber',
                },
              },
            },
          ],
          selectionSet: {
            kind: Kind.SELECTION_SET,
            selections: [
              {
                kind: Kind.FIELD,
                name: {
                  kind: Kind.NAME,
                  value: 'user',
                },
                arguments: [
                  {
                    kind: Kind.ARGUMENT,
                    name: {
                      kind: Kind.NAME,
                      value: 'id',
                    },
                    value: {
                      kind: Kind.VARIABLE,
                      name: {
                        kind: Kind.NAME,
                        value: 'id',
                      },
                    },
                  },
                  {
                    kind: Kind.ARGUMENT,
                    name: {
                      kind: Kind.NAME,
                      value: 'number',
                    },
                    value: {
                      kind: Kind.VARIABLE,
                      name: {
                        kind: Kind.NAME,
                        value: 'someNumber',
                      },
                    },
                  },
                ],
                selectionSet: {
                  kind: Kind.SELECTION_SET,
                  selections: [
                    {
                      kind: Kind.INLINE_FRAGMENT,
                      typeCondition: {
                        kind: Kind.NAMED_TYPE,
                        name: {
                          kind: Kind.NAME,
                          value: 'User',
                        },
                      },
                      selectionSet: {
                        kind: Kind.SELECTION_SET,
                        selections: [
                          {
                            kind: Kind.FIELD,
                            name: {
                              kind: Kind.NAME,
                              value: '__typename',
                            },
                          },
                          {
                            kind: Kind.FIELD,
                            name: {
                              kind: Kind.NAME,
                              value: 'id',
                            },
                          },
                        ],
                      },
                    },
                    {
                      kind: Kind.INLINE_FRAGMENT,
                      typeCondition: {
                        kind: Kind.NAMED_TYPE,
                        name: {
                          kind: Kind.NAME,
                          value: 'Error',
                        },
                      },
                      selectionSet: {
                        kind: Kind.SELECTION_SET,
                        selections: [
                          {
                            kind: Kind.FIELD,
                            name: {
                              kind: Kind.NAME,
                              value: '__typename',
                            },
                          },
                          {
                            kind: Kind.FIELD,
                            name: {
                              kind: Kind.NAME,
                              value: 'reason',
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    };
    expect(document).toStrictEqual(expectedDocument);

    type OperationType = ReturnType<Exclude<typeof document['__apiType'], null | undefined>>;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    function api_test(value: OperationType) {
      value;
      if (value.user.__typename === 'User') {
        value.user.id;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        value.user.login;
      }

      if (value.user.__typename === 'Error') {
        value.user.__typename;
        value.user.reason;
      }
    }
  });
});
