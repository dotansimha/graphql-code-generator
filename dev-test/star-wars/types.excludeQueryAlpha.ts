type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type CreateReviewForEpisodeMutationVariables = Exact<{
  episode: Episode;
  review: ReviewInput;
}>;

export type CreateReviewForEpisodeMutation = {
  __typename?: 'Mutation';
  createReview: { __typename?: 'Review'; stars: number; commentary: string | null } | null;
};

export type ExcludeQueryBetaQueryVariables = Exact<{
  episode?: Episode | null;
}>;

export type ExcludeQueryBetaQuery = {
  __typename?: 'Query';
  hero: { __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string } | null;
};

export type HeroAndFriendsNamesQueryVariables = Exact<{
  episode?: Episode | null;
}>;

export type HeroAndFriendsNamesQuery = {
  __typename?: 'Query';
  hero:
    | {
        __typename?: 'Droid';
        name: string;
<<<<<<< HEAD
        friends?: Array<
          { __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string } | null
        > | null;
=======
        friends: Array<{ __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string } | null> | null;
>>>>>>> caa1c98e0 ([typescript-operations] No optional Result fields, unless deferred or conditional (#10548))
      }
    | {
        __typename?: 'Human';
        name: string;
<<<<<<< HEAD
        friends?: Array<
          { __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string } | null
        > | null;
=======
        friends: Array<{ __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string } | null> | null;
>>>>>>> caa1c98e0 ([typescript-operations] No optional Result fields, unless deferred or conditional (#10548))
      }
    | null;
};

export type HeroAppearsInQueryVariables = Exact<{ [key: string]: never }>;

export type HeroAppearsInQuery = {
  __typename?: 'Query';
  hero:
    | { __typename?: 'Droid'; name: string; appearsIn: Array<Episode | null> }
    | { __typename?: 'Human'; name: string; appearsIn: Array<Episode | null> }
    | null;
};

export type HeroDetailsQueryVariables = Exact<{
  episode?: Episode | null;
}>;

export type HeroDetailsQuery = {
  __typename?: 'Query';
  hero:
    | { __typename?: 'Droid'; primaryFunction: string | null; name: string }
    | { __typename?: 'Human'; height: number | null; name: string }
    | null;
};

<<<<<<< HEAD
type HeroDetails_Droid_Fragment = {
  __typename?: 'Droid';
  primaryFunction?: string | null;
  name: string;
};
=======
type HeroDetails_Droid_Fragment = { __typename?: 'Droid'; primaryFunction: string | null; name: string };
>>>>>>> caa1c98e0 ([typescript-operations] No optional Result fields, unless deferred or conditional (#10548))

type HeroDetails_Human_Fragment = { __typename?: 'Human'; height: number | null; name: string };

export type HeroDetailsFragment = HeroDetails_Droid_Fragment | HeroDetails_Human_Fragment;

export type HeroDetailsWithFragmentQueryVariables = Exact<{
  episode?: Episode | null;
}>;

export type HeroDetailsWithFragmentQuery = {
  __typename?: 'Query';
  hero:
    | { __typename?: 'Droid'; primaryFunction: string | null; name: string }
    | { __typename?: 'Human'; height: number | null; name: string }
    | null;
};

export type HeroNameQueryVariables = Exact<{
  episode?: Episode | null;
}>;

export type HeroNameQuery = {
  __typename?: 'Query';
  hero: { __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string } | null;
};

export type HeroNameConditionalInclusionQueryVariables = Exact<{
  episode?: Episode | null;
  includeName: boolean;
}>;

export type HeroNameConditionalInclusionQuery = {
  __typename?: 'Query';
  hero: { __typename?: 'Droid'; name?: string } | { __typename?: 'Human'; name?: string } | null;
};

export type HeroNameConditionalExclusionQueryVariables = Exact<{
  episode?: Episode | null;
  skipName: boolean;
}>;

export type HeroNameConditionalExclusionQuery = {
  __typename?: 'Query';
  hero: { __typename?: 'Droid'; name?: string } | { __typename?: 'Human'; name?: string } | null;
};

export type HeroParentTypeDependentFieldQueryVariables = Exact<{
  episode?: Episode | null;
}>;

export type HeroParentTypeDependentFieldQuery = {
  __typename?: 'Query';
  hero:
    | {
        __typename?: 'Droid';
        name: string;
<<<<<<< HEAD
        friends?: Array<
          | { __typename?: 'Droid'; name: string }
          | { __typename?: 'Human'; height?: number | null; name: string }
          | null
=======
        friends: Array<
          { __typename?: 'Droid'; name: string } | { __typename?: 'Human'; height: number | null; name: string } | null
>>>>>>> caa1c98e0 ([typescript-operations] No optional Result fields, unless deferred or conditional (#10548))
        > | null;
      }
    | {
        __typename?: 'Human';
        name: string;
<<<<<<< HEAD
        friends?: Array<
          | { __typename?: 'Droid'; name: string }
          | { __typename?: 'Human'; height?: number | null; name: string }
          | null
=======
        friends: Array<
          { __typename?: 'Droid'; name: string } | { __typename?: 'Human'; height: number | null; name: string } | null
>>>>>>> caa1c98e0 ([typescript-operations] No optional Result fields, unless deferred or conditional (#10548))
        > | null;
      }
    | null;
};

export type HeroTypeDependentAliasedFieldQueryVariables = Exact<{
  episode?: Episode | null;
}>;

export type HeroTypeDependentAliasedFieldQuery = {
  __typename?: 'Query';
<<<<<<< HEAD
  hero?:
    | { __typename?: 'Droid'; property?: string | null }
    | { __typename?: 'Human'; property?: string | null }
    | null;
=======
  hero: { __typename?: 'Droid'; property: string | null } | { __typename?: 'Human'; property: string | null } | null;
>>>>>>> caa1c98e0 ([typescript-operations] No optional Result fields, unless deferred or conditional (#10548))
};

export type HumanFieldsFragment = { __typename?: 'Human'; name: string; mass: number | null };

export type HumanWithNullHeightQueryVariables = Exact<{ [key: string]: never }>;

export type HumanWithNullHeightQuery = {
  __typename?: 'Query';
  human: { __typename?: 'Human'; name: string; mass: number | null } | null;
};

export type TwoHeroesQueryVariables = Exact<{ [key: string]: never }>;

export type TwoHeroesQuery = {
  __typename?: 'Query';
  r2: { __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string } | null;
  luke: { __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string } | null;
};
