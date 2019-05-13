import * as Types from '../types';

type Maybe<T> = T | null;

export type VoteButtonsFragment = ({ __typename?: 'Entry' } & Pick<Types.Entry, 'score'> & { vote: ({ __typename?: 'Vote' } & Pick<Types.Vote, 'vote_value'>) });
