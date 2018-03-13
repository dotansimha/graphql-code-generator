import { Character } from './character.interface';
import { Episode } from './episode.enum';
import { Review } from './review.type';
import { SearchResult } from './searchresult.union';
import { Droid } from './droid.type';
import { Human } from './human.type';
import { Starship } from './starship.type';
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
