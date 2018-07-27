/* tslint:disable */
import { GraphQLResolveInfo } from 'graphql';

export type Resolver<Parent, Result, Args = any> = (
  parent?: Parent,
  args?: Args,
  context?: any,
  info?: GraphQLResolveInfo
) => Promise<Result> | Result;

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
/** The query type, represents all of the entry points into our object graph */
export namespace QueryResolvers {
  export interface Resolvers {
    hero?: HeroResolver;
    reviews?: ReviewsResolver;
    search?: SearchResolver;
    character?: CharacterResolver;
    droid?: DroidResolver;
    human?: HumanResolver;
    starship?: StarshipResolver;
  }

  export type HeroResolver = Resolver<Query, Character | null, HeroArgs>;
  export interface HeroArgs {
    episode?: Episode | null;
  }

  export type ReviewsResolver = Resolver<Query, ReadonlyArray<Review | null> | null, ReviewsArgs>;
  export interface ReviewsArgs {
    episode: Episode;
  }

  export type SearchResolver = Resolver<Query, ReadonlyArray<SearchResult | null> | null, SearchArgs>;
  export interface SearchArgs {
    text?: string | null;
  }

  export type CharacterResolver = Resolver<Query, Character | null, CharacterArgs>;
  export interface CharacterArgs {
    id: string;
  }

  export type DroidResolver = Resolver<Query, Droid | null, DroidArgs>;
  export interface DroidArgs {
    id: string;
  }

  export type HumanResolver = Resolver<Query, Human | null, HumanArgs>;
  export interface HumanArgs {
    id: string;
  }

  export type StarshipResolver = Resolver<Query, Starship | null, StarshipArgs>;
  export interface StarshipArgs {
    id: string;
  }
}
/** A connection object for a character's friends */
/** A connection object for a character's friends */
export namespace FriendsConnectionResolvers {
  export interface Resolvers {
    totalCount?: TotalCountResolver /** The total number of friends */;
    edges?: EdgesResolver /** The edges for each of the character's friends. */;
    friends?: FriendsResolver /** A list of the friends, as a convenience when edges are not needed. */;
    pageInfo?: PageInfoResolver /** Information for paginating this connection */;
  }

  export type TotalCountResolver = Resolver<FriendsConnection, number | null>;
  export type EdgesResolver = Resolver<FriendsConnection, ReadonlyArray<FriendsEdge | null> | null>;
  export type FriendsResolver = Resolver<FriendsConnection, ReadonlyArray<Character | null> | null>;
  export type PageInfoResolver = Resolver<FriendsConnection, PageInfo>;
}
/** An edge object for a character's friends */
/** An edge object for a character's friends */
export namespace FriendsEdgeResolvers {
  export interface Resolvers {
    cursor?: CursorResolver /** A cursor used for pagination */;
    node?: NodeResolver /** The character represented by this friendship edge */;
  }

  export type CursorResolver = Resolver<FriendsEdge, string>;
  export type NodeResolver = Resolver<FriendsEdge, Character | null>;
}
/** Information for paginating this connection */
/** Information for paginating this connection */
export namespace PageInfoResolvers {
  export interface Resolvers {
    startCursor?: StartCursorResolver;
    endCursor?: EndCursorResolver;
    hasNextPage?: HasNextPageResolver;
  }

  export type StartCursorResolver = Resolver<PageInfo, string | null>;
  export type EndCursorResolver = Resolver<PageInfo, string | null>;
  export type HasNextPageResolver = Resolver<PageInfo, boolean>;
}
/** Represents a review for a movie */
/** Represents a review for a movie */
export namespace ReviewResolvers {
  export interface Resolvers {
    stars?: StarsResolver /** The number of stars this review gave, 1-5 */;
    commentary?: CommentaryResolver /** Comment about the movie */;
  }

  export type StarsResolver = Resolver<Review, number>;
  export type CommentaryResolver = Resolver<Review, string | null>;
}
/** A humanoid creature from the Star Wars universe */
/** A humanoid creature from the Star Wars universe */
export namespace HumanResolvers {
  export interface Resolvers {
    id?: IdResolver /** The ID of the human */;
    name?: NameResolver /** What this human calls themselves */;
    homePlanet?: HomePlanetResolver /** The home planet of the human, or null if unknown */;
    height?: HeightResolver /** Height in the preferred unit, default is meters */;
    mass?: MassResolver /** Mass in kilograms, or null if unknown */;
    friends?: FriendsResolver /** This human's friends, or an empty list if they have none */;
    friendsConnection?: FriendsConnectionResolver /** The friends of the human exposed as a connection with edges */;
    appearsIn?: AppearsInResolver /** The movies this human appears in */;
    starships?: StarshipsResolver /** A list of starships this person has piloted, or an empty list if none */;
  }

  export type IdResolver = Resolver<Human, string>;
  export type NameResolver = Resolver<Human, string>;
  export type HomePlanetResolver = Resolver<Human, string | null>;
  export type HeightResolver = Resolver<Human, number | null, HeightArgs>;
  export interface HeightArgs {
    unit?: LengthUnit | null;
  }

  export type MassResolver = Resolver<Human, number | null>;
  export type FriendsResolver = Resolver<Human, ReadonlyArray<Character | null> | null>;
  export type FriendsConnectionResolver = Resolver<Human, FriendsConnection, FriendsConnectionArgs>;
  export interface FriendsConnectionArgs {
    first?: number | null;
    after?: string | null;
  }

  export type AppearsInResolver = Resolver<Human, ReadonlyArray<Episode | null>>;
  export type StarshipsResolver = Resolver<Human, ReadonlyArray<Starship | null> | null>;
}

export namespace StarshipResolvers {
  export interface Resolvers {
    id?: IdResolver /** The ID of the starship */;
    name?: NameResolver /** The name of the starship */;
    length?: LengthResolver /** Length of the starship, along the longest axis */;
  }

  export type IdResolver = Resolver<Starship, string>;
  export type NameResolver = Resolver<Starship, string>;
  export type LengthResolver = Resolver<Starship, number | null, LengthArgs>;
  export interface LengthArgs {
    unit?: LengthUnit | null;
  }
}
/** An autonomous mechanical character in the Star Wars universe */
/** An autonomous mechanical character in the Star Wars universe */
export namespace DroidResolvers {
  export interface Resolvers {
    id?: IdResolver /** The ID of the droid */;
    name?: NameResolver /** What others call this droid */;
    friends?: FriendsResolver /** This droid's friends, or an empty list if they have none */;
    friendsConnection?: FriendsConnectionResolver /** The friends of the droid exposed as a connection with edges */;
    appearsIn?: AppearsInResolver /** The movies this droid appears in */;
    primaryFunction?: PrimaryFunctionResolver /** This droid's primary function */;
  }

  export type IdResolver = Resolver<Droid, string>;
  export type NameResolver = Resolver<Droid, string>;
  export type FriendsResolver = Resolver<Droid, ReadonlyArray<Character | null> | null>;
  export type FriendsConnectionResolver = Resolver<Droid, FriendsConnection, FriendsConnectionArgs>;
  export interface FriendsConnectionArgs {
    first?: number | null;
    after?: string | null;
  }

  export type AppearsInResolver = Resolver<Droid, ReadonlyArray<Episode | null>>;
  export type PrimaryFunctionResolver = Resolver<Droid, string | null>;
}
/** The mutation type, represents all updates we can make to our data */
/** The mutation type, represents all updates we can make to our data */
export namespace MutationResolvers {
  export interface Resolvers {
    createReview?: CreateReviewResolver;
  }

  export type CreateReviewResolver = Resolver<Mutation, Review | null, CreateReviewArgs>;
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
    readonly friends?: ReadonlyArray<Friends | null> | null;
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
