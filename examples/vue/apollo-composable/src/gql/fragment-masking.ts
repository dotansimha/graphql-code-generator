import type { ResultOf, TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import type { FragmentDefinitionNode } from 'graphql';

export type FragmentName<TDocumentType extends DocumentNode<any, any>> = TDocumentType extends DocumentNode<
  infer TType,
  any
>
  ? TType extends { ' $fragmentName'?: infer TKey }
    ? TKey
    : never
  : never;

export type FragmentType<TDocumentType extends DocumentNode<any, any>> = TDocumentType extends DocumentNode<
  infer TType,
  any
>
  ? FragmentName<TDocumentType> extends string
    ? { ' $fragmentRefs'?: { [key in FragmentName<TDocumentType>]: TType } }
    : never
  : never;

// return non-nullable if `fragmentType` is non-nullable
export function useFragment<TType>(
  _documentNode: DocumentNode<TType, any>,
  fragmentType: FragmentType<DocumentNode<TType, any>>
): TType;
// return nullable if `fragmentType` is nullable
export function useFragment<TType>(
  _documentNode: DocumentNode<TType, any>,
  fragmentType: FragmentType<DocumentNode<TType, any>> | null | undefined
): TType | null | undefined;
// return array of non-nullable if `fragmentType` is array of non-nullable
export function useFragment<TType>(
  _documentNode: DocumentNode<TType, any>,
  fragmentType: ReadonlyArray<FragmentType<DocumentNode<TType, any>>>
): ReadonlyArray<TType>;
// return array of nullable if `fragmentType` is array of nullable
export function useFragment<TType>(
  _documentNode: DocumentNode<TType, any>,
  fragmentType: ReadonlyArray<FragmentType<DocumentNode<TType, any>>> | null | undefined
): ReadonlyArray<TType> | null | undefined;
export function useFragment<TType>(
  _documentNode: DocumentNode<TType, any>,
  fragmentType:
    | FragmentType<DocumentNode<TType, any>>
    | ReadonlyArray<FragmentType<DocumentNode<TType, any>>>
    | null
    | undefined
): TType | ReadonlyArray<TType> | null | undefined {
  return fragmentType as any;
}

export function makeFragmentData<F extends DocumentNode, FT extends ResultOf<F>>(
  data: FT,
  _fragment: F
): FragmentType<F> {
  return data as FragmentType<F>;
}

export function getFragmentName<TType>(doc: DocumentNode<TType>): FragmentName<DocumentNode<TType, any>> {
  const fragmentName = doc.definitions
    .filter((definition): definition is FragmentDefinitionNode => definition.kind === 'FragmentDefinition')
    .map(definition => definition.name.value as FragmentName<DocumentNode<TType, any>>)[0];

  if (!fragmentName) {
    throw new Error(`Could not find a fragment name for the provided document: ${doc}`);
  }

  return fragmentName;
}
