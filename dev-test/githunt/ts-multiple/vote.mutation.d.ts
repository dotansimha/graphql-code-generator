import { VoteType } from './votetype.enum';
export namespace Vote {
  export type Variables = {
    repoFullName: string;
    type: VoteType;
  }

  export type Mutation = {
    vote?: Vote; 
  } 

  export type Vote = {
    score: number; 
    id: number; 
    vote: _Vote; 
  } 

  export type _Vote = {
    vote_value: number; 
  } 
}
