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
  friends?: (Character | null)[] | null /** The friends of the character, or an empty list if they have none */;
  friendsConnection: FriendsConnection /** The friends of the character exposed as a connection with edges */;
  appearsIn: (Episode | null)[] /** The movies this character appears in */;
}
/** The query type, represents all of the entry points into our object graph */
export interface Query {
  hero?: Character | null;
  reviews?: (Review | null)[] | null;
  search?: (SearchResult | null)[] | null;
  character?: Character | null;
  droid?: Droid | null;
  human?: Human | null;
  starship?: Starship | null;
}
/** A connection object for a character's friends */
export interface FriendsConnection {
  totalCount?: number | null /** The total number of friends */;
  edges?: (FriendsEdge | null)[] | null /** The edges for each of the character's friends. */;
  friends?: (Character | null)[] | null /** A list of the friends, as a convenience when edges are not needed. */;
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
  friends?: (Character | null)[] | null /** This human's friends, or an empty list if they have none */;
  friendsConnection: FriendsConnection /** The friends of the human exposed as a connection with edges */;
  appearsIn: (Episode | null)[] /** The movies this human appears in */;
  starships?: (Starship | null)[] | null /** A list of starships this person has piloted, or an empty list if none */;
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
  friends?: (Character | null)[] | null /** This droid's friends, or an empty list if they have none */;
  friendsConnection: FriendsConnection /** The friends of the droid exposed as a connection with edges */;
  appearsIn: (Episode | null)[] /** The movies this droid appears in */;
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
export namespace QueryResolvers {
  export interface Resolvers<Context = any, Parent = Query> {
    hero?: HeroResolver<Character | null, Parent, Context>;
    reviews?: ReviewsResolver<(Review | null)[] | null, Parent, Context>;
    search?: SearchResolver<(SearchResult | null)[] | null, Parent, Context>;
    character?: CharacterResolver<Character | null, Parent, Context>;
    droid?: DroidResolver<Droid | null, Parent, Context>;
    human?: HumanResolver<Human | null, Parent, Context>;
    starship?: StarshipResolver<Starship | null, Parent, Context>;
  }

  export type HeroResolver<R = Character | null, Parent = Query, Context = any> = Resolver<
    R,
    Parent,
    Context,
    HeroArgs
  >;
  export interface HeroArgs {
    episode?: Episode | null;
  }

  export type ReviewsResolver<R = (Review | null)[] | null, Parent = Query, Context = any> = Resolver<
    R,
    Parent,
    Context,
    ReviewsArgs
  >;
  export interface ReviewsArgs {
    episode: Episode;
  }

  export type SearchResolver<R = (SearchResult | null)[] | null, Parent = Query, Context = any> = Resolver<
    R,
    Parent,
    Context,
    SearchArgs
  >;
  export interface SearchArgs {
    text?: string | null;
  }

  export type CharacterResolver<R = Character | null, Parent = Query, Context = any> = Resolver<
    R,
    Parent,
    Context,
    CharacterArgs
  >;
  export interface CharacterArgs {
    id: string;
  }

  export type DroidResolver<R = Droid | null, Parent = Query, Context = any> = Resolver<R, Parent, Context, DroidArgs>;
  export interface DroidArgs {
    id: string;
  }

  export type HumanResolver<R = Human | null, Parent = Query, Context = any> = Resolver<R, Parent, Context, HumanArgs>;
  export interface HumanArgs {
    id: string;
  }

  export type StarshipResolver<R = Starship | null, Parent = Query, Context = any> = Resolver<
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
  export interface Resolvers<Context = any, Parent = FriendsConnection> {
    totalCount?: TotalCountResolver<number | null, Parent, Context> /** The total number of friends */;
    edges?: EdgesResolver<
      (FriendsEdge | null)[] | null,
      Parent,
      Context
    > /** The edges for each of the character's friends. */;
    friends?: FriendsResolver<
      (Character | null)[] | null,
      Parent,
      Context
    > /** A list of the friends, as a convenience when edges are not needed. */;
    pageInfo?: PageInfoResolver<PageInfo, Parent, Context> /** Information for paginating this connection */;
  }

  export type TotalCountResolver<R = number | null, Parent = FriendsConnection, Context = any> = Resolver<
    R,
    Parent,
    Context
  >;
  export type EdgesResolver<R = (FriendsEdge | null)[] | null, Parent = FriendsConnection, Context = any> = Resolver<
    R,
    Parent,
    Context
  >;
  export type FriendsResolver<R = (Character | null)[] | null, Parent = FriendsConnection, Context = any> = Resolver<
    R,
    Parent,
    Context
  >;
  export type PageInfoResolver<R = PageInfo, Parent = FriendsConnection, Context = any> = Resolver<R, Parent, Context>;
}
/** An edge object for a character's friends */
export namespace FriendsEdgeResolvers {
  export interface Resolvers<Context = any, Parent = FriendsEdge> {
    cursor?: CursorResolver<string, Parent, Context> /** A cursor used for pagination */;
    node?: NodeResolver<Character | null, Parent, Context> /** The character represented by this friendship edge */;
  }

  export type CursorResolver<R = string, Parent = FriendsEdge, Context = any> = Resolver<R, Parent, Context>;
  export type NodeResolver<R = Character | null, Parent = FriendsEdge, Context = any> = Resolver<R, Parent, Context>;
}
/** Information for paginating this connection */
export namespace PageInfoResolvers {
  export interface Resolvers<Context = any, Parent = PageInfo> {
    startCursor?: StartCursorResolver<string | null, Parent, Context>;
    endCursor?: EndCursorResolver<string | null, Parent, Context>;
    hasNextPage?: HasNextPageResolver<boolean, Parent, Context>;
  }

  export type StartCursorResolver<R = string | null, Parent = PageInfo, Context = any> = Resolver<R, Parent, Context>;
  export type EndCursorResolver<R = string | null, Parent = PageInfo, Context = any> = Resolver<R, Parent, Context>;
  export type HasNextPageResolver<R = boolean, Parent = PageInfo, Context = any> = Resolver<R, Parent, Context>;
}
/** Represents a review for a movie */
export namespace ReviewResolvers {
  export interface Resolvers<Context = any, Parent = Review> {
    stars?: StarsResolver<number, Parent, Context> /** The number of stars this review gave, 1-5 */;
    commentary?: CommentaryResolver<string | null, Parent, Context> /** Comment about the movie */;
  }

  export type StarsResolver<R = number, Parent = Review, Context = any> = Resolver<R, Parent, Context>;
  export type CommentaryResolver<R = string | null, Parent = Review, Context = any> = Resolver<R, Parent, Context>;
}
/** A humanoid creature from the Star Wars universe */
export namespace HumanResolvers {
  export interface Resolvers<Context = any, Parent = Human> {
    id?: IdResolver<string, Parent, Context> /** The ID of the human */;
    name?: NameResolver<string, Parent, Context> /** What this human calls themselves */;
    homePlanet?: HomePlanetResolver<
      string | null,
      Parent,
      Context
    > /** The home planet of the human, or null if unknown */;
    height?: HeightResolver<number | null, Parent, Context> /** Height in the preferred unit, default is meters */;
    mass?: MassResolver<number | null, Parent, Context> /** Mass in kilograms, or null if unknown */;
    friends?: FriendsResolver<
      (Character | null)[] | null,
      Parent,
      Context
    > /** This human's friends, or an empty list if they have none */;
    friendsConnection?: FriendsConnectionResolver<
      FriendsConnection,
      Parent,
      Context
    > /** The friends of the human exposed as a connection with edges */;
    appearsIn?: AppearsInResolver<(Episode | null)[], Parent, Context> /** The movies this human appears in */;
    starships?: StarshipsResolver<
      (Starship | null)[] | null,
      Parent,
      Context
    > /** A list of starships this person has piloted, or an empty list if none */;
  }

  export type IdResolver<R = string, Parent = Human, Context = any> = Resolver<R, Parent, Context>;
  export type NameResolver<R = string, Parent = Human, Context = any> = Resolver<R, Parent, Context>;
  export type HomePlanetResolver<R = string | null, Parent = Human, Context = any> = Resolver<R, Parent, Context>;
  export type HeightResolver<R = number | null, Parent = Human, Context = any> = Resolver<
    R,
    Parent,
    Context,
    HeightArgs
  >;
  export interface HeightArgs {
    unit?: LengthUnit | null;
  }

  export type MassResolver<R = number | null, Parent = Human, Context = any> = Resolver<R, Parent, Context>;
  export type FriendsResolver<R = (Character | null)[] | null, Parent = Human, Context = any> = Resolver<
    R,
    Parent,
    Context
  >;
  export type FriendsConnectionResolver<R = FriendsConnection, Parent = Human, Context = any> = Resolver<
    R,
    Parent,
    Context,
    FriendsConnectionArgs
  >;
  export interface FriendsConnectionArgs {
    first?: number | null;
    after?: string | null;
  }

  export type AppearsInResolver<R = (Episode | null)[], Parent = Human, Context = any> = Resolver<R, Parent, Context>;
  export type StarshipsResolver<R = (Starship | null)[] | null, Parent = Human, Context = any> = Resolver<
    R,
    Parent,
    Context
  >;
}

export namespace StarshipResolvers {
  export interface Resolvers<Context = any, Parent = Starship> {
    id?: IdResolver<string, Parent, Context> /** The ID of the starship */;
    name?: NameResolver<string, Parent, Context> /** The name of the starship */;
    length?: LengthResolver<number | null, Parent, Context> /** Length of the starship, along the longest axis */;
  }

  export type IdResolver<R = string, Parent = Starship, Context = any> = Resolver<R, Parent, Context>;
  export type NameResolver<R = string, Parent = Starship, Context = any> = Resolver<R, Parent, Context>;
  export type LengthResolver<R = number | null, Parent = Starship, Context = any> = Resolver<
    R,
    Parent,
    Context,
    LengthArgs
  >;
  export interface LengthArgs {
    unit?: LengthUnit | null;
  }
}
/** An autonomous mechanical character in the Star Wars universe */
export namespace DroidResolvers {
  export interface Resolvers<Context = any, Parent = Droid> {
    id?: IdResolver<string, Parent, Context> /** The ID of the droid */;
    name?: NameResolver<string, Parent, Context> /** What others call this droid */;
    friends?: FriendsResolver<
      (Character | null)[] | null,
      Parent,
      Context
    > /** This droid's friends, or an empty list if they have none */;
    friendsConnection?: FriendsConnectionResolver<
      FriendsConnection,
      Parent,
      Context
    > /** The friends of the droid exposed as a connection with edges */;
    appearsIn?: AppearsInResolver<(Episode | null)[], Parent, Context> /** The movies this droid appears in */;
    primaryFunction?: PrimaryFunctionResolver<string | null, Parent, Context> /** This droid's primary function */;
  }

  export type IdResolver<R = string, Parent = Droid, Context = any> = Resolver<R, Parent, Context>;
  export type NameResolver<R = string, Parent = Droid, Context = any> = Resolver<R, Parent, Context>;
  export type FriendsResolver<R = (Character | null)[] | null, Parent = Droid, Context = any> = Resolver<
    R,
    Parent,
    Context
  >;
  export type FriendsConnectionResolver<R = FriendsConnection, Parent = Droid, Context = any> = Resolver<
    R,
    Parent,
    Context,
    FriendsConnectionArgs
  >;
  export interface FriendsConnectionArgs {
    first?: number | null;
    after?: string | null;
  }

  export type AppearsInResolver<R = (Episode | null)[], Parent = Droid, Context = any> = Resolver<R, Parent, Context>;
  export type PrimaryFunctionResolver<R = string | null, Parent = Droid, Context = any> = Resolver<R, Parent, Context>;
}
/** The mutation type, represents all updates we can make to our data */
export namespace MutationResolvers {
  export interface Resolvers<Context = any, Parent = Mutation> {
    createReview?: CreateReviewResolver<Review | null, Parent, Context>;
  }

  export type CreateReviewResolver<R = Review | null, Parent = Mutation, Context = any> = Resolver<
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
    episode: Episode;
    review: ReviewInput;
  };

  export type Mutation = {
    __typename?: 'Mutation';
    createReview?: CreateReview | null;
  };

  export type CreateReview = {
    __typename?: 'Review';
    stars: number;
    commentary?: string | null;
  };
}

export namespace HeroAndFriendsNames {
  export type Variables = {
    episode?: Episode | null;
  };

  export type Query = {
    __typename?: 'Query';
    hero?: Hero | null;
  };

  export type Hero = {
    __typename?: 'Character';
    name: string;
    friends?: (Friends | null)[] | null;
  };

  export type Friends = {
    __typename?: 'Character';
    name: string;
  };
}

export namespace HeroAppearsIn {
  export type Variables = {};

  export type Query = {
    __typename?: 'Query';
    hero?: Hero | null;
  };

  export type Hero = {
    __typename?: 'Character';
    name: string;
    appearsIn: (Episode | null)[];
  };
}

export namespace HeroDetails {
  export type Variables = {
    episode?: Episode | null;
  };

  export type Query = {
    __typename?: 'Query';
    hero?: Hero | null;
  };

  export type Hero = {
    __typename?: HumanInlineFragment['__typename'] | DroidInlineFragment['__typename'];
    name: string;
  } & (HumanInlineFragment | DroidInlineFragment);

  export type HumanInlineFragment = {
    __typename?: 'Human';
    height?: number | null;
  };

  export type DroidInlineFragment = {
    __typename?: 'Droid';
    primaryFunction?: string | null;
  };
}

export namespace HeroDetailsWithFragment {
  export type Variables = {
    episode?: Episode | null;
  };

  export type Query = {
    __typename?: 'Query';
    hero?: Hero | null;
  };

  export type Hero = HeroDetails.Fragment;
}

export namespace HeroName {
  export type Variables = {
    episode?: Episode | null;
  };

  export type Query = {
    __typename?: 'Query';
    hero?: Hero | null;
  };

  export type Hero = {
    __typename?: 'Character';
    name: string;
  };
}

export namespace HeroNameConditionalInclusion {
  export type Variables = {
    episode?: Episode | null;
    includeName: boolean;
  };

  export type Query = {
    __typename?: 'Query';
    hero?: Hero | null;
  };

  export type Hero = {
    __typename?: 'Character';
    name: string;
  };
}

export namespace HeroNameConditionalExclusion {
  export type Variables = {
    episode?: Episode | null;
    skipName: boolean;
  };

  export type Query = {
    __typename?: 'Query';
    hero?: Hero | null;
  };

  export type Hero = {
    __typename?: 'Character';
    name: string;
  };
}

export namespace HeroParentTypeDependentField {
  export type Variables = {
    episode?: Episode | null;
  };

  export type Query = {
    __typename?: 'Query';
    hero?: Hero | null;
  };

  export type Hero = {
    __typename?: HumanInlineFragment['__typename'] | DroidInlineFragment['__typename'];
    name: string;
  } & (HumanInlineFragment | DroidInlineFragment);

  export type HumanInlineFragment = {
    __typename?: 'Human';
    friends?: (Friends | null)[] | null;
  };

  export type Friends = {
    __typename?: _HumanInlineFragment['__typename'];
    name: string;
  } & (_HumanInlineFragment);

  export type _HumanInlineFragment = {
    __typename?: 'Human';
    height?: number | null;
  };

  export type DroidInlineFragment = {
    __typename?: 'Droid';
    friends?: (Friends | null)[] | null;
  };

  export type _Friends = {
    __typename?: __HumanInlineFragment['__typename'];
    name: string;
  } & (__HumanInlineFragment);

  export type __HumanInlineFragment = {
    __typename?: 'Human';
    height?: number | null;
  };
}

export namespace HeroTypeDependentAliasedField {
  export type Variables = {
    episode?: Episode | null;
  };

  export type Query = {
    __typename?: 'Query';
    hero?: Hero | null;
  };

  export type Hero = HumanInlineFragment | DroidInlineFragment;

  export type HumanInlineFragment = {
    __typename?: 'Human';
    property?: string | null;
  };

  export type DroidInlineFragment = {
    __typename?: 'Droid';
    property?: string | null;
  };
}

export namespace HumanWithNullHeight {
  export type Variables = {};

  export type Query = {
    __typename?: 'Query';
    human?: Human | null;
  };

  export type Human = {
    __typename?: 'Human';
    name: string;
    mass?: number | null;
  };
}

export namespace TwoHeroes {
  export type Variables = {};

  export type Query = {
    __typename?: 'Query';
    r2?: R2 | null;
    luke?: Luke | null;
  };

  export type R2 = {
    __typename?: 'Character';
    name: string;
  };

  export type Luke = {
    __typename?: 'Character';
    name: string;
  };
}

export namespace HeroDetails {
  export type Fragment = {
    __typename?: 'Character';
    name: string;
  } & (HumanInlineFragment | DroidInlineFragment);

  export type HumanInlineFragment = {
    __typename?: 'Human';
    height?: number | null;
  };

  export type DroidInlineFragment = {
    __typename?: 'Droid';
    primaryFunction?: string | null;
  };
}
