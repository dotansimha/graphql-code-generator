import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type {
  ArgumentNode,
  DocumentNode,
  FieldNode,
  Kind,
  OperationTypeNode,
  SelectionNode,
  SelectionSetNode,
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

type SDKSelection = { [key: string]: any };

type ResultType = { [key: string]: any };

type SDKOperationType<TSelection extends SDKSelection, TType extends ResultType> = {
  [TKey in keyof TSelection]: TKey extends keyof TType
    ? TType[TKey] extends Record<string, any>
      ? SDKOperationType<TSelection[TKey], TType[TKey]>
      : TType[TKey]
    : never;
};

type InternalSDKSelectionSet = Record<string, any>;

export type SDKSelectionSet<TType extends Record<string, any> = any> = AtLeastOnePropertyOf<NoExtraProperties<TType>>;

type SDKArgumentType<TSelection extends SDKSelection> = {}; // TODO IMPLEMENT

type SDKSelectionTypedDocumentNode<TSelection extends SDKSelection, TResultType extends ResultType> = TypedDocumentNode<
  SDKOperationType<TSelection, TResultType>,
  SDKArgumentType<TSelection>
>;

export const SDKFieldArgumentSymbol = Symbol('SDKFieldArguments');

type SDKVariableDefinitions<TInputTypes extends string = any> = { [key: string]: TInputTypes };

type SDK<
  SDKInputTypes extends string,
  SDKQuerySelectionSet extends SDKSelectionSet,
  QueryResultType extends ResultType,
  SDKMutationSelectionSet extends SDKSelectionSet | void = void,
  MutationResultType extends ResultType | void = void,
  SDKSubscriptionSelectionSet extends SDKSelectionSet | void = void,
  SubscriptionResultType extends ResultType | void = void
> = {
  query<TSelection extends SDKQuerySelectionSet, TVariableDefinitions extends SDKVariableDefinitions<SDKInputTypes>>(
    args: (
      | {
          name: string;
          variables?: TVariableDefinitions;
        }
      | {
          name?: never;
          variables?: never;
        }
    ) & {
      selection: TSelection;
    }
  ): SDKSelectionTypedDocumentNode<TSelection, QueryResultType>;
} & (SDKMutationSelectionSet extends SDKSelectionSet
  ? MutationResultType extends ResultType
    ? {
        mutation<
          TSelection extends SDKMutationSelectionSet,
          TVariableDefinitions extends SDKVariableDefinitions<SDKInputTypes>
        >(
          args: (
            | {
                name: string;
                variables?: TVariableDefinitions;
              }
            | {
                name?: never;
                variables?: never;
              }
          ) & {
            selection: TSelection;
          }
        ): SDKSelectionTypedDocumentNode<TSelection, MutationResultType>;
      }
    : {}
  : {}) &
  (SDKSubscriptionSelectionSet extends SDKSelectionSet
    ? SubscriptionResultType extends ResultType
      ? {
          subscription<
            TSelection extends SDKSubscriptionSelectionSet,
            TVariableDefinitions extends SDKVariableDefinitions<SDKInputTypes>
          >(
            args: (
              | {
                  name: string;
                  variables?: TVariableDefinitions;
                }
              | {
                  name?: never;
                  variables?: never;
                }
            ) & {
              selection: TSelection;
            }
          ): SDKSelectionTypedDocumentNode<TSelection, SubscriptionResultType>;
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

const buildSelectionSet = (sdkSelectionSet: InternalSDKSelectionSet): SelectionSetNode => {
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
      type: {
        // TODO: ! (non-null) and [] (list) handling
        kind: 'NamedType' as Kind.NAMED_TYPE,
        name: {
          kind: 'Name' as Kind.NAME,
          value: inputType,
        },
      },
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
  SDKInputTypes extends string,
  SDKQuerySelectionSet extends SDKSelectionSet,
  QueryResultType extends ResultType,
  SDKMutationSelectionSet extends SDKSelectionSet | void = void,
  MutationResultType extends ResultType | void = void,
  SDKSubscriptionSelectionSet extends SDKSelectionSet | void = void,
  SubscriptionResultType extends ResultType | void = void
>(): SDK<
  SDKInputTypes,
  SDKQuerySelectionSet,
  QueryResultType,
  SDKMutationSelectionSet,
  MutationResultType,
  SDKSubscriptionSelectionSet,
  SubscriptionResultType
> {
  return {
    query: sdkHandler('query'),
    mutation: sdkHandler('mutation'),
    subscription: sdkHandler('subscription'),
  } as any;
}
