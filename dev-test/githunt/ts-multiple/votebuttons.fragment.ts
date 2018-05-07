export namespace VoteButtons {
  export type Fragment = {
    __typename?: 'Entry';
    score: number;
    vote: Vote;
  };
  export type Vote = {
    __typename?: 'Vote';
    vote_value: number;
  };
}
