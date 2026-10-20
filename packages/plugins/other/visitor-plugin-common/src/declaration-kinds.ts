import { DeclarationKind, DeclarationKindConfig } from './types.js';

export type NormalizedDeclarationKindConfig = Required<DeclarationKindConfig>;

export const DEFAULT_DECLARATION_KINDS: NormalizedDeclarationKindConfig = {
  directive: 'type',
  scalar: 'type',
  input: 'type',
  type: 'type',
  interface: 'type',
  arguments: 'type',
};

export function normalizeDeclarationKind(
  declarationKind?: DeclarationKind | DeclarationKindConfig,
): NormalizedDeclarationKindConfig {
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
