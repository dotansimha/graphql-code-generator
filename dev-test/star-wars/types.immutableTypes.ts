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
  readonly id: string;
  /** The name of the character */
  readonly name: string;
  /** The friends of the character, or an empty list if they have none */
  readonly friends?: ReadonlyArray<Character | null> | null;
  /** The friends of the character exposed as a connection with edges */
  readonly friendsConnection: FriendsConnection;
  /** The movies this character appears in */
  readonly appearsIn: ReadonlyArray<Episode | null>;
}

// ====================================================
// Types
// ====================================================

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
  /** The total number of friends */
  readonly totalCount?: number | null;
  /** The edges for each of the character's friends. */
  readonly edges?: ReadonlyArray<FriendsEdge | null> | null;
  /** A list of the friends, as a convenience when edges are not needed. */
  readonly friends?: ReadonlyArray<Character | null> | null;
  /** Information for paginating this connection */
  readonly pageInfo: PageInfo;
}
/** An edge object for a character's friends */
export interface FriendsEdge {
  /** A cursor used for pagination */
  readonly cursor: string;
  /** The character represented by this friendship edge */
  readonly node?: Character | null;
}
/** Information for paginating this connection */
export interface PageInfo {
  readonly startCursor?: string | null;

  readonly endCursor?: string | null;

  readonly hasNextPage: boolean;
}
/** Represents a review for a movie */
export interface Review {
  /** The number of stars this review gave, 1-5 */
  readonly stars: number;
  /** Comment about the movie */
  readonly commentary?: string | null;
}
/** A humanoid creature from the Star Wars universe */
export interface Human extends Character {
  /** The ID of the human */
  readonly id: string;
  /** What this human calls themselves */
  readonly name: string;
  /** The home planet of the human, or null if unknown */
  readonly homePlanet?: string | null;
  /** Height in the preferred unit, default is meters */
  readonly height?: number | null;
  /** Mass in kilograms, or null if unknown */
  readonly mass?: number | null;
  /** This human's friends, or an empty list if they have none */
  readonly friends?: ReadonlyArray<Character | null> | null;
  /** The friends of the human exposed as a connection with edges */
  readonly friendsConnection: FriendsConnection;
  /** The movies this human appears in */
  readonly appearsIn: ReadonlyArray<Episode | null>;
  /** A list of starships this person has piloted, or an empty list if none */
  readonly starships?: ReadonlyArray<Starship | null> | null;
}

export interface Starship {
  /** The ID of the starship */
  readonly id: string;
  /** The name of the starship */
  readonly name: string;
  /** Length of the starship, along the longest axis */
  readonly length?: number | null;
}
/** An autonomous mechanical character in the Star Wars universe */
export interface Droid extends Character {
  /** The ID of the droid */
  readonly id: string;
  /** What others call this droid */
  readonly name: string;
  /** This droid's friends, or an empty list if they have none */
  readonly friends?: ReadonlyArray<Character | null> | null;
  /** The friends of the droid exposed as a connection with edges */
  readonly friendsConnection: FriendsConnection;
  /** The movies this droid appears in */
  readonly appearsIn: ReadonlyArray<Episode | null>;
  /** This droid's primary function */
  readonly primaryFunction?: string | null;
}
/** The mutation type, represents all updates we can make to our data */
export interface Mutation {
  readonly createReview?: Review | null;
}

// ====================================================
// InputTypes
// ====================================================

/** The input object sent when someone is creating a new review */
export interface ReviewInput {
  /** 0-5 stars */
  readonly stars: number;
  /** Comment about the movie, optional */
  readonly commentary?: string | null;
  /** Favorite color, optional */
  readonly favoriteColor?: ColorInput | null;
}
/** The input object sent when passing a color */
export interface ColorInput {
  readonly red: number;

  readonly green: number;

  readonly blue: number;
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
  NEWHOPE = 'NEWHOPE',
  EMPIRE = 'EMPIRE',
  JEDI = 'JEDI'
}
/** Units of height */
export enum LengthUnit {
  METER = 'METER',
  FOOT = 'FOOT'
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
