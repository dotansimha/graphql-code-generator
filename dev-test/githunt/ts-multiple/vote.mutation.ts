import { VoteType } from './votetype.enum';
export namespace Vote {
  export type Variables = {
    repoFullName: string;
    type: VoteType;
  };

  export type Mutation = {
    __typename?: 'Mutation';
    vote?: Vote | null;
  };

  export type Vote = {
    __typename?: 'Entry';
    score: number;
    id: number;
    vote: _Vote;
  };

  export type _Vote = {
    __typename?: 'Vote';
    vote_value: number;
  };
}
