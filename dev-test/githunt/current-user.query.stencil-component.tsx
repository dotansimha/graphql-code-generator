// tslint:disable
import * as Types from './types.d';

import gql from 'graphql-tag';
import 'stencil-apollo';
import { Component, Prop, h } from '@stencil/core';

    declare global { 
      export type CurrentUserForProfileQueryVariables = {};


export type CurrentUserForProfileQuery = (
  { __typename?: 'Query' }
  & { currentUser: Types.Maybe<(
    { __typename?: 'User' }
    & Pick<Types.User, 'login' | 'avatar_url'>
  )> }
);
 
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
    tag: 'apollo-current-user-for-profile'
})
export class CurrentUserForProfileComponent {
    @Prop() renderer: import('stencil-apollo').QueryRenderer<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables>;
    render() {
        return <apollo-query query={ CurrentUserForProfileDocument } renderer={ this.renderer } />;
    }
}
      