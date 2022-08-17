import { DeclarationKindConfig, DeclarationKind } from './types.js';

export const DEFAULT_DECLARATION_KINDS: DeclarationKindConfig = {
  directive: 'type',
  scalar: 'type',
  input: 'type',
  type: 'type',
  interface: 'type',
  arguments: 'type',
};

export function normalizeDeclarationKind(
  declarationKind?: DeclarationKind | DeclarationKindConfig
): DeclarationKindConfig {
  if (typeof declarationKind === 'string') {
    return {
      directive: declarationKind,
      scalar: declarationKind,
      input: declarationKind,
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
