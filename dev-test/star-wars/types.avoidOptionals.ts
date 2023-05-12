export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
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
  friends: Maybe<Array<Maybe<Character>>>;
  /** The friends of the character exposed as a connection with edges */
  friendsConnection: FriendsConnection;
  /** The ID of the character */
  id: Scalars['ID'];
  /** The name of the character */
  name: Scalars['String'];
};

/** A character from the Star Wars universe */
export type CharacterFriendsConnectionArgs = {
  after: InputMaybe<Scalars['ID']>;
  first: InputMaybe<Scalars['Int']>;
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
  friends: Maybe<Array<Maybe<Character>>>;
  /** The friends of the droid exposed as a connection with edges */
  friendsConnection: FriendsConnection;
  /** The ID of the droid */
  id: Scalars['ID'];
  /** What others call this droid */
  name: Scalars['String'];
  /** This droid's primary function */
  primaryFunction: Maybe<Scalars['String']>;
};

/** An autonomous mechanical character in the Star Wars universe */
export type DroidFriendsConnectionArgs = {
  after: InputMaybe<Scalars['ID']>;
  first: InputMaybe<Scalars['Int']>;
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
  edges: Maybe<Array<Maybe<FriendsEdge>>>;
  /** A list of the friends, as a convenience when edges are not needed. */
  friends: Maybe<Array<Maybe<Character>>>;
  /** Information for paginating this connection */
  pageInfo: PageInfo;
  /** The total number of friends */
  totalCount: Maybe<Scalars['Int']>;
};

/** An edge object for a character's friends */
export type FriendsEdge = {
  __typename?: 'FriendsEdge';
  /** A cursor used for pagination */
  cursor: Scalars['ID'];
  /** The character represented by this friendship edge */
  node: Maybe<Character>;
};

/** A humanoid creature from the Star Wars universe */
export type Human = Character & {
  __typename?: 'Human';
  /** The movies this human appears in */
  appearsIn: Array<Maybe<Episode>>;
  /** This human's friends, or an empty list if they have none */
  friends: Maybe<Array<Maybe<Character>>>;
  /** The friends of the human exposed as a connection with edges */
  friendsConnection: FriendsConnection;
  /** Height in the preferred unit, default is meters */
  height: Maybe<Scalars['Float']>;
  /** The home planet of the human, or null if unknown */
  homePlanet: Maybe<Scalars['String']>;
  /** The ID of the human */
  id: Scalars['ID'];
  /** Mass in kilograms, or null if unknown */
  mass: Maybe<Scalars['Float']>;
  /** What this human calls themselves */
  name: Scalars['String'];
  /** A list of starships this person has piloted, or an empty list if none */
  starships: Maybe<Array<Maybe<Starship>>>;
};

/** A humanoid creature from the Star Wars universe */
export type HumanFriendsConnectionArgs = {
  after: InputMaybe<Scalars['ID']>;
  first: InputMaybe<Scalars['Int']>;
};

/** A humanoid creature from the Star Wars universe */
export type HumanHeightArgs = {
  unit?: InputMaybe<LengthUnit>;
};

/** Units of height */
export enum LengthUnit {
  /** Primarily used in the United States */
  Foot = 'FOOT',
  /** The standard unit around the world */
  Meter = 'METER',
}

/** The mutation type, represents all updates we can make to our data */
export type Mutation = {
  __typename?: 'Mutation';
  createReview: Maybe<Review>;
};

/** The mutation type, represents all updates we can make to our data */
export type MutationCreateReviewArgs = {
  episode: InputMaybe<Episode>;
  review: ReviewInput;
};

/** Information for paginating this connection */
export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor: Maybe<Scalars['ID']>;
  hasNextPage: Scalars['Boolean'];
  startCursor: Maybe<Scalars['ID']>;
};

/** The query type, represents all of the entry points into our object graph */
export type Query = {
  __typename?: 'Query';
  character: Maybe<Character>;
  droid: Maybe<Droid>;
  hero: Maybe<Character>;
  human: Maybe<Human>;
  reviews: Maybe<Array<Maybe<Review>>>;
  search: Maybe<Array<Maybe<SearchResult>>>;
  starship: Maybe<Starship>;
};

/** The query type, represents all of the entry points into our object graph */
export type QueryCharacterArgs = {
  id: Scalars['ID'];
};

/** The query type, represents all of the entry points into our object graph */
export type QueryDroidArgs = {
  id: Scalars['ID'];
};

/** The query type, represents all of the entry points into our object graph */
export type QueryHeroArgs = {
  episode: InputMaybe<Episode>;
};

/** The query type, represents all of the entry points into our object graph */
export type QueryHumanArgs = {
  id: Scalars['ID'];
};

/** The query type, represents all of the entry points into our object graph */
export type QueryReviewsArgs = {
  episode: Episode;
};

/** The query type, represents all of the entry points into our object graph */
export type QuerySearchArgs = {
  text: InputMaybe<Scalars['String']>;
};

/** The query type, represents all of the entry points into our object graph */
export type QueryStarshipArgs = {
  id: Scalars['ID'];
};

/** Represents a review for a movie */
export type Review = {
  __typename?: 'Review';
  /** Comment about the movie */
  commentary: Maybe<Scalars['String']>;
  /** The number of stars this review gave, 1-5 */
  stars: Scalars['Int'];
};

/** The input object sent when someone is creating a new review */
export type ReviewInput = {
  /** Comment about the movie, optional */
  commentary: InputMaybe<Scalars['String']>;
  /** Favorite color, optional */
  favoriteColor: InputMaybe<ColorInput>;
  /** 0-5 stars */
  stars: Scalars['Int'];
};

export type SearchResult = Droid | Human | Starship;

export type Starship = {
  __typename?: 'Starship';
  /** The ID of the starship */
  id: Scalars['ID'];
  /** Length of the starship, along the longest axis */
  length: Maybe<Scalars['Float']>;
  /** The name of the starship */
  name: Scalars['String'];
};

export type StarshipLengthArgs = {
  unit?: InputMaybe<LengthUnit>;
};

export type CreateReviewForEpisodeMutationVariables = Exact<{
  episode: Episode;
  review: ReviewInput;
}>;

export type CreateReviewForEpisodeMutation = {
  __typename?: 'Mutation';
  createReview: { __typename?: 'Review'; stars: number; commentary: string | null } | null;
};

export type HeroAndFriendsNamesQueryVariables = Exact<{
  episode: InputMaybe<Episode>;
}>;

export type HeroAndFriendsNamesQuery = {
  __typename?: 'Query';
  hero:
    | {
        __typename?: 'Droid';
        name: string;
        friends: Array<{ __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string } | null> | null;
      }
    | {
        __typename?: 'Human';
        name: string;
        friends: Array<{ __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string } | null> | null;
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
  episode: InputMaybe<Episode>;
}>;

export type HeroDetailsQuery = {
  __typename?: 'Query';
  hero:
    | { __typename?: 'Droid'; primaryFunction: string | null; name: string }
    | { __typename?: 'Human'; height: number | null; name: string }
    | null;
};

type HeroDetails_Droid_Fragment = { __typename?: 'Droid'; primaryFunction: string | null; name: string };

type HeroDetails_Human_Fragment = { __typename?: 'Human'; height: number | null; name: string };

export type HeroDetailsFragment = HeroDetails_Droid_Fragment | HeroDetails_Human_Fragment;

export type HeroDetailsWithFragmentQueryVariables = Exact<{
  episode: InputMaybe<Episode>;
}>;

export type HeroDetailsWithFragmentQuery = {
  __typename?: 'Query';
  hero:
    | { __typename?: 'Droid'; primaryFunction: string | null; name: string }
    | { __typename?: 'Human'; height: number | null; name: string }
    | null;
};

export type HeroNameQueryVariables = Exact<{
  episode: InputMaybe<Episode>;
}>;

export type HeroNameQuery = {
  __typename?: 'Query';
  hero: { __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string } | null;
};

export type HeroNameConditionalInclusionQueryVariables = Exact<{
  episode: InputMaybe<Episode>;
  includeName: Scalars['Boolean'];
}>;

export type HeroNameConditionalInclusionQuery = {
  __typename?: 'Query';
  hero: { __typename?: 'Droid'; name?: string } | { __typename?: 'Human'; name?: string } | null;
};

export type HeroNameConditionalExclusionQueryVariables = Exact<{
  episode: InputMaybe<Episode>;
  skipName: Scalars['Boolean'];
}>;

export type HeroNameConditionalExclusionQuery = {
  __typename?: 'Query';
  hero: { __typename?: 'Droid'; name?: string } | { __typename?: 'Human'; name?: string } | null;
};

export type HeroParentTypeDependentFieldQueryVariables = Exact<{
  episode: InputMaybe<Episode>;
}>;

export type HeroParentTypeDependentFieldQuery = {
  __typename?: 'Query';
  hero:
    | {
        __typename?: 'Droid';
        name: string;
        friends: Array<
          { __typename?: 'Droid'; name: string } | { __typename?: 'Human'; height: number | null; name: string } | null
        > | null;
      }
    | {
        __typename?: 'Human';
        name: string;
        friends: Array<
          { __typename?: 'Droid'; name: string } | { __typename?: 'Human'; height: number | null; name: string } | null
        > | null;
      }
    | null;
};

export type HeroTypeDependentAliasedFieldQueryVariables = Exact<{
  episode: InputMaybe<Episode>;
}>;

export type HeroTypeDependentAliasedFieldQuery = {
  __typename?: 'Query';
  hero: { __typename?: 'Droid'; property: string | null } | { __typename?: 'Human'; property: string | null } | null;
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
