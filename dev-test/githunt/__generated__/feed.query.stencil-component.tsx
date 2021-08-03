import gql from 'graphql-tag';
import { FeedEntryFragmentDoc } from './feed-entry.fragment.stencil-component';
import 'stencil-apollo';
import { Component, Prop, h } from '@stencil/core';

declare global {
  export type FeedQueryVariables = Types.Exact<{
    type: Types.FeedType;
    offset?: Types.Maybe<Types.Scalars['Int']>;
    limit?: Types.Maybe<Types.Scalars['Int']>;
  }>;

  export type FeedQuery = {
    __typename?: 'Query';
    currentUser?: Types.Maybe<{ __typename?: 'User'; login: string }>;
    feed?: Types.Maybe<
      Array<
        Types.Maybe<{
          __typename?: 'Entry';
          id: number;
          commentCount: number;
          score: number;
          createdAt: number;
          repository: {
            __typename?: 'Repository';
            full_name: string;
            html_url: string;
            description?: Types.Maybe<string>;
            stargazers_count: number;
            open_issues_count?: Types.Maybe<number>;
            owner?: Types.Maybe<{ __typename?: 'User'; avatar_url: string }>;
          };
          vote: { __typename?: 'Vote'; vote_value: number };
          postedBy: { __typename?: 'User'; html_url: string; login: string };
        }>
      >
    >;
  };
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
  ${FeedEntryFragmentDoc}
`;

@Component({
  tag: 'apollo-feed',
})
export class FeedComponent {
  @Prop() renderer: import('stencil-apollo').QueryRenderer<FeedQuery, FeedQueryVariables>;
  @Prop() variables: FeedQueryVariables;
  render() {
    return <apollo-query query={FeedDocument} variables={this.variables} renderer={this.renderer} />;
  }
}
