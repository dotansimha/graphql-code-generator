/* eslint-disable */
import type { ResultOf, DocumentTypeDecoration, TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { FragmentDefinitionNode } from 'graphql';
import type { Incremental } from './graphql';

export type FragmentType<TDocumentType extends DocumentTypeDecoration<any, any>> =
  TDocumentType extends DocumentTypeDecoration<infer TType, any>
    ? [TType] extends [{ ' $fragmentName'?: infer TKey }]
      ? TKey extends string
        ? { ' $fragmentRefs'?: { [key in TKey]: TType } }
        : never
      : never
    : never;

// return non-nullable if `fragmentType` is non-nullable
export function useFragment<F extends DocumentTypeDecoration<any, any>>(
  _documentNode: F,
  fragmentType: FragmentType<F>
): ResultOf<F>;
// return nullable if `fragmentType` is undefined
export function useFragment<F extends DocumentTypeDecoration<any, any>>(
  _documentNode: F,
  fragmentType: FragmentType<F> | undefined
): ResultOf<F> | undefined;
// return nullable if `fragmentType` is nullable
export function useFragment<F extends DocumentTypeDecoration<any, any>>(
  _documentNode: F,
  fragmentType: FragmentType<F> | null
): ResultOf<F> | null;
// return nullable if `fragmentType` is nullable or undefined
export function useFragment<F extends DocumentTypeDecoration<any, any>>(
  _documentNode: F,
  fragmentType: FragmentType<F> | null | undefined
): ResultOf<F> | null | undefined;
// return array of non-nullable if `fragmentType` is array of non-nullable
export function useFragment<F extends DocumentTypeDecoration<any, any>>(
  _documentNode: F,
  fragmentType: ReadonlyArray<FragmentType<F>>
): ReadonlyArray<ResultOf<F>>;
// return array of nullable if `fragmentType` is array of nullable
export function useFragment<F extends DocumentTypeDecoration<any, any>>(
  _documentNode: F,
  fragmentType: ReadonlyArray<FragmentType<F>> | null | undefined
): ReadonlyArray<ResultOf<F>> | null | undefined;
export function useFragment<F extends DocumentTypeDecoration<any, any>>(
  _documentNode: F,
  fragmentType: FragmentType<F> | ReadonlyArray<FragmentType<F>> | null | undefined
): ResultOf<F> | ReadonlyArray<ResultOf<F>> | null | undefined {
  return fragmentType as any;
}

export function makeFragmentData<F extends DocumentTypeDecoration<any, any>, FT extends ResultOf<F>>(
  data: FT,
  _fragment: F
): FragmentType<F> {
  return data as FragmentType<F>;
}
export function isFragmentReady<TQuery, TFrag>(
  queryNode: DocumentTypeDecoration<TQuery, any>,
  fragmentNode: TypedDocumentNode<TFrag>,
  data: FragmentType<TypedDocumentNode<Incremental<TFrag>, any>> | null | undefined
): data is FragmentType<typeof fragmentNode> {
  const deferredFields = (queryNode as { __meta__?: { deferredFields: Record<string, (keyof TFrag)[]> } }).__meta__
    ?.deferredFields;

  if (!deferredFields) return true;

  const fragDef = fragmentNode.definitions[0] as FragmentDefinitionNode | undefined;
  const fragName = fragDef?.name?.value;

  const fields = (fragName && deferredFields[fragName]) || [];
  return fields.length > 0 && fields.every((field: keyof TFrag) => data && field in data);
}
