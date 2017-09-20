/* tslint:disable */
/* A character from the Star Wars universe */
export interface Character {
  id: string; /* The ID of the character */
  name: string; /* The name of the character */
  friends?: Character[]; /* The friends of the character, or an empty list if they have none */
  friendsConnection: FriendsConnection; /* The friends of the character exposed as a connection with edges */
  appearsIn: Episode[]; /* The movies this character appears in */
}
/* The query type, represents all of the entry points into our object graph */
export interface Query {
  hero?: Character; 
  reviews?: Review[]; 
  search?: SearchResult[]; 
  character?: Character; 
  droid?: Droid; 
  human?: Human; 
  starship?: Starship; 
}
/* A connection object for a character&#x27;s friends */
export interface FriendsConnection {
  totalCount?: number; /* The total number of friends */
  edges?: FriendsEdge[]; /* The edges for each of the character&#x27;s friends. */
  friends?: Character[]; /* A list of the friends, as a convenience when edges are not needed. */
  pageInfo: PageInfo; /* Information for paginating this connection */
}
/* An edge object for a character&#x27;s friends */
export interface FriendsEdge {
  cursor: string; /* A cursor used for pagination */
  node?: Character; /* The character represented by this friendship edge */
}
/* Information for paginating this connection */
export interface PageInfo {
  startCursor?: string; 
  endCursor?: string; 
  hasNextPage: boolean; 
}
/* Represents a review for a movie */
export interface Review {
  stars: number; /* The number of stars this review gave, 1-5 */
  commentary?: string; /* Comment about the movie */
}
/* A humanoid creature from the Star Wars universe */
export interface Human extends Character {
  id: string; /* The ID of the human */
  name: string; /* What this human calls themselves */
  homePlanet?: string; /* The home planet of the human, or null if unknown */
  height?: number; /* Height in the preferred unit, default is meters */
  mass?: number; /* Mass in kilograms, or null if unknown */
  friends?: Character[]; /* This human&#x27;s friends, or an empty list if they have none */
  friendsConnection: FriendsConnection; /* The friends of the human exposed as a connection with edges */
  appearsIn: Episode[]; /* The movies this human appears in */
  starships?: Starship[]; /* A list of starships this person has piloted, or an empty list if none */
}

export interface Starship {
  id: string; /* The ID of the starship */
  name: string; /* The name of the starship */
  length?: number; /* Length of the starship, along the longest axis */
}
/* An autonomous mechanical character in the Star Wars universe */
export interface Droid extends Character {
  id: string; /* The ID of the droid */
  name: string; /* What others call this droid */
  friends?: Character[]; /* This droid&#x27;s friends, or an empty list if they have none */
  friendsConnection: FriendsConnection; /* The friends of the droid exposed as a connection with edges */
  appearsIn: Episode[]; /* The movies this droid appears in */
  primaryFunction?: string; /* This droid&#x27;s primary function */
}
/* The mutation type, represents all updates we can make to our data */
export interface Mutation {
  createReview?: Review; 
}
/* The input object sent when someone is creating a new review */
export interface ReviewInput {
  stars: number; /* 0-5 stars */
  commentary?: string; /* Comment about the movie, optional */
  favoriteColor?: ColorInput; /* Favorite color, optional */
}
/* The input object sent when passing a color */
export interface ColorInput {
  red: number; 
  green: number; 
  blue: number; 
}
export interface HeroQueryArgs {
  episode?: Episode; 
}
export interface ReviewsQueryArgs {
  episode: Episode; 
}
export interface SearchQueryArgs {
  text?: string; 
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
  first?: number; 
  after?: string; 
}
export interface LengthStarshipArgs {
  unit?: LengthUnit; 
}
export interface FriendsConnectionDroidArgs {
  first?: number; 
  after?: string; 
}
export interface CreateReviewMutationArgs {
  episode?: Episode; 
  review: ReviewInput; 
}
/* The episodes in the Star Wars trilogy */
export type Episode = "NEWHOPE" | "EMPIRE" | "JEDI";

/* Units of height */
export type LengthUnit = "METER" | "FOOT";


export type SearchResult = Human | Droid | Starship;

