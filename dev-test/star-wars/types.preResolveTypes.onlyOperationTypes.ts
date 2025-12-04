export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

/** The input object sent when passing a color */
export type ColorInput = {
  blue: Scalars['Int']['input'];
  green: Scalars['Int']['input'];
  red: Scalars['Int']['input'];
};

/** The episodes in the Star Wars trilogy */
export enum Episode {
  /** Star Wars Episode V: The Empire Strikes Back, released in 1980. */
  Empire = 'EMPIRE',
  /** Star Wars Episode VI: Return of the Jedi, released in 1983. */
  Jedi = 'JEDI',
  /** Star Wars Episode IV: A New Hope, released in 1977. */
  Newhope = 'NEWHOPE',
}

/** Units of height */
export enum LengthUnit {
  /** Primarily used in the United States */
  Foot = 'FOOT',
  /** The standard unit around the world */
  Meter = 'METER',
}

/** The input object sent when someone is creating a new review */
export type ReviewInput = {
  /** Comment about the movie, optional */
  commentary?: InputMaybe<Scalars['String']['input']>;
  /** Favorite color, optional */
  favoriteColor?: InputMaybe<ColorInput>;
  /** 0-5 stars */
  stars: Scalars['Int']['input'];
};

/** The input object sent when passing a color */
export type ColorInput = {
  blue: number;
  green: number;
  red: number;
};

/** The episodes in the Star Wars trilogy */
export type Episode =
  /** Star Wars Episode V: The Empire Strikes Back, released in 1980. */
  | 'EMPIRE'
  /** Star Wars Episode VI: Return of the Jedi, released in 1983. */
  | 'JEDI'
  /** Star Wars Episode IV: A New Hope, released in 1977. */
  | 'NEWHOPE';

/** The input object sent when someone is creating a new review */
export type ReviewInput = {
  /** Comment about the movie, optional */
  commentary: string;
  /** Favorite color, optional */
  favoriteColor: ColorInput;
  /** 0-5 stars */
  stars: number;
};

export type CreateReviewForEpisodeMutationVariables = Exact<{
  episode: Episode;
  review: ReviewInput;
}>;

export type CreateReviewForEpisodeMutation = {
  __typename?: 'Mutation';
  createReview?: { __typename?: 'Review'; stars: number; commentary?: string | null } | null;
};

export type ExcludeQueryAlphaQueryVariables = Exact<{
  episode?: Episode | null;
}>;

export type ExcludeQueryAlphaQuery = {
  __typename?: 'Query';
  hero?: { __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string } | null;
};

export type ExcludeQueryBetaQueryVariables = Exact<{
  episode?: Episode | null;
}>;

export type ExcludeQueryBetaQuery = {
  __typename?: 'Query';
  hero?: { __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string } | null;
};

export type HeroAndFriendsNamesQueryVariables = Exact<{
  episode?: Episode | null;
}>;

export type HeroAndFriendsNamesQuery = {
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

export type HeroAppearsInQueryVariables = Exact<{ [key: string]: never }>;

export type HeroAppearsInQuery = {
  __typename?: 'Query';
  hero?:
    | { __typename?: 'Droid'; name: string; appearsIn: Array<Episode | null> }
    | { __typename?: 'Human'; name: string; appearsIn: Array<Episode | null> }
    | null;
};

export type HeroDetailsQueryVariables = Exact<{
  episode?: Episode | null;
}>;

export type HeroDetailsQuery = {
  __typename?: 'Query';
  hero?:
    | { __typename?: 'Droid'; primaryFunction?: string | null; name: string }
    | { __typename?: 'Human'; height?: number | null; name: string }
    | null;
};

type HeroDetails_Droid_Fragment = { __typename?: 'Droid'; primaryFunction?: string | null; name: string };

type HeroDetails_Human_Fragment = { __typename?: 'Human'; height?: number | null; name: string };

export type HeroDetailsFragment = HeroDetails_Droid_Fragment | HeroDetails_Human_Fragment;

export type HeroDetailsWithFragmentQueryVariables = Exact<{
  episode?: Episode | null;
}>;

export type HeroDetailsWithFragmentQuery = {
  __typename?: 'Query';
  hero?:
    | { __typename?: 'Droid'; primaryFunction?: string | null; name: string }
    | { __typename?: 'Human'; height?: number | null; name: string }
    | null;
};

export type HeroNameQueryVariables = Exact<{
  episode?: Episode | null;
}>;

export type HeroNameQuery = {
  __typename?: 'Query';
  hero?: { __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string } | null;
};

export type HeroNameConditionalInclusionQueryVariables = Exact<{
  episode?: Episode | null;
  includeName: boolean;
}>;

export type HeroNameConditionalInclusionQuery = {
  __typename?: 'Query';
  hero?: { __typename?: 'Droid'; name?: string } | { __typename?: 'Human'; name?: string } | null;
};

export type HeroNameConditionalExclusionQueryVariables = Exact<{
  episode?: Episode | null;
  skipName: boolean;
}>;

export type HeroNameConditionalExclusionQuery = {
  __typename?: 'Query';
  hero?: { __typename?: 'Droid'; name?: string } | { __typename?: 'Human'; name?: string } | null;
};

export type HeroParentTypeDependentFieldQueryVariables = Exact<{
  episode?: Episode | null;
}>;

export type HeroParentTypeDependentFieldQuery = {
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

export type HeroTypeDependentAliasedFieldQueryVariables = Exact<{
  episode?: Episode | null;
}>;

export type HeroTypeDependentAliasedFieldQuery = {
  __typename?: 'Query';
  hero?: { __typename?: 'Droid'; property?: string | null } | { __typename?: 'Human'; property?: string | null } | null;
};

export type HumanFieldsFragment = { __typename?: 'Human'; name: string; mass?: number | null };

export type HumanWithNullHeightQueryVariables = Exact<{ [key: string]: never }>;

export type HumanWithNullHeightQuery = {
  __typename?: 'Query';
  human?: { __typename?: 'Human'; name: string; mass?: number | null } | null;
};

export type TwoHeroesQueryVariables = Exact<{ [key: string]: never }>;

export type TwoHeroesQuery = {
  __typename?: 'Query';
  r2?: { __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string } | null;
  luke?: { __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string } | null;
};
