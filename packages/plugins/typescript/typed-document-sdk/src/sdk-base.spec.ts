import { DocumentNode, Kind, OperationTypeNode } from 'graphql';
import { createSDK, SDKFieldArgumentSymbol, SDKSelectionSet } from './sdk-base';

describe('SDKLogic', () => {
  it('anonymous query operation', () => {
    const sdk = createSDK<
      string,
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
      string,
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
    type ResultType = {
      __typename?: 'Query';
    };

    const sdk = createSDK<string, SelectionType, ResultType, SelectionType, ResultType>();
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
    type ResultType = {
      __typename?: 'Query';
    };

    const sdk = createSDK<string, SelectionType, ResultType, SelectionType, ResultType, SelectionType, ResultType>();
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
      string,
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

  it('query with variables', () => {
    type SelectionType = SDKSelectionSet<{
      __typename?: true;
      user?: SDKSelectionSet<{
        id?: boolean;
      }> & {
        [SDKFieldArgumentSymbol]?: {
          id?: 'String';
        };
      };
    }>;
    type ResultType = {
      __typename?: 'Query';
    };
    type InputTypes = 'String' | 'Int' | 'Boolean';

    const sdk = createSDK<InputTypes, SelectionType, ResultType>();

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
});
