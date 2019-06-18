import { DeclarationKindConfig, DeclarationKind } from './types';

export const DEFAULT_DECLARATION_KINDS: DeclarationKindConfig = {
  scalar: 'type',
  input: 'type',
  union: 'type',
  type: 'type',
  interface: 'type',
  arguments: 'type',
};

export function normalizeDeclarationKind(declarationKind?: DeclarationKind | DeclarationKindConfig): DeclarationKindConfig {
  if (typeof declarationKind === 'string') {
    return {
      scalar: declarationKind,
      input: declarationKind,
      union: declarationKind,
      type: declarationKind,
      interface: declarationKind,
      arguments: declarationKind,
    };
  }

  return {
    ...DEFAULT_DECLARATION_KINDS,
    ...declarationKind,
  };
}
