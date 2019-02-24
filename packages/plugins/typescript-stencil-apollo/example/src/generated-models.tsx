/* tslint:disable */
export type Maybe<T> = T | null;

export enum CacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE'
}

/** The `Upload` scalar type represents a file upload. */
export type Upload = any;

// ====================================================
// Documents
// ====================================================

export namespace AllPosts {
  export type Variables = {};

  export type Query = {
    __typename?: 'Query';

    posts: Maybe<(Maybe<Posts>)[]>;
  };

  export type Posts = {
    __typename?: 'Post';

    id: number;

    title: Maybe<string>;

    votes: Maybe<number>;

    author: Maybe<Author>;
  };

  export type Author = {
    __typename?: 'Author';

    id: number;

    firstName: Maybe<string>;

    lastName: Maybe<string>;
  };
}

export namespace UpvotePost {
  export type Variables = {
    postId: number;
  };

  export type Mutation = {
    __typename?: 'Mutation';

    upvotePost: Maybe<UpvotePost>;
  };

  export type UpvotePost = {
    __typename?: 'Post';

    id: number;

    votes: Maybe<number>;
  };
}

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
  export const Component = (props: ComponentProps) => <apollo-query query={Document} {...props} />;
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
  export const Component = (props: ComponentProps) => <apollo-mutation mutation={Document} {...props} />;
}
