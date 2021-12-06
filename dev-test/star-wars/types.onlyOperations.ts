export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

/** A character from the Star Wars universe */
export type Character = {
  /** The movies this character appears in */
  appearsIn: Array<Maybe<Episode>>;
  /** The friends of the character, or an empty list if they have none */
  friends?: Maybe<Array<Maybe<Character>>>;
  /** The friends of the character exposed as a connection with edges */
  friendsConnection: FriendsConnection;
  /** The ID of the character */
  id: Scalars['ID'];
  /** The name of the character */
  name: Scalars['String'];
};

/** The input object sent when passing a color */
export type ColorInput = {
  blue: Scalars['Int'];
  green: Scalars['Int'];
  red: Scalars['Int'];
};

/** An autonomous mechanical character in the Star Wars universe */
export type Droid = Character & {
  __typename?: 'Droid';
  /** The movies this droid appears in */
  appearsIn: Array<Maybe<Episode>>;
  /** This droid's friends, or an empty list if they have none */
  friends?: Maybe<Array<Maybe<Character>>>;
  /** The friends of the droid exposed as a connection with edges */
  friendsConnection: FriendsConnection;
  /** The ID of the droid */
  id: Scalars['ID'];
  /** What others call this droid */
  name: Scalars['String'];
  /** This droid's primary function */
  primaryFunction?: Maybe<Scalars['String']>;
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

/** A connection object for a character's friends */
export type FriendsConnection = {
  __typename?: 'FriendsConnection';
  /** The edges for each of the character's friends. */
  edges?: Maybe<Array<Maybe<FriendsEdge>>>;
  /** A list of the friends, as a convenience when edges are not needed. */
  friends?: Maybe<Array<Maybe<Character>>>;
  /** Information for paginating this connection */
  pageInfo: PageInfo;
  /** The total number of friends */
  totalCount?: Maybe<Scalars['Int']>;
};

/** An edge object for a character's friends */
export type FriendsEdge = {
  __typename?: 'FriendsEdge';
  /** A cursor used for pagination */
  cursor: Scalars['ID'];
  /** The character represented by this friendship edge */
  node?: Maybe<Character>;
};

/** A humanoid creature from the Star Wars universe */
export type Human = Character & {
  __typename?: 'Human';
  /** The movies this human appears in */
  appearsIn: Array<Maybe<Episode>>;
  /** This human's friends, or an empty list if they have none */
  friends?: Maybe<Array<Maybe<Character>>>;
  /** The friends of the human exposed as a connection with edges */
  friendsConnection: FriendsConnection;
  /** Height in the preferred unit, default is meters */
  height?: Maybe<Scalars['Float']>;
  /** The home planet of the human, or null if unknown */
  homePlanet?: Maybe<Scalars['String']>;
  /** The ID of the human */
  id: Scalars['ID'];
  /** Mass in kilograms, or null if unknown */
  mass?: Maybe<Scalars['Float']>;
  /** What this human calls themselves */
  name: Scalars['String'];
  /** A list of starships this person has piloted, or an empty list if none */
  starships?: Maybe<Array<Maybe<Starship>>>;
};

/** Information for paginating this connection */
export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['ID']>;
  hasNextPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['ID']>;
};

/** Represents a review for a movie */
export type Review = {
  __typename?: 'Review';
  /** Comment about the movie */
  commentary?: Maybe<Scalars['String']>;
  /** The number of stars this review gave, 1-5 */
  stars: Scalars['Int'];
};

/** The input object sent when someone is creating a new review */
export type ReviewInput = {
  /** Comment about the movie, optional */
  commentary?: InputMaybe<Scalars['String']>;
  /** Favorite color, optional */
  favoriteColor?: InputMaybe<ColorInput>;
  /** 0-5 stars */
  stars: Scalars['Int'];
};

export type Starship = {
  __typename?: 'Starship';
  /** The ID of the starship */
  id: Scalars['ID'];
  /** Length of the starship, along the longest axis */
  length?: Maybe<Scalars['Float']>;
  /** The name of the starship */
  name: Scalars['String'];
};

export type CreateReviewForEpisodeMutationVariables = Exact<{
  episode: Episode;
  review: ReviewInput;
}>;

export type CreateReviewForEpisodeMutation = { __typename?: 'Mutation' } & {
  createReview?: Maybe<{ __typename?: 'Review' } & Pick<Review, 'stars' | 'commentary'>>;
};

export type HeroAndFriendsNamesQueryVariables = Exact<{
  episode?: InputMaybe<Episode>;
}>;

export type HeroAndFriendsNamesQuery = { __typename?: 'Query' } & {
  hero?: Maybe<
    | ({ __typename?: 'Droid' } & Pick<Droid, 'name'> & {
          friends?: Maybe<
            Array<
              Maybe<({ __typename?: 'Droid' } & Pick<Droid, 'name'>) | ({ __typename?: 'Human' } & Pick<Human, 'name'>)>
            >
          >;
        })
    | ({ __typename?: 'Human' } & Pick<Human, 'name'> & {
          friends?: Maybe<
            Array<
              Maybe<({ __typename?: 'Droid' } & Pick<Droid, 'name'>) | ({ __typename?: 'Human' } & Pick<Human, 'name'>)>
            >
          >;
        })
  >;
};

export type HeroAppearsInQueryVariables = Exact<{ [key: string]: never }>;

export type HeroAppearsInQuery = { __typename?: 'Query' } & {
  hero?: Maybe<
    | ({ __typename?: 'Droid' } & Pick<Droid, 'name' | 'appearsIn'>)
    | ({ __typename?: 'Human' } & Pick<Human, 'name' | 'appearsIn'>)
  >;
};

export type HeroDetailsQueryVariables = Exact<{
  episode?: InputMaybe<Episode>;
}>;

export type HeroDetailsQuery = { __typename?: 'Query' } & {
  hero?: Maybe<
    | ({ __typename?: 'Droid' } & Pick<Droid, 'primaryFunction' | 'name'>)
    | ({ __typename?: 'Human' } & Pick<Human, 'height' | 'name'>)
  >;
};

type HeroDetails_Droid_Fragment = { __typename?: 'Droid' } & Pick<Droid, 'primaryFunction' | 'name'>;

type HeroDetails_Human_Fragment = { __typename?: 'Human' } & Pick<Human, 'height' | 'name'>;

export type HeroDetailsFragment = HeroDetails_Droid_Fragment | HeroDetails_Human_Fragment;

export type HeroDetailsWithFragmentQueryVariables = Exact<{
  episode?: InputMaybe<Episode>;
}>;

export type HeroDetailsWithFragmentQuery = { __typename?: 'Query' } & {
  hero?: Maybe<
    | ({ __typename?: 'Droid' } & Pick<Droid, 'primaryFunction' | 'name'>)
    | ({ __typename?: 'Human' } & Pick<Human, 'height' | 'name'>)
  >;
};

export type HeroNameQueryVariables = Exact<{
  episode?: InputMaybe<Episode>;
}>;

export type HeroNameQuery = { __typename?: 'Query' } & {
  hero?: Maybe<({ __typename?: 'Droid' } & Pick<Droid, 'name'>) | ({ __typename?: 'Human' } & Pick<Human, 'name'>)>;
};

export type HeroNameConditionalInclusionQueryVariables = Exact<{
  episode?: InputMaybe<Episode>;
  includeName: Scalars['Boolean'];
}>;

export type HeroNameConditionalInclusionQuery = { __typename?: 'Query' } & {
  hero?: Maybe<
    | ({ __typename?: 'Droid' } & MakeOptional<Pick<Droid, 'name'>, 'name'>)
    | ({ __typename?: 'Human' } & MakeOptional<Pick<Human, 'name'>, 'name'>)
  >;
};

export type HeroNameConditionalExclusionQueryVariables = Exact<{
  episode?: InputMaybe<Episode>;
  skipName: Scalars['Boolean'];
}>;

export type HeroNameConditionalExclusionQuery = { __typename?: 'Query' } & {
  hero?: Maybe<
    | ({ __typename?: 'Droid' } & MakeOptional<Pick<Droid, 'name'>, 'name'>)
    | ({ __typename?: 'Human' } & MakeOptional<Pick<Human, 'name'>, 'name'>)
  >;
};

export type HeroParentTypeDependentFieldQueryVariables = Exact<{
  episode?: InputMaybe<Episode>;
}>;

export type HeroParentTypeDependentFieldQuery = { __typename?: 'Query' } & {
  hero?: Maybe<
    | ({ __typename?: 'Droid' } & Pick<Droid, 'name'> & {
          friends?: Maybe<
            Array<
              Maybe<
                | ({ __typename?: 'Droid' } & Pick<Droid, 'name'>)
                | ({ __typename?: 'Human' } & Pick<Human, 'height' | 'name'>)
              >
            >
          >;
        })
    | ({ __typename?: 'Human' } & Pick<Human, 'name'> & {
          friends?: Maybe<
            Array<
              Maybe<
                | ({ __typename?: 'Droid' } & Pick<Droid, 'name'>)
                | ({ __typename?: 'Human' } & Pick<Human, 'height' | 'name'>)
              >
            >
          >;
        })
  >;
};

export type HeroTypeDependentAliasedFieldQueryVariables = Exact<{
  episode?: InputMaybe<Episode>;
}>;

export type HeroTypeDependentAliasedFieldQuery = { __typename?: 'Query' } & {
  hero?: Maybe<
    | ({ __typename?: 'Droid' } & { property: Droid['primaryFunction'] })
    | ({ __typename?: 'Human' } & { property: Human['homePlanet'] })
  >;
};

export type HumanFieldsFragment = { __typename?: 'Human' } & Pick<Human, 'name' | 'mass'>;

export type HumanWithNullHeightQueryVariables = Exact<{ [key: string]: never }>;

export type HumanWithNullHeightQuery = { __typename?: 'Query' } & {
  human?: Maybe<{ __typename?: 'Human' } & Pick<Human, 'name' | 'mass'>>;
};

export type TwoHeroesQueryVariables = Exact<{ [key: string]: never }>;

export type TwoHeroesQuery = { __typename?: 'Query' } & {
  r2?: Maybe<({ __typename?: 'Droid' } & Pick<Droid, 'name'>) | ({ __typename?: 'Human' } & Pick<Human, 'name'>)>;
  luke?: Maybe<({ __typename?: 'Droid' } & Pick<Droid, 'name'>) | ({ __typename?: 'Human' } & Pick<Human, 'name'>)>;
};
