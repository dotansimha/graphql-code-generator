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

  export type ReviewsResolver = Resolver<Query, (Review | null)[] | null, ReviewsArgs>;
  export interface ReviewsArgs {
    episode: Episode;
  }

  export type SearchResolver = Resolver<Query, (SearchResult | null)[] | null, SearchArgs>;
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
  export type EdgesResolver = Resolver<FriendsConnection, (FriendsEdge | null)[] | null>;
  export type FriendsResolver = Resolver<FriendsConnection, (Character | null)[] | null>;
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
  export type FriendsResolver = Resolver<Human, (Character | null)[] | null>;
  export type FriendsConnectionResolver = Resolver<Human, FriendsConnection, FriendsConnectionArgs>;
  export interface FriendsConnectionArgs {
    first?: number | null;
    after?: string | null;
  }

  export type AppearsInResolver = Resolver<Human, (Episode | null)[]>;
  export type StarshipsResolver = Resolver<Human, (Starship | null)[] | null>;
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
  export type FriendsResolver = Resolver<Droid, (Character | null)[] | null>;
  export type FriendsConnectionResolver = Resolver<Droid, FriendsConnection, FriendsConnectionArgs>;
  export interface FriendsConnectionArgs {
    first?: number | null;
    after?: string | null;
  }

  export type AppearsInResolver = Resolver<Droid, (Episode | null)[]>;
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
    friends?: (_Friends | null)[] | null;
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
