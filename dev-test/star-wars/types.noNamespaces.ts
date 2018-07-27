/* tslint:disable */
import { GraphQLResolveInfo } from 'graphql';

type Resolver<Parent, Result, Args = any> = (
  parent?: Parent,
  args?: Args,
  context?: any,
  info?: GraphQLResolveInfo
) => Promise<Result> | Result;

/** A character from the Star Wars universe */
export interface Character {
  id: string /** The ID of the character */;
  name: string /** The name of the character */;
  friends?: Character[] | null /** The friends of the character, or an empty list if they have none */;
  friendsConnection: FriendsConnection /** The friends of the character exposed as a connection with edges */;
  appearsIn: Episode[] /** The movies this character appears in */;
}
/** The query type, represents all of the entry points into our object graph */
export interface Query {
  hero?: Character | null;
  reviews?: Review[] | null;
  search?: SearchResult[] | null;
  character?: Character | null;
  droid?: Droid | null;
  human?: Human | null;
  starship?: Starship | null;
}
/** A connection object for a character's friends */
export interface FriendsConnection {
  totalCount?: number | null /** The total number of friends */;
  edges?: FriendsEdge[] | null /** The edges for each of the character's friends. */;
  friends?: Character[] | null /** A list of the friends, as a convenience when edges are not needed. */;
  pageInfo: PageInfo /** Information for paginating this connection */;
}
/** An edge object for a character's friends */
export interface FriendsEdge {
  cursor: string /** A cursor used for pagination */;
  node?: Character | null /** The character represented by this friendship edge */;
}
/** Information for paginating this connection */
export interface PageInfo {
  startCursor?: string | null;
  endCursor?: string | null;
  hasNextPage: boolean;
}
/** Represents a review for a movie */
export interface Review {
  stars: number /** The number of stars this review gave, 1-5 */;
  commentary?: string | null /** Comment about the movie */;
}
/** A humanoid creature from the Star Wars universe */
export interface Human extends Character {
  id: string /** The ID of the human */;
  name: string /** What this human calls themselves */;
  homePlanet?: string | null /** The home planet of the human, or null if unknown */;
  height?: number | null /** Height in the preferred unit, default is meters */;
  mass?: number | null /** Mass in kilograms, or null if unknown */;
  friends?: Character[] | null /** This human's friends, or an empty list if they have none */;
  friendsConnection: FriendsConnection /** The friends of the human exposed as a connection with edges */;
  appearsIn: Episode[] /** The movies this human appears in */;
  starships?: Starship[] | null /** A list of starships this person has piloted, or an empty list if none */;
}

export interface Starship {
  id: string /** The ID of the starship */;
  name: string /** The name of the starship */;
  length?: number | null /** Length of the starship, along the longest axis */;
}
/** An autonomous mechanical character in the Star Wars universe */
export interface Droid extends Character {
  id: string /** The ID of the droid */;
  name: string /** What others call this droid */;
  friends?: Character[] | null /** This droid's friends, or an empty list if they have none */;
  friendsConnection: FriendsConnection /** The friends of the droid exposed as a connection with edges */;
  appearsIn: Episode[] /** The movies this droid appears in */;
  primaryFunction?: string | null /** This droid's primary function */;
}
/** The mutation type, represents all updates we can make to our data */
export interface Mutation {
  createReview?: Review | null;
}
/** The input object sent when someone is creating a new review */
export interface ReviewInput {
  stars: number /** 0-5 stars */;
  commentary?: string | null /** Comment about the movie, optional */;
  favoriteColor?: ColorInput | null /** Favorite color, optional */;
}
/** The input object sent when passing a color */
export interface ColorInput {
  red: number;
  green: number;
  blue: number;
}
export interface HeroQueryArgs {
  episode?: Episode | null;
}
export interface ReviewsQueryArgs {
  episode: Episode;
}
export interface SearchQueryArgs {
  text?: string | null;
}
export interface CharacterQueryArgs {
  id: string;
}
export interface DroidQueryArgs {
  id: string;
}
export interface HumanQueryArgs {
  id: string;
}
export interface StarshipQueryArgs {
  id: string;
}
export interface HeightHumanArgs {
  unit?: LengthUnit | null;
}
export interface FriendsConnectionHumanArgs {
  first?: number | null;
  after?: string | null;
}
export interface LengthStarshipArgs {
  unit?: LengthUnit | null;
}
export interface FriendsConnectionDroidArgs {
  first?: number | null;
  after?: string | null;
}
export interface CreateReviewMutationArgs {
  episode?: Episode | null;
  review: ReviewInput;
}
/** The episodes in the Star Wars trilogy */
export enum Episode {
  NEWHOPE = 'NEWHOPE',
  EMPIRE = 'EMPIRE',
  JEDI = 'JEDI'
}
/** Units of height */
export enum LengthUnit {
  METER = 'METER',
  FOOT = 'FOOT'
}

export type SearchResult = Human | Droid | Starship;

/** The query type, represents all of the entry points into our object graph */
export interface QueryResolvers {
  hero?: QueryHeroResolver;
  reviews?: QueryReviewsResolver;
  search?: QuerySearchResolver;
  character?: QueryCharacterResolver;
  droid?: QueryDroidResolver;
  human?: QueryHumanResolver;
  starship?: QueryStarshipResolver;
}

export type QueryHeroResolver = Resolver<Query, Character | null>;
export interface QueryHeroArgs {
  episode?: Episode | null;
}

export type QueryReviewsResolver = Resolver<Query, Review[] | null>;
export interface QueryReviewsArgs {
  episode: Episode;
}

export type QuerySearchResolver = Resolver<Query, SearchResult[] | null>;
export interface QuerySearchArgs {
  text?: string | null;
}

export type QueryCharacterResolver = Resolver<Query, Character | null>;
export interface QueryCharacterArgs {
  id: string;
}

export type QueryDroidResolver = Resolver<Query, Droid | null>;
export interface QueryDroidArgs {
  id: string;
}

export type QueryHumanResolver = Resolver<Query, Human | null>;
export interface QueryHumanArgs {
  id: string;
}

export type QueryStarshipResolver = Resolver<Query, Starship | null>;
export interface QueryStarshipArgs {
  id: string;
}

/** A connection object for a character's friends */
export interface FriendsConnectionResolvers {
  totalCount?: FriendsConnectionTotalCountResolver /** The total number of friends */;
  edges?: FriendsConnectionEdgesResolver /** The edges for each of the character's friends. */;
  friends?: FriendsConnectionFriendsResolver /** A list of the friends, as a convenience when edges are not needed. */;
  pageInfo?: FriendsConnectionPageInfoResolver /** Information for paginating this connection */;
}

export type FriendsConnectionTotalCountResolver = Resolver<FriendsConnection, number | null>;
export type FriendsConnectionEdgesResolver = Resolver<FriendsConnection, FriendsEdge[] | null>;
export type FriendsConnectionFriendsResolver = Resolver<FriendsConnection, Character[] | null>;
export type FriendsConnectionPageInfoResolver = Resolver<
  FriendsConnection,
  PageInfo
>; /** An edge object for a character's friends */
export interface FriendsEdgeResolvers {
  cursor?: FriendsEdgeCursorResolver /** A cursor used for pagination */;
  node?: FriendsEdgeNodeResolver /** The character represented by this friendship edge */;
}

export type FriendsEdgeCursorResolver = Resolver<FriendsEdge, string>;
export type FriendsEdgeNodeResolver = Resolver<
  FriendsEdge,
  Character | null
>; /** Information for paginating this connection */
export interface PageInfoResolvers {
  startCursor?: PageInfoStartCursorResolver;
  endCursor?: PageInfoEndCursorResolver;
  hasNextPage?: PageInfoHasNextPageResolver;
}

export type PageInfoStartCursorResolver = Resolver<PageInfo, string | null>;
export type PageInfoEndCursorResolver = Resolver<PageInfo, string | null>;
export type PageInfoHasNextPageResolver = Resolver<PageInfo, boolean>; /** Represents a review for a movie */
export interface ReviewResolvers {
  stars?: ReviewStarsResolver /** The number of stars this review gave, 1-5 */;
  commentary?: ReviewCommentaryResolver /** Comment about the movie */;
}

export type ReviewStarsResolver = Resolver<Review, number>;
export type ReviewCommentaryResolver = Resolver<
  Review,
  string | null
>; /** A humanoid creature from the Star Wars universe */
export interface HumanResolvers {
  id?: HumanIdResolver /** The ID of the human */;
  name?: HumanNameResolver /** What this human calls themselves */;
  homePlanet?: HumanHomePlanetResolver /** The home planet of the human, or null if unknown */;
  height?: HumanHeightResolver /** Height in the preferred unit, default is meters */;
  mass?: HumanMassResolver /** Mass in kilograms, or null if unknown */;
  friends?: HumanFriendsResolver /** This human's friends, or an empty list if they have none */;
  friendsConnection?: HumanFriendsConnectionResolver /** The friends of the human exposed as a connection with edges */;
  appearsIn?: HumanAppearsInResolver /** The movies this human appears in */;
  starships?: HumanStarshipsResolver /** A list of starships this person has piloted, or an empty list if none */;
}

export type HumanIdResolver = Resolver<Human, string>;
export type HumanNameResolver = Resolver<Human, string>;
export type HumanHomePlanetResolver = Resolver<Human, string | null>;
export type HumanHeightResolver = Resolver<Human, number | null>;
export interface HumanHeightArgs {
  unit?: LengthUnit | null;
}

export type HumanMassResolver = Resolver<Human, number | null>;
export type HumanFriendsResolver = Resolver<Human, Character[] | null>;
export type HumanFriendsConnectionResolver = Resolver<Human, FriendsConnection>;
export interface HumanFriendsConnectionArgs {
  first?: number | null;
  after?: string | null;
}

export type HumanAppearsInResolver = Resolver<Human, Episode[]>;
export type HumanStarshipsResolver = Resolver<Human, Starship[] | null>;
export interface StarshipResolvers {
  id?: StarshipIdResolver /** The ID of the starship */;
  name?: StarshipNameResolver /** The name of the starship */;
  length?: StarshipLengthResolver /** Length of the starship, along the longest axis */;
}

export type StarshipIdResolver = Resolver<Starship, string>;
export type StarshipNameResolver = Resolver<Starship, string>;
export type StarshipLengthResolver = Resolver<Starship, number | null>;
export interface StarshipLengthArgs {
  unit?: LengthUnit | null;
}

/** An autonomous mechanical character in the Star Wars universe */
export interface DroidResolvers {
  id?: DroidIdResolver /** The ID of the droid */;
  name?: DroidNameResolver /** What others call this droid */;
  friends?: DroidFriendsResolver /** This droid's friends, or an empty list if they have none */;
  friendsConnection?: DroidFriendsConnectionResolver /** The friends of the droid exposed as a connection with edges */;
  appearsIn?: DroidAppearsInResolver /** The movies this droid appears in */;
  primaryFunction?: DroidPrimaryFunctionResolver /** This droid's primary function */;
}

export type DroidIdResolver = Resolver<Droid, string>;
export type DroidNameResolver = Resolver<Droid, string>;
export type DroidFriendsResolver = Resolver<Droid, Character[] | null>;
export type DroidFriendsConnectionResolver = Resolver<Droid, FriendsConnection>;
export interface DroidFriendsConnectionArgs {
  first?: number | null;
  after?: string | null;
}

export type DroidAppearsInResolver = Resolver<Droid, Episode[]>;
export type DroidPrimaryFunctionResolver = Resolver<
  Droid,
  string | null
>; /** The mutation type, represents all updates we can make to our data */
export interface MutationResolvers {
  createReview?: MutationCreateReviewResolver;
}

export type MutationCreateReviewResolver = Resolver<Mutation, Review | null>;
export interface MutationCreateReviewArgs {
  episode?: Episode | null;
  review: ReviewInput;
}

export type CreateReviewForEpisodeVariables = {
  episode: Episode;
  review: ReviewInput;
};

export type CreateReviewForEpisodeMutation = {
  __typename?: 'Mutation';
  createReview?: CreateReviewForEpisodeCreateReview | null;
};

export type CreateReviewForEpisodeCreateReview = {
  __typename?: 'Review';
  stars: number;
  commentary?: string | null;
};

export type HeroAndFriendsNamesVariables = {
  episode?: Episode | null;
};

export type HeroAndFriendsNamesQuery = {
  __typename?: 'Query';
  hero?: HeroAndFriendsNamesHero | null;
};

export type HeroAndFriendsNamesHero = {
  __typename?: 'Character';
  name: string;
  friends?: HeroAndFriendsNamesFriends[] | null;
};

export type HeroAndFriendsNamesFriends = {
  __typename?: 'Character';
  name: string;
};

export type HeroAppearsInVariables = {};

export type HeroAppearsInQuery = {
  __typename?: 'Query';
  hero?: HeroAppearsInHero | null;
};

export type HeroAppearsInHero = {
  __typename?: 'Character';
  name: string;
  appearsIn: HeroAppearsInEpisode[];
};

export type HeroDetailsVariables = {
  episode?: Episode | null;
};

export type HeroDetailsQuery = {
  __typename?: 'Query';
  hero?: HeroDetailsHero | null;
};

export type HeroDetailsHero = {
  __typename?: HeroDetailsHumanInlineFragment['__typename'] | HeroDetailsDroidInlineFragment['__typename'];
  name: string;
} & (HeroDetailsHumanInlineFragment | HeroDetailsDroidInlineFragment);

export type HeroDetailsHumanInlineFragment = {
  __typename?: 'Human';
  height?: number | null;
};

export type HeroDetailsDroidInlineFragment = {
  __typename?: 'Droid';
  primaryFunction?: string | null;
};

export type HeroDetailsWithFragmentVariables = {
  episode?: Episode | null;
};

export type HeroDetailsWithFragmentQuery = {
  __typename?: 'Query';
  hero?: HeroDetailsWithFragmentHero | null;
};

export type HeroDetailsWithFragmentHero = HeroDetailsFragment;

export type HeroNameVariables = {
  episode?: Episode | null;
};

export type HeroNameQuery = {
  __typename?: 'Query';
  hero?: HeroNameHero | null;
};

export type HeroNameHero = {
  __typename?: 'Character';
  name: string;
};

export type HeroNameConditionalInclusionVariables = {
  episode?: Episode | null;
  includeName: boolean;
};

export type HeroNameConditionalInclusionQuery = {
  __typename?: 'Query';
  hero?: HeroNameConditionalInclusionHero | null;
};

export type HeroNameConditionalInclusionHero = {
  __typename?: 'Character';
  name: string;
};

export type HeroNameConditionalExclusionVariables = {
  episode?: Episode | null;
  skipName: boolean;
};

export type HeroNameConditionalExclusionQuery = {
  __typename?: 'Query';
  hero?: HeroNameConditionalExclusionHero | null;
};

export type HeroNameConditionalExclusionHero = {
  __typename?: 'Character';
  name: string;
};

export type HeroParentTypeDependentFieldVariables = {
  episode?: Episode | null;
};

export type HeroParentTypeDependentFieldQuery = {
  __typename?: 'Query';
  hero?: HeroParentTypeDependentFieldHero | null;
};

export type HeroParentTypeDependentFieldHero = {
  __typename?:
    | HeroParentTypeDependentFieldHumanInlineFragment['__typename']
    | HeroParentTypeDependentFieldDroidInlineFragment['__typename'];
  name: string;
} & (HeroParentTypeDependentFieldHumanInlineFragment | HeroParentTypeDependentFieldDroidInlineFragment);

export type HeroParentTypeDependentFieldHumanInlineFragment = {
  __typename?: 'Human';
  friends?: HeroParentTypeDependentFieldFriends[] | null;
};

export type HeroParentTypeDependentFieldFriends = {
  __typename?: HeroParentTypeDependentField_HumanInlineFragment['__typename'];
  name: string;
} & (HeroParentTypeDependentField_HumanInlineFragment);

export type HeroParentTypeDependentField_HumanInlineFragment = {
  __typename?: 'Human';
  height?: number | null;
};

export type HeroParentTypeDependentFieldDroidInlineFragment = {
  __typename?: 'Droid';
  friends?: HeroParentTypeDependentField_Friends[] | null;
};

export type HeroParentTypeDependentField_Friends = {
  __typename?: HeroParentTypeDependentField__HumanInlineFragment['__typename'];
  name: string;
} & (HeroParentTypeDependentField__HumanInlineFragment);

export type HeroParentTypeDependentField__HumanInlineFragment = {
  __typename?: 'Human';
  height?: number | null;
};

export type HeroTypeDependentAliasedFieldVariables = {
  episode?: Episode | null;
};

export type HeroTypeDependentAliasedFieldQuery = {
  __typename?: 'Query';
  hero?: HeroTypeDependentAliasedFieldHero | null;
};

export type HeroTypeDependentAliasedFieldHero =
  | HeroTypeDependentAliasedFieldHumanInlineFragment
  | HeroTypeDependentAliasedFieldDroidInlineFragment;

export type HeroTypeDependentAliasedFieldHumanInlineFragment = {
  __typename?: 'Human';
  property?: string | null;
};

export type HeroTypeDependentAliasedFieldDroidInlineFragment = {
  __typename?: 'Droid';
  property?: string | null;
};

export type HumanWithNullHeightVariables = {};

export type HumanWithNullHeightQuery = {
  __typename?: 'Query';
  human?: HumanWithNullHeightHuman | null;
};

export type HumanWithNullHeightHuman = {
  __typename?: 'Human';
  name: string;
  mass?: number | null;
};

export type TwoHeroesVariables = {};

export type TwoHeroesQuery = {
  __typename?: 'Query';
  r2?: TwoHeroesR2 | null;
  luke?: TwoHeroesLuke | null;
};

export type TwoHeroesR2 = {
  __typename?: 'Character';
  name: string;
};

export type TwoHeroesLuke = {
  __typename?: 'Character';
  name: string;
};

export type HeroDetailsFragment = {
  __typename?: 'Character';
  name: string;
} & (HeroDetailsHumanInlineFragment | HeroDetailsDroidInlineFragment);

export type HeroDetailsHumanInlineFragment = {
  __typename?: 'Human';
  height?: number | null;
};

export type HeroDetailsDroidInlineFragment = {
  __typename?: 'Droid';
  primaryFunction?: string | null;
};
