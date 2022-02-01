import gql from 'graphql-tag';
import 'stencil-apollo';
import { Component, Prop, h } from '@stencil/core';

declare global {
  export type VoteMutationVariables = Types.Exact<{
    repoFullName: Types.Scalars['String'];
    type: Types.VoteType;
  }>;

  export type VoteMutation = {
    __typename?: 'Mutation';
    vote?: {
      __typename?: 'Entry';
      score: number;
      id: number;
      vote: { __typename?: 'Vote'; vote_value: number };
    } | null;
  };
}

const VoteDocument = gql`
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

@Component({
  tag: 'apollo-vote',
})
export class VoteComponent {
  @Prop() renderer: import('stencil-apollo').MutationRenderer<VoteMutation, VoteMutationVariables>;
  @Prop() variables: VoteMutationVariables;
  render() {
    return <apollo-mutation mutation={VoteDocument} variables={this.variables} renderer={this.renderer} />;
  }
}
