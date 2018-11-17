// ====================================================
// Documents
// ====================================================

export type AllPostsVariables = {};

export type AllPostsQuery = {
  __typename?: 'Query';

  posts: AllPostsPosts[] | null;
};

export type AllPostsPosts = {
  __typename?: 'Post';

  id: number;

  title: string | null;

  votes: number | null;

  author: AllPostsAuthor | null;
};

export type AllPostsAuthor = {
  __typename?: 'Author';

  id: number;

  firstName: string | null;

  lastName: string | null;
};

export type AllPostsWithFragmentVariables = {};

export type AllPostsWithFragmentQuery = {
  __typename?: 'Query';

  posts: AllPostsWithFragmentPosts[] | null;
};

export type AllPostsWithFragmentPosts = PostFragmentFragment;

export type UpvotePostVariables = {
  postId: number;
};

export type UpvotePostMutation = {
  __typename?: 'Mutation';

  upvotePost: UpvotePostUpvotePost | null;
};

export type UpvotePostUpvotePost = {
  __typename?: 'Post';

  id: number;

  votes: number | null;
};

export type PostFragmentFragment = {
  __typename?: 'Post';

  id: number;

  title: string | null;

  votes: number | null;

  author: PostFragmentAuthor | null;
};

export type PostFragmentAuthor = AuthorFragmentFragment;

export type AuthorFragmentFragment = {
  __typename?: 'Author';

  id: number;

  firstName: string | null;

  lastName: string | null;
};

import * as ReactApollo from 'react-apollo';
import * as React from 'react';

import gql from 'graphql-tag';

// ====================================================
// Fragments
// ====================================================

export const AuthorFragmentFragmentDoc = gql`
  fragment AuthorFragment on Author {
    id
    firstName
    lastName
  }
`;

export const PostFragmentFragmentDoc = gql`
  fragment PostFragment on Post {
    id
    title
    votes
    author {
      ...AuthorFragment
    }
  }

  ${AuthorFragmentFragmentDoc}
`;

// ====================================================
// Components
// ====================================================

export const AllPostsDocument = gql`
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
export class AllPostsComponent extends React.Component<
  Partial<ReactApollo.QueryProps<AllPostsQuery, AllPostsVariables>>
> {
  render() {
    return (
      <ReactApollo.Query<AllPostsQuery, AllPostsVariables>
        query={AllPostsDocument}
        {...(this as any)['props'] as any}
      />
    );
  }
}
export type AllPostsProps<TChildProps = any> = Partial<ReactApollo.DataProps<AllPostsQuery, AllPostsVariables>> &
  TChildProps;
export function AllPostsHOC<TProps, TChildProps = any>(
  operationOptions:
    | ReactApollo.OperationOption<TProps, AllPostsQuery, AllPostsVariables, AllPostsProps<TChildProps>>
    | undefined
) {
  return ReactApollo.graphql<TProps, AllPostsQuery, AllPostsVariables, AllPostsProps<TChildProps>>(
    AllPostsDocument,
    operationOptions
  );
}
export const AllPostsWithFragmentDocument = gql`
  query allPostsWithFragment {
    posts {
      ...PostFragment
    }
  }

  ${PostFragmentFragmentDoc}
`;
export class AllPostsWithFragmentComponent extends React.Component<
  Partial<ReactApollo.QueryProps<AllPostsWithFragmentQuery, AllPostsWithFragmentVariables>>
> {
  render() {
    return (
      <ReactApollo.Query<AllPostsWithFragmentQuery, AllPostsWithFragmentVariables>
        query={AllPostsWithFragmentDocument}
        {...(this as any)['props'] as any}
      />
    );
  }
}
export type AllPostsWithFragmentProps<TChildProps = any> = Partial<
  ReactApollo.DataProps<AllPostsWithFragmentQuery, AllPostsWithFragmentVariables>
> &
  TChildProps;
export function AllPostsWithFragmentHOC<TProps, TChildProps = any>(
  operationOptions:
    | ReactApollo.OperationOption<
        TProps,
        AllPostsWithFragmentQuery,
        AllPostsWithFragmentVariables,
        AllPostsWithFragmentProps<TChildProps>
      >
    | undefined
) {
  return ReactApollo.graphql<
    TProps,
    AllPostsWithFragmentQuery,
    AllPostsWithFragmentVariables,
    AllPostsWithFragmentProps<TChildProps>
  >(AllPostsWithFragmentDocument, operationOptions);
}
export const UpvotePostDocument = gql`
  mutation upvotePost($postId: Int!) {
    upvotePost(postId: $postId) {
      id
      votes
    }
  }
`;
export class UpvotePostComponent extends React.Component<
  Partial<ReactApollo.MutationProps<UpvotePostMutation, UpvotePostVariables>>
> {
  render() {
    return (
      <ReactApollo.Mutation<UpvotePostMutation, UpvotePostVariables>
        mutation={UpvotePostDocument}
        {...(this as any)['props'] as any}
      />
    );
  }
}
export type UpvotePostProps<TChildProps = any> = Partial<
  ReactApollo.MutateProps<UpvotePostMutation, UpvotePostVariables>
> &
  TChildProps;
export type UpvotePostMutationFn = ReactApollo.MutationFn<UpvotePostMutation, UpvotePostVariables>;
export function UpvotePostHOC<TProps, TChildProps = any>(
  operationOptions:
    | ReactApollo.OperationOption<TProps, UpvotePostMutation, UpvotePostVariables, UpvotePostProps<TChildProps>>
    | undefined
) {
  return ReactApollo.graphql<TProps, UpvotePostMutation, UpvotePostVariables, UpvotePostProps<TChildProps>>(
    UpvotePostDocument,
    operationOptions
  );
}
