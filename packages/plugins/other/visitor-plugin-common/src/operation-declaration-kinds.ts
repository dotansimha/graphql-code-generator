export type OperationDeclarationKind = 'type' | 'interface';

export type OperationDeclarationKindConfig = {
  input?: OperationDeclarationKind;
  result?: OperationDeclarationKind; // Query, Mutation, Subscription
};

export type NormalizedOperationDeclarationKindConfig = Required<OperationDeclarationKindConfig>;

const DEFAULT_OPERATION_DECLARATION_KINDS: NormalizedOperationDeclarationKindConfig = {
  input: 'type',
  result: 'type',
};

export function normalizeOperationDeclarationKind(
  declarationKind: OperationDeclarationKind | OperationDeclarationKindConfig,
): NormalizedOperationDeclarationKindConfig {
  if (typeof declarationKind === 'string') {
    return {
      input: declarationKind,
      result: declarationKind,
    };
  }

  return {
    ...DEFAULT_OPERATION_DECLARATION_KINDS,
    ...declarationKind,
  };
}
