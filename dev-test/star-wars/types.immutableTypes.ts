
type Maybe<T> = T | null;
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
  /** The ID of the character */
  readonly id: Scalars['ID'],
  /** The name of the character */
  readonly name: Scalars['String'],
  /** The friends of the character, or an empty list if they have none */
  readonly friends?: Maybe<ReadonlyArray<Maybe<Character>>>,
  /** The friends of the character exposed as a connection with edges */
  readonly friendsConnection: FriendsConnection,
  /** The movies this character appears in */
  readonly appearsIn: ReadonlyArray<Maybe<Episode>>,
};

/** The input object sent when passing a color */
export type ColorInput = {
  readonly red: Scalars['Int'],
  readonly green: Scalars['Int'],
  readonly blue: Scalars['Int'],
};

/** An autonomous mechanical character in the Star Wars universe */
export type Droid = Character & {
  /** The ID of the droid */
  readonly id: Scalars['ID'],
  /** What others call this droid */
  readonly name: Scalars['String'],
  /** This droid's friends, or an empty list if they have none */
  readonly friends?: Maybe<ReadonlyArray<Maybe<Character>>>,
  /** The friends of the droid exposed as a connection with edges */
  readonly friendsConnection: FriendsConnection,
  /** The movies this droid appears in */
  readonly appearsIn: ReadonlyArray<Maybe<Episode>>,
  /** This droid's primary function */
  readonly primaryFunction?: Maybe<Scalars['String']>,
};


/** An autonomous mechanical character in the Star Wars universe */
export type DroidFriendsConnectionArgs = {
  first?: Maybe<Scalars['Int']>,
  after?: Maybe<Scalars['ID']>
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
  /** The total number of friends */
  readonly totalCount?: Maybe<Scalars['Int']>,
  /** The edges for each of the character's friends. */
  readonly edges?: Maybe<ReadonlyArray<Maybe<FriendsEdge>>>,
  /** A list of the friends, as a convenience when edges are not needed. */
  readonly friends?: Maybe<ReadonlyArray<Maybe<Character>>>,
  /** Information for paginating this connection */
  readonly pageInfo: PageInfo,
};

/** An edge object for a character's friends */
export type FriendsEdge = {
  /** A cursor used for pagination */
  readonly cursor: Scalars['ID'],
  /** The character represented by this friendship edge */
  readonly node?: Maybe<Character>,
};

/** A humanoid creature from the Star Wars universe */
export type Human = Character & {
  /** The ID of the human */
  readonly id: Scalars['ID'],
  /** What this human calls themselves */
  readonly name: Scalars['String'],
  /** The home planet of the human, or null if unknown */
  readonly homePlanet?: Maybe<Scalars['String']>,
  /** Height in the preferred unit, default is meters */
  readonly height?: Maybe<Scalars['Float']>,
  /** Mass in kilograms, or null if unknown */
  readonly mass?: Maybe<Scalars['Float']>,
  /** This human's friends, or an empty list if they have none */
  readonly friends?: Maybe<ReadonlyArray<Maybe<Character>>>,
  /** The friends of the human exposed as a connection with edges */
  readonly friendsConnection: FriendsConnection,
  /** The movies this human appears in */
  readonly appearsIn: ReadonlyArray<Maybe<Episode>>,
  /** A list of starships this person has piloted, or an empty list if none */
  readonly starships?: Maybe<ReadonlyArray<Maybe<Starship>>>,
};


/** A humanoid creature from the Star Wars universe */
export type HumanHeightArgs = {
  unit: LengthUnit
};


/** A humanoid creature from the Star Wars universe */
export type HumanFriendsConnectionArgs = {
  first?: Maybe<Scalars['Int']>,
  after?: Maybe<Scalars['ID']>
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
  readonly createReview?: Maybe<Review>,
};


/** The mutation type, represents all updates we can make to our data */
export type MutationCreateReviewArgs = {
  episode?: Maybe<Episode>,
  review: ReviewInput
};

/** Information for paginating this connection */
export type PageInfo = {
  readonly startCursor?: Maybe<Scalars['ID']>,
  readonly endCursor?: Maybe<Scalars['ID']>,
  readonly hasNextPage: Scalars['Boolean'],
};

/** The query type, represents all of the entry points into our object graph */
export type Query = {
  readonly hero?: Maybe<Character>,
  readonly reviews?: Maybe<ReadonlyArray<Maybe<Review>>>,
  readonly search?: Maybe<ReadonlyArray<Maybe<SearchResult>>>,
  readonly character?: Maybe<Character>,
  readonly droid?: Maybe<Droid>,
  readonly human?: Maybe<Human>,
  readonly starship?: Maybe<Starship>,
};


/** The query type, represents all of the entry points into our object graph */
export type QueryHeroArgs = {
  episode?: Maybe<Episode>
};


/** The query type, represents all of the entry points into our object graph */
export type QueryReviewsArgs = {
  episode: Episode
};


/** The query type, represents all of the entry points into our object graph */
export type QuerySearchArgs = {
  text?: Maybe<Scalars['String']>
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
  /** The number of stars this review gave, 1-5 */
  readonly stars: Scalars['Int'],
  /** Comment about the movie */
  readonly commentary?: Maybe<Scalars['String']>,
};

/** The input object sent when someone is creating a new review */
export type ReviewInput = {
  /** 0-5 stars */
  readonly stars: Scalars['Int'],
  /** Comment about the movie, optional */
  readonly commentary?: Maybe<Scalars['String']>,
  /** Favorite color, optional */
  readonly favoriteColor?: Maybe<ColorInput>,
};

export type SearchResult = Human | Droid | Starship;

export type Starship = {
  /** The ID of the starship */
  readonly id: Scalars['ID'],
  /** The name of the starship */
  readonly name: Scalars['String'],
  /** Length of the starship, along the longest axis */
  readonly length?: Maybe<Scalars['Float']>,
};


export type StarshipLengthArgs = {
  unit: LengthUnit
};
export type CreateReviewForEpisodeMutationVariables = {
  episode: Episode,
  review: ReviewInput
};


export type CreateReviewForEpisodeMutation = ({ readonly __typename?: 'Mutation' } & { readonly createReview: Maybe<({ readonly __typename?: 'Review' } & Pick<Review, 'stars' | 'commentary'>)> });

export type HeroAndFriendsNamesQueryVariables = {
  episode?: Maybe<Episode>
};


export type HeroAndFriendsNamesQuery = ({ readonly __typename?: 'Query' } & { readonly hero: Maybe<(Pick<Character, 'name'> & { readonly friends: Maybe<ReadonlyArray<Maybe<Pick<Character, 'name'>>>> })> });

export type HeroAppearsInQueryVariables = {};


export type HeroAppearsInQuery = ({ readonly __typename?: 'Query' } & { readonly hero: Maybe<Pick<Character, 'name' | 'appearsIn'>> });

export type HeroDetailsQueryVariables = {
  episode?: Maybe<Episode>
};


export type HeroDetailsQuery = ({ readonly __typename?: 'Query' } & { readonly hero: Maybe<(Pick<Character, 'name'> & (({ readonly __typename?: 'Human' } & Pick<Human, 'height'>) | ({ readonly __typename?: 'Droid' } & Pick<Droid, 'primaryFunction'>)))> });

export type HeroDetailsWithFragmentQueryVariables = {
  episode?: Maybe<Episode>
};


export type HeroDetailsWithFragmentQuery = ({ readonly __typename?: 'Query' } & { readonly hero: Maybe<HeroDetailsFragment> });

export type HeroDetailsFragment = (Pick<Character, 'name'> & (({ readonly __typename?: 'Human' } & Pick<Human, 'height'>) | ({ readonly __typename?: 'Droid' } & Pick<Droid, 'primaryFunction'>)));

export type HeroNameQueryVariables = {
  episode?: Maybe<Episode>
};


export type HeroNameQuery = ({ readonly __typename?: 'Query' } & { readonly hero: Maybe<Pick<Character, 'name'>> });

export type HeroNameConditionalInclusionQueryVariables = {
  episode?: Maybe<Episode>,
  includeName: Scalars['Boolean']
};


export type HeroNameConditionalInclusionQuery = ({ readonly __typename?: 'Query' } & { readonly hero: Maybe<Pick<Character, 'name'>> });

export type HeroNameConditionalExclusionQueryVariables = {
  episode?: Maybe<Episode>,
  skipName: Scalars['Boolean']
};


export type HeroNameConditionalExclusionQuery = ({ readonly __typename?: 'Query' } & { readonly hero: Maybe<Pick<Character, 'name'>> });

export type HeroParentTypeDependentFieldQueryVariables = {
  episode?: Maybe<Episode>
};


export type HeroParentTypeDependentFieldQuery = ({ readonly __typename?: 'Query' } & { readonly hero: Maybe<(Pick<Character, 'name'> & (({ readonly __typename?: 'Human' } & { readonly friends: Maybe<ReadonlyArray<Maybe<(Pick<Character, 'name'> & (({ readonly __typename?: 'Human' } & Pick<Human, 'height'>)))>>> }) | ({ readonly __typename?: 'Droid' } & { readonly friends: Maybe<ReadonlyArray<Maybe<(Pick<Character, 'name'> & (({ readonly __typename?: 'Human' } & Pick<Human, 'height'>)))>>> })))> });

export type HeroTypeDependentAliasedFieldQueryVariables = {
  episode?: Maybe<Episode>
};


export type HeroTypeDependentAliasedFieldQuery = ({ readonly __typename?: 'Query' } & { readonly hero: Maybe<(({ readonly __typename?: 'Human' } & { readonly property: Human['homePlanet'] }) | ({ readonly __typename?: 'Droid' } & { readonly property: Droid['primaryFunction'] }))> });

export type HumanWithNullHeightQueryVariables = {};


export type HumanWithNullHeightQuery = ({ readonly __typename?: 'Query' } & { readonly human: Maybe<({ readonly __typename?: 'Human' } & Pick<Human, 'name' | 'mass'>)> });

export type TwoHeroesQueryVariables = {};


export type TwoHeroesQuery = ({ readonly __typename?: 'Query' } & { readonly r2: Maybe<Pick<Character, 'name'>>, readonly luke: Maybe<Pick<Character, 'name'>> });
