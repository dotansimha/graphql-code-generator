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

  export type FeedQuery = { __typename?: 'Query' } & {
    currentUser?: Types.Maybe<{ __typename?: 'User' } & Pick<Types.User, 'login'>>;
    feed?: Types.Maybe<
      Array<
        Types.Maybe<
          { __typename?: 'Entry' } & Pick<Types.Entry, 'id' | 'commentCount' | 'score' | 'createdAt'> & {
              repository: { __typename?: 'Repository' } & Pick<
                Types.Repository,
                'full_name' | 'html_url' | 'description' | 'stargazers_count' | 'open_issues_count'
              > & { owner?: Types.Maybe<{ __typename?: 'User' } & Pick<Types.User, 'avatar_url'>> };
              vote: { __typename?: 'Vote' } & Pick<Types.Vote, 'vote_value'>;
              postedBy: { __typename?: 'User' } & Pick<Types.User, 'html_url' | 'login'>;
            }
        >
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
