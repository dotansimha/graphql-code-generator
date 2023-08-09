import { ResultOf, DocumentTypeDecoration } from '@graphql-typed-document-node/core';
import { Incremental, TypedDocumentString } from './graphql';

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
type ValuesOf<T> = T[keyof T];
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export type FragmentType<TDocumentType extends DocumentTypeDecoration<any, any>> =
  TDocumentType extends DocumentTypeDecoration<infer TType, any>
    ? [TType] extends [{ ' $fragmentName'?: infer TKey }]
      ? TKey extends string
        ? { ' $fragmentRefs'?: { [key in TKey]: TType } }
        : never
      : never
    : never;

// return non-nullable if `fragmentType` is non-nullable
export function useFragment<TType>(
  _documentNode: DocumentTypeDecoration<TType, any>,
  fragmentType: FragmentType<DocumentTypeDecoration<TType, any>>
): TType;
// return nullable if `fragmentType` is nullable
export function useFragment<TType>(
  _documentNode: DocumentTypeDecoration<TType, any>,
  fragmentType: FragmentType<DocumentTypeDecoration<TType, any>> | null | undefined
): TType | null | undefined;
// return array of non-nullable if `fragmentType` is array of non-nullable
export function useFragment<TType>(
  _documentNode: DocumentTypeDecoration<TType, any>,
  fragmentType: ReadonlyArray<FragmentType<DocumentTypeDecoration<TType, any>>>
): ReadonlyArray<TType>;
// return array of nullable if `fragmentType` is array of nullable
export function useFragment<TType>(
  _documentNode: DocumentTypeDecoration<TType, any>,
  fragmentType: ReadonlyArray<FragmentType<DocumentTypeDecoration<TType, any>>> | null | undefined
): ReadonlyArray<TType> | null | undefined;
export function useFragment<TType>(
  _documentNode: DocumentTypeDecoration<TType, any>,
  fragmentType:
    | FragmentType<DocumentTypeDecoration<TType, any>>
    | ReadonlyArray<FragmentType<DocumentTypeDecoration<TType, any>>>
    | null
    | undefined
): TType | ReadonlyArray<TType> | null | undefined {
  return fragmentType as any;
}

export function makeFragmentData<F extends DocumentTypeDecoration<any, any>, FT extends ResultOf<F>>(
  data: FT,
  _fragment: F
): FragmentType<F> {
  return data as FragmentType<F>;
}

/**
 * Helper for unmasking a fragment type.
 *
 * @example
 *
 * ```ts
 * type FilmProducersFragment = {
 *   __typename?: 'Film';
 *   id: string;
 *   producers?: Array<string | null> | null;
 * } & { ' $fragmentName'?: 'FilmProducersFragment' };
 *
 * type FilmItemFragment = {
 *   __typename?: 'Film';
 *   id: string;
 *   title?: string | null;
 * } & {
 *   ' $fragmentRefs'?: { FilmProducersFragment: FilmProducersFragment };
 * } & { ' $fragmentName'?: 'FilmItemFragment' };
 *
 * // Fragment references are all inlined rather than referring to ` $fragmentRefs`.
 * type UnmaskedData = UnmaskFragmentType<FilmItemFragment>;
 * //   ^? type UnmaskedData = {
 * //      __typename?: "Film" | undefined;
 * //      id: string;
 * //      title?: string | null | undefined;
 * //      producers?: (string | null)[] | null | undefined;
 * //    }
 * ```
 */
export type UnmaskFragmentType<TType> = TType extends { ' $fragmentRefs'?: infer TRefs }
  ? Prettify<
      UnmaskFragmentType<
        Omit<TType, ' $fragmentRefs' | ' $fragmentName'> & Omit<UnionToIntersection<ValuesOf<TRefs>>, ' $fragmentName'>
      >
    >
  : TType extends { [K in keyof TType]: any }
  ? { [K in keyof TType]: UnmaskFragmentType<TType[K]> }
  : never;

/**
 * Helper for unmasking the result of a GraphQL document (`DocumentType`).
 *
 * @example
 *
 * ```ts
 * const FilmItemFragment = graphql(`
 *   fragment FilmItem on Film {
 *     id
 *     title
 *   }
 * `);
 *
 * const myQuery = graphql(`
 *   query Films {
 *     allFilms {
 *       films {
 *         ...FilmItem
 *       }
 *     }
 *   }
 * `); // DocumentTypeDecoration<R, V>
 *
 * // Fragment references are all inlined rather than referring to ` $fragmentRefs`.
 * type UnmaskedData = UnmaskResultOf<typeof myQuery>;
 * //   ^? type UnmaskedData = {
 * //        __typename: 'Root' | undefined,
 * //        allFilms: {
 * //          films: {
 * //            __typename?: "Film" | undefined;
 * //            id: string;
 * //            title?: string | null | undefined;
 * //          }[] | null | undefined
 * //        } | null | undefined
 * //      }
 * ```
 */
export type UnmaskResultOf<TDocumentType extends DocumentTypeDecoration<any, any>> =
  TDocumentType extends DocumentTypeDecoration<infer TType, any> ? UnmaskFragmentType<TType> : never;
export function isFragmentReady<TQuery, TFrag>(
  queryNode: TypedDocumentString<TQuery, any>,
  fragmentNode: TypedDocumentString<TFrag, any>,
  data: FragmentType<TypedDocumentString<Incremental<TFrag>, any>> | null | undefined
): data is FragmentType<typeof fragmentNode> {
  const deferredFields = queryNode.__meta__?.deferredFields as Record<string, (keyof TFrag)[]>;
  const fragName = fragmentNode.__meta__?.fragmentName as string | undefined;

  if (!deferredFields || !fragName) return true;

  const fields = deferredFields[fragName] ?? [];
  return fields.length > 0 && fields.every(field => data && field in data);
}
