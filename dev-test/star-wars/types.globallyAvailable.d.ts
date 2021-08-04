type Maybe<T> = T | null;
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

/** Type overrides using directives */
type Directives = {};

/** A character from the Star Wars universe */
type Character = {
  /** The ID of the character */
  id: Scalars['ID'];
  /** The name of the character */
  name: Scalars['String'];
  /** The friends of the character, or an empty list if they have none */
  friends?: Maybe<Array<Maybe<Character>>>;
  /** The friends of the character exposed as a connection with edges */
  friendsConnection: FriendsConnection;
  /** The movies this character appears in */
  appearsIn: Array<Maybe<Episode>>;
};

/** A character from the Star Wars universe */
type CharacterFriendsConnectionArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['ID']>;
};

/** The input object sent when passing a color */
type ColorInput = {
  red: Scalars['Int'];
  green: Scalars['Int'];
  blue: Scalars['Int'];
};

/** An autonomous mechanical character in the Star Wars universe */
type Droid = Character & {
  __typename?: 'Droid';
  /** The ID of the droid */
  id: Scalars['ID'];
  /** What others call this droid */
  name: Scalars['String'];
  /** This droid's friends, or an empty list if they have none */
  friends?: Maybe<Array<Maybe<Character>>>;
  /** The friends of the droid exposed as a connection with edges */
  friendsConnection: FriendsConnection;
  /** The movies this droid appears in */
  appearsIn: Array<Maybe<Episode>>;
  /** This droid's primary function */
  primaryFunction?: Maybe<Scalars['String']>;
};

/** An autonomous mechanical character in the Star Wars universe */
type DroidFriendsConnectionArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['ID']>;
};

/** The episodes in the Star Wars trilogy */
type Episode =
  /** Star Wars Episode IV: A New Hope, released in 1977. */
  | 'NEWHOPE'
  /** Star Wars Episode V: The Empire Strikes Back, released in 1980. */
  | 'EMPIRE'
  /** Star Wars Episode VI: Return of the Jedi, released in 1983. */
  | 'JEDI';

/** A connection object for a character's friends */
type FriendsConnection = {
  __typename?: 'FriendsConnection';
  /** The total number of friends */
  totalCount?: Maybe<Scalars['Int']>;
  /** The edges for each of the character's friends. */
  edges?: Maybe<Array<Maybe<FriendsEdge>>>;
  /** A list of the friends, as a convenience when edges are not needed. */
  friends?: Maybe<Array<Maybe<Character>>>;
  /** Information for paginating this connection */
  pageInfo: PageInfo;
};

/** An edge object for a character's friends */
type FriendsEdge = {
  __typename?: 'FriendsEdge';
  /** A cursor used for pagination */
  cursor: Scalars['ID'];
  /** The character represented by this friendship edge */
  node?: Maybe<Character>;
};

/** A humanoid creature from the Star Wars universe */
type Human = Character & {
  __typename?: 'Human';
  /** The ID of the human */
  id: Scalars['ID'];
  /** What this human calls themselves */
  name: Scalars['String'];
  /** The home planet of the human, or null if unknown */
  homePlanet?: Maybe<Scalars['String']>;
  /** Height in the preferred unit, default is meters */
  height?: Maybe<Scalars['Float']>;
  /** Mass in kilograms, or null if unknown */
  mass?: Maybe<Scalars['Float']>;
  /** This human's friends, or an empty list if they have none */
  friends?: Maybe<Array<Maybe<Character>>>;
  /** The friends of the human exposed as a connection with edges */
  friendsConnection: FriendsConnection;
  /** The movies this human appears in */
  appearsIn: Array<Maybe<Episode>>;
  /** A list of starships this person has piloted, or an empty list if none */
  starships?: Maybe<Array<Maybe<Starship>>>;
};

/** A humanoid creature from the Star Wars universe */
type HumanHeightArgs = {
  unit?: Maybe<LengthUnit>;
};

/** A humanoid creature from the Star Wars universe */
type HumanFriendsConnectionArgs = {
  first?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['ID']>;
};

/** Units of height */
type LengthUnit =
  /** The standard unit around the world */
  | 'METER'
  /** Primarily used in the United States */
  | 'FOOT';

/** The mutation type, represents all updates we can make to our data */
type Mutation = {
  __typename?: 'Mutation';
  createReview?: Maybe<Review>;
};

/** The mutation type, represents all updates we can make to our data */
type MutationCreateReviewArgs = {
  episode?: Maybe<Episode>;
  review: ReviewInput;
};

/** Information for paginating this connection */
type PageInfo = {
  __typename?: 'PageInfo';
  startCursor?: Maybe<Scalars['ID']>;
  endCursor?: Maybe<Scalars['ID']>;
  hasNextPage: Scalars['Boolean'];
};

/** The query type, represents all of the entry points into our object graph */
type Query = {
  __typename?: 'Query';
  hero?: Maybe<Character>;
  reviews?: Maybe<Array<Maybe<Review>>>;
  search?: Maybe<Array<Maybe<SearchResult>>>;
  character?: Maybe<Character>;
  droid?: Maybe<Droid>;
  human?: Maybe<Human>;
  starship?: Maybe<Starship>;
};

/** The query type, represents all of the entry points into our object graph */
type QueryHeroArgs = {
  episode?: Maybe<Episode>;
};

/** The query type, represents all of the entry points into our object graph */
type QueryReviewsArgs = {
  episode: Episode;
};

/** The query type, represents all of the entry points into our object graph */
type QuerySearchArgs = {
  text?: Maybe<Scalars['String']>;
};

/** The query type, represents all of the entry points into our object graph */
type QueryCharacterArgs = {
  id: Scalars['ID'];
};

/** The query type, represents all of the entry points into our object graph */
type QueryDroidArgs = {
  id: Scalars['ID'];
};

/** The query type, represents all of the entry points into our object graph */
type QueryHumanArgs = {
  id: Scalars['ID'];
};

/** The query type, represents all of the entry points into our object graph */
type QueryStarshipArgs = {
  id: Scalars['ID'];
};

/** Represents a review for a movie */
type Review = {
  __typename?: 'Review';
  /** The number of stars this review gave, 1-5 */
  stars: Scalars['Int'];
  /** Comment about the movie */
  commentary?: Maybe<Scalars['String']>;
};

/** The input object sent when someone is creating a new review */
type ReviewInput = {
  /** 0-5 stars */
  stars: Scalars['Int'];
  /** Comment about the movie, optional */
  commentary?: Maybe<Scalars['String']>;
  /** Favorite color, optional */
  favoriteColor?: Maybe<ColorInput>;
};

type SearchResult = Human | Droid | Starship;

type Starship = {
  __typename?: 'Starship';
  /** The ID of the starship */
  id: Scalars['ID'];
  /** The name of the starship */
  name: Scalars['String'];
  /** Length of the starship, along the longest axis */
  length?: Maybe<Scalars['Float']>;
};

type StarshipLengthArgs = {
  unit?: Maybe<LengthUnit>;
};

type CreateReviewForEpisodeMutationVariables = Exact<{
  episode: Episode;
  review: ReviewInput;
}>;

type CreateReviewForEpisodeMutation = {
  __typename?: 'Mutation';
  createReview?: Maybe<{ __typename?: 'Review'; stars: number; commentary?: Maybe<string> }>;
};

type HeroAndFriendsNamesQueryVariables = Exact<{
  episode?: Maybe<Episode>;
}>;

type HeroAndFriendsNamesQuery = {
  __typename?: 'Query';
  hero?: Maybe<
    | {
        __typename?: 'Droid';
        name: string;
        friends?: Maybe<Array<Maybe<{ __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string }>>>;
      }
    | {
        __typename?: 'Human';
        name: string;
        friends?: Maybe<Array<Maybe<{ __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string }>>>;
      }
  >;
};

type HeroAppearsInQueryVariables = Exact<{ [key: string]: never }>;

type HeroAppearsInQuery = {
  __typename?: 'Query';
  hero?: Maybe<
    | { __typename?: 'Droid'; name: string; appearsIn: Array<Maybe<Episode>> }
    | { __typename?: 'Human'; name: string; appearsIn: Array<Maybe<Episode>> }
  >;
};

type HeroDetailsQueryVariables = Exact<{
  episode?: Maybe<Episode>;
}>;

type HeroDetailsQuery = {
  __typename?: 'Query';
  hero?: Maybe<
    | { __typename?: 'Droid'; primaryFunction?: Maybe<string>; name: string }
    | { __typename?: 'Human'; height?: Maybe<number>; name: string }
  >;
};

type HeroDetails_Droid_Fragment = { __typename?: 'Droid'; primaryFunction?: Maybe<string>; name: string };

type HeroDetails_Human_Fragment = { __typename?: 'Human'; height?: Maybe<number>; name: string };

type HeroDetailsFragment = HeroDetails_Droid_Fragment | HeroDetails_Human_Fragment;

type HeroDetailsWithFragmentQueryVariables = Exact<{
  episode?: Maybe<Episode>;
}>;

type HeroDetailsWithFragmentQuery = {
  __typename?: 'Query';
  hero?: Maybe<
    | { __typename?: 'Droid'; primaryFunction?: Maybe<string>; name: string }
    | { __typename?: 'Human'; height?: Maybe<number>; name: string }
  >;
};

type HeroNameQueryVariables = Exact<{
  episode?: Maybe<Episode>;
}>;

type HeroNameQuery = {
  __typename?: 'Query';
  hero?: Maybe<{ __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string }>;
};

type HeroNameConditionalInclusionQueryVariables = Exact<{
  episode?: Maybe<Episode>;
  includeName: Scalars['Boolean'];
}>;

type HeroNameConditionalInclusionQuery = {
  __typename?: 'Query';
  hero?: Maybe<{ __typename?: 'Droid'; name?: Maybe<string> } | { __typename?: 'Human'; name?: Maybe<string> }>;
};

type HeroNameConditionalExclusionQueryVariables = Exact<{
  episode?: Maybe<Episode>;
  skipName: Scalars['Boolean'];
}>;

type HeroNameConditionalExclusionQuery = {
  __typename?: 'Query';
  hero?: Maybe<{ __typename?: 'Droid'; name?: Maybe<string> } | { __typename?: 'Human'; name?: Maybe<string> }>;
};

type HeroParentTypeDependentFieldQueryVariables = Exact<{
  episode?: Maybe<Episode>;
}>;

type HeroParentTypeDependentFieldQuery = {
  __typename?: 'Query';
  hero?: Maybe<
    | {
        __typename?: 'Droid';
        name: string;
        friends?: Maybe<
          Array<
            Maybe<
              { __typename?: 'Droid'; name: string } | { __typename?: 'Human'; height?: Maybe<number>; name: string }
            >
          >
        >;
      }
    | {
        __typename?: 'Human';
        name: string;
        friends?: Maybe<
          Array<
            Maybe<
              { __typename?: 'Droid'; name: string } | { __typename?: 'Human'; height?: Maybe<number>; name: string }
            >
          >
        >;
      }
  >;
};

type HeroTypeDependentAliasedFieldQueryVariables = Exact<{
  episode?: Maybe<Episode>;
}>;

type HeroTypeDependentAliasedFieldQuery = {
  __typename?: 'Query';
  hero?: Maybe<{ __typename?: 'Droid'; property?: Maybe<string> } | { __typename?: 'Human'; property?: Maybe<string> }>;
};

type HumanFieldsFragment = { __typename?: 'Human'; name: string; mass?: Maybe<number> };

type HumanWithNullHeightQueryVariables = Exact<{ [key: string]: never }>;

type HumanWithNullHeightQuery = {
  __typename?: 'Query';
  human?: Maybe<{ __typename?: 'Human'; name: string; mass?: Maybe<number> }>;
};

type TwoHeroesQueryVariables = Exact<{ [key: string]: never }>;

type TwoHeroesQuery = {
  __typename?: 'Query';
  r2?: Maybe<{ __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string }>;
  luke?: Maybe<{ __typename?: 'Droid'; name: string } | { __typename?: 'Human'; name: string }>;
};
