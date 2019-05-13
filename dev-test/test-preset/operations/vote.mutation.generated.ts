import * as Types from '../types';

export type VoteMutationVariables = {
  repoFullName: Types.Maybe<Types.Scalars['String']>,
  type: Types.Maybe<Types.VoteType>
};


export type VoteMutation = ({ __typename?: 'Mutation' } & { vote: Types.Maybe<({ __typename?: 'Entry' } & Pick<Types.Entry, 'score' | 'id'> & { vote: Types.Maybe<({ __typename?: 'Vote' } & Pick<Types.Vote, 'vote_value'>)> })> });
