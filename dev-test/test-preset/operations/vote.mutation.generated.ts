import * as Types from '../types';

type Maybe<T> = T | null;

export type VoteMutationVariables = {
  repoFullName: Types.Scalars['String'],
  type: VoteType
};


export type VoteMutation = ({ __typename?: 'Mutation' } & { vote: Maybe<({ __typename?: 'Entry' } & Pick<Types.Entry, 'score' | 'id'> & { vote: ({ __typename?: 'Vote' } & Pick<Types.Vote, 'vote_value'>) })> });
