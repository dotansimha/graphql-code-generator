type Maybe<T> = T | null;
type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
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

/** The episodes in the Star Wars trilogy */
type Episode =
  /** Star Wars Episode IV: A New Hope, released in 1977. */
  | 'NEWHOPE'
  /** Star Wars Episode V: The Empire Strikes Back, released in 1980. */
  | 'EMPIRE'
  /** Star Wars Episode VI: Return of the Jedi, released in 1983. */
  | 'JEDI';

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

/** Information for paginating this connection */
type PageInfo = {
  __typename?: 'PageInfo';
  startCursor?: Maybe<Scalars['ID']>;
  endCursor?: Maybe<Scalars['ID']>;
  hasNextPage: Scalars['Boolean'];
};

/** Represents a review for a movie */
type Review = {
  __typename?: 'Review';
  /** The number of stars this review gave, 1-5 */
  stars: Scalars['Int'];
  /** Comment about the movie */
  commentary?: Maybe<Scalars['String']>;
};

type SearchResult = Human | Droid | Starship;

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

/** The input object sent when someone is creating a new review */
type ReviewInput = {
  /** 0-5 stars */
  stars: Scalars['Int'];
  /** Comment about the movie, optional */
  commentary?: Maybe<Scalars['String']>;
  /** Favorite color, optional */
  favoriteColor?: Maybe<ColorInput>;
};

/** The input object sent when passing a color */
type ColorInput = {
  red: Scalars['Int'];
  green: Scalars['Int'];
  blue: Scalars['Int'];
};

type CreateReviewForEpisodeMutationVariables = Exact<{
  episode: Episode;
  review: ReviewInput;
}>;

type CreateReviewForEpisodeMutation = { __typename?: 'Mutation' } & {
  createReview?: Maybe<{ __typename?: 'Review' } & Pick<Review, 'stars' | 'commentary'>>;
};

type HeroAndFriendsNamesQueryVariables = Exact<{
  episode?: Maybe<Episode>;
}>;

type HeroAndFriendsNamesQuery = { __typename?: 'Query' } & {
  hero?: Maybe<
    | ({ __typename?: 'Human' } & Pick<Human, 'name'> & {
          friends?: Maybe<
            Array<
              Maybe<({ __typename?: 'Human' } & Pick<Human, 'name'>) | ({ __typename?: 'Droid' } & Pick<Droid, 'name'>)>
            >
          >;
        })
    | ({ __typename?: 'Droid' } & Pick<Droid, 'name'> & {
          friends?: Maybe<
            Array<
              Maybe<({ __typename?: 'Human' } & Pick<Human, 'name'>) | ({ __typename?: 'Droid' } & Pick<Droid, 'name'>)>
            >
          >;
        })
  >;
};

type HeroAppearsInQueryVariables = Exact<{ [key: string]: never }>;

type HeroAppearsInQuery = { __typename?: 'Query' } & {
  hero?: Maybe<
    | ({ __typename?: 'Human' } & Pick<Human, 'name' | 'appearsIn'>)
    | ({ __typename?: 'Droid' } & Pick<Droid, 'name' | 'appearsIn'>)
  >;
};

type HeroDetailsQueryVariables = Exact<{
  episode?: Maybe<Episode>;
}>;

type HeroDetailsQuery = { __typename?: 'Query' } & {
  hero?: Maybe<
    | ({ __typename?: 'Human' } & Pick<Human, 'height' | 'name'>)
    | ({ __typename?: 'Droid' } & Pick<Droid, 'primaryFunction' | 'name'>)
  >;
};

type HeroDetails_Human_Fragment = { __typename?: 'Human' } & Pick<Human, 'height' | 'name'>;

type HeroDetails_Droid_Fragment = { __typename?: 'Droid' } & Pick<Droid, 'primaryFunction' | 'name'>;

type HeroDetailsFragment = HeroDetails_Human_Fragment | HeroDetails_Droid_Fragment;

type HeroDetailsWithFragmentQueryVariables = Exact<{
  episode?: Maybe<Episode>;
}>;

type HeroDetailsWithFragmentQuery = { __typename?: 'Query' } & {
  hero?: Maybe<
    ({ __typename?: 'Human' } & HeroDetails_Human_Fragment) | ({ __typename?: 'Droid' } & HeroDetails_Droid_Fragment)
  >;
};

type HeroNameQueryVariables = Exact<{
  episode?: Maybe<Episode>;
}>;

type HeroNameQuery = { __typename?: 'Query' } & {
  hero?: Maybe<({ __typename?: 'Human' } & Pick<Human, 'name'>) | ({ __typename?: 'Droid' } & Pick<Droid, 'name'>)>;
};

type HeroNameConditionalInclusionQueryVariables = Exact<{
  episode?: Maybe<Episode>;
  includeName: Scalars['Boolean'];
}>;

type HeroNameConditionalInclusionQuery = { __typename?: 'Query' } & {
  hero?: Maybe<({ __typename?: 'Human' } & Pick<Human, 'name'>) | ({ __typename?: 'Droid' } & Pick<Droid, 'name'>)>;
};

type HeroNameConditionalExclusionQueryVariables = Exact<{
  episode?: Maybe<Episode>;
  skipName: Scalars['Boolean'];
}>;

type HeroNameConditionalExclusionQuery = { __typename?: 'Query' } & {
  hero?: Maybe<({ __typename?: 'Human' } & Pick<Human, 'name'>) | ({ __typename?: 'Droid' } & Pick<Droid, 'name'>)>;
};

type HeroParentTypeDependentFieldQueryVariables = Exact<{
  episode?: Maybe<Episode>;
}>;

type HeroParentTypeDependentFieldQuery = { __typename?: 'Query' } & {
  hero?: Maybe<
    | ({ __typename?: 'Human' } & Pick<Human, 'name'> & {
          friends?: Maybe<
            Array<
              Maybe<
                | ({ __typename?: 'Human' } & Pick<Human, 'height' | 'name'>)
                | ({ __typename?: 'Droid' } & Pick<Droid, 'name'>)
              >
            >
          >;
        })
    | ({ __typename?: 'Droid' } & Pick<Droid, 'name'> & {
          friends?: Maybe<
            Array<
              Maybe<
                | ({ __typename?: 'Human' } & Pick<Human, 'height' | 'name'>)
                | ({ __typename?: 'Droid' } & Pick<Droid, 'name'>)
              >
            >
          >;
        })
  >;
};

type HeroTypeDependentAliasedFieldQueryVariables = Exact<{
  episode?: Maybe<Episode>;
}>;

type HeroTypeDependentAliasedFieldQuery = { __typename?: 'Query' } & {
  hero?: Maybe<
    | ({ __typename?: 'Human' } & { property: Human['homePlanet'] })
    | ({ __typename?: 'Droid' } & { property: Droid['primaryFunction'] })
  >;
};

type HumanFieldsFragment = { __typename?: 'Human' } & Pick<Human, 'name' | 'mass'>;

type HumanWithNullHeightQueryVariables = Exact<{ [key: string]: never }>;

type HumanWithNullHeightQuery = { __typename?: 'Query' } & {
  human?: Maybe<{ __typename?: 'Human' } & HumanFieldsFragment>;
};

type TwoHeroesQueryVariables = Exact<{ [key: string]: never }>;

type TwoHeroesQuery = { __typename?: 'Query' } & {
  r2?: Maybe<({ __typename?: 'Human' } & Pick<Human, 'name'>) | ({ __typename?: 'Droid' } & Pick<Droid, 'name'>)>;
  luke?: Maybe<({ __typename?: 'Human' } & Pick<Human, 'name'>) | ({ __typename?: 'Droid' } & Pick<Droid, 'name'>)>;
};
