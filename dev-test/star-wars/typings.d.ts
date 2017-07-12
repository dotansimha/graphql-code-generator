/* tslint:disable */

export interface Query {
  hero: Character | null;
  reviews: Array<Review> | null;
  search: Array<SearchResult> | null;
  character: Character | null;
  droid: Droid | null;
  human: Human | null;
  starship: Starship | null;
}

export interface HeroQueryArgs {
  episode: Episode | null;
}

export interface ReviewsQueryArgs {
  episode: Episode;
}

export interface SearchQueryArgs {
  text: string | null;
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

export type Episode = "NEWHOPE" | "EMPIRE" | "JEDI";

export interface Character {
  id: string;
  name: string;
  friends: Array<Character> | null;
  friendsConnection: FriendsConnection;
  appearsIn: Array<Episode>;
}

export interface FriendsConnectionCharacterArgs {
  first: number | null;
  after: string | null;
}

export interface FriendsConnection {
  totalCount: number | null;
  edges: Array<FriendsEdge> | null;
  friends: Array<Character> | null;
  pageInfo: PageInfo;
}

export interface FriendsEdge {
  cursor: string;
  node: Character | null;
}

export interface PageInfo {
  startCursor: string | null;
  endCursor: string | null;
  hasNextPage: boolean;
}

export interface Review {
  stars: number;
  commentary: string | null;
}

export type SearchResult = Human | Droid | Starship;

export interface Human extends Character {
  id: string;
  name: string;
  homePlanet: string | null;
  height: number | null;
  mass: number | null;
  friends: Array<Character> | null;
  friendsConnection: FriendsConnection;
  appearsIn: Array<Episode>;
  starships: Array<Starship> | null;
}

export interface HeightHumanArgs {
  unit: LengthUnit | null;
}

export interface FriendsConnectionHumanArgs {
  first: number | null;
  after: string | null;
}

export type LengthUnit = "METER" | "FOOT";

export interface Starship {
  id: string;
  name: string;
  length: number | null;
}

export interface LengthStarshipArgs {
  unit: LengthUnit | null;
}

export interface Droid extends Character {
  id: string;
  name: string;
  friends: Array<Character> | null;
  friendsConnection: FriendsConnection;
  appearsIn: Array<Episode>;
  primaryFunction: string | null;
}

export interface FriendsConnectionDroidArgs {
  first: number | null;
  after: string | null;
}

export interface Mutation {
  createReview: Review | null;
}

export interface CreateReviewMutationArgs {
  episode: Episode | null;
  review: ReviewInput;
}

export interface ReviewInput {
  stars: number;
  commentary: string | null;
  favoriteColor: ColorInput | null;
}

export interface ColorInput {
  red: number;
  green: number;
  blue: number;
}

export namespace CreateReviewForEpisodeMutation {
  export type Variables = {
      episode: Episode;
      review: ReviewInput;
  }

  export type Result = {
    createReview: CreateReview;
  } 

  export type CreateReview = {
    stars: number;
    commentary: string;
  } 
}

export namespace HeroAndFriendsNamesQuery {
  export type Variables = {
      episode: Episode | null;
  }

  export type Result = {
    hero: Hero;
  } 

  export type Hero = {
    name: string;
    friends: Array<Friends>;
  } 

  export type Friends = {
    name: string;
  } 
}

export namespace HeroAppearsInQuery {
  export type Variables = {
  }

  export type Result = {
    hero: Hero;
  } 

  export type Hero = {
    name: string;
    appearsIn: Array<Episode>;
  } 
}

export namespace HeroDetailsQuery {
  export type Variables = {
      episode: Episode | null;
  }

  export type Result = {
    hero: Hero;
  } 

  export type Hero = {
    name: string;
  } & (HumanInlineFragment | DroidInlineFragment | {}) 

  export type HumanInlineFragment = {
    __typename = "Human";
    height: number;
  } 

  export type DroidInlineFragment = {
    __typename = "Droid";
    primaryFunction: string;
  } 
}

export namespace HeroDetailsWithFragmentQuery {
  export type Variables = {
      episode: Episode | null;
  }

  export type Result = {
    hero: Hero;
  } 

  export type Hero = {
  } & HeroDetails.Fragment 
}

export namespace HeroDetails {
  export type Variables = {
  }

  export type Fragment = {
    name: string;
  } & (HumanInlineFragment | DroidInlineFragment | {}) 

  export type HumanInlineFragment = {
    __typename = "Human";
    height: number;
  } 

  export type DroidInlineFragment = {
    __typename = "Droid";
    primaryFunction: string;
  } 
}

export namespace HeroNameQuery {
  export type Variables = {
      episode: Episode | null;
  }

  export type Result = {
    hero: Hero;
  } 

  export type Hero = {
    name: string;
  } 
}

export namespace HeroNameConditionalInclusionQuery {
  export type Variables = {
      episode: Episode | null;
      includeName: boolean;
  }

  export type Result = {
    hero: Hero;
  } 

  export type Hero = {
    name: string;
  } 
}

export namespace HeroNameConditionalExclusionQuery {
  export type Variables = {
      episode: Episode | null;
      skipName: boolean;
  }

  export type Result = {
    hero: Hero;
  } 

  export type Hero = {
    name: string;
  } 
}

export namespace HeroParentTypeDependentFieldQuery {
  export type Variables = {
      episode: Episode | null;
  }

  export type Result = {
    hero: Hero;
  } 

  export type Hero = {
    name: string;
  } & (HumanInlineFragment | DroidInlineFragment | {}) 

  export type HumanInlineFragment = {
    __typename = "Human";
    friends: Array<Friends>;
  } 

  export type Friends = {
    name: string;
  } & (HumanInlineFragment | {}) 

  export type HumanInlineFragment = {
    __typename = "Human";
    height: number;
  } 

  export type DroidInlineFragment = {
    __typename = "Droid";
    friends: Array<_Friends>;
  } 

  export type _Friends = {
    name: string;
  } & (HumanInlineFragment | {}) 

  export type HumanInlineFragment = {
    __typename = "Human";
    height: number;
  } 
}

export namespace HeroTypeDependentAliasedFieldQuery {
  export type Variables = {
      episode: Episode | null;
  }

  export type Result = {
    hero: Hero;
  } 

  export type Hero = {
  } & (HumanInlineFragment | DroidInlineFragment | {}) 

  export type HumanInlineFragment = {
    __typename = "Human";
    property: string;
  } 

  export type DroidInlineFragment = {
    __typename = "Droid";
    property: string;
  } 
}

export namespace HumanWithNullHeightQuery {
  export type Variables = {
  }

  export type Result = {
    human: Human;
  } 

  export type Human = {
    name: string;
    mass: number;
  } 
}

export namespace TwoHeroesQuery {
  export type Variables = {
  }

  export type Result = {
    r2: R2_Hero;
    luke: Luke_Hero;
  } 

  export type R2_Hero = {
    name: string;
  } 

  export type Luke_Hero = {
    name: string;
  } 
}
