/* tslint:disable */
import { GraphQLResolveInfo } from 'graphql';

export type Resolver<Result, Parent = any, Context = any, Args = any> = (
  parent?: Parent,
  args?: Args,
  context?: Context,
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
export interface QueryResolvers<Context = any, Parent = Query> {
  hero?: QueryHeroResolver<Character | null, Parent, Context>;
  reviews?: QueryReviewsResolver<Review[] | null, Parent, Context>;
  search?: QuerySearchResolver<SearchResult[] | null, Parent, Context>;
  character?: QueryCharacterResolver<Character | null, Parent, Context>;
  droid?: QueryDroidResolver<Droid | null, Parent, Context>;
  human?: QueryHumanResolver<Human | null, Parent, Context>;
  starship?: QueryStarshipResolver<Starship | null, Parent, Context>;
}

export type QueryHeroResolver<R = Character | null, Parent = Query, Context = any> = Resolver<R, Parent, Context>;
export interface QueryHeroArgs {
  episode?: Episode | null;
}

export type QueryReviewsResolver<R = Review[] | null, Parent = Query, Context = any> = Resolver<R, Parent, Context>;
export interface QueryReviewsArgs {
  episode: Episode;
}

export type QuerySearchResolver<R = SearchResult[] | null, Parent = Query, Context = any> = Resolver<
  R,
  Parent,
  Context
>;
export interface QuerySearchArgs {
  text?: string | null;
}

export type QueryCharacterResolver<R = Character | null, Parent = Query, Context = any> = Resolver<R, Parent, Context>;
export interface QueryCharacterArgs {
  id: string;
}

export type QueryDroidResolver<R = Droid | null, Parent = Query, Context = any> = Resolver<R, Parent, Context>;
export interface QueryDroidArgs {
  id: string;
}

export type QueryHumanResolver<R = Human | null, Parent = Query, Context = any> = Resolver<R, Parent, Context>;
export interface QueryHumanArgs {
  id: string;
}

export type QueryStarshipResolver<R = Starship | null, Parent = Query, Context = any> = Resolver<R, Parent, Context>;
export interface QueryStarshipArgs {
  id: string;
}

/** A connection object for a character's friends */
export interface FriendsConnectionResolvers<Context = any, Parent = FriendsConnection> {
  totalCount?: FriendsConnectionTotalCountResolver<number | null, Parent, Context> /** The total number of friends */;
  edges?: FriendsConnectionEdgesResolver<
    FriendsEdge[] | null,
    Parent,
    Context
  > /** The edges for each of the character's friends. */;
  friends?: FriendsConnectionFriendsResolver<
    Character[] | null,
    Parent,
    Context
  > /** A list of the friends, as a convenience when edges are not needed. */;
  pageInfo?: FriendsConnectionPageInfoResolver<
    PageInfo,
    Parent,
    Context
  > /** Information for paginating this connection */;
}

export type FriendsConnectionTotalCountResolver<
  R = number | null,
  Parent = FriendsConnection,
  Context = any
> = Resolver<R, Parent, Context>;
export type FriendsConnectionEdgesResolver<
  R = FriendsEdge[] | null,
  Parent = FriendsConnection,
  Context = any
> = Resolver<R, Parent, Context>;
export type FriendsConnectionFriendsResolver<
  R = Character[] | null,
  Parent = FriendsConnection,
  Context = any
> = Resolver<R, Parent, Context>;
export type FriendsConnectionPageInfoResolver<R = PageInfo, Parent = FriendsConnection, Context = any> = Resolver<
  R,
  Parent,
  Context
>; /** An edge object for a character's friends */
export interface FriendsEdgeResolvers<Context = any, Parent = FriendsEdge> {
  cursor?: FriendsEdgeCursorResolver<string, Parent, Context> /** A cursor used for pagination */;
  node?: FriendsEdgeNodeResolver<
    Character | null,
    Parent,
    Context
  > /** The character represented by this friendship edge */;
}

export type FriendsEdgeCursorResolver<R = string, Parent = FriendsEdge, Context = any> = Resolver<R, Parent, Context>;
export type FriendsEdgeNodeResolver<R = Character | null, Parent = FriendsEdge, Context = any> = Resolver<
  R,
  Parent,
  Context
>; /** Information for paginating this connection */
export interface PageInfoResolvers<Context = any, Parent = PageInfo> {
  startCursor?: PageInfoStartCursorResolver<string | null, Parent, Context>;
  endCursor?: PageInfoEndCursorResolver<string | null, Parent, Context>;
  hasNextPage?: PageInfoHasNextPageResolver<boolean, Parent, Context>;
}

export type PageInfoStartCursorResolver<R = string | null, Parent = PageInfo, Context = any> = Resolver<
  R,
  Parent,
  Context
>;
export type PageInfoEndCursorResolver<R = string | null, Parent = PageInfo, Context = any> = Resolver<
  R,
  Parent,
  Context
>;
export type PageInfoHasNextPageResolver<R = boolean, Parent = PageInfo, Context = any> = Resolver<
  R,
  Parent,
  Context
>; /** Represents a review for a movie */
export interface ReviewResolvers<Context = any, Parent = Review> {
  stars?: ReviewStarsResolver<number, Parent, Context> /** The number of stars this review gave, 1-5 */;
  commentary?: ReviewCommentaryResolver<string | null, Parent, Context> /** Comment about the movie */;
}

export type ReviewStarsResolver<R = number, Parent = Review, Context = any> = Resolver<R, Parent, Context>;
export type ReviewCommentaryResolver<R = string | null, Parent = Review, Context = any> = Resolver<
  R,
  Parent,
  Context
>; /** A humanoid creature from the Star Wars universe */
export interface HumanResolvers<Context = any, Parent = Human> {
  id?: HumanIdResolver<string, Parent, Context> /** The ID of the human */;
  name?: HumanNameResolver<string, Parent, Context> /** What this human calls themselves */;
  homePlanet?: HumanHomePlanetResolver<
    string | null,
    Parent,
    Context
  > /** The home planet of the human, or null if unknown */;
  height?: HumanHeightResolver<number | null, Parent, Context> /** Height in the preferred unit, default is meters */;
  mass?: HumanMassResolver<number | null, Parent, Context> /** Mass in kilograms, or null if unknown */;
  friends?: HumanFriendsResolver<
    Character[] | null,
    Parent,
    Context
  > /** This human's friends, or an empty list if they have none */;
  friendsConnection?: HumanFriendsConnectionResolver<
    FriendsConnection,
    Parent,
    Context
  > /** The friends of the human exposed as a connection with edges */;
  appearsIn?: HumanAppearsInResolver<Episode[], Parent, Context> /** The movies this human appears in */;
  starships?: HumanStarshipsResolver<
    Starship[] | null,
    Parent,
    Context
  > /** A list of starships this person has piloted, or an empty list if none */;
}

export type HumanIdResolver<R = string, Parent = Human, Context = any> = Resolver<R, Parent, Context>;
export type HumanNameResolver<R = string, Parent = Human, Context = any> = Resolver<R, Parent, Context>;
export type HumanHomePlanetResolver<R = string | null, Parent = Human, Context = any> = Resolver<R, Parent, Context>;
export type HumanHeightResolver<R = number | null, Parent = Human, Context = any> = Resolver<R, Parent, Context>;
export interface HumanHeightArgs {
  unit?: LengthUnit | null;
}

export type HumanMassResolver<R = number | null, Parent = Human, Context = any> = Resolver<R, Parent, Context>;
export type HumanFriendsResolver<R = Character[] | null, Parent = Human, Context = any> = Resolver<R, Parent, Context>;
export type HumanFriendsConnectionResolver<R = FriendsConnection, Parent = Human, Context = any> = Resolver<
  R,
  Parent,
  Context
>;
export interface HumanFriendsConnectionArgs {
  first?: number | null;
  after?: string | null;
}

export type HumanAppearsInResolver<R = Episode[], Parent = Human, Context = any> = Resolver<R, Parent, Context>;
export type HumanStarshipsResolver<R = Starship[] | null, Parent = Human, Context = any> = Resolver<R, Parent, Context>;
export interface StarshipResolvers<Context = any, Parent = Starship> {
  id?: StarshipIdResolver<string, Parent, Context> /** The ID of the starship */;
  name?: StarshipNameResolver<string, Parent, Context> /** The name of the starship */;
  length?: StarshipLengthResolver<number | null, Parent, Context> /** Length of the starship, along the longest axis */;
}

export type StarshipIdResolver<R = string, Parent = Starship, Context = any> = Resolver<R, Parent, Context>;
export type StarshipNameResolver<R = string, Parent = Starship, Context = any> = Resolver<R, Parent, Context>;
export type StarshipLengthResolver<R = number | null, Parent = Starship, Context = any> = Resolver<R, Parent, Context>;
export interface StarshipLengthArgs {
  unit?: LengthUnit | null;
}

/** An autonomous mechanical character in the Star Wars universe */
export interface DroidResolvers<Context = any, Parent = Droid> {
  id?: DroidIdResolver<string, Parent, Context> /** The ID of the droid */;
  name?: DroidNameResolver<string, Parent, Context> /** What others call this droid */;
  friends?: DroidFriendsResolver<
    Character[] | null,
    Parent,
    Context
  > /** This droid's friends, or an empty list if they have none */;
  friendsConnection?: DroidFriendsConnectionResolver<
    FriendsConnection,
    Parent,
    Context
  > /** The friends of the droid exposed as a connection with edges */;
  appearsIn?: DroidAppearsInResolver<Episode[], Parent, Context> /** The movies this droid appears in */;
  primaryFunction?: DroidPrimaryFunctionResolver<string | null, Parent, Context> /** This droid's primary function */;
}

export type DroidIdResolver<R = string, Parent = Droid, Context = any> = Resolver<R, Parent, Context>;
export type DroidNameResolver<R = string, Parent = Droid, Context = any> = Resolver<R, Parent, Context>;
export type DroidFriendsResolver<R = Character[] | null, Parent = Droid, Context = any> = Resolver<R, Parent, Context>;
export type DroidFriendsConnectionResolver<R = FriendsConnection, Parent = Droid, Context = any> = Resolver<
  R,
  Parent,
  Context
>;
export interface DroidFriendsConnectionArgs {
  first?: number | null;
  after?: string | null;
}

export type DroidAppearsInResolver<R = Episode[], Parent = Droid, Context = any> = Resolver<R, Parent, Context>;
export type DroidPrimaryFunctionResolver<R = string | null, Parent = Droid, Context = any> = Resolver<
  R,
  Parent,
  Context
>; /** The mutation type, represents all updates we can make to our data */
export interface MutationResolvers<Context = any, Parent = Mutation> {
  createReview?: MutationCreateReviewResolver<Review | null, Parent, Context>;
}

export type MutationCreateReviewResolver<R = Review | null, Parent = Mutation, Context = any> = Resolver<
  R,
  Parent,
  Context
>;
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
  friends?: HeroParentTypeDependentFieldFriends[] | null;
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
