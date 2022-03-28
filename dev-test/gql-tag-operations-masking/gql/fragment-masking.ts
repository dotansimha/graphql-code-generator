import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

export type FragmentType<TDocumentType extends DocumentNode<any, any>> = TDocumentType extends DocumentNode<
  infer TType,
  any
>
  ? TType extends { ' $fragmentName': infer TKey }
    ? TKey extends string
      ? { ' $fragmentRefs': { [key in TKey]: TType } }
      : never
    : never
  : never;

export function useFragment<TType>(
  _documentNode: DocumentNode<TType, any>,
  fragmentType: FragmentType<DocumentNode<TType, any>>
): TType {
  return fragmentType as any;
}
