/* tslint:disable */
import { GraphQLResolveInfo } from 'graphql';

export type Resolver<Result, Parent = any, Context = any, Args = any> = (
  parent: Parent,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo
) => Promise<Result> | Result;

export type SubscriptionResolver<Result, Parent = any, Context = any, Args = any> = {
  subscribe<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: Context,
    info: GraphQLResolveInfo
  ): AsyncIterator<R | Result>;
  resolve?<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: Context,
    info: GraphQLResolveInfo
  ): R | Result | Promise<R | Result>;
};

/** The `Upload` scalar type represents a file upload promise that resolves an object containing `stream`, `filename`, `mimetype` and `encoding`. */
export type Upload = any;

export interface Query {
  posts?: (Post | null)[] | null;
  author?: Author | null;
}

export interface Post {
  id: number;
  title?: string | null;
  author?: Author | null;
  votes?: number | null;
}

export interface Author {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  posts?: (Post | null)[] | null;
}

export interface Mutation {
  upvotePost?: Post | null;
}
export interface AuthorQueryArgs {
  id: number;
}
export interface UpvotePostMutationArgs {
  postId: number;
}

export enum CacheControlScope {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE'
}

export namespace QueryResolvers {
  export interface Resolvers<Context = any> {
    posts?: PostsResolver<(Post | null)[] | null, any, Context>;
    author?: AuthorResolver<Author | null, any, Context>;
  }

  export type PostsResolver<R = (Post | null)[] | null, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type AuthorResolver<R = Author | null, Parent = any, Context = any> = Resolver<R, Parent, Context, AuthorArgs>;
  export interface AuthorArgs {
    id: number;
  }
}

export namespace PostResolvers {
  export interface Resolvers<Context = any> {
    id?: IdResolver<number, any, Context>;
    title?: TitleResolver<string | null, any, Context>;
    author?: AuthorResolver<Author | null, any, Context>;
    votes?: VotesResolver<number | null, any, Context>;
  }

  export type IdResolver<R = number, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type TitleResolver<R = string | null, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type AuthorResolver<R = Author | null, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type VotesResolver<R = number | null, Parent = any, Context = any> = Resolver<R, Parent, Context>;
}

export namespace AuthorResolvers {
  export interface Resolvers<Context = any> {
    id?: IdResolver<number, any, Context>;
    firstName?: FirstNameResolver<string | null, any, Context>;
    lastName?: LastNameResolver<string | null, any, Context>;
    posts?: PostsResolver<(Post | null)[] | null, any, Context>;
  }

  export type IdResolver<R = number, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type FirstNameResolver<R = string | null, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type LastNameResolver<R = string | null, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type PostsResolver<R = (Post | null)[] | null, Parent = any, Context = any> = Resolver<R, Parent, Context>;
}

export namespace MutationResolvers {
  export interface Resolvers<Context = any> {
    upvotePost?: UpvotePostResolver<Post | null, any, Context>;
  }

  export type UpvotePostResolver<R = Post | null, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context,
    UpvotePostArgs
  >;
  export interface UpvotePostArgs {
    postId: number;
  }
}

export namespace AllPosts {
  export type Variables = {};

  export type Query = {
    __typename?: 'Query';
    posts?: (Posts | null)[] | null;
  };

  export type Posts = {
    __typename?: 'Post';
    id: number;
    title?: string | null;
    votes?: number | null;
    author?: Author | null;
  };

  export type Author = {
    __typename?: 'Author';
    id: number;
    firstName?: string | null;
    lastName?: string | null;
  };
}

export namespace AllPostsWithFragment {
  export type Variables = {};

  export type Query = {
    __typename?: 'Query';
    posts?: (Posts | null)[] | null;
  };

  export type Posts = PostFragment.Fragment;
}

export namespace UpvotePost {
  export type Variables = {
    postId: number;
  };

  export type Mutation = {
    __typename?: 'Mutation';
    upvotePost?: UpvotePost | null;
  };

  export type UpvotePost = {
    __typename?: 'Post';
    id: number;
    votes?: number | null;
  };
}

export namespace PostFragment {
  export type Fragment = {
    __typename?: 'Post';
    id: number;
    title?: string | null;
    votes?: number | null;
    author?: Author | null;
  };

  export type Author = AuthorFragment.Fragment;
}

export namespace AuthorFragment {
  export type Fragment = {
    __typename?: 'Author';
    id: number;
    firstName?: string | null;
    lastName?: string | null;
  };
}

import * as ReactApollo from 'react-apollo';
import * as React from 'react';

import gql from 'graphql-tag';

export namespace PostFragment {
  export const getDocument = () => gql`
    fragment PostFragment on Post {
      id
      title
      votes
      author {
        ...AuthorFragment
      }
    }

    ${AuthorFragment.getDocument()}
  `;
}

export namespace AuthorFragment {
  export const getDocument = () => gql`
    fragment AuthorFragment on Author {
      id
      firstName
      lastName
    }
  `;
}

export namespace AllPosts {
  export const getDocument = () => gql`
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
  export class Component extends React.Component<Partial<ReactApollo.QueryProps<Query, Variables>>> {
    render() {
      return <ReactApollo.Query<Query, Variables> query={getDocument()} {...this.props as any} />;
    }
  }
  export function HOC<TProps = {}>(operationOptions?: ReactApollo.OperationOption<TProps, Query, Variables>) {
    return ReactApollo.graphql<TProps, Query, Variables>(getDocument(), operationOptions);
  }
}
export namespace AllPostsWithFragment {
  export const getDocument = () => gql`
    query allPostsWithFragment {
      posts {
        ...PostFragment
      }
    }

    ${PostFragment.getDocument()}
  `;
  export class Component extends React.Component<Partial<ReactApollo.QueryProps<Query, Variables>>> {
    render() {
      return <ReactApollo.Query<Query, Variables> query={getDocument()} {...this.props as any} />;
    }
  }
  export function HOC<TProps = {}>(operationOptions?: ReactApollo.OperationOption<TProps, Query, Variables>) {
    return ReactApollo.graphql<TProps, Query, Variables>(getDocument(), operationOptions);
  }
}
export namespace UpvotePost {
  export const getDocument = () => gql`
    mutation upvotePost($postId: Int!) {
      upvotePost(postId: $postId) {
        id
        votes
      }
    }
  `;
  export class Component extends React.Component<Partial<ReactApollo.MutationProps<Mutation, Variables>>> {
    render() {
      return <ReactApollo.Mutation<Mutation, Variables> mutation={getDocument()} {...this.props as any} />;
    }
  }
  export function HOC<TProps = {}>(operationOptions?: ReactApollo.OperationOption<TProps, Mutation, Variables>) {
    return ReactApollo.graphql<TProps, Mutation, Variables>(getDocument(), operationOptions);
  }
}
