type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type CreateReviewForEpisodeMutationVariables = Exact<{
  episode: Episode;
  review: ReviewInput;
}>;

export type CreateReviewForEpisodeMutation = {
  readonly __typename?: 'Mutation';
  readonly createReview?: {
    readonly __typename?: 'Review';
    readonly stars: number;
    readonly commentary?: string | null;
  } | null;
};

export type ExcludeQueryAlphaQueryVariables = Exact<{
  episode?: Episode | null;
}>;

export type ExcludeQueryAlphaQuery = {
  readonly __typename?: 'Query';
  readonly hero?:
    | { readonly __typename?: 'Droid'; readonly name: string }
    | { readonly __typename?: 'Human'; readonly name: string }
    | null;
};

export type ExcludeQueryBetaQueryVariables = Exact<{
  episode?: Episode | null;
}>;

export type ExcludeQueryBetaQuery = {
  readonly __typename?: 'Query';
  readonly hero?:
    | { readonly __typename?: 'Droid'; readonly name: string }
    | { readonly __typename?: 'Human'; readonly name: string }
    | null;
};

export type HeroAndFriendsNamesQueryVariables = Exact<{
  episode?: Episode | null;
}>;

export type HeroAndFriendsNamesQuery = {
  readonly __typename?: 'Query';
  readonly hero?:
    | {
        readonly __typename?: 'Droid';
        readonly name: string;
        readonly friends?: ReadonlyArray<
          | { readonly __typename?: 'Droid'; readonly name: string }
          | { readonly __typename?: 'Human'; readonly name: string }
          | null
        > | null;
      }
    | {
        readonly __typename?: 'Human';
        readonly name: string;
        readonly friends?: ReadonlyArray<
          | { readonly __typename?: 'Droid'; readonly name: string }
          | { readonly __typename?: 'Human'; readonly name: string }
          | null
        > | null;
      }
    | null;
};

export type HeroAppearsInQueryVariables = Exact<{ [key: string]: never }>;

export type HeroAppearsInQuery = {
  readonly __typename?: 'Query';
  readonly hero?:
    | { readonly __typename?: 'Droid'; readonly name: string; readonly appearsIn: ReadonlyArray<Episode | null> }
    | { readonly __typename?: 'Human'; readonly name: string; readonly appearsIn: ReadonlyArray<Episode | null> }
    | null;
};

export type HeroDetailsQueryVariables = Exact<{
  episode?: Episode | null;
}>;

export type HeroDetailsQuery = {
  readonly __typename?: 'Query';
  readonly hero?:
    | { readonly __typename?: 'Droid'; readonly primaryFunction?: string | null; readonly name: string }
    | { readonly __typename?: 'Human'; readonly height?: number | null; readonly name: string }
    | null;
};

type HeroDetails_Droid_Fragment = {
  readonly __typename?: 'Droid';
  readonly primaryFunction?: string | null;
  readonly name: string;
};

type HeroDetails_Human_Fragment = {
  readonly __typename?: 'Human';
  readonly height?: number | null;
  readonly name: string;
};

export type HeroDetailsFragment = HeroDetails_Droid_Fragment | HeroDetails_Human_Fragment;

export type HeroDetailsWithFragmentQueryVariables = Exact<{
  episode?: Episode | null;
}>;

export type HeroDetailsWithFragmentQuery = {
  readonly __typename?: 'Query';
  readonly hero?:
    | { readonly __typename?: 'Droid'; readonly primaryFunction?: string | null; readonly name: string }
    | { readonly __typename?: 'Human'; readonly height?: number | null; readonly name: string }
    | null;
};

export type HeroNameQueryVariables = Exact<{
  episode?: Episode | null;
}>;

export type HeroNameQuery = {
  readonly __typename?: 'Query';
  readonly hero?:
    | { readonly __typename?: 'Droid'; readonly name: string }
    | { readonly __typename?: 'Human'; readonly name: string }
    | null;
};

export type HeroNameConditionalInclusionQueryVariables = Exact<{
  episode?: Episode | null;
  includeName: boolean;
}>;

export type HeroNameConditionalInclusionQuery = {
  readonly __typename?: 'Query';
  readonly hero?:
    | { readonly __typename?: 'Droid'; readonly name?: string }
    | { readonly __typename?: 'Human'; readonly name?: string }
    | null;
};

export type HeroNameConditionalExclusionQueryVariables = Exact<{
  episode?: Episode | null;
  skipName: boolean;
}>;

export type HeroNameConditionalExclusionQuery = {
  readonly __typename?: 'Query';
  readonly hero?:
    | { readonly __typename?: 'Droid'; readonly name?: string }
    | { readonly __typename?: 'Human'; readonly name?: string }
    | null;
};

export type HeroParentTypeDependentFieldQueryVariables = Exact<{
  episode?: Episode | null;
}>;

export type HeroParentTypeDependentFieldQuery = {
  readonly __typename?: 'Query';
  readonly hero?:
    | {
        readonly __typename?: 'Droid';
        readonly name: string;
        readonly friends?: ReadonlyArray<
          | { readonly __typename?: 'Droid'; readonly name: string }
          | { readonly __typename?: 'Human'; readonly height?: number | null; readonly name: string }
          | null
        > | null;
      }
    | {
        readonly __typename?: 'Human';
        readonly name: string;
        readonly friends?: ReadonlyArray<
          | { readonly __typename?: 'Droid'; readonly name: string }
          | { readonly __typename?: 'Human'; readonly height?: number | null; readonly name: string }
          | null
        > | null;
      }
    | null;
};

export type HeroTypeDependentAliasedFieldQueryVariables = Exact<{
  episode?: Episode | null;
}>;

export type HeroTypeDependentAliasedFieldQuery = {
  readonly __typename?: 'Query';
  readonly hero?:
    | { readonly __typename?: 'Droid'; readonly property?: string | null }
    | { readonly __typename?: 'Human'; readonly property?: string | null }
    | null;
};

export type HumanFieldsFragment = {
  readonly __typename?: 'Human';
  readonly name: string;
  readonly mass?: number | null;
};

export type HumanWithNullHeightQueryVariables = Exact<{ [key: string]: never }>;

export type HumanWithNullHeightQuery = {
  readonly __typename?: 'Query';
  readonly human?: { readonly __typename?: 'Human'; readonly name: string; readonly mass?: number | null } | null;
};

export type TwoHeroesQueryVariables = Exact<{ [key: string]: never }>;

export type TwoHeroesQuery = {
  readonly __typename?: 'Query';
  readonly r2?:
    | { readonly __typename?: 'Droid'; readonly name: string }
    | { readonly __typename?: 'Human'; readonly name: string }
    | null;
  readonly luke?:
    | { readonly __typename?: 'Droid'; readonly name: string }
    | { readonly __typename?: 'Human'; readonly name: string }
    | null;
};
