import gql from 'graphql-tag';
import { CommentsPageCommentFragmentDoc } from './comments-page-comment.fragment.stencil-component';
import 'stencil-apollo';
import { Component, Prop, h } from '@stencil/core';

declare global {
  export type CommentQueryVariables = Types.Exact<{
    repoFullName: Types.Scalars['String'];
    limit?: Types.InputMaybe<Types.Scalars['Int']>;
    offset?: Types.InputMaybe<Types.Scalars['Int']>;
  }>;

  export type CommentQuery = {
    __typename?: 'Query';
    currentUser?: { __typename?: 'User'; login: string; html_url: string } | null;
    entry?: {
      __typename?: 'Entry';
      id: number;
      createdAt: number;
      commentCount: number;
      postedBy: { __typename?: 'User'; login: string; html_url: string };
      comments: Array<{
        __typename?: 'Comment';
        id: number;
        createdAt: number;
        content: string;
        postedBy: { __typename?: 'User'; login: string; html_url: string };
      } | null>;
      repository: {
        __typename?: 'Repository';
        description?: string | null;
        open_issues_count?: number | null;
        stargazers_count: number;
        full_name: string;
        html_url: string;
      };
    } | null;
  };
}

const CommentDocument = gql`
  query Comment($repoFullName: String!, $limit: Int, $offset: Int) {
    currentUser {
      login
      html_url
    }
    entry(repoFullName: $repoFullName) {
      id
      postedBy {
        login
        html_url
      }
      createdAt
      comments(limit: $limit, offset: $offset) {
        ...CommentsPageComment
      }
      commentCount
      repository {
        full_name
        html_url
        ... on Repository {
          description
          open_issues_count
          stargazers_count
        }
      }
    }
  }
  ${CommentsPageCommentFragmentDoc}
`;

@Component({
  tag: 'apollo-comment',
})
export class CommentComponent {
  @Prop() renderer: import('stencil-apollo').QueryRenderer<CommentQuery, CommentQueryVariables>;
  @Prop() variables: CommentQueryVariables;
  render() {
    return <apollo-query query={CommentDocument} variables={this.variables} renderer={this.renderer} />;
  }
}
