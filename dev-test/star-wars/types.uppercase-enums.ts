// tslint:disable
export type Maybe<T> = T | null;

/** The input object sent when someone is creating a new review */
export interface ReviewInput {
  /** 0-5 stars */
  stars: number;
  /** Comment about the movie, optional */
  commentary?: Maybe<string>;
  /** Favorite color, optional */
  favoriteColor?: Maybe<ColorInput>;
}
/** The input object sent when passing a color */
export interface ColorInput {
  
  red: number;
  
  green: number;
  
  blue: number;
}
/** The episodes in the Star Wars trilogy */
  export enum Episode {
    NEWHOPE = "NEWHOPE",
    EMPIRE = "EMPIRE",
    JEDI = "JEDI",
  }
/** Units of height */
  export enum LengthUnit {
    METER = "METER",
    FOOT = "FOOT",
  }





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
  friends?: Maybe<(Maybe<Character>)[]>;
  /** The friends of the character exposed as a connection with edges */
  friendsConnection: FriendsConnection;
  /** The movies this character appears in */
  appearsIn: (Maybe<Episode>)[];
}




// ====================================================
// Types
// ====================================================


/** The query type, represents all of the entry points into our object graph */
export interface Query {
  
  hero?: Maybe<Character>;
  
  reviews?: Maybe<(Maybe<Review>)[]>;
  
  search?: Maybe<(Maybe<SearchResult>)[]>;
  
  character?: Maybe<Character>;
  
  droid?: Maybe<Droid>;
  
  human?: Maybe<Human>;
  
  starship?: Maybe<Starship>;
}

/** A connection object for a character's friends */
export interface FriendsConnection {
  /** The total number of friends */
  totalCount?: Maybe<number>;
  /** The edges for each of the character's friends. */
  edges?: Maybe<(Maybe<FriendsEdge>)[]>;
  /** A list of the friends, as a convenience when edges are not needed. */
  friends?: Maybe<(Maybe<Character>)[]>;
  /** Information for paginating this connection */
  pageInfo: PageInfo;
}

/** An edge object for a character's friends */
export interface FriendsEdge {
  /** A cursor used for pagination */
  cursor: string;
  /** The character represented by this friendship edge */
  node?: Maybe<Character>;
}

/** Information for paginating this connection */
export interface PageInfo {
  
  startCursor?: Maybe<string>;
  
  endCursor?: Maybe<string>;
  
  hasNextPage: boolean;
}

/** Represents a review for a movie */
export interface Review {
  /** The number of stars this review gave, 1-5 */
  stars: number;
  /** Comment about the movie */
  commentary?: Maybe<string>;
}

/** A humanoid creature from the Star Wars universe */
export interface Human extends Character {
  /** The ID of the human */
  id: string;
  /** What this human calls themselves */
  name: string;
  /** The home planet of the human, or null if unknown */
  homePlanet?: Maybe<string>;
  /** Height in the preferred unit, default is meters */
  height?: Maybe<number>;
  /** Mass in kilograms, or null if unknown */
  mass?: Maybe<number>;
  /** This human's friends, or an empty list if they have none */
  friends?: Maybe<(Maybe<Character>)[]>;
  /** The friends of the human exposed as a connection with edges */
  friendsConnection: FriendsConnection;
  /** The movies this human appears in */
  appearsIn: (Maybe<Episode>)[];
  /** A list of starships this person has piloted, or an empty list if none */
  starships?: Maybe<(Maybe<Starship>)[]>;
}


export interface Starship {
  /** The ID of the starship */
  id: string;
  /** The name of the starship */
  name: string;
  /** Length of the starship, along the longest axis */
  length?: Maybe<number>;
}

/** An autonomous mechanical character in the Star Wars universe */
export interface Droid extends Character {
  /** The ID of the droid */
  id: string;
  /** What others call this droid */
  name: string;
  /** This droid's friends, or an empty list if they have none */
  friends?: Maybe<(Maybe<Character>)[]>;
  /** The friends of the droid exposed as a connection with edges */
  friendsConnection: FriendsConnection;
  /** The movies this droid appears in */
  appearsIn: (Maybe<Episode>)[];
  /** This droid's primary function */
  primaryFunction?: Maybe<string>;
}

/** The mutation type, represents all updates we can make to our data */
export interface Mutation {
  
  createReview?: Maybe<Review>;
}



// ====================================================
// Arguments
// ====================================================

export interface HeroQueryArgs {
  
  episode?: Maybe<Episode>;
}
export interface ReviewsQueryArgs {
  
  episode: Episode;
}
export interface SearchQueryArgs {
  
  text?: Maybe<string>;
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
  
  unit?: LengthUnit;
}
export interface FriendsConnectionHumanArgs {
  
  first?: Maybe<number>;
  
  after?: Maybe<string>;
}
export interface LengthStarshipArgs {
  
  unit?: LengthUnit;
}
export interface FriendsConnectionDroidArgs {
  
  first?: Maybe<number>;
  
  after?: Maybe<string>;
}
export interface CreateReviewMutationArgs {
  
  episode?: Maybe<Episode>;
  
  review: ReviewInput;
}


// ====================================================
// Unions
// ====================================================



export type SearchResult = Human | Droid | Starship;


