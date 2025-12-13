type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
type CreateReviewForEpisodeMutationVariables = Exact<{
  episode: Episode;
  review: ReviewInput;
}>;

type CreateReviewForEpisodeMutation = {
  __typename?: 'Mutation';
  createReview?: { __typename?: 'Review'; stars: number; commentary?: string | null } | null;
};

type ExcludeQueryAlphaQueryVariables = Exact<{
  episode?: Episode | null;
}>;

type ExcludeQueryAlphaQuery = {
  __typename?: 'Query';
  hero?: { __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string } | null;
};

type ExcludeQueryBetaQueryVariables = Exact<{
  episode?: Episode | null;
}>;

type ExcludeQueryBetaQuery = {
  __typename?: 'Query';
  hero?: { __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string } | null;
};

type HeroAndFriendsNamesQueryVariables = Exact<{
  episode?: Episode | null;
}>;

type HeroAndFriendsNamesQuery = {
  __typename?: 'Query';
  hero?:
    | {
        __typename?: 'Droid';
        name: string;
        friends?: Array<{ __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string } | null> | null;
      }
    | {
        __typename?: 'Human';
        name: string;
        friends?: Array<{ __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string } | null> | null;
      }
    | null;
};

type HeroAppearsInQueryVariables = Exact<{ [key: string]: never }>;

type HeroAppearsInQuery = {
  __typename?: 'Query';
  hero?:
    | { __typename?: 'Droid'; name: string; appearsIn: Array<Episode | null> }
    | { __typename?: 'Human'; name: string; appearsIn: Array<Episode | null> }
    | null;
};

type HeroDetailsQueryVariables = Exact<{
  episode?: Episode | null;
}>;

type HeroDetailsQuery = {
  __typename?: 'Query';
  hero?:
    | { __typename?: 'Droid'; primaryFunction?: string | null; name: string }
    | { __typename?: 'Human'; height?: number | null; name: string }
    | null;
};

type HeroDetails_Droid_Fragment = { __typename?: 'Droid'; primaryFunction?: string | null; name: string };

type HeroDetails_Human_Fragment = { __typename?: 'Human'; height?: number | null; name: string };

type HeroDetailsFragment = HeroDetails_Droid_Fragment | HeroDetails_Human_Fragment;

type HeroDetailsWithFragmentQueryVariables = Exact<{
  episode?: Episode | null;
}>;

type HeroDetailsWithFragmentQuery = {
  __typename?: 'Query';
  hero?:
    | { __typename?: 'Droid'; primaryFunction?: string | null; name: string }
    | { __typename?: 'Human'; height?: number | null; name: string }
    | null;
};

type HeroNameQueryVariables = Exact<{
  episode?: Episode | null;
}>;

type HeroNameQuery = {
  __typename?: 'Query';
  hero?: { __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string } | null;
};

type HeroNameConditionalInclusionQueryVariables = Exact<{
  episode?: Episode | null;
  includeName: boolean;
}>;

type HeroNameConditionalInclusionQuery = {
  __typename?: 'Query';
  hero?: { __typename?: 'Droid'; name?: string } | { __typename?: 'Human'; name?: string } | null;
};

type HeroNameConditionalExclusionQueryVariables = Exact<{
  episode?: Episode | null;
  skipName: boolean;
}>;

type HeroNameConditionalExclusionQuery = {
  __typename?: 'Query';
  hero?: { __typename?: 'Droid'; name?: string } | { __typename?: 'Human'; name?: string } | null;
};

type HeroParentTypeDependentFieldQueryVariables = Exact<{
  episode?: Episode | null;
}>;

type HeroParentTypeDependentFieldQuery = {
  __typename?: 'Query';
  hero?:
    | {
        __typename?: 'Droid';
        name: string;
        friends?: Array<
          { __typename?: 'Droid'; name: string } | { __typename?: 'Human'; height?: number | null; name: string } | null
        > | null;
      }
    | {
        __typename?: 'Human';
        name: string;
        friends?: Array<
          { __typename?: 'Droid'; name: string } | { __typename?: 'Human'; height?: number | null; name: string } | null
        > | null;
      }
    | null;
};

type HeroTypeDependentAliasedFieldQueryVariables = Exact<{
  episode?: Episode | null;
}>;

type HeroTypeDependentAliasedFieldQuery = {
  __typename?: 'Query';
  hero?: { __typename?: 'Droid'; property?: string | null } | { __typename?: 'Human'; property?: string | null } | null;
};

type HumanFieldsFragment = { __typename?: 'Human'; name: string; mass?: number | null };

type HumanWithNullHeightQueryVariables = Exact<{ [key: string]: never }>;

type HumanWithNullHeightQuery = {
  __typename?: 'Query';
  human?: { __typename?: 'Human'; name: string; mass?: number | null } | null;
};

type TwoHeroesQueryVariables = Exact<{ [key: string]: never }>;

type TwoHeroesQuery = {
  __typename?: 'Query';
  r2?: { __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string } | null;
  luke?: { __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string } | null;
};
