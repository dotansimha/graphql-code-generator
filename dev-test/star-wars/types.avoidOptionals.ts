export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
};

/** A character from the Star Wars universe */
export type Character = {
  __typename?: 'Character',
  /** The ID of the character */
  id: Scalars['ID'],
  /** The name of the character */
  name: Scalars['String'],
  /** The friends of the character, or an empty list if they have none */
  friends: Maybe<Array<Maybe<Character>>>,
  /** The friends of the character exposed as a connection with edges */
  friendsConnection: FriendsConnection,
  /** The movies this character appears in */
  appearsIn: Array<Maybe<Episode>>,
};


/** A character from the Star Wars universe */
export type CharacterFriendsConnectionArgs = {
  first: Maybe<Scalars['Int']>,
  after: Maybe<Scalars['ID']>
};

/** The input object sent when passing a color */
export type ColorInput = {
  red: Scalars['Int'],
  green: Scalars['Int'],
  blue: Scalars['Int'],
};

/** An autonomous mechanical character in the Star Wars universe */
export type Droid = Character & {
  __typename?: 'Droid',
  /** The ID of the droid */
  id: Scalars['ID'],
  /** What others call this droid */
  name: Scalars['String'],
  /** This droid's friends, or an empty list if they have none */
  friends: Maybe<Array<Maybe<Character>>>,
  /** The friends of the droid exposed as a connection with edges */
  friendsConnection: FriendsConnection,
  /** The movies this droid appears in */
  appearsIn: Array<Maybe<Episode>>,
  /** This droid's primary function */
  primaryFunction: Maybe<Scalars['String']>,
};


/** An autonomous mechanical character in the Star Wars universe */
export type DroidFriendsConnectionArgs = {
  first: Maybe<Scalars['Int']>,
  after: Maybe<Scalars['ID']>
};

/** The episodes in the Star Wars trilogy */
export enum Episode {
  /** Star Wars Episode IV: A New Hope, released in 1977. */
  Newhope = 'NEWHOPE',
  /** Star Wars Episode V: The Empire Strikes Back, released in 1980. */
  Empire = 'EMPIRE',
  /** Star Wars Episode VI: Return of the Jedi, released in 1983. */
  Jedi = 'JEDI'
}

/** A connection object for a character's friends */
export type FriendsConnection = {
  __typename?: 'FriendsConnection',
  /** The total number of friends */
  totalCount: Maybe<Scalars['Int']>,
  /** The edges for each of the character's friends. */
  edges: Maybe<Array<Maybe<FriendsEdge>>>,
  /** A list of the friends, as a convenience when edges are not needed. */
  friends: Maybe<Array<Maybe<Character>>>,
  /** Information for paginating this connection */
  pageInfo: PageInfo,
};

/** An edge object for a character's friends */
export type FriendsEdge = {
  __typename?: 'FriendsEdge',
  /** A cursor used for pagination */
  cursor: Scalars['ID'],
  /** The character represented by this friendship edge */
  node: Maybe<Character>,
};

/** A humanoid creature from the Star Wars universe */
export type Human = Character & {
  __typename?: 'Human',
  /** The ID of the human */
  id: Scalars['ID'],
  /** What this human calls themselves */
  name: Scalars['String'],
  /** The home planet of the human, or null if unknown */
  homePlanet: Maybe<Scalars['String']>,
  /** Height in the preferred unit, default is meters */
  height: Maybe<Scalars['Float']>,
  /** Mass in kilograms, or null if unknown */
  mass: Maybe<Scalars['Float']>,
  /** This human's friends, or an empty list if they have none */
  friends: Maybe<Array<Maybe<Character>>>,
  /** The friends of the human exposed as a connection with edges */
  friendsConnection: FriendsConnection,
  /** The movies this human appears in */
  appearsIn: Array<Maybe<Episode>>,
  /** A list of starships this person has piloted, or an empty list if none */
  starships: Maybe<Array<Maybe<Starship>>>,
};


/** A humanoid creature from the Star Wars universe */
export type HumanHeightArgs = {
  unit: LengthUnit
};


/** A humanoid creature from the Star Wars universe */
export type HumanFriendsConnectionArgs = {
  first: Maybe<Scalars['Int']>,
  after: Maybe<Scalars['ID']>
};

/** Units of height */
export enum LengthUnit {
  /** The standard unit around the world */
  Meter = 'METER',
  /** Primarily used in the United States */
  Foot = 'FOOT'
}

/** The mutation type, represents all updates we can make to our data */
export type Mutation = {
  __typename?: 'Mutation',
  createReview: Maybe<Review>,
};


/** The mutation type, represents all updates we can make to our data */
export type MutationCreateReviewArgs = {
  episode: Maybe<Episode>,
  review: ReviewInput
};

/** Information for paginating this connection */
export type PageInfo = {
  __typename?: 'PageInfo',
  startCursor: Maybe<Scalars['ID']>,
  endCursor: Maybe<Scalars['ID']>,
  hasNextPage: Scalars['Boolean'],
};

/** The query type, represents all of the entry points into our object graph */
export type Query = {
  __typename?: 'Query',
  hero: Maybe<Character>,
  reviews: Maybe<Array<Maybe<Review>>>,
  search: Maybe<Array<Maybe<SearchResult>>>,
  character: Maybe<Character>,
  droid: Maybe<Droid>,
  human: Maybe<Human>,
  starship: Maybe<Starship>,
};


/** The query type, represents all of the entry points into our object graph */
export type QueryHeroArgs = {
  episode: Maybe<Episode>
};


/** The query type, represents all of the entry points into our object graph */
export type QueryReviewsArgs = {
  episode: Episode
};


/** The query type, represents all of the entry points into our object graph */
export type QuerySearchArgs = {
  text: Maybe<Scalars['String']>
};


/** The query type, represents all of the entry points into our object graph */
export type QueryCharacterArgs = {
  id: Scalars['ID']
};


/** The query type, represents all of the entry points into our object graph */
export type QueryDroidArgs = {
  id: Scalars['ID']
};


/** The query type, represents all of the entry points into our object graph */
export type QueryHumanArgs = {
  id: Scalars['ID']
};


/** The query type, represents all of the entry points into our object graph */
export type QueryStarshipArgs = {
  id: Scalars['ID']
};

/** Represents a review for a movie */
export type Review = {
  __typename?: 'Review',
  /** The number of stars this review gave, 1-5 */
  stars: Scalars['Int'],
  /** Comment about the movie */
  commentary: Maybe<Scalars['String']>,
};

/** The input object sent when someone is creating a new review */
export type ReviewInput = {
  /** 0-5 stars */
  stars: Scalars['Int'],
  /** Comment about the movie, optional */
  commentary: Maybe<Scalars['String']>,
  /** Favorite color, optional */
  favoriteColor: Maybe<ColorInput>,
};

export type SearchResult = Human | Droid | Starship;

export type Starship = {
  __typename?: 'Starship',
  /** The ID of the starship */
  id: Scalars['ID'],
  /** The name of the starship */
  name: Scalars['String'],
  /** Length of the starship, along the longest axis */
  length: Maybe<Scalars['Float']>,
};


export type StarshipLengthArgs = {
  unit: LengthUnit
};
export type CreateReviewForEpisodeMutationVariables = {
  episode: Episode,
  review: ReviewInput
};


export type CreateReviewForEpisodeMutation = ({ __typename?: 'Mutation' } & { createReview: Maybe<({ __typename?: 'Review' } & Pick<Review, 'stars' | 'commentary'>)> });

export type HeroAndFriendsNamesQueryVariables = {
  episode: Maybe<Episode>
};


export type HeroAndFriendsNamesQuery = ({ __typename?: 'Query' } & { hero: Maybe<({ __typename?: 'Human' | 'Droid' } & Pick<Character, 'name'> & { friends: Maybe<Array<Maybe<({ __typename?: 'Human' | 'Droid' } & Pick<Character, 'name'>)>>> })> });

export type HeroAppearsInQueryVariables = {};


export type HeroAppearsInQuery = ({ __typename?: 'Query' } & { hero: Maybe<({ __typename?: 'Human' | 'Droid' } & Pick<Character, 'name' | 'appearsIn'>)> });

export type HeroDetailsQueryVariables = {
  episode: Maybe<Episode>
};


export type HeroDetailsQuery = ({ __typename?: 'Query' } & { hero: Maybe<({ __typename?: 'Human' | 'Droid' } & Pick<Character, 'name'> & (({ __typename?: 'Human' } & Pick<Human, 'height'>) | ({ __typename?: 'Droid' } & Pick<Droid, 'primaryFunction'>)))> });

export type HeroDetailsWithFragmentQueryVariables = {
  episode: Maybe<Episode>
};


export type HeroDetailsWithFragmentQuery = ({ __typename?: 'Query' } & { hero: Maybe<({ __typename?: 'Human' | 'Droid' } & HeroDetailsFragment)> });

export type HeroDetailsFragment = ({ __typename?: 'Human' | 'Droid' } & Pick<Character, 'name'> & (({ __typename?: 'Human' } & Pick<Human, 'height'>) | ({ __typename?: 'Droid' } & Pick<Droid, 'primaryFunction'>)));

export type HeroNameQueryVariables = {
  episode: Maybe<Episode>
};


export type HeroNameQuery = ({ __typename?: 'Query' } & { hero: Maybe<({ __typename?: 'Human' | 'Droid' } & Pick<Character, 'name'>)> });

export type HeroNameConditionalInclusionQueryVariables = {
  episode: Maybe<Episode>,
  includeName: Scalars['Boolean']
};


export type HeroNameConditionalInclusionQuery = ({ __typename?: 'Query' } & { hero: Maybe<({ __typename?: 'Human' | 'Droid' } & Pick<Character, 'name'>)> });

export type HeroNameConditionalExclusionQueryVariables = {
  episode: Maybe<Episode>,
  skipName: Scalars['Boolean']
};


export type HeroNameConditionalExclusionQuery = ({ __typename?: 'Query' } & { hero: Maybe<({ __typename?: 'Human' | 'Droid' } & Pick<Character, 'name'>)> });

export type HeroParentTypeDependentFieldQueryVariables = {
  episode: Maybe<Episode>
};


export type HeroParentTypeDependentFieldQuery = ({ __typename?: 'Query' } & { hero: Maybe<({ __typename?: 'Human' | 'Droid' } & Pick<Character, 'name'> & (({ __typename?: 'Human' } & { friends: Maybe<Array<Maybe<({ __typename?: 'Human' | 'Droid' } & Pick<Character, 'name'> & ({ __typename?: 'Human' } & Pick<Human, 'height'>))>>> }) | ({ __typename?: 'Droid' } & { friends: Maybe<Array<Maybe<({ __typename?: 'Human' | 'Droid' } & Pick<Character, 'name'> & ({ __typename?: 'Human' } & Pick<Human, 'height'>))>>> })))> });

export type HeroTypeDependentAliasedFieldQueryVariables = {
  episode: Maybe<Episode>
};


export type HeroTypeDependentAliasedFieldQuery = ({ __typename?: 'Query' } & { hero: Maybe<({ __typename?: 'Human' | 'Droid' } & (({ __typename?: 'Human' } & { property: Human['homePlanet'] }) | ({ __typename?: 'Droid' } & { property: Droid['primaryFunction'] })))> });

export type HumanWithNullHeightQueryVariables = {};


export type HumanWithNullHeightQuery = ({ __typename?: 'Query' } & { human: Maybe<({ __typename?: 'Human' } & Pick<Human, 'name' | 'mass'>)> });

export type TwoHeroesQueryVariables = {};


export type TwoHeroesQuery = ({ __typename?: 'Query' } & { r2: Maybe<({ __typename?: 'Human' | 'Droid' } & Pick<Character, 'name'>)>, luke: Maybe<({ __typename?: 'Human' | 'Droid' } & Pick<Character, 'name'>)> });
