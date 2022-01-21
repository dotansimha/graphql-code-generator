import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type {
  ArgumentNode,
  DocumentNode,
  FieldNode,
  Kind,
  ListTypeNode,
  NamedTypeNode,
  NonNullTypeNode,
  OperationTypeNode,
  SelectionNode,
  SelectionSetNode,
  TypeNode,
  VariableDefinitionNode,
} from 'graphql';
// IMPORTS END

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

type Impossible<K extends keyof any> = {
  [P in K]: never;
};

/** Do not allow any other properties as the ones defined in the base type. */
type NoExtraProperties<T, U extends T = T> = U & Impossible<Exclude<keyof U, keyof T>>;

/** Require at least one property in the object defined. */
type AtLeastOnePropertyOf<T> = {
  [K in keyof T]: { [L in K]-?: T[L] } & { [L in Exclude<keyof T, K>]?: T[L] };
}[keyof T];

/**
 * @source https://stackoverflow.com/a/56874389/4202031
 */
type KeysMatching<T extends { [key: string]: any }, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

type SDKSelection = { [key: string]: any };

type ResultType = { [key: string]: any };

type SDKOperationType<TSelection extends SDKSelection, TType extends ResultType> = {
  [TKey in keyof TSelection]: TKey extends keyof TType
    ? TType[TKey] extends Record<string, any>
      ? SDKOperationType<TSelection[TKey], TType[TKey]>
      : TType[TKey]
    : never;
};

export type SDKSelectionSet<TType extends Record<string, any> = any> = AtLeastOnePropertyOf<NoExtraProperties<TType>>;

type SDKInputTypeMap = { [inputTypeName: string]: any };

type SDKArgumentType<
  T_SDKInputTypeMap extends SDKInputTypeMap,
  T_VariableDefinitions extends SDKVariableDefinitions<T_SDKInputTypeMap>
> = { [T_VariableName in keyof T_VariableDefinitions]: T_SDKInputTypeMap[T_VariableDefinitions[T_VariableName]] };

type SDKSelectionTypedDocumentNode<
  T_Selection extends SDKSelection,
  T_ResultType extends ResultType,
  T_SDKInputTypeMap extends SDKInputTypeMap | void,
  T_VariableDefinitions extends SDKVariableDefinitions<
    T_SDKInputTypeMap extends void ? never : T_SDKInputTypeMap
  > | void
> = TypedDocumentNode<
  SDKOperationType<T_Selection, T_ResultType>,
  T_SDKInputTypeMap extends SDKInputTypeMap
    ? T_VariableDefinitions extends SDKVariableDefinitions<T_SDKInputTypeMap>
      ? SDKArgumentType<T_SDKInputTypeMap, T_VariableDefinitions>
      : never
    : never
>;

export const SDKFieldArgumentSymbol = Symbol('SDKFieldArguments');

type SDKInputNonNullType<T extends string> = `${T}!`;
type SDKInputListType<T extends string> = `[${T}]`;

/**
 * Poor mans implementation, this should actually be recursive as you could potentially indefinitely nest non nullable and list types...
 * Right now we only allow Type, [Type], [Type]!, [Type!] and [Type!]!
 */
type SDKInputContainerType<T extends string> =
  | T
  | SDKInputNonNullType<T>
  | SDKInputListType<T>
  | SDKInputNonNullType<SDKInputListType<T>>
  | SDKInputListType<SDKInputNonNullType<T>>
  | SDKInputNonNullType<SDKInputListType<SDKInputNonNullType<T>>>;

type SDKVariableDefinitions<TSDKInputTypeMap extends SDKInputTypeMap> = {
  [key: string]: SDKInputContainerType<Exclude<keyof TSDKInputTypeMap, number | symbol>>;
};

type SDKSelectionWithVariables<
  /** GraphQLTypeName -> TS type */
  T_SDKInputTypeMap extends SDKInputTypeMap,
  T_Type extends SDKSelectionSet,
  /** variableName -> GraphQLTypeName */
  T_VariableDefinitions extends SDKVariableDefinitions<T_SDKInputTypeMap> | void
> = {
  [U_FieldName in keyof T_Type]: U_FieldName extends typeof SDKFieldArgumentSymbol
    ? T_VariableDefinitions extends SDKVariableDefinitions<T_SDKInputTypeMap>
      ? {
          // From T_VariableDefinitions we want all keys whose value IS `T_Type[U_FieldName][V_ArgumentName]`
          [V_ArgumentName in keyof T_Type[U_FieldName] /* ArgumentType */]: KeysMatching<
            T_VariableDefinitions,
            T_Type[U_FieldName][V_ArgumentName]
          >;
        }
      : never
    : T_Type[U_FieldName] extends SDKSelectionSet
    ? SDKSelectionWithVariables<T_SDKInputTypeMap, T_Type[U_FieldName], T_VariableDefinitions>
    : T_Type[U_FieldName];
};

type SDK<
  T_SDKInputTypeMap extends SDKInputTypeMap,
  T_SDKQuerySelectionSet extends SDKSelectionSet,
  T_QueryResultType extends ResultType,
  T_SDKMutationSelectionSet extends SDKSelectionSet | void = void,
  T_MutationResultType extends ResultType | void = void,
  T_SDKSubscriptionSelectionSet extends SDKSelectionSet | void = void,
  T_SubscriptionResultType extends ResultType | void = void
> = {
  query<
    Q_VariableDefinitions extends SDKVariableDefinitions<T_SDKInputTypeMap> | void,
    Q_Selection extends T_SDKQuerySelectionSet
  >(
    args: (
      | {
          name: string;
          variables?: Q_VariableDefinitions;
        }
      | {
          name?: never;
          variables?: never;
        }
    ) & {
      selection: SDKSelectionWithVariables<T_SDKInputTypeMap, Q_Selection, Q_VariableDefinitions>;
    }
  ): SDKSelectionTypedDocumentNode<Q_Selection, T_QueryResultType, T_SDKInputTypeMap, Q_VariableDefinitions>;
} & (T_SDKMutationSelectionSet extends SDKSelectionSet
  ? T_MutationResultType extends ResultType
    ? {
        mutation<
          M_VariableDefinitions extends SDKVariableDefinitions<T_SDKInputTypeMap>,
          M_Selection extends T_SDKMutationSelectionSet
        >(
          args: (
            | {
                name: string;
                variables?: M_VariableDefinitions;
              }
            | {
                name?: never;
                variables?: never;
              }
          ) & {
            selection: SDKSelectionWithVariables<T_SDKInputTypeMap, M_Selection, M_VariableDefinitions>;
          }
        ): SDKSelectionTypedDocumentNode<M_Selection, T_MutationResultType, T_SDKInputTypeMap, M_VariableDefinitions>;
      }
    : {}
  : {}) &
  (T_SDKSubscriptionSelectionSet extends SDKSelectionSet
    ? T_SubscriptionResultType extends ResultType
      ? {
          subscription<
            S_VariableDefinitions extends SDKVariableDefinitions<T_SDKInputTypeMap>,
            S_Selection extends T_SDKSubscriptionSelectionSet
          >(
            args: (
              | {
                  name: string;
                  variables?: S_VariableDefinitions;
                }
              | {
                  name?: never;
                  variables?: never;
                }
            ) & {
              selection: SDKSelectionWithVariables<T_SDKInputTypeMap, S_Selection, S_VariableDefinitions>;
            }
          ): SDKSelectionTypedDocumentNode<
            S_Selection,
            T_SubscriptionResultType,
            T_SDKInputTypeMap,
            S_VariableDefinitions
          >;
        }
      : {}
    : {});

const getBaseDocument = (
  operation: 'query' | 'mutation' | 'subscription',
  name: string | undefined,
  variableDefinitions: Array<VariableDefinitionNode>,
  selectionSet: SelectionSetNode
): DocumentNode => ({
  kind: 'Document' as Kind.DOCUMENT,
  definitions: [
    {
      kind: 'OperationDefinition' as Kind.OPERATION_DEFINITION,
      name: name
        ? {
            kind: 'Name' as Kind.NAME,
            value: name,
          }
        : undefined,
      operation: operation as OperationTypeNode,
      variableDefinitions,
      selectionSet,
    },
  ],
});

const buildSelectionSet = (sdkSelectionSet: SDKSelectionSet): SelectionSetNode => {
  const selections: Array<SelectionNode> = [];

  for (const [fieldName, selectionValue] of Object.entries(sdkSelectionSet)) {
    const fieldNode: Mutable<FieldNode> = {
      kind: 'Field' as Kind.FIELD,
      name: {
        kind: 'Name' as Kind.NAME,
        value: fieldName,
      },
    };
    if (typeof selectionValue === 'object') {
      fieldNode.selectionSet = buildSelectionSet(selectionValue);

      if (SDKFieldArgumentSymbol in selectionValue) {
        const args: Array<ArgumentNode> = [];
        for (const [argumentName, variableName] of Object.entries(selectionValue[SDKFieldArgumentSymbol])) {
          if (typeof variableName !== 'string') {
            continue;
          }
          args.push({
            kind: 'Argument' as Kind.ARGUMENT,
            name: {
              kind: 'Name' as Kind.NAME,
              value: argumentName,
            },
            value: {
              kind: 'Variable' as Kind.VARIABLE,
              name: {
                kind: 'Name' as Kind.NAME,
                value: variableName,
              },
            },
          });
        }
        if (args.length) {
          fieldNode.arguments = args;
        }
      }
    }
    selections.push(fieldNode);
  }

  const selectionSet: SelectionSetNode = {
    kind: 'SelectionSet' as Kind.SELECTION_SET,
    selections,
  };

  return selectionSet;
};

/**
 * Poor mans GraphQL `parseType` (https://github.com/graphql/graphql-js/blob/a91fdc600f2012a60e44356c373e51c5dd20ba81/src/language/parser.ts#L157-L166)
 * But in a more compact way :)
 */
const buildTypeNode = (name: string): TypeNode => {
  let entry: Mutable<ListTypeNode | NonNullTypeNode>;
  let previous: Mutable<ListTypeNode | NonNullTypeNode>;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (name.endsWith('!')) {
      name = name.substring(0, name.length - 1);
      const current: NonNullTypeNode = {
        kind: 'NonNullType' as Kind.NON_NULL_TYPE,
        // Yeah... this is illegal - but we assign it in the next loop run
        type: null,
      };
      if (previous) {
        previous.type = current;
        previous = current;
      } else if (!entry) {
        entry = previous = current;
      }
      continue;
    }
    if (name.endsWith(']')) {
      name = name.substring(1, name.length - 1);
      const current: ListTypeNode = {
        kind: 'ListType' as Kind.LIST_TYPE,
        // Yeah... this is illegal - but we assign it in the next loop run
        type: null,
      };
      if (previous) {
        previous.type = current;
        previous = current;
      } else if (!entry) {
        entry = previous = current;
      }
      continue;
    }
    break;
  }

  const last: NamedTypeNode = {
    kind: 'NamedType' as Kind.NAMED_TYPE,
    name: {
      kind: 'Name' as Kind.NAME,
      value: name,
    },
  };

  if (entry === undefined) {
    return last;
  }

  previous.type = last;
  return entry;
};

const buildVariableDefinitions = (args: Record<string, string>): Array<VariableDefinitionNode> => {
  const variableDefinitions: Array<VariableDefinitionNode> = [];
  for (const [variableName, inputType] of Object.entries(args)) {
    variableDefinitions.push({
      kind: 'VariableDefinition' as Kind.VARIABLE_DEFINITION,
      variable: {
        kind: 'Variable' as Kind.VARIABLE,
        name: {
          kind: 'Name' as Kind.NAME,
          value: variableName,
        },
      },
      type: buildTypeNode(inputType),
    });
  }

  return variableDefinitions;
};

const sdkHandler =
  (operationType: 'query' | 'mutation' | 'subscription') =>
  (args: { name?: string; variables?: Record<string, string>; selection: SDKSelection }) => {
    const variableDefinitions = buildVariableDefinitions(args.variables ?? {});
    const selectionSet = buildSelectionSet(args.selection);

    const document = getBaseDocument(operationType, args.name, variableDefinitions, selectionSet);

    // type as any so the TypeScript compiler has less work to do :)
    return document as any;
  };

export function createSDK<
  T_SDKInputTypeMap extends SDKInputTypeMap,
  T_SDKQuerySelectionSet extends SDKSelectionSet,
  T_QueryResultType extends ResultType,
  T_SDKMutationSelectionSet extends SDKSelectionSet | void = void,
  T_MutationResultType extends ResultType | void = void,
  T_SDKSubscriptionSelectionSet extends SDKSelectionSet | void = void,
  T_SubscriptionResultType extends ResultType | void = void
>(): SDK<
  T_SDKInputTypeMap,
  T_SDKQuerySelectionSet,
  T_QueryResultType,
  T_SDKMutationSelectionSet,
  T_MutationResultType,
  T_SDKSubscriptionSelectionSet,
  T_SubscriptionResultType
> {
  return {
    query: sdkHandler('query'),
    mutation: sdkHandler('mutation'),
    subscription: sdkHandler('subscription'),
  } as any;
}
