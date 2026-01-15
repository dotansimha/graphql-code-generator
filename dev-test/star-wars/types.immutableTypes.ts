type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** The episodes in the Star Wars trilogy */
export type Episode =
  /** Star Wars Episode V: The Empire Strikes Back, released in 1980. */
  | 'EMPIRE'
  /** Star Wars Episode VI: Return of the Jedi, released in 1983. */
  | 'JEDI'
  /** Star Wars Episode IV: A New Hope, released in 1977. */
  | 'NEWHOPE';

export type CreateReviewForEpisodeMutationVariables = Exact<{
  episode: Episode;
  review: ReviewInput;
}>;

export type CreateReviewForEpisodeMutation = {
  readonly createReview: { readonly stars: number; readonly commentary: string | null } | null;
};

export type ExcludeQueryAlphaQueryVariables = Exact<{
  episode?: Episode | null | undefined;
}>;

export type ExcludeQueryAlphaQuery = { readonly hero: { readonly name: string } | { readonly name: string } | null };

export type ExcludeQueryBetaQueryVariables = Exact<{
  episode?: Episode | null | undefined;
}>;

export type ExcludeQueryBetaQuery = { readonly hero: { readonly name: string } | { readonly name: string } | null };

export type HeroAndFriendsNamesQueryVariables = Exact<{
  episode?: Episode | null | undefined;
}>;

export type HeroAndFriendsNamesQuery = {
  readonly hero:
    | {
        readonly name: string;
        readonly friends: ReadonlyArray<{ readonly name: string } | { readonly name: string } | null> | null;
      }
    | {
        readonly name: string;
        readonly friends: ReadonlyArray<{ readonly name: string } | { readonly name: string } | null> | null;
      }
    | null;
};

export type HeroAppearsInQueryVariables = Exact<{ [key: string]: never }>;

export type HeroAppearsInQuery = {
  readonly hero:
    | { readonly name: string; readonly appearsIn: ReadonlyArray<Episode | null> }
    | { readonly name: string; readonly appearsIn: ReadonlyArray<Episode | null> }
    | null;
};

export type HeroDetailsQueryVariables = Exact<{
  episode?: Episode | null | undefined;
}>;

export type HeroDetailsQuery = {
  readonly hero:
    | { readonly primaryFunction: string | null; readonly name: string }
    | { readonly height: number | null; readonly name: string }
    | null;
};

type HeroDetails_Droid_Fragment = { readonly primaryFunction: string | null; readonly name: string };

type HeroDetails_Human_Fragment = { readonly height: number | null; readonly name: string };

export type HeroDetailsFragment = HeroDetails_Droid_Fragment | HeroDetails_Human_Fragment;

export type HeroDetailsWithFragmentQueryVariables = Exact<{
  episode?: Episode | null | undefined;
}>;

export type HeroDetailsWithFragmentQuery = {
  readonly hero:
    | { readonly primaryFunction: string | null; readonly name: string }
    | { readonly height: number | null; readonly name: string }
    | null;
};

export type HeroNameQueryVariables = Exact<{
  episode?: Episode | null | undefined;
}>;

export type HeroNameQuery = { readonly hero: { readonly name: string } | { readonly name: string } | null };

export type HeroNameConditionalInclusionQueryVariables = Exact<{
  episode?: Episode | null | undefined;
  includeName: boolean;
}>;

export type HeroNameConditionalInclusionQuery = {
  readonly hero: { readonly name?: string } | { readonly name?: string } | null;
};

export type HeroNameConditionalExclusionQueryVariables = Exact<{
  episode?: Episode | null | undefined;
  skipName: boolean;
}>;

export type HeroNameConditionalExclusionQuery = {
  readonly hero: { readonly name?: string } | { readonly name?: string } | null;
};

export type HeroParentTypeDependentFieldQueryVariables = Exact<{
  episode?: Episode | null | undefined;
}>;

export type HeroParentTypeDependentFieldQuery = {
  readonly hero:
    | {
        readonly name: string;
        readonly friends: ReadonlyArray<
          { readonly name: string } | { readonly height: number | null; readonly name: string } | null
        > | null;
      }
    | {
        readonly name: string;
        readonly friends: ReadonlyArray<
          { readonly name: string } | { readonly height: number | null; readonly name: string } | null
        > | null;
      }
    | null;
};

export type HeroTypeDependentAliasedFieldQueryVariables = Exact<{
  episode?: Episode | null | undefined;
}>;

export type HeroTypeDependentAliasedFieldQuery = {
  readonly hero: { readonly property: string | null } | { readonly property: string | null } | null;
};

export type HumanFieldsFragment = { readonly name: string; readonly mass: number | null };

export type HumanWithNullHeightQueryVariables = Exact<{ [key: string]: never }>;

export type HumanWithNullHeightQuery = {
  readonly human: { readonly name: string; readonly mass: number | null } | null;
};

export type TwoHeroesQueryVariables = Exact<{ [key: string]: never }>;

export type TwoHeroesQuery = {
  readonly r2: { readonly name: string } | { readonly name: string } | null;
  readonly luke: { readonly name: string } | { readonly name: string } | null;
};
