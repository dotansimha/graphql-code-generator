import gql from 'graphql-tag';

declare global {
  export type VoteButtonsFragment = {
    __typename?: 'Entry';
    score: number;
    vote: { __typename?: 'Vote'; vote_value: number };
  };
}

export const VoteButtonsFragmentDoc = gql`
  fragment VoteButtons on Entry {
    score
    vote {
      vote_value
    }
  }
`;
