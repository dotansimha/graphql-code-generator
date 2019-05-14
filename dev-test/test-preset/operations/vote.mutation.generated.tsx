import * as Types from '../types';

export type VoteMutationVariables = {
  repoFullName: Types.Scalars['String'],
  type: Types.VoteType
};


export type VoteMutation = ({ __typename?: 'Mutation' } & { vote: Types.Maybe<({ __typename?: 'Entry' } & Pick<Types.Entry, 'score' | 'id'> & { vote: ({ __typename?: 'Vote' } & Pick<Types.Vote, 'vote_value'>) })> });

import gql from 'graphql-tag';
import * as React from 'react';
import * as ReactApollo from 'react-apollo';
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export const VoteDocument = gql`
    mutation vote($repoFullName: String!, $type: VoteType!) {
  vote(repoFullName: $repoFullName, type: $type) {
    score
    id
    vote {
      vote_value
    }
  }
}
    `;
export type VoteMutationFn = ReactApollo.MutationFn<VoteMutation, VoteMutationVariables>;

export const VoteComponent = (props: Omit<Omit<ReactApollo.MutationProps<VoteMutation, VoteMutationVariables>, 'mutation'>, 'variables'> & { variables?: VoteMutationVariables }) => (
  <ReactApollo.Mutation<VoteMutation, VoteMutationVariables> mutation={VoteDocument} {...props} />
);

export type VoteProps<TChildProps = {}> = Partial<ReactApollo.MutateProps<VoteMutation, VoteMutationVariables>> & TChildProps;
export function withVote<TProps, TChildProps = {}>(operationOptions?: ReactApollo.OperationOption<
  TProps,
  VoteMutation,
  VoteMutationVariables,
  VoteProps<TChildProps>>) {
    return ReactApollo.withMutation<TProps, VoteMutation, VoteMutationVariables, VoteProps<TChildProps>>(VoteDocument, {
      alias: 'withVote',
      ...operationOptions
    });
}
