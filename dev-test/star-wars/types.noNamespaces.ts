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
  friends?: Character[] | null;
  /** The friends of the character exposed as a connection with edges */
  friendsConnection: FriendsConnection;
  /** The movies this character appears in */
  appearsIn: Episode[];
}

// ====================================================
// Types
// ====================================================

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
  /** The total number of friends */
  totalCount?: number | null;
  /** The edges for each of the character's friends. */
  edges?: FriendsEdge[] | null;
  /** A list of the friends, as a convenience when edges are not needed. */
  friends?: Character[] | null;
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
  friends?: Character[] | null;
  /** The friends of the human exposed as a connection with edges */
  friendsConnection: FriendsConnection;
  /** The movies this human appears in */
  appearsIn: Episode[];
  /** A list of starships this person has piloted, or an empty list if none */
  starships?: Starship[] | null;
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
  friends?: Character[] | null;
  /** The friends of the droid exposed as a connection with edges */
  friendsConnection: FriendsConnection;
  /** The movies this droid appears in */
  appearsIn: Episode[];
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

  appearsIn: Episode[];
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
