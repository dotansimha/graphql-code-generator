import gql from 'graphql-tag';
import 'stencil-apollo';
import { Component, Prop, h } from '@stencil/core';
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };

declare global {
  export type CurrentUserForProfileQueryVariables = Exact<{ [key: string]: never }>;

  export type CurrentUserForProfileQuery = { __typename?: 'Query' } & {
    currentUser?: Types.Maybe<{ __typename?: 'User' } & Pick<Types.User, 'login' | 'avatar_url'>>;
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
