import gql from 'graphql-tag';
import 'stencil-apollo';
import { Component, Prop, h } from '@stencil/core';

declare global {
  export type SubmitRepositoryMutationVariables = Types.Exact<{
    repoFullName: Types.Scalars['String'];
  }>;

  export type SubmitRepositoryMutation = {
    __typename?: 'Mutation';
    submitRepository?: { __typename?: 'Entry'; createdAt: number } | null;
  };
}

const SubmitRepositoryDocument = gql`
  mutation submitRepository($repoFullName: String!) {
    submitRepository(repoFullName: $repoFullName) {
      createdAt
    }
  }
`;

@Component({
  tag: 'apollo-submit-repository',
})
export class SubmitRepositoryComponent {
  @Prop() renderer: import('stencil-apollo').MutationRenderer<
    SubmitRepositoryMutation,
    SubmitRepositoryMutationVariables
  >;
  @Prop() variables: SubmitRepositoryMutationVariables;
  render() {
    return <apollo-mutation mutation={SubmitRepositoryDocument} variables={this.variables} renderer={this.renderer} />;
  }
}
