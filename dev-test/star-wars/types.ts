/* tslint:disable */

// ====================================================
// START: Typescript template
// ====================================================

// ====================================================
// Interfaces
// ====================================================

/** A character from the Star Wars universe */
export interface Character {
  /** The ID of the character */
  id: string;
  /** The name of the character */
  name: string;
  /** The friends of the character, or an empty list if they have none */
  friends?: (Character | null)[] | null;
  /** The friends of the character exposed as a connection with edges */
  friendsConnection: FriendsConnection;
  /** The movies this character appears in */
  appearsIn: (Episode | null)[];
}

// ====================================================
// Types
// ====================================================

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
  /** The total number of friends */
  totalCount?: number | null;
  /** The edges for each of the character's friends. */
  edges?: (FriendsEdge | null)[] | null;
  /** A list of the friends, as a convenience when edges are not needed. */
  friends?: (Character | null)[] | null;
  /** Information for paginating this connection */
  pageInfo: PageInfo;
}
/** An edge object for a character's friends */
export interface FriendsEdge {
  /** A cursor used for pagination */
  cursor: string;
  /** The character represented by this friendship edge */
  node?: Character | null;
}
/** Information for paginating this connection */
export interface PageInfo {
  startCursor?: string | null;

  endCursor?: string | null;

  hasNextPage: boolean;
}
/** Represents a review for a movie */
export interface Review {
  /** The number of stars this review gave, 1-5 */
  stars: number;
  /** Comment about the movie */
  commentary?: string | null;
}
/** A humanoid creature from the Star Wars universe */
export interface Human extends Character {
  /** The ID of the human */
  id: string;
  /** What this human calls themselves */
  name: string;
  /** The home planet of the human, or null if unknown */
  homePlanet?: string | null;
  /** Height in the preferred unit, default is meters */
  height?: number | null;
  /** Mass in kilograms, or null if unknown */
  mass?: number | null;
  /** This human's friends, or an empty list if they have none */
  friends?: (Character | null)[] | null;
  /** The friends of the human exposed as a connection with edges */
  friendsConnection: FriendsConnection;
  /** The movies this human appears in */
  appearsIn: (Episode | null)[];
  /** A list of starships this person has piloted, or an empty list if none */
  starships?: (Starship | null)[] | null;
}

export interface Starship {
  /** The ID of the starship */
  id: string;
  /** The name of the starship */
  name: string;
  /** Length of the starship, along the longest axis */
  length?: number | null;
}
/** An autonomous mechanical character in the Star Wars universe */
export interface Droid extends Character {
  /** The ID of the droid */
  id: string;
  /** What others call this droid */
  name: string;
  /** This droid's friends, or an empty list if they have none */
  friends?: (Character | null)[] | null;
  /** The friends of the droid exposed as a connection with edges */
  friendsConnection: FriendsConnection;
  /** The movies this droid appears in */
  appearsIn: (Episode | null)[];
  /** This droid's primary function */
  primaryFunction?: string | null;
}
/** The mutation type, represents all updates we can make to our data */
export interface Mutation {
  createReview?: Review | null;
}

// ====================================================
// InputTypes
// ====================================================

/** The input object sent when someone is creating a new review */
export interface ReviewInput {
  /** 0-5 stars */
  stars: number;
  /** Comment about the movie, optional */
  commentary?: string | null;
  /** Favorite color, optional */
  favoriteColor?: ColorInput | null;
}
/** The input object sent when passing a color */
export interface ColorInput {
  red: number;

  green: number;

  blue: number;
}

// ====================================================
// Arguments
// ====================================================

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

// ====================================================
// Enums
// ====================================================

/** The episodes in the Star Wars trilogy */
export enum Episode {
  Newhope = 'NEWHOPE',
  Empire = 'EMPIRE',
  Jedi = 'JEDI'
}
/** Units of height */
export enum LengthUnit {
  Meter = 'METER',
  Foot = 'FOOT'
}

// ====================================================
// Unions
// ====================================================

export type SearchResult = Human | Droid | Starship;

// ====================================================
// END: Typescript template
// ====================================================

// ====================================================
// Documents
// ====================================================

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
