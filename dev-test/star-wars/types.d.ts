/* tslint:disable */
/* A character from the Star Wars universe */
export interface Character {
  id: string /* The ID of the character */;
  name: string /* The name of the character */;
  friends?:
    | Character[]
    | null /* The friends of the character, or an empty list if they have none */;
  friendsConnection: FriendsConnection /* The friends of the character exposed as a connection with edges */;
  appearsIn: Episode[] /* The movies this character appears in */;
}
/* The query type, represents all of the entry points into our object graph */
export interface Query {
  hero?: Character | null;
  reviews?: Review[] | null;
  search?: SearchResult[] | null;
  character?: Character | null;
  droid?: Droid | null;
  human?: Human | null;
  starship?: Starship | null;
}
/* A connection object for a character&#x27;s friends */
export interface FriendsConnection {
  totalCount?: number | null /* The total number of friends */;
  edges?:
    | FriendsEdge[]
    | null /* The edges for each of the character&#x27;s friends. */;
  friends?:
    | Character[]
    | null /* A list of the friends, as a convenience when edges are not needed. */;
  pageInfo: PageInfo /* Information for paginating this connection */;
}
/* An edge object for a character&#x27;s friends */
export interface FriendsEdge {
  cursor: string /* A cursor used for pagination */;
  node?: Character | null /* The character represented by this friendship edge */;
}
/* Information for paginating this connection */
export interface PageInfo {
  startCursor?: string | null;
  endCursor?: string | null;
  hasNextPage: boolean;
}
/* Represents a review for a movie */
export interface Review {
  stars: number /* The number of stars this review gave, 1-5 */;
  commentary?: string | null /* Comment about the movie */;
}
/* A humanoid creature from the Star Wars universe */
export interface Human extends Character {
  id: string /* The ID of the human */;
  name: string /* What this human calls themselves */;
  homePlanet?:
    | string
    | null /* The home planet of the human, or null if unknown */;
  height?: number | null /* Height in the preferred unit, default is meters */;
  mass?: number | null /* Mass in kilograms, or null if unknown */;
  friends?:
    | Character[]
    | null /* This human&#x27;s friends, or an empty list if they have none */;
  friendsConnection: FriendsConnection /* The friends of the human exposed as a connection with edges */;
  appearsIn: Episode[] /* The movies this human appears in */;
  starships?:
    | Starship[]
    | null /* A list of starships this person has piloted, or an empty list if none */;
}

export interface Starship {
  id: string /* The ID of the starship */;
  name: string /* The name of the starship */;
  length?: number | null /* Length of the starship, along the longest axis */;
}
/* An autonomous mechanical character in the Star Wars universe */
export interface Droid extends Character {
  id: string /* The ID of the droid */;
  name: string /* What others call this droid */;
  friends?:
    | Character[]
    | null /* This droid&#x27;s friends, or an empty list if they have none */;
  friendsConnection: FriendsConnection /* The friends of the droid exposed as a connection with edges */;
  appearsIn: Episode[] /* The movies this droid appears in */;
  primaryFunction?: string | null /* This droid&#x27;s primary function */;
}
/* The mutation type, represents all updates we can make to our data */
export interface Mutation {
  createReview?: Review | null;
}
/* The input object sent when someone is creating a new review */
export interface ReviewInput {
  stars: number /* 0-5 stars */;
  commentary?: string | null /* Comment about the movie, optional */;
  favoriteColor?: ColorInput | null /* Favorite color, optional */;
}
/* The input object sent when passing a color */
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
/* The episodes in the Star Wars trilogy */
export enum Episode {
  NEWHOPE = "NEWHOPE",
  EMPIRE = "EMPIRE",
  JEDI = "JEDI"
}

/* Units of height */
export enum LengthUnit {
  METER = "METER",
  FOOT = "FOOT"
}

export type SearchResult = Human | Droid | Starship;

export namespace CreateReviewForEpisode {
  export type Variables = {
    episode: Episode;
    review: ReviewInput;
  };

  export type Mutation = {
    __typename?: "Mutation";
    createReview?: CreateReview | null;
  };

  export type CreateReview = {
    __typename?: "Review";
    stars: number;
    commentary?: string | null;
  };
}
export namespace HeroAndFriendsNames {
  export type Variables = {
    episode?: Episode | null;
  };

  export type Query = {
    __typename?: "Query";
    hero?: Hero | null;
  };

  export type Hero = {
    __typename?: "Character";
    name: string;
    friends?: Friends[] | null;
  };

  export type Friends = {
    __typename?: "Character";
    name: string;
  };
}
export namespace HeroAppearsIn {
  export type Variables = {};

  export type Query = {
    __typename?: "Query";
    hero?: Hero | null;
  };

  export type Hero = {
    __typename?: "Character";
    name: string;
    appearsIn: Episode[];
  };
}
export namespace HeroDetails {
  export type Variables = {
    episode?: Episode | null;
  };

  export type Query = {
    __typename?: "Query";
    hero?: Hero | null;
  };

  export type Hero = {
    __typename?:
      | HumanInlineFragment["__typename"]
      | DroidInlineFragment["__typename"];
    name: string;
  } & (HumanInlineFragment | DroidInlineFragment);

  export type HumanInlineFragment = {
    __typename?: "Human";
    height?: number | null;
  };

  export type DroidInlineFragment = {
    __typename?: "Droid";
    primaryFunction?: string | null;
  };
}
export namespace HeroDetailsWithFragment {
  export type Variables = {
    episode?: Episode | null;
  };

  export type Query = {
    __typename?: "Query";
    hero?: Hero | null;
  };

  export type Hero = HeroDetails.Fragment;
}
export namespace HeroName {
  export type Variables = {
    episode?: Episode | null;
  };

  export type Query = {
    __typename?: "Query";
    hero?: Hero | null;
  };

  export type Hero = {
    __typename?: "Character";
    name: string;
  };
}
export namespace HeroNameConditionalInclusion {
  export type Variables = {
    episode?: Episode | null;
    includeName: boolean;
  };

  export type Query = {
    __typename?: "Query";
    hero?: Hero | null;
  };

  export type Hero = {
    __typename?: "Character";
    name: string;
  };
}
export namespace HeroNameConditionalExclusion {
  export type Variables = {
    episode?: Episode | null;
    skipName: boolean;
  };

  export type Query = {
    __typename?: "Query";
    hero?: Hero | null;
  };

  export type Hero = {
    __typename?: "Character";
    name: string;
  };
}
export namespace HeroParentTypeDependentField {
  export type Variables = {
    episode?: Episode | null;
  };

  export type Query = {
    __typename?: "Query";
    hero?: Hero | null;
  };

  export type Hero = {
    __typename?:
      | HumanInlineFragment["__typename"]
      | DroidInlineFragment["__typename"];
    name: string;
  } & (HumanInlineFragment | DroidInlineFragment);

  export type HumanInlineFragment = {
    __typename?: "Human";
    friends?: Friends[] | null;
  };

  export type Friends = {
    __typename?: _HumanInlineFragment["__typename"];
    name: string;
  } & (_HumanInlineFragment);

  export type _HumanInlineFragment = {
    __typename?: "Human";
    height?: number | null;
  };

  export type DroidInlineFragment = {
    __typename?: "Droid";
    friends?: _Friends[] | null;
  };

  export type _Friends = {
    __typename?: __HumanInlineFragment["__typename"];
    name: string;
  } & (__HumanInlineFragment);

  export type __HumanInlineFragment = {
    __typename?: "Human";
    height?: number | null;
  };
}
export namespace HeroTypeDependentAliasedField {
  export type Variables = {
    episode?: Episode | null;
  };

  export type Query = {
    __typename?: "Query";
    hero?: Hero | null;
  };

  export type Hero = HumanInlineFragment | DroidInlineFragment;

  export type HumanInlineFragment = {
    __typename?: "Human";
    property?: string | null;
  };

  export type DroidInlineFragment = {
    __typename?: "Droid";
    property?: string | null;
  };
}
export namespace HumanWithNullHeight {
  export type Variables = {};

  export type Query = {
    __typename?: "Query";
    human?: Human | null;
  };

  export type Human = {
    __typename?: "Human";
    name: string;
    mass?: number | null;
  };
}
export namespace TwoHeroes {
  export type Variables = {};

  export type Query = {
    __typename?: "Query";
    r2?: R2 | null;
    luke?: Luke | null;
  };

  export type R2 = {
    __typename?: "Character";
    name: string;
  };

  export type Luke = {
    __typename?: "Character";
    name: string;
  };
}

export namespace HeroDetails {
  export type Fragment = {
    __typename?: "Character";
    name: string;
  } & (HumanInlineFragment | DroidInlineFragment);

  export type HumanInlineFragment = {
    __typename?: "Human";
    height?: number | null;
  };

  export type DroidInlineFragment = {
    __typename?: "Droid";
    primaryFunction?: string | null;
  };
}
