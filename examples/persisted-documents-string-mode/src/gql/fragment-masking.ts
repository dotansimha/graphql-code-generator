/* eslint-disable */
import { ResultOf, DocumentTypeDecoration } from '@graphql-typed-document-node/core';
import { Incremental, TypedDocumentString } from './graphql';

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
  queryNode: TypedDocumentString<TQuery, any>,
  fragmentNode: TypedDocumentString<TFrag, any>,
  data: FragmentType<TypedDocumentString<Incremental<TFrag>, any>> | null | undefined
): data is FragmentType<typeof fragmentNode> {
  const deferredFields = queryNode.__meta__?.deferredFields as Record<string, (keyof TFrag)[]>;
  const fragName = fragmentNode.__meta__?.fragmentName as string | undefined;

  if (!deferredFields || !fragName) return true;

  const fields = deferredFields[fragName] ?? [];
  return fields.length > 0 && fields.every((field: keyof TFrag) => data && field in data);
}
