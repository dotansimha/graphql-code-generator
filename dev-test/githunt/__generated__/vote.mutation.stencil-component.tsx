import gql from 'graphql-tag';
import 'stencil-apollo';
import { Component, Prop, h } from '@stencil/core';
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };

declare global {
  export type VoteMutationVariables = Exact<{
    repoFullName: Types.Scalars['String'];
    type: Types.VoteType;
  }>;

  export type VoteMutation = { __typename?: 'Mutation' } & {
    vote?: Types.Maybe<
      { __typename?: 'Entry' } & Pick<Types.Entry, 'score' | 'id'> & {
          vote: { __typename?: 'Vote' } & Pick<Types.Vote, 'vote_value'>;
        }
    >;
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
