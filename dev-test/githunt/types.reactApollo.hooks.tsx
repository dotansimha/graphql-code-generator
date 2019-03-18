// tslint:disable
type Maybe<T> = T | null;
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
};

export type Comment = {
  id: Scalars['Int'],
  postedBy: User,
  createdAt: Scalars['Float'],
  content: Scalars['String'],
  repoName: Scalars['String'],
};

export type Entry = {
  repository: Repository,
  postedBy: User,
  createdAt: Scalars['Float'],
  score: Scalars['Int'],
  hotScore: Scalars['Float'],
  comments: Array<Maybe<Comment>>,
  commentCount: Scalars['Int'],
  id: Scalars['Int'],
  vote: Vote,
};


export type EntryCommentsArgs = {
  limit?: Maybe<Scalars['Int']>,
  offset?: Maybe<Scalars['Int']>
};

export enum FeedType {
  Hot = 'HOT',
  New = 'NEW',
  Top = 'TOP'
}

export type Mutation = {
  submitRepository?: Maybe<Entry>,
  vote?: Maybe<Entry>,
  submitComment?: Maybe<Comment>,
};


export type MutationSubmitRepositoryArgs = {
  repoFullName: Scalars['String']
};


export type MutationVoteArgs = {
  repoFullName: Scalars['String'],
  type: VoteType
};


export type MutationSubmitCommentArgs = {
  repoFullName: Scalars['String'],
  commentContent: Scalars['String']
};

export type Query = {
  feed?: Maybe<Array<Maybe<Entry>>>,
  entry?: Maybe<Entry>,
  currentUser?: Maybe<User>,
};


export type QueryFeedArgs = {
  type: FeedType,
  offset?: Maybe<Scalars['Int']>,
  limit?: Maybe<Scalars['Int']>
};


export type QueryEntryArgs = {
  repoFullName: Scalars['String']
};

export type Repository = {
  name: Scalars['String'],
  full_name: Scalars['String'],
  description?: Maybe<Scalars['String']>,
  html_url: Scalars['String'],
  stargazers_count: Scalars['Int'],
  open_issues_count?: Maybe<Scalars['Int']>,
  owner?: Maybe<User>,
};

export type Subscription = {
  commentAdded?: Maybe<Comment>,
};


export type SubscriptionCommentAddedArgs = {
  repoFullName: Scalars['String']
};

export type User = {
  login: Scalars['String'],
  avatar_url: Scalars['String'],
  html_url: Scalars['String'],
};

export type Vote = {
  vote_value: Scalars['Int'],
};

export enum VoteType {
  Up = 'UP',
  Down = 'DOWN',
  Cancel = 'CANCEL'
}
export type OnCommentAddedSubscriptionVariables = {
  repoFullName: Scalars['String']
};


export type OnCommentAddedSubscription = ({ __typename?: 'Subscription' } & { commentAdded: Maybe<({ __typename?: 'Comment' } & Pick<Comment, 'id' | 'createdAt' | 'content'> & { postedBy: ({ __typename?: 'User' } & Pick<User, 'login' | 'html_url'>) })> });

export type CommentQueryVariables = {
  repoFullName: Scalars['String'],
  limit?: Maybe<Scalars['Int']>,
  offset?: Maybe<Scalars['Int']>
};


export type CommentQuery = ({ __typename?: 'Query' } & { currentUser: Maybe<({ __typename?: 'User' } & Pick<User, 'login' | 'html_url'>)>, entry: Maybe<({ __typename?: 'Entry' } & Pick<Entry, 'id' | 'createdAt' | 'commentCount'> & { postedBy: ({ __typename?: 'User' } & Pick<User, 'login' | 'html_url'>), comments: Array<Maybe<({ __typename?: 'Comment' } & CommentsPageCommentFragment)>>, repository: ({ __typename?: 'Repository' } & Pick<Repository, 'full_name' | 'html_url'> & (({ __typename?: 'Repository' } & Pick<Repository, 'description' | 'open_issues_count' | 'stargazers_count'>))) })> });

export type CommentsPageCommentFragment = ({ __typename?: 'Comment' } & Pick<Comment, 'id' | 'createdAt' | 'content'> & { postedBy: ({ __typename?: 'User' } & Pick<User, 'login' | 'html_url'>) });

export type CurrentUserForProfileQueryVariables = {};


export type CurrentUserForProfileQuery = ({ __typename?: 'Query' } & { currentUser: Maybe<({ __typename?: 'User' } & Pick<User, 'login' | 'avatar_url'>)> });

export type FeedEntryFragment = ({ __typename?: 'Entry' } & Pick<Entry, 'id' | 'commentCount'> & { repository: ({ __typename?: 'Repository' } & Pick<Repository, 'full_name' | 'html_url'> & { owner: Maybe<({ __typename?: 'User' } & Pick<User, 'avatar_url'>)> }) } & (VoteButtonsFragment & RepoInfoFragment));

export type FeedQueryVariables = {
  type: FeedType,
  offset?: Maybe<Scalars['Int']>,
  limit?: Maybe<Scalars['Int']>
};


export type FeedQuery = ({ __typename?: 'Query' } & { currentUser: Maybe<({ __typename?: 'User' } & Pick<User, 'login'>)>, feed: Maybe<Array<Maybe<({ __typename?: 'Entry' } & FeedEntryFragment)>>> });

export type SubmitRepositoryMutationVariables = {
  repoFullName: Scalars['String']
};


export type SubmitRepositoryMutation = ({ __typename?: 'Mutation' } & { submitRepository: Maybe<({ __typename?: 'Entry' } & Pick<Entry, 'createdAt'>)> });

export type RepoInfoFragment = ({ __typename?: 'Entry' } & Pick<Entry, 'createdAt'> & { repository: ({ __typename?: 'Repository' } & Pick<Repository, 'description' | 'stargazers_count' | 'open_issues_count'>), postedBy: ({ __typename?: 'User' } & Pick<User, 'html_url' | 'login'>) });

export type SubmitCommentMutationVariables = {
  repoFullName: Scalars['String'],
  commentContent: Scalars['String']
};


export type SubmitCommentMutation = ({ __typename?: 'Mutation' } & { submitComment: Maybe<({ __typename?: 'Comment' } & CommentsPageCommentFragment)> });

export type VoteButtonsFragment = ({ __typename?: 'Entry' } & Pick<Entry, 'score'> & { vote: ({ __typename?: 'Vote' } & Pick<Vote, 'vote_value'>) });

export type VoteMutationVariables = {
  repoFullName: Scalars['String'],
  type: VoteType
};


export type VoteMutation = ({ __typename?: 'Mutation' } & { vote: Maybe<({ __typename?: 'Entry' } & Pick<Entry, 'score' | 'id'> & { vote: ({ __typename?: 'Vote' } & Pick<Vote, 'vote_value'>) })> });

import gql from 'graphql-tag';
import * as React from 'react';
import * as ReactApollo from 'react-apollo';
import * as ReactApolloHooks from 'react-apollo-hooks';
export const CommentsPageCommentFragmentDoc = gql`
    fragment CommentsPageComment on Comment {
  id
  postedBy {
    login
    html_url
  }
  createdAt
  content
}
    `;
export const VoteButtonsFragmentDoc = gql`
    fragment VoteButtons on Entry {
  score
  vote {
    vote_value
  }
}
    `;
export const RepoInfoFragmentDoc = gql`
    fragment RepoInfo on Entry {
  createdAt
  repository {
    description
    stargazers_count
    open_issues_count
  }
  postedBy {
    html_url
    login
  }
}
    `;
export const FeedEntryFragmentDoc = gql`
    fragment FeedEntry on Entry {
  id
  commentCount
  repository {
    full_name
    html_url
    owner {
      avatar_url
    }
  }
  ...VoteButtons
  ...RepoInfo
}
    ${VoteButtonsFragmentDoc}
${RepoInfoFragmentDoc}`;
export const OnCommentAddedDocument = gql`
    subscription onCommentAdded($repoFullName: String!) {
  commentAdded(repoFullName: $repoFullName) {
    id
    postedBy {
      login
      html_url
    }
    createdAt
    content
  }
}
    `;

export class OnCommentAddedComponent extends React.Component<Partial<ReactApollo.SubscriptionProps<OnCommentAddedSubscription, OnCommentAddedSubscriptionVariables>>> {
  render() {
      return (
          <ReactApollo.Subscription<OnCommentAddedSubscription, OnCommentAddedSubscriptionVariables> subscription={OnCommentAddedDocument} {...(this as any)['props'] as any} />
      );
  }
}
export type OnCommentAddedProps<TChildProps = {}> = Partial<ReactApollo.DataProps<OnCommentAddedSubscription, OnCommentAddedSubscriptionVariables>> & TChildProps;
export function withOnCommentAdded<TProps, TChildProps = {}>(operationOptions: ReactApollo.OperationOption<
  TProps, 
  OnCommentAddedSubscription,
  OnCommentAddedSubscriptionVariables,
  OnCommentAddedProps<TChildProps>> | undefined) {
    return ReactApollo.withSubscription<TProps, OnCommentAddedSubscription, OnCommentAddedSubscriptionVariables, OnCommentAddedProps<TChildProps>>(OnCommentAddedDocument, operationOptions);
};

export function useOnCommentAddedSubscription(baseOptions?: ReactApolloHooks.SubscriptionHookOptions<OnCommentAddedSubscription, OnCommentAddedSubscriptionVariables>) {
  return ReactApolloHooks.useSubscription<OnCommentAddedSubscription, OnCommentAddedSubscriptionVariables>(OnCommentAddedDocument, baseOptions);
};
export const CommentDocument = gql`
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
    ${CommentsPageCommentFragmentDoc}`;

export class CommentComponent extends React.Component<Partial<ReactApollo.QueryProps<CommentQuery, CommentQueryVariables>>> {
  render() {
      return (
          <ReactApollo.Query<CommentQuery, CommentQueryVariables> query={CommentDocument} {...(this as any)['props'] as any} />
      );
  }
}
export type CommentProps<TChildProps = {}> = Partial<ReactApollo.DataProps<CommentQuery, CommentQueryVariables>> & TChildProps;
export function withComment<TProps, TChildProps = {}>(operationOptions: ReactApollo.OperationOption<
  TProps, 
  CommentQuery,
  CommentQueryVariables,
  CommentProps<TChildProps>> | undefined) {
    return ReactApollo.withQuery<TProps, CommentQuery, CommentQueryVariables, CommentProps<TChildProps>>(CommentDocument, operationOptions);
};

export function useCommentQuery(baseOptions?: ReactApolloHooks.QueryHookOptions<CommentQueryVariables>) {
  return ReactApolloHooks.useQuery<CommentQuery, CommentQueryVariables>(CommentDocument, baseOptions);
};
export const CurrentUserForProfileDocument = gql`
    query CurrentUserForProfile {
  currentUser {
    login
    avatar_url
  }
}
    `;

export class CurrentUserForProfileComponent extends React.Component<Partial<ReactApollo.QueryProps<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables>>> {
  render() {
      return (
          <ReactApollo.Query<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables> query={CurrentUserForProfileDocument} {...(this as any)['props'] as any} />
      );
  }
}
export type CurrentUserForProfileProps<TChildProps = {}> = Partial<ReactApollo.DataProps<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables>> & TChildProps;
export function withCurrentUserForProfile<TProps, TChildProps = {}>(operationOptions: ReactApollo.OperationOption<
  TProps, 
  CurrentUserForProfileQuery,
  CurrentUserForProfileQueryVariables,
  CurrentUserForProfileProps<TChildProps>> | undefined) {
    return ReactApollo.withQuery<TProps, CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables, CurrentUserForProfileProps<TChildProps>>(CurrentUserForProfileDocument, operationOptions);
};

export function useCurrentUserForProfileQuery(baseOptions?: ReactApolloHooks.QueryHookOptions<CurrentUserForProfileQueryVariables>) {
  return ReactApolloHooks.useQuery<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables>(CurrentUserForProfileDocument, baseOptions);
};
export const FeedDocument = gql`
    query Feed($type: FeedType!, $offset: Int, $limit: Int) {
  currentUser {
    login
  }
  feed(type: $type, offset: $offset, limit: $limit) {
    ...FeedEntry
  }
}
    ${FeedEntryFragmentDoc}`;

export class FeedComponent extends React.Component<Partial<ReactApollo.QueryProps<FeedQuery, FeedQueryVariables>>> {
  render() {
      return (
          <ReactApollo.Query<FeedQuery, FeedQueryVariables> query={FeedDocument} {...(this as any)['props'] as any} />
      );
  }
}
export type FeedProps<TChildProps = {}> = Partial<ReactApollo.DataProps<FeedQuery, FeedQueryVariables>> & TChildProps;
export function withFeed<TProps, TChildProps = {}>(operationOptions: ReactApollo.OperationOption<
  TProps, 
  FeedQuery,
  FeedQueryVariables,
  FeedProps<TChildProps>> | undefined) {
    return ReactApollo.withQuery<TProps, FeedQuery, FeedQueryVariables, FeedProps<TChildProps>>(FeedDocument, operationOptions);
};

export function useFeedQuery(baseOptions?: ReactApolloHooks.QueryHookOptions<FeedQueryVariables>) {
  return ReactApolloHooks.useQuery<FeedQuery, FeedQueryVariables>(FeedDocument, baseOptions);
};
export const SubmitRepositoryDocument = gql`
    mutation submitRepository($repoFullName: String!) {
  submitRepository(repoFullName: $repoFullName) {
    createdAt
  }
}
    `;

export class SubmitRepositoryComponent extends React.Component<Partial<ReactApollo.MutationProps<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>>> {
  render() {
      return (
          <ReactApollo.Mutation<SubmitRepositoryMutation, SubmitRepositoryMutationVariables> mutation={SubmitRepositoryDocument} {...(this as any)['props'] as any} />
      );
  }
}
export type SubmitRepositoryProps<TChildProps = {}> = Partial<ReactApollo.MutateProps<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>> & TChildProps;
export type SubmitRepositoryMutationFn = ReactApollo.MutationFn<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>;
export function withSubmitRepository<TProps, TChildProps = {}>(operationOptions: ReactApollo.OperationOption<
  TProps, 
  SubmitRepositoryMutation,
  SubmitRepositoryMutationVariables,
  SubmitRepositoryProps<TChildProps>> | undefined) {
    return ReactApollo.withMutation<TProps, SubmitRepositoryMutation, SubmitRepositoryMutationVariables, SubmitRepositoryProps<TChildProps>>(SubmitRepositoryDocument, operationOptions);
};

export function useSubmitRepositoryMutation(baseOptions?: ReactApolloHooks.MutationHookOptions<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>) {
  return ReactApolloHooks.useMutation<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>(SubmitRepositoryDocument, baseOptions);
};
export const SubmitCommentDocument = gql`
    mutation submitComment($repoFullName: String!, $commentContent: String!) {
  submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {
    ...CommentsPageComment
  }
}
    ${CommentsPageCommentFragmentDoc}`;

export class SubmitCommentComponent extends React.Component<Partial<ReactApollo.MutationProps<SubmitCommentMutation, SubmitCommentMutationVariables>>> {
  render() {
      return (
          <ReactApollo.Mutation<SubmitCommentMutation, SubmitCommentMutationVariables> mutation={SubmitCommentDocument} {...(this as any)['props'] as any} />
      );
  }
}
export type SubmitCommentProps<TChildProps = {}> = Partial<ReactApollo.MutateProps<SubmitCommentMutation, SubmitCommentMutationVariables>> & TChildProps;
export type SubmitCommentMutationFn = ReactApollo.MutationFn<SubmitCommentMutation, SubmitCommentMutationVariables>;
export function withSubmitComment<TProps, TChildProps = {}>(operationOptions: ReactApollo.OperationOption<
  TProps, 
  SubmitCommentMutation,
  SubmitCommentMutationVariables,
  SubmitCommentProps<TChildProps>> | undefined) {
    return ReactApollo.withMutation<TProps, SubmitCommentMutation, SubmitCommentMutationVariables, SubmitCommentProps<TChildProps>>(SubmitCommentDocument, operationOptions);
};

export function useSubmitCommentMutation(baseOptions?: ReactApolloHooks.MutationHookOptions<SubmitCommentMutation, SubmitCommentMutationVariables>) {
  return ReactApolloHooks.useMutation<SubmitCommentMutation, SubmitCommentMutationVariables>(SubmitCommentDocument, baseOptions);
};
export const VoteDocument = gql`
    mutation vote($repoFullName: String!, $type: VoteType!) {
  vote(repoFullName: $repoFullName, type: $type) {
    score
    id
    vote {
      vote_value
    }
  }
}
    `;

export class VoteComponent extends React.Component<Partial<ReactApollo.MutationProps<VoteMutation, VoteMutationVariables>>> {
  render() {
      return (
          <ReactApollo.Mutation<VoteMutation, VoteMutationVariables> mutation={VoteDocument} {...(this as any)['props'] as any} />
      );
  }
}
export type VoteProps<TChildProps = {}> = Partial<ReactApollo.MutateProps<VoteMutation, VoteMutationVariables>> & TChildProps;
export type VoteMutationFn = ReactApollo.MutationFn<VoteMutation, VoteMutationVariables>;
export function withVote<TProps, TChildProps = {}>(operationOptions: ReactApollo.OperationOption<
  TProps, 
  VoteMutation,
  VoteMutationVariables,
  VoteProps<TChildProps>> | undefined) {
    return ReactApollo.withMutation<TProps, VoteMutation, VoteMutationVariables, VoteProps<TChildProps>>(VoteDocument, operationOptions);
};

export function useVoteMutation(baseOptions?: ReactApolloHooks.MutationHookOptions<VoteMutation, VoteMutationVariables>) {
  return ReactApolloHooks.useMutation<VoteMutation, VoteMutationVariables>(VoteDocument, baseOptions);
};