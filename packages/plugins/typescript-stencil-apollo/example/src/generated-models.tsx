/* tslint:disable */

// ====================================================
// Documents
// ====================================================

export namespace AllPosts {
  export type Variables = {};

  export type Query = {
    __typename?: 'Query';

    posts: (Posts | null)[] | null;
  };

  export type Posts = {
    __typename?: 'Post';

    id: number;

    title: string | null;

    votes: number | null;

    author: Author | null;
  };

  export type Author = {
    __typename?: 'Author';

    id: number;

    firstName: string | null;

    lastName: string | null;
  };
}

export namespace UpvotePost {
  export type Variables = {
    postId: number;
  };

  export type Mutation = {
    __typename?: 'Mutation';

    upvotePost: UpvotePost | null;
  };

  export type UpvotePost = {
    __typename?: 'Post';

    id: number;

    votes: number | null;
  };
}

import { FunctionalComponent } from '@stencil/core';

import gql from 'graphql-tag';

// ====================================================
// Components
// ====================================================

export namespace AllPosts {
  export const Document = gql`
    query allPosts {
      posts {
        id
        title
        votes
        author {
          id
          firstName
          lastName
        }
      }
    }
  `;
  export interface ComponentProps {
    variables?: Variables;
    onReady?: import('stencil-apollo/dist/types/components/apollo-query/types').OnQueryReadyFn<Query, Variables>;
  }
  export const Component: FunctionalComponent<ComponentProps> = (props, children) => {
    return (
      <apollo-query query={Document} {...props}>
        {children}
      </apollo-query>
    );
  };
}
export namespace UpvotePost {
  export const Document = gql`
    mutation upvotePost($postId: Int!) {
      upvotePost(postId: $postId) {
        id
        votes
      }
    }
  `;
  export interface ComponentProps {
    variables?: Variables;
    onReady?: import('stencil-apollo/dist/types/components/apollo-mutation/types').OnMutationReadyFn<
      Mutation,
      Variables
    >;
  }
  export const Component: FunctionalComponent<ComponentProps> = (props, children) => {
    return (
      <apollo-mutation mutation={Document} {...props}>
        {children}
      </apollo-mutation>
    );
  };
}
