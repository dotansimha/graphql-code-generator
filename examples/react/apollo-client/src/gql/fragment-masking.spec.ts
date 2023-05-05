import { expectTypeOf } from 'expect-type';
import type { ResultOf } from '@graphql-typed-document-node/core';

import type { UnmaskFragmentType, UnmaskResultOf } from './fragment-masking';
import { AllFilmsWithVariablesQueryDocument, type FilmItemFragment } from './graphql';

type FilmProducersFragment = {
  __typename?: 'Film';
  id: string;
  producers?: Array<string | null> | null;
} & { ' $fragmentName'?: 'FilmProducersFragment' };

// Single fragment reference to resolve
type FilmItemWithProducersFragment = {
  __typename?: 'Film';
  id: string;
  title?: string | null;
} & {
  ' $fragmentRefs'?: { FilmProducersFragment: FilmProducersFragment };
} & { ' $fragmentName'?: 'FilmItemWithProducersFragment' };

type FilmDirectorFragment = {
  __typename?: 'Film';
  director?: string | null;
} & { ' $fragmentName'?: 'FilmDirectorFragment' };

// Multiple embedded fragment references to resolve
type FullFilmItemFragment = {
  __typename?: 'Film';
  releaseDate?: string | null;
} & {
  ' $fragmentRefs'?: {
    FilmItemWithProducersFragment: FilmItemWithProducersFragment;
    FilmDirectorFragment: FilmDirectorFragment;
  };
} & { ' $fragmentName'?: 'FullFilmItemFragment' };

describe('Fragment Masking', () => {
  it('should return masked fragment for FilmItemWithProducersFragment', () => {
    type MaskedDataTest = FilmItemWithProducersFragment;
    type ExpectedMaskedData = {
      __typename?: 'Film' | undefined;
      id: string;
      title?: string | null | undefined;
    } & {
      ' $fragmentRefs'?:
        | {
            FilmProducersFragment: FilmProducersFragment;
          }
        | undefined;
    } & {
      ' $fragmentName'?: 'FilmItemWithProducersFragment' | undefined;
    };

    expectTypeOf<MaskedDataTest>().toEqualTypeOf<ExpectedMaskedData>();
    // The following tests should be caught early by `toEqualTypeOf`,
    // but just to make explicit what we're expecting:
    expectTypeOf<MaskedDataTest>().toHaveProperty(' $fragmentRefs');
    expectTypeOf<MaskedDataTest>().not.toHaveProperty('producers');
  });

  it('should return masked fragments for AllFilmsWithVariablesQueryDocument', () => {
    type MaskedDataTest = ResultOf<typeof AllFilmsWithVariablesQueryDocument>;
    type ExpectedMaskedData = {
      __typename?: 'Root' | undefined;
      allFilms?:
        | {
            __typename?: 'FilmsConnection' | undefined;
            edges?:
              | ({
                  __typename?: 'FilmsEdge' | undefined;
                  node?:
                    | ({ __typename?: 'Film' } & { ' $fragmentRefs'?: { FilmItemFragment: FilmItemFragment } })
                    | null
                    | undefined;
                } | null)[]
              | null
              | undefined;
          }
        | null
        | undefined;
    };

    expectTypeOf<MaskedDataTest>().toEqualTypeOf<ExpectedMaskedData>();
  });

  describe('UnmaskFragmentType', () => {
    it('should unmask FilmItemWithProducersFragment (single fragment reference to resolve)', () => {
      type UnmaskedDataTest = UnmaskFragmentType<FilmItemWithProducersFragment>;
      type ExpectedUnmaskedData = {
        __typename?: 'Film' | undefined;
        id: string;
        title?: string | null | undefined;
        producers?: (string | null)[] | null | undefined;
      };

      expectTypeOf<UnmaskedDataTest>().toEqualTypeOf<ExpectedUnmaskedData>();
      // The following tests should be caught early by `toEqualTypeOf`,
      // but just to make explicit what we're expecting:
      expectTypeOf<UnmaskedDataTest>().not.toHaveProperty(' $fragmentRefs');
      expectTypeOf<UnmaskedDataTest>().toHaveProperty('producers');
    });
    it('should unmask FullFilmItemFragment (multiple embedded fragment references to resolve)', () => {
      type UnmaskedDataTest = UnmaskFragmentType<FullFilmItemFragment>;
      type ExpectedUnmaskedData = {
        __typename?: 'Film' | undefined;
        id: string;
        title?: string | null | undefined;
        releaseDate?: string | null | undefined;
        director?: string | null | undefined;
        producers?: (string | null)[] | null | undefined;
      };

      expectTypeOf<UnmaskedDataTest>().toEqualTypeOf<ExpectedUnmaskedData>();
      // The following tests should be caught early by `toEqualTypeOf`,
      // but just to make explicit what we're expecting:
      expectTypeOf<UnmaskedDataTest>().not.toHaveProperty(' $fragmentRefs');
      expectTypeOf<UnmaskedDataTest>().toHaveProperty('releaseDate');
      expectTypeOf<UnmaskedDataTest>().toHaveProperty('director');
      expectTypeOf<UnmaskedDataTest>().toHaveProperty('producers');
    });
  });

  describe('UnmaskResultOf', () => {
    it('should unmask result of AllFilmsWithVariablesQueryDocument', () => {
      type UnmaskedDataTest = UnmaskResultOf<typeof AllFilmsWithVariablesQueryDocument>;
      type ExpectedUnmaskedData = {
        __typename?: 'Root' | undefined;
        allFilms?:
          | {
              __typename?: 'FilmsConnection' | undefined;
              edges?:
                | ({
                    __typename?: 'FilmsEdge' | undefined;
                    node?:
                      | {
                          __typename?: 'Film' | undefined;
                          id: string;
                          title?: string | null | undefined;
                          producers?: (string | null)[] | null | undefined;
                          releaseDate?: string | null | undefined;
                        }
                      | null
                      | undefined;
                  } | null)[]
                | null
                | undefined;
            }
          | null
          | undefined;
      };

      expectTypeOf<UnmaskedDataTest>().toEqualTypeOf<ExpectedUnmaskedData>();
    });
  });
});
