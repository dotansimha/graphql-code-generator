export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

/** The episodes in the Star Wars trilogy */
export enum Episode {
  /** Star Wars Episode IV: A New Hope, released in 1977. */
  Newhope = 'NEWHOPE',
  /** Star Wars Episode V: The Empire Strikes Back, released in 1980. */
  Empire = 'EMPIRE',
  /** Star Wars Episode VI: Return of the Jedi, released in 1983. */
  Jedi = 'JEDI',
}

/** Units of height */
export enum LengthUnit {
  /** The standard unit around the world */
  Meter = 'METER',
  /** Primarily used in the United States */
  Foot = 'FOOT',
}

/** The input object sent when someone is creating a new review */
export type ReviewInput = {
  /** 0-5 stars */
  stars: Scalars['Int'];
  /** Comment about the movie, optional */
  commentary?: Maybe<Scalars['String']>;
  /** Favorite color, optional */
  favoriteColor?: Maybe<ColorInput>;
};

/** The input object sent when passing a color */
export type ColorInput = {
  red: Scalars['Int'];
  green: Scalars['Int'];
  blue: Scalars['Int'];
};

export type CreateReviewForEpisodeMutationVariables = Exact<{
  episode: Episode;
  review: ReviewInput;
}>;

export type CreateReviewForEpisodeMutation = {
  __typename?: 'Mutation';
  createReview?: Maybe<{ __typename?: 'Review'; stars: number; commentary?: Maybe<string> }>;
};

export type HeroAndFriendsNamesQueryVariables = Exact<{
  episode?: Maybe<Episode>;
}>;

export type HeroAndFriendsNamesQuery = {
  __typename?: 'Query';
  hero?: Maybe<
    | {
        __typename?: 'Human';
        name: string;
        friends?: Maybe<Array<Maybe<{ __typename?: 'Human'; name: string } | { __typename?: 'Droid'; name: string }>>>;
      }
    | {
        __typename?: 'Droid';
        name: string;
        friends?: Maybe<Array<Maybe<{ __typename?: 'Human'; name: string } | { __typename?: 'Droid'; name: string }>>>;
      }
  >;
};

export type HeroAppearsInQueryVariables = Exact<{ [key: string]: never }>;

export type HeroAppearsInQuery = {
  __typename?: 'Query';
  hero?: Maybe<
    | { __typename?: 'Human'; name: string; appearsIn: Array<Maybe<Episode>> }
    | { __typename?: 'Droid'; name: string; appearsIn: Array<Maybe<Episode>> }
  >;
};

export type HeroDetailsQueryVariables = Exact<{
  episode?: Maybe<Episode>;
}>;

export type HeroDetailsQuery = {
  __typename?: 'Query';
  hero?: Maybe<
    | { __typename?: 'Human'; height?: Maybe<number>; name: string }
    | { __typename?: 'Droid'; primaryFunction?: Maybe<string>; name: string }
  >;
};

type HeroDetails_Human_Fragment = { __typename?: 'Human'; height?: Maybe<number>; name: string };

type HeroDetails_Droid_Fragment = { __typename?: 'Droid'; primaryFunction?: Maybe<string>; name: string };

export type HeroDetailsFragment = HeroDetails_Human_Fragment | HeroDetails_Droid_Fragment;

export type HeroDetailsWithFragmentQueryVariables = Exact<{
  episode?: Maybe<Episode>;
}>;

export type HeroDetailsWithFragmentQuery = {
  __typename?: 'Query';
  hero?: Maybe<
    ({ __typename?: 'Human' } & HeroDetails_Human_Fragment) | ({ __typename?: 'Droid' } & HeroDetails_Droid_Fragment)
  >;
};

export type HeroNameQueryVariables = Exact<{
  episode?: Maybe<Episode>;
}>;

export type HeroNameQuery = {
  __typename?: 'Query';
  hero?: Maybe<{ __typename?: 'Human'; name: string } | { __typename?: 'Droid'; name: string }>;
};

export type HeroNameConditionalInclusionQueryVariables = Exact<{
  episode?: Maybe<Episode>;
  includeName: Scalars['Boolean'];
}>;

export type HeroNameConditionalInclusionQuery = {
  __typename?: 'Query';
  hero?: Maybe<{ __typename?: 'Human'; name: string } | { __typename?: 'Droid'; name: string }>;
};

export type HeroNameConditionalExclusionQueryVariables = Exact<{
  episode?: Maybe<Episode>;
  skipName: Scalars['Boolean'];
}>;

export type HeroNameConditionalExclusionQuery = {
  __typename?: 'Query';
  hero?: Maybe<{ __typename?: 'Human'; name: string } | { __typename?: 'Droid'; name: string }>;
};

export type HeroParentTypeDependentFieldQueryVariables = Exact<{
  episode?: Maybe<Episode>;
}>;

export type HeroParentTypeDependentFieldQuery = {
  __typename?: 'Query';
  hero?: Maybe<
    | {
        __typename?: 'Human';
        name: string;
        friends?: Maybe<
          Array<
            Maybe<
              { __typename?: 'Human'; height?: Maybe<number>; name: string } | { __typename?: 'Droid'; name: string }
            >
          >
        >;
      }
    | {
        __typename?: 'Droid';
        name: string;
        friends?: Maybe<
          Array<
            Maybe<
              { __typename?: 'Human'; height?: Maybe<number>; name: string } | { __typename?: 'Droid'; name: string }
            >
          >
        >;
      }
  >;
};

export type HeroTypeDependentAliasedFieldQueryVariables = Exact<{
  episode?: Maybe<Episode>;
}>;

export type HeroTypeDependentAliasedFieldQuery = {
  __typename?: 'Query';
  hero?: Maybe<{ __typename?: 'Human'; property?: Maybe<string> } | { __typename?: 'Droid'; property?: Maybe<string> }>;
};

export type HumanFieldsFragment = { __typename?: 'Human'; name: string; mass?: Maybe<number> };

export type HumanWithNullHeightQueryVariables = Exact<{ [key: string]: never }>;

export type HumanWithNullHeightQuery = {
  __typename?: 'Query';
  human?: Maybe<{ __typename?: 'Human' } & HumanFieldsFragment>;
};

export type TwoHeroesQueryVariables = Exact<{ [key: string]: never }>;

export type TwoHeroesQuery = {
  __typename?: 'Query';
  r2?: Maybe<{ __typename?: 'Human'; name: string } | { __typename?: 'Droid'; name: string }>;
  luke?: Maybe<{ __typename?: 'Human'; name: string } | { __typename?: 'Droid'; name: string }>;
};
