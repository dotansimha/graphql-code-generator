// tslint:disable
import * as Types from './types.d';

import gql from 'graphql-tag';
import { FeedEntryFragmentDoc } from './feed-entry.fragment.stencil-component';
import 'stencil-apollo';
import { Component, Prop, h } from '@stencil/core';

    declare global { 
      export type FeedQueryVariables = {
  type: Types.FeedType,
  offset?: Types.Maybe<Types.Scalars['Int']>,
  limit?: Types.Maybe<Types.Scalars['Int']>
};


export type FeedQuery = ({ __typename?: 'Query' } & { currentUser: Types.Maybe<({ __typename?: 'User' } & Pick<Types.User, 'login'>)>, feed: Types.Maybe<Array<Types.Maybe<({ __typename?: 'Entry' } & FeedEntryFragment)>>> });
 
    }
          

 const FeedDocument = gql`
    query Feed($type: FeedType!, $offset: Int, $limit: Int) {
  currentUser {
    login
  }
  feed(type: $type, offset: $offset, limit: $limit) {
    ...FeedEntry
  }
}
    ${FeedEntryFragmentDoc}`;

@Component({
    tag: 'apollo-feed'
})
export class FeedComponent {
    @Prop() renderer: import('stencil-apollo').QueryRenderer<FeedQuery, FeedQueryVariables>;
    render() {
        return <apollo-query query={ FeedDocument } renderer={ this.renderer } />;
    }
}
      