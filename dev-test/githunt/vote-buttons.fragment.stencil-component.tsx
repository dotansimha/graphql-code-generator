// tslint:disable
import * as Types from './types.d';

import gql from 'graphql-tag';

    declare global { 
      export type VoteButtonsFragment = (
  { __typename?: 'Entry' }
  & Pick<Types.Entry, 'score'>
  & { vote: (
    { __typename?: 'Vote' }
    & Pick<Types.Vote, 'vote_value'>
  ) }
);
 
    }
          
export const VoteButtonsFragmentDoc = gql`
    fragment VoteButtons on Entry {
  score
  vote {
    vote_value
  }
}
    `;