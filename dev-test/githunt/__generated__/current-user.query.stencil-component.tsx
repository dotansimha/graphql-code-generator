import gql from 'graphql-tag';
import 'stencil-apollo';
import { Component, Prop, h } from '@stencil/core';

declare global {
  export type CurrentUserForProfileQueryVariables = Types.Exact<{ [key: string]: never }>;

  export type CurrentUserForProfileQuery = {
    __typename?: 'Query';
    currentUser?: { __typename?: 'User'; login: string; avatar_url: string } | null;
  };
}

const CurrentUserForProfileDocument = gql`
  query CurrentUserForProfile {
    currentUser {
      login
      avatar_url
    }
  }
`;

@Component({
  tag: 'apollo-current-user-for-profile',
})
export class CurrentUserForProfileComponent {
  @Prop() renderer: import('stencil-apollo').QueryRenderer<
    CurrentUserForProfileQuery,
    CurrentUserForProfileQueryVariables
  >;
  @Prop() variables: CurrentUserForProfileQueryVariables;
  render() {
    return <apollo-query query={CurrentUserForProfileDocument} variables={this.variables} renderer={this.renderer} />;
  }
}
