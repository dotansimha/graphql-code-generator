/* tslint:disable */
import { GraphQLResolveInfo } from 'graphql';

export type Resolver<Result, Parent = any, Context = any, Args = any> = (
  parent?: Parent,
  args?: Args,
  context?: Context,
  info?: GraphQLResolveInfo
) => Promise<Result> | Result;

export type SubscriptionResolver<Result, Parent = any, Context = any, Args = any> = {
  subscribe<R = Result, P = Parent>(
    parent?: P,
    args?: Args,
    context?: Context,
    info?: GraphQLResolveInfo
  ): AsyncIterator<R | Result>;
  resolve?<R = Result, P = Parent>(
    parent?: P,
    args?: Args,
    context?: Context,
    info?: GraphQLResolveInfo
  ): R | Result | Promise<R | Result>;
};

/** A character from the Star Wars universe */
export interface Character {
  readonly id: string /** The ID of the character */;
  readonly name: string /** The name of the character */;
  readonly friends?: ReadonlyArray<Character | null> | null /** The friends of the character, or an empty list if they have none */;
  readonly friendsConnection: FriendsConnection /** The friends of the character exposed as a connection with edges */;
  readonly appearsIn: ReadonlyArray<Episode | null> /** The movies this character appears in */;
}
/** The query type, represents all of the entry points into our object graph */
export interface Query {
  readonly hero?: Character | null;
  readonly reviews?: ReadonlyArray<Review | null> | null;
  readonly search?: ReadonlyArray<SearchResult | null> | null;
  readonly character?: Character | null;
  readonly droid?: Droid | null;
  readonly human?: Human | null;
  readonly starship?: Starship | null;
}
/** A connection object for a character's friends */
export interface FriendsConnection {
  readonly totalCount?: number | null /** The total number of friends */;
  readonly edges?: ReadonlyArray<FriendsEdge | null> | null /** The edges for each of the character's friends. */;
  readonly friends?: ReadonlyArray<Character | null> | null /** A list of the friends, as a convenience when edges are not needed. */;
  readonly pageInfo: PageInfo /** Information for paginating this connection */;
}
/** An edge object for a character's friends */
export interface FriendsEdge {
  readonly cursor: string /** A cursor used for pagination */;
  readonly node?: Character | null /** The character represented by this friendship edge */;
}
/** Information for paginating this connection */
export interface PageInfo {
  readonly startCursor?: string | null;
  readonly endCursor?: string | null;
  readonly hasNextPage: boolean;
}
/** Represents a review for a movie */
export interface Review {
  readonly stars: number /** The number of stars this review gave, 1-5 */;
  readonly commentary?: string | null /** Comment about the movie */;
}
/** A humanoid creature from the Star Wars universe */
export interface Human extends Character {
  readonly id: string /** The ID of the human */;
  readonly name: string /** What this human calls themselves */;
  readonly homePlanet?: string | null /** The home planet of the human, or null if unknown */;
  readonly height?: number | null /** Height in the preferred unit, default is meters */;
  readonly mass?: number | null /** Mass in kilograms, or null if unknown */;
  readonly friends?: ReadonlyArray<Character | null> | null /** This human's friends, or an empty list if they have none */;
  readonly friendsConnection: FriendsConnection /** The friends of the human exposed as a connection with edges */;
  readonly appearsIn: ReadonlyArray<Episode | null> /** The movies this human appears in */;
  readonly starships?: ReadonlyArray<Starship | null> | null /** A list of starships this person has piloted, or an empty list if none */;
}

export interface Starship {
  readonly id: string /** The ID of the starship */;
  readonly name: string /** The name of the starship */;
  readonly length?: number | null /** Length of the starship, along the longest axis */;
}
/** An autonomous mechanical character in the Star Wars universe */
export interface Droid extends Character {
  readonly id: string /** The ID of the droid */;
  readonly name: string /** What others call this droid */;
  readonly friends?: ReadonlyArray<Character | null> | null /** This droid's friends, or an empty list if they have none */;
  readonly friendsConnection: FriendsConnection /** The friends of the droid exposed as a connection with edges */;
  readonly appearsIn: ReadonlyArray<Episode | null> /** The movies this droid appears in */;
  readonly primaryFunction?: string | null /** This droid's primary function */;
}
/** The mutation type, represents all updates we can make to our data */
export interface Mutation {
  readonly createReview?: Review | null;
}
/** The input object sent when someone is creating a new review */
export interface ReviewInput {
  readonly stars: number /** 0-5 stars */;
  readonly commentary?: string | null /** Comment about the movie, optional */;
  readonly favoriteColor?: ColorInput | null /** Favorite color, optional */;
}
/** The input object sent when passing a color */
export interface ColorInput {
  readonly red: number;
  readonly green: number;
  readonly blue: number;
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
export namespace QueryResolvers {
  export interface Resolvers<Context = any> {
    hero?: HeroResolver<Character | null, any, Context>;
    reviews?: ReviewsResolver<ReadonlyArray<Review | null> | null, any, Context>;
    search?: SearchResolver<ReadonlyArray<SearchResult | null> | null, any, Context>;
    character?: CharacterResolver<Character | null, any, Context>;
    droid?: DroidResolver<Droid | null, any, Context>;
    human?: HumanResolver<Human | null, any, Context>;
    starship?: StarshipResolver<Starship | null, any, Context>;
  }

  export type HeroResolver<R = Character | null, Parent = any, Context = any> = Resolver<R, Parent, Context, HeroArgs>;
  export interface HeroArgs {
    episode?: Episode | null;
  }

  export type ReviewsResolver<R = ReadonlyArray<Review | null> | null, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context,
    ReviewsArgs
  >;
  export interface ReviewsArgs {
    episode: Episode;
  }

  export type SearchResolver<R = ReadonlyArray<SearchResult | null> | null, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context,
    SearchArgs
  >;
  export interface SearchArgs {
    text?: string | null;
  }

  export type CharacterResolver<R = Character | null, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context,
    CharacterArgs
  >;
  export interface CharacterArgs {
    id: string;
  }

  export type DroidResolver<R = Droid | null, Parent = any, Context = any> = Resolver<R, Parent, Context, DroidArgs>;
  export interface DroidArgs {
    id: string;
  }

  export type HumanResolver<R = Human | null, Parent = any, Context = any> = Resolver<R, Parent, Context, HumanArgs>;
  export interface HumanArgs {
    id: string;
  }

  export type StarshipResolver<R = Starship | null, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context,
    StarshipArgs
  >;
  export interface StarshipArgs {
    id: string;
  }
}
/** A connection object for a character's friends */
export namespace FriendsConnectionResolvers {
  export interface Resolvers<Context = any> {
    totalCount?: TotalCountResolver<number | null, any, Context> /** The total number of friends */;
    edges?: EdgesResolver<
      ReadonlyArray<FriendsEdge | null> | null,
      any,
      Context
    > /** The edges for each of the character's friends. */;
    friends?: FriendsResolver<
      ReadonlyArray<Character | null> | null,
      any,
      Context
    > /** A list of the friends, as a convenience when edges are not needed. */;
    pageInfo?: PageInfoResolver<PageInfo, any, Context> /** Information for paginating this connection */;
  }

  export type TotalCountResolver<R = number | null, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type EdgesResolver<R = ReadonlyArray<FriendsEdge | null> | null, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context
  >;
  export type FriendsResolver<R = ReadonlyArray<Character | null> | null, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context
  >;
  export type PageInfoResolver<R = PageInfo, Parent = any, Context = any> = Resolver<R, Parent, Context>;
}
/** An edge object for a character's friends */
export namespace FriendsEdgeResolvers {
  export interface Resolvers<Context = any> {
    cursor?: CursorResolver<string, any, Context> /** A cursor used for pagination */;
    node?: NodeResolver<Character | null, any, Context> /** The character represented by this friendship edge */;
  }

  export type CursorResolver<R = string, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type NodeResolver<R = Character | null, Parent = any, Context = any> = Resolver<R, Parent, Context>;
}
/** Information for paginating this connection */
export namespace PageInfoResolvers {
  export interface Resolvers<Context = any> {
    startCursor?: StartCursorResolver<string | null, any, Context>;
    endCursor?: EndCursorResolver<string | null, any, Context>;
    hasNextPage?: HasNextPageResolver<boolean, any, Context>;
  }

  export type StartCursorResolver<R = string | null, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type EndCursorResolver<R = string | null, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type HasNextPageResolver<R = boolean, Parent = any, Context = any> = Resolver<R, Parent, Context>;
}
/** Represents a review for a movie */
export namespace ReviewResolvers {
  export interface Resolvers<Context = any> {
    stars?: StarsResolver<number, any, Context> /** The number of stars this review gave, 1-5 */;
    commentary?: CommentaryResolver<string | null, any, Context> /** Comment about the movie */;
  }

  export type StarsResolver<R = number, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type CommentaryResolver<R = string | null, Parent = any, Context = any> = Resolver<R, Parent, Context>;
}
/** A humanoid creature from the Star Wars universe */
export namespace HumanResolvers {
  export interface Resolvers<Context = any> {
    id?: IdResolver<string, any, Context> /** The ID of the human */;
    name?: NameResolver<string, any, Context> /** What this human calls themselves */;
    homePlanet?: HomePlanetResolver<
      string | null,
      any,
      Context
    > /** The home planet of the human, or null if unknown */;
    height?: HeightResolver<number | null, any, Context> /** Height in the preferred unit, default is meters */;
    mass?: MassResolver<number | null, any, Context> /** Mass in kilograms, or null if unknown */;
    friends?: FriendsResolver<
      ReadonlyArray<Character | null> | null,
      any,
      Context
    > /** This human's friends, or an empty list if they have none */;
    friendsConnection?: FriendsConnectionResolver<
      FriendsConnection,
      any,
      Context
    > /** The friends of the human exposed as a connection with edges */;
    appearsIn?: AppearsInResolver<ReadonlyArray<Episode | null>, any, Context> /** The movies this human appears in */;
    starships?: StarshipsResolver<
      ReadonlyArray<Starship | null> | null,
      any,
      Context
    > /** A list of starships this person has piloted, or an empty list if none */;
  }

  export type IdResolver<R = string, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type NameResolver<R = string, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type HomePlanetResolver<R = string | null, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type HeightResolver<R = number | null, Parent = any, Context = any> = Resolver<R, Parent, Context, HeightArgs>;
  export interface HeightArgs {
    unit?: LengthUnit | null;
  }

  export type MassResolver<R = number | null, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type FriendsResolver<R = ReadonlyArray<Character | null> | null, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context
  >;
  export type FriendsConnectionResolver<R = FriendsConnection, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context,
    FriendsConnectionArgs
  >;
  export interface FriendsConnectionArgs {
    first?: number | null;
    after?: string | null;
  }

  export type AppearsInResolver<R = ReadonlyArray<Episode | null>, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context
  >;
  export type StarshipsResolver<R = ReadonlyArray<Starship | null> | null, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context
  >;
}

export namespace StarshipResolvers {
  export interface Resolvers<Context = any> {
    id?: IdResolver<string, any, Context> /** The ID of the starship */;
    name?: NameResolver<string, any, Context> /** The name of the starship */;
    length?: LengthResolver<number | null, any, Context> /** Length of the starship, along the longest axis */;
  }

  export type IdResolver<R = string, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type NameResolver<R = string, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type LengthResolver<R = number | null, Parent = any, Context = any> = Resolver<R, Parent, Context, LengthArgs>;
  export interface LengthArgs {
    unit?: LengthUnit | null;
  }
}
/** An autonomous mechanical character in the Star Wars universe */
export namespace DroidResolvers {
  export interface Resolvers<Context = any> {
    id?: IdResolver<string, any, Context> /** The ID of the droid */;
    name?: NameResolver<string, any, Context> /** What others call this droid */;
    friends?: FriendsResolver<
      ReadonlyArray<Character | null> | null,
      any,
      Context
    > /** This droid's friends, or an empty list if they have none */;
    friendsConnection?: FriendsConnectionResolver<
      FriendsConnection,
      any,
      Context
    > /** The friends of the droid exposed as a connection with edges */;
    appearsIn?: AppearsInResolver<ReadonlyArray<Episode | null>, any, Context> /** The movies this droid appears in */;
    primaryFunction?: PrimaryFunctionResolver<string | null, any, Context> /** This droid's primary function */;
  }

  export type IdResolver<R = string, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type NameResolver<R = string, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type FriendsResolver<R = ReadonlyArray<Character | null> | null, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context
  >;
  export type FriendsConnectionResolver<R = FriendsConnection, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context,
    FriendsConnectionArgs
  >;
  export interface FriendsConnectionArgs {
    first?: number | null;
    after?: string | null;
  }

  export type AppearsInResolver<R = ReadonlyArray<Episode | null>, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context
  >;
  export type PrimaryFunctionResolver<R = string | null, Parent = any, Context = any> = Resolver<R, Parent, Context>;
}
/** The mutation type, represents all updates we can make to our data */
export namespace MutationResolvers {
  export interface Resolvers<Context = any> {
    createReview?: CreateReviewResolver<Review | null, any, Context>;
  }

  export type CreateReviewResolver<R = Review | null, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context,
    CreateReviewArgs
  >;
  export interface CreateReviewArgs {
    episode?: Episode | null;
    review: ReviewInput;
  }
}

export namespace CreateReviewForEpisode {
  export type Variables = {
    readonly episode: Episode;
    readonly review: ReviewInput;
  };

  export type Mutation = {
    readonly __typename?: 'Mutation';
    readonly createReview?: CreateReview | null;
  };

  export type CreateReview = {
    readonly __typename?: 'Review';
    readonly stars: number;
    readonly commentary?: string | null;
  };
}

export namespace HeroAndFriendsNames {
  export type Variables = {
    readonly episode?: Episode | null;
  };

  export type Query = {
    readonly __typename?: 'Query';
    readonly hero?: Hero | null;
  };

  export type Hero = {
    readonly __typename?: 'Character';
    readonly name: string;
    readonly friends?: ReadonlyArray<Friends | null> | null;
  };

  export type Friends = {
    readonly __typename?: 'Character';
    readonly name: string;
  };
}

export namespace HeroAppearsIn {
  export type Variables = {};

  export type Query = {
    readonly __typename?: 'Query';
    readonly hero?: Hero | null;
  };

  export type Hero = {
    readonly __typename?: 'Character';
    readonly name: string;
    readonly appearsIn: ReadonlyArray<Episode | null>;
  };
}

export namespace HeroDetails {
  export type Variables = {
    readonly episode?: Episode | null;
  };

  export type Query = {
    readonly __typename?: 'Query';
    readonly hero?: Hero | null;
  };

  export type Hero = {
    readonly __typename?: HumanInlineFragment['__typename'] | DroidInlineFragment['__typename'];
    readonly name: string;
  } & (HumanInlineFragment | DroidInlineFragment);

  export type HumanInlineFragment = {
    readonly __typename?: 'Human';
    readonly height?: number | null;
  };

  export type DroidInlineFragment = {
    readonly __typename?: 'Droid';
    readonly primaryFunction?: string | null;
  };
}

export namespace HeroDetailsWithFragment {
  export type Variables = {
    readonly episode?: Episode | null;
  };

  export type Query = {
    readonly __typename?: 'Query';
    readonly hero?: Hero | null;
  };

  export type Hero = HeroDetails.Fragment;
}

export namespace HeroName {
  export type Variables = {
    readonly episode?: Episode | null;
  };

  export type Query = {
    readonly __typename?: 'Query';
    readonly hero?: Hero | null;
  };

  export type Hero = {
    readonly __typename?: 'Character';
    readonly name: string;
  };
}

export namespace HeroNameConditionalInclusion {
  export type Variables = {
    readonly episode?: Episode | null;
    readonly includeName: boolean;
  };

  export type Query = {
    readonly __typename?: 'Query';
    readonly hero?: Hero | null;
  };

  export type Hero = {
    readonly __typename?: 'Character';
    readonly name: string;
  };
}

export namespace HeroNameConditionalExclusion {
  export type Variables = {
    readonly episode?: Episode | null;
    readonly skipName: boolean;
  };

  export type Query = {
    readonly __typename?: 'Query';
    readonly hero?: Hero | null;
  };

  export type Hero = {
    readonly __typename?: 'Character';
    readonly name: string;
  };
}

export namespace HeroParentTypeDependentField {
  export type Variables = {
    readonly episode?: Episode | null;
  };

  export type Query = {
    readonly __typename?: 'Query';
    readonly hero?: Hero | null;
  };

  export type Hero = {
    readonly __typename?: HumanInlineFragment['__typename'] | DroidInlineFragment['__typename'];
    readonly name: string;
  } & (HumanInlineFragment | DroidInlineFragment);

  export type HumanInlineFragment = {
    readonly __typename?: 'Human';
    readonly friends?: ReadonlyArray<Friends | null> | null;
  };

  export type Friends = {
    readonly __typename?: _HumanInlineFragment['__typename'];
    readonly name: string;
  } & (_HumanInlineFragment);

  export type _HumanInlineFragment = {
    readonly __typename?: 'Human';
    readonly height?: number | null;
  };

  export type DroidInlineFragment = {
    readonly __typename?: 'Droid';
    readonly friends?: ReadonlyArray<_Friends | null> | null;
  };

  export type _Friends = {
    readonly __typename?: __HumanInlineFragment['__typename'];
    readonly name: string;
  } & (__HumanInlineFragment);

  export type __HumanInlineFragment = {
    readonly __typename?: 'Human';
    readonly height?: number | null;
  };
}

export namespace HeroTypeDependentAliasedField {
  export type Variables = {
    readonly episode?: Episode | null;
  };

  export type Query = {
    readonly __typename?: 'Query';
    readonly hero?: Hero | null;
  };

  export type Hero = HumanInlineFragment | DroidInlineFragment;

  export type HumanInlineFragment = {
    readonly __typename?: 'Human';
    readonly property?: string | null;
  };

  export type DroidInlineFragment = {
    readonly __typename?: 'Droid';
    readonly property?: string | null;
  };
}

export namespace HumanWithNullHeight {
  export type Variables = {};

  export type Query = {
    readonly __typename?: 'Query';
    readonly human?: Human | null;
  };

  export type Human = {
    readonly __typename?: 'Human';
    readonly name: string;
    readonly mass?: number | null;
  };
}

export namespace TwoHeroes {
  export type Variables = {};

  export type Query = {
    readonly __typename?: 'Query';
    readonly r2?: R2 | null;
    readonly luke?: Luke | null;
  };

  export type R2 = {
    readonly __typename?: 'Character';
    readonly name: string;
  };

  export type Luke = {
    readonly __typename?: 'Character';
    readonly name: string;
  };
}

export namespace HeroDetails {
  export type Fragment = {
    readonly __typename?: 'Character';
    readonly name: string;
  } & (HumanInlineFragment | DroidInlineFragment);

  export type HumanInlineFragment = {
    readonly __typename?: 'Human';
    readonly height?: number | null;
  };

  export type DroidInlineFragment = {
    readonly __typename?: 'Droid';
    readonly primaryFunction?: string | null;
  };
}
