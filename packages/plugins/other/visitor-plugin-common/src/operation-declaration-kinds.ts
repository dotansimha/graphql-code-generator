export type OperationDeclarationKind = 'type' | 'interface';

export type OperationDeclarationKindConfig = {
  input: OperationDeclarationKind;
  result: OperationDeclarationKind; // Query, Mutation, Subscription
};

const DEFAULT_OPERATION_DECLARATION_KINDS: OperationDeclarationKindConfig = {
  input: 'type',
  result: 'type',
};

export function normalizeOperationDeclarationKind(
  declarationKind: OperationDeclarationKind | Partial<OperationDeclarationKindConfig>
): OperationDeclarationKindConfig {
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
