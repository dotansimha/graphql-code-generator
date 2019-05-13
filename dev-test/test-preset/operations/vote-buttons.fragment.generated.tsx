import * as Types from '../types';

export type VoteButtonsFragment = ({ __typename?: 'Entry' } & Pick<Types.Entry, 'score'> & { vote: Types.Maybe<({ __typename?: 'Vote' } & Pick<Types.Vote, 'vote_value'>)> });
