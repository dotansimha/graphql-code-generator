type Maybe<T> = T | null;
export type Character = {
  id: string,
  name: string,
  friends?: Maybe<Array<Maybe<Character>>>,
  friendsConnection: FriendsConnection,
  appearsIn: Array<Maybe<Episode>>,
};

export type ColorInput = {
  red: number,
  green: number,
  blue: number,
};

export type Droid = Character & {
  id: string,
  name: string,
  friends?: Maybe<Array<Maybe<Character>>>,
  friendsConnection: FriendsConnection,
  appearsIn: Array<Maybe<Episode>>,
  primaryFunction?: Maybe<string>,
};


export type DroidFriendsConnectionArgs = {
  first?: Maybe<number>,
  after?: Maybe<string>
};

export type Episode = 'NEWHOPE' | 'EMPIRE' | 'JEDI';

export type FriendsConnection = {
  totalCount?: Maybe<number>,
  edges?: Maybe<Array<Maybe<FriendsEdge>>>,
  friends?: Maybe<Array<Maybe<Character>>>,
  pageInfo: PageInfo,
};

export type FriendsEdge = {
  cursor: string,
  node?: Maybe<Character>,
};

export type Human = Character & {
  id: string,
  name: string,
  homePlanet?: Maybe<string>,
  height?: Maybe<number>,
  mass?: Maybe<number>,
  friends?: Maybe<Array<Maybe<Character>>>,
  friendsConnection: FriendsConnection,
  appearsIn: Array<Maybe<Episode>>,
  starships?: Maybe<Array<Maybe<Starship>>>,
};


export type HumanHeightArgs = {
  unit: LengthUnit
};


export type HumanFriendsConnectionArgs = {
  first?: Maybe<number>,
  after?: Maybe<string>
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
  startCursor?: Maybe<string>,
  endCursor?: Maybe<string>,
  hasNextPage: boolean,
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
  text?: Maybe<string>
};


export type QueryCharacterArgs = {
  id: string
};


export type QueryDroidArgs = {
  id: string
};


export type QueryHumanArgs = {
  id: string
};


export type QueryStarshipArgs = {
  id: string
};

export type Review = {
  stars: number,
  commentary?: Maybe<string>,
};

export type ReviewInput = {
  stars: number,
  commentary: Maybe<string>,
  favoriteColor: Maybe<ColorInput>,
};

export type SearchResult = Human | Droid | Starship;

export type Starship = {
  id: string,
  name: string,
  length?: Maybe<number>,
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
  includeName: boolean
};


export type HeroNameConditionalInclusionQuery = ({ __typename?: 'Query' } & { hero: Maybe<Pick<Character, 'name'>> });

export type HeroNameConditionalExclusionQueryVariables = {
  episode?: Maybe<Episode>,
  skipName: boolean
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
