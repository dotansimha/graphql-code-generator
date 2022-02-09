import { DocumentNode, Kind, OperationTypeNode } from 'graphql';
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
      {},
      SDKSelectionSet<{
        __typename?: true;
      }>,
      {
        __typename?: 'Query';
      }
    >();
    const operation = sdk.query({
      selection: {
        __typename: true,
      },
    });

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
      {},
      SDKSelectionSet<{
        __typename?: true;
      }>,
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
      {},
      SDKSelectionSet<{
        __typename?: true;
        foo?: {
          a?: true;
        };
      }>,
      {
        __typename?: 'Query';
        foo?: {
          a?: boolean;
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
      name: 'AJSDGAJKSDHG',
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
          id: '[String!]!';
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
        idVariableName: '[String!]!',
        a: 'Int',
      },
      selection: {
        __typename: true,
        user: {
          [sdk.arguments]: {
            id: 'idVariableName',
          },
          __typename: true,
          id: true,
          login: true,
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
        User: SDKSelectionSet<{
          __typename?: true;
          id?: boolean;
          login?: boolean;
        }>;
        Error: SDKSelectionSet<{
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
          id?: InputTypes['String'];
          login?: InputTypes['String'];
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
          User: {
            __typename: true,
            id: true,
            login: true,
          },
          Error: {
            __typename: true,
            reason: true,
          },
        },
      },
    });

    const expectedDocument: DocumentNode = {
      kind: Kind.DOCUMENT,
      definitions: [],
    };

    expect(document).toStrictEqual(expectedDocument);
  });
});
