type Maybe<T> = T | null;
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
};

export type Character = {
  readonly id: Scalars['ID'],
  readonly name: Scalars['String'],
  readonly friends?: Maybe<ReadonlyArray<Maybe<Character>>>,
  readonly friendsConnection: FriendsConnection,
  readonly appearsIn: ReadonlyArray<Maybe<Episode>>,
};

export type ColorInput = {
  red: Scalars['Int'],
  green: Scalars['Int'],
  blue: Scalars['Int'],
};

export type Droid = Character & {
  readonly id: Scalars['ID'],
  readonly name: Scalars['String'],
  readonly friends?: Maybe<ReadonlyArray<Maybe<Character>>>,
  readonly friendsConnection: FriendsConnection,
  readonly appearsIn: ReadonlyArray<Maybe<Episode>>,
  readonly primaryFunction?: Maybe<Scalars['String']>,
};


export type DroidFriendsConnectionArgs = {
  first?: Maybe<Scalars['Int']>,
  after?: Maybe<Scalars['ID']>
};

export enum Episode {
  Newhope = 'NEWHOPE',
  Empire = 'EMPIRE',
  Jedi = 'JEDI'
}

export type FriendsConnection = {
  readonly totalCount?: Maybe<Scalars['Int']>,
  readonly edges?: Maybe<ReadonlyArray<Maybe<FriendsEdge>>>,
  readonly friends?: Maybe<ReadonlyArray<Maybe<Character>>>,
  readonly pageInfo: PageInfo,
};

export type FriendsEdge = {
  readonly cursor: Scalars['ID'],
  readonly node?: Maybe<Character>,
};

export type Human = Character & {
  readonly id: Scalars['ID'],
  readonly name: Scalars['String'],
  readonly homePlanet?: Maybe<Scalars['String']>,
  readonly height?: Maybe<Scalars['Float']>,
  readonly mass?: Maybe<Scalars['Float']>,
  readonly friends?: Maybe<ReadonlyArray<Maybe<Character>>>,
  readonly friendsConnection: FriendsConnection,
  readonly appearsIn: ReadonlyArray<Maybe<Episode>>,
  readonly starships?: Maybe<ReadonlyArray<Maybe<Starship>>>,
};


export type HumanHeightArgs = {
  unit: LengthUnit
};


export type HumanFriendsConnectionArgs = {
  first?: Maybe<Scalars['Int']>,
  after?: Maybe<Scalars['ID']>
};

export enum LengthUnit {
  Meter = 'METER',
  Foot = 'FOOT'
}

export type Mutation = {
  readonly createReview?: Maybe<Review>,
};


export type MutationCreateReviewArgs = {
  episode?: Maybe<Episode>,
  review: ReviewInput
};

export type PageInfo = {
  readonly startCursor?: Maybe<Scalars['ID']>,
  readonly endCursor?: Maybe<Scalars['ID']>,
  readonly hasNextPage: Scalars['Boolean'],
};

export type Query = {
  readonly hero?: Maybe<Character>,
  readonly reviews?: Maybe<ReadonlyArray<Maybe<Review>>>,
  readonly search?: Maybe<ReadonlyArray<Maybe<SearchResult>>>,
  readonly character?: Maybe<Character>,
  readonly droid?: Maybe<Droid>,
  readonly human?: Maybe<Human>,
  readonly starship?: Maybe<Starship>,
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
  readonly stars: Scalars['Int'],
  readonly commentary?: Maybe<Scalars['String']>,
};

export type ReviewInput = {
  stars: Scalars['Int'],
  commentary?: Maybe<Scalars['String']>,
  favoriteColor?: Maybe<ColorInput>,
};

export type SearchResult = Human | Droid | Starship;

export type Starship = {
  readonly id: Scalars['ID'],
  readonly name: Scalars['String'],
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
