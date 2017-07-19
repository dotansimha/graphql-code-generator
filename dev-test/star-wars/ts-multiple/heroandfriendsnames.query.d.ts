import { Episode } from './episode.enum';
export namespace HeroAndFriendsNames {
  export type Variables = {
    episode: Episode | null;
  }

  export type Query = {
    hero: Hero | null; 
  } 

  export type Hero = {
    name: string; 
    friends: Friends[] | null; 
  }

  export type Friends = {
    name: string; 
  }
}
