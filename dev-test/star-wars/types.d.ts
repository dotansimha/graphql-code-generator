type Maybe<T> = T | null;
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
};

export type Character = {
  id: Scalars['ID'],
  name: Scalars['String'],
  friends?: Maybe<Array<Maybe<Character>>>,
  friendsConnection: FriendsConnection,
  appearsIn: Array<Maybe<Episode>>,
};

export type ColorInput = {
  red: Scalars['Int'],
  green: Scalars['Int'],
  blue: Scalars['Int'],
};

export type Droid = Character & {
  id: Scalars['ID'],
  name: Scalars['String'],
  friends?: Maybe<Array<Maybe<Character>>>,
  friendsConnection: FriendsConnection,
  appearsIn: Array<Maybe<Episode>>,
  primaryFunction?: Maybe<Scalars['String']>,
};


export type DroidFriendsConnectionArgs = {
  first?: Maybe<Scalars['Int']>,
  after?: Maybe<Scalars['ID']>
};

export type Episode = 'NEWHOPE' | 'EMPIRE' | 'JEDI';

export type FriendsConnection = {
  totalCount?: Maybe<Scalars['Int']>,
  edges?: Maybe<Array<Maybe<FriendsEdge>>>,
  friends?: Maybe<Array<Maybe<Character>>>,
  pageInfo: PageInfo,
};

export type FriendsEdge = {
  cursor: Scalars['ID'],
  node?: Maybe<Character>,
};

export type Human = Character & {
  id: Scalars['ID'],
  name: Scalars['String'],
  homePlanet?: Maybe<Scalars['String']>,
  height?: Maybe<Scalars['Float']>,
  mass?: Maybe<Scalars['Float']>,
  friends?: Maybe<Array<Maybe<Character>>>,
  friendsConnection: FriendsConnection,
  appearsIn: Array<Maybe<Episode>>,
  starships?: Maybe<Array<Maybe<Starship>>>,
};


export type HumanHeightArgs = {
  unit: LengthUnit
};


export type HumanFriendsConnectionArgs = {
  first?: Maybe<Scalars['Int']>,
  after?: Maybe<Scalars['ID']>
};

export type LengthUnit = 'METER' | 'FOOT';

export type Mutation = {
  createReview?: Maybe<Review>,
};


export type MutationCreateReviewArgs = {
  episode?: Maybe<Episode>,
  review: ReviewInput
};

export type PageInfo = {
  startCursor?: Maybe<Scalars['ID']>,
  endCursor?: Maybe<Scalars['ID']>,
  hasNextPage: Scalars['Boolean'],
};

export type Query = {
  hero?: Maybe<Character>,
  reviews?: Maybe<Array<Maybe<Review>>>,
  search?: Maybe<Array<Maybe<SearchResult>>>,
  character?: Maybe<Character>,
  droid?: Maybe<Droid>,
  human?: Maybe<Human>,
  starship?: Maybe<Starship>,
};


export type QueryHeroArgs = {
  episode?: Maybe<Episode>
};


export type QueryReviewsArgs = {
  episode: Episode
};


export type QuerySearchArgs = {
  text?: Maybe<Scalars['String']>
};


export type QueryCharacterArgs = {
  id: Scalars['ID']
};


export type QueryDroidArgs = {
  id: Scalars['ID']
};


export type QueryHumanArgs = {
  id: Scalars['ID']
};


export type QueryStarshipArgs = {
  id: Scalars['ID']
};

export type Review = {
  stars: Scalars['Int'],
  commentary?: Maybe<Scalars['String']>,
};

export type ReviewInput = {
  stars: Scalars['Int'],
  commentary?: Maybe<Scalars['String']>,
  favoriteColor?: Maybe<ColorInput>,
};

export type SearchResult = Human | Droid | Starship;

export type Starship = {
  id: Scalars['ID'],
  name: Scalars['String'],
  length?: Maybe<Scalars['Float']>,
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
  episode?: Maybe<Episode>
};


export type HeroAndFriendsNamesQuery = ({ __typename?: 'Query' } & { hero: Maybe<(Pick<Character, 'name'> & { friends: Maybe<Array<Maybe<Pick<Character, 'name'>>>> })> });

export type HeroAppearsInQueryVariables = {};


export type HeroAppearsInQuery = ({ __typename?: 'Query' } & { hero: Maybe<Pick<Character, 'name' | 'appearsIn'>> });

export type HeroDetailsQueryVariables = {
  episode?: Maybe<Episode>
};


export type HeroDetailsQuery = ({ __typename?: 'Query' } & { hero: Maybe<(Pick<Character, 'name'> & (({ __typename?: 'Human' } & Pick<Human, 'height'>) | ({ __typename?: 'Droid' } & Pick<Droid, 'primaryFunction'>)))> });

export type HeroDetailsWithFragmentQueryVariables = {
  episode?: Maybe<Episode>
};


export type HeroDetailsWithFragmentQuery = ({ __typename?: 'Query' } & { hero: Maybe<HeroDetailsFragment> });

export type HeroDetailsFragment = (Pick<Character, 'name'> & (({ __typename?: 'Human' } & Pick<Human, 'height'>) | ({ __typename?: 'Droid' } & Pick<Droid, 'primaryFunction'>)));

export type HeroNameQueryVariables = {
  episode?: Maybe<Episode>
};


export type HeroNameQuery = ({ __typename?: 'Query' } & { hero: Maybe<Pick<Character, 'name'>> });

export type HeroNameConditionalInclusionQueryVariables = {
  episode?: Maybe<Episode>,
  includeName: Scalars['Boolean']
};


export type HeroNameConditionalInclusionQuery = ({ __typename?: 'Query' } & { hero: Maybe<Pick<Character, 'name'>> });

export type HeroNameConditionalExclusionQueryVariables = {
  episode?: Maybe<Episode>,
  skipName: Scalars['Boolean']
};


export type HeroNameConditionalExclusionQuery = ({ __typename?: 'Query' } & { hero: Maybe<Pick<Character, 'name'>> });

export type HeroParentTypeDependentFieldQueryVariables = {
  episode?: Maybe<Episode>
};


export type HeroParentTypeDependentFieldQuery = ({ __typename?: 'Query' } & { hero: Maybe<(Pick<Character, 'name'> & (({ __typename?: 'Human' } & { friends: Maybe<Array<Maybe<(Pick<Character, 'name'> & (({ __typename?: 'Human' } & Pick<Human, 'height'>)))>>> }) | ({ __typename?: 'Droid' } & { friends: Maybe<Array<Maybe<(Pick<Character, 'name'> & (({ __typename?: 'Human' } & Pick<Human, 'height'>)))>>> })))> });

export type HeroTypeDependentAliasedFieldQueryVariables = {
  episode?: Maybe<Episode>
};


export type HeroTypeDependentAliasedFieldQuery = ({ __typename?: 'Query' } & { hero: Maybe<(({ __typename?: 'Human' } & { property: Human['homePlanet'] }) | ({ __typename?: 'Droid' } & { property: Droid['primaryFunction'] }))> });

export type HumanWithNullHeightQueryVariables = {};


export type HumanWithNullHeightQuery = ({ __typename?: 'Query' } & { human: Maybe<({ __typename?: 'Human' } & Pick<Human, 'name' | 'mass'>)> });

export type TwoHeroesQueryVariables = {};


export type TwoHeroesQuery = ({ __typename?: 'Query' } & { r2: Maybe<Pick<Character, 'name'>>, luke: Maybe<Pick<Character, 'name'>> });
