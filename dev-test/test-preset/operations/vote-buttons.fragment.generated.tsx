import * as Types from '../types';

export type VoteButtonsFragment = ({ __typename?: 'Entry' } & Pick<Types.Entry, 'score'> & { vote: ({ __typename?: 'Vote' } & Pick<Types.Vote, 'vote_value'>) });

import gql from 'graphql-tag';
export const VoteButtonsFragmentDoc = gql`
    fragment VoteButtons on Entry {
  score
  vote {
    vote_value
  }
}
    `;
