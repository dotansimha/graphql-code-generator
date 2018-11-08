/* tslint:disable */

// ====================================================
// START: Typescript template
// ====================================================

// ====================================================
// Types
// ====================================================

export interface Query {
  /** A feed of repository submissions */
  feed?: Entry[] | null;
  /** A single entry */
  entry?: Entry | null;
  /** Return the currently logged in user, or null if nobody is logged in */
  currentUser?: User | null;
}
/** Information about a GitHub repository submitted to GitHunt */
export interface Entry {
  /** Information about the repository from GitHub */
  repository: Repository;
  /** The GitHub user who submitted this entry */
  postedBy: User;
  /** A timestamp of when the entry was submitted */
  createdAt: number;
  /** The score of this repository, upvotes - downvotes */
  score: number;
  /** The hot score of this repository */
  hotScore: number;
  /** Comments posted about this repository */
  comments: Comment[];
  /** The number of comments posted about this repository */
  commentCount: number;
  /** The SQL ID of this entry */
  id: number;
  /** XXX to be changed */
  vote: Vote;
}
/** A repository object from the GitHub API. This uses the exact field names returned by theGitHub API for simplicity, even though the convention for GraphQL is usually to camel case. */
export interface Repository {
  /** Just the name of the repository, e.g. GitHunt-API */
  name: string;
  /** The full name of the repository with the username, e.g. apollostack/GitHunt-API */
  full_name: string;
  /** The description of the repository */
  description?: string | null;
  /** The link to the repository on GitHub */
  html_url: string;
  /** The number of people who have starred this repository on GitHub */
  stargazers_count: number;
  /** The number of open issues on this repository on GitHub */
  open_issues_count?: number | null;
  /** The owner of this repository on GitHub, e.g. apollostack */
  owner?: User | null;
}
/** A user object from the GitHub API. This uses the exact field names returned from the GitHub API. */
export interface User {
  /** The name of the user, e.g. apollostack */
  login: string;
  /** The URL to a directly embeddable image for this user's avatar */
  avatar_url: string;
  /** The URL of this user's GitHub page */
  html_url: string;
}
/** A comment about an entry, submitted by a user */
export interface Comment {
  /** The SQL ID of this entry */
  id: number;
  /** The GitHub user who posted the comment */
  postedBy: User;
  /** A timestamp of when the comment was posted */
  createdAt: number;
  /** The text of the comment */
  content: string;
  /** The repository which this comment is about */
  repoName: string;
}
/** XXX to be removed */
export interface Vote {
  vote_value: number;
}

export interface Mutation {
  /** Submit a new repository, returns the new submission */
  submitRepository?: Entry | null;
  /** Vote on a repository submission, returns the submission that was voted on */
  vote?: Entry | null;
  /** Comment on a repository, returns the new comment */
  submitComment?: Comment | null;
}

export interface Subscription {
  /** Subscription fires on every comment added */
  commentAdded?: Comment | null;
}

// ====================================================
// Arguments
// ====================================================

export interface FeedQueryArgs {
  /** The sort order for the feed */
  type: FeedType;
  /** The number of items to skip, for pagination */
  offset?: number | null;
  /** The number of items to fetch starting from the offset, for pagination */
  limit?: number | null;
}
export interface EntryQueryArgs {
  /** The full repository name from GitHub, e.g. "apollostack/GitHunt-API" */
  repoFullName: string;
}
export interface CommentsEntryArgs {
  limit?: number | null;

  offset?: number | null;
}
export interface SubmitRepositoryMutationArgs {
  /** The full repository name from GitHub, e.g. "apollostack/GitHunt-API" */
  repoFullName: string;
}
export interface VoteMutationArgs {
  /** The full repository name from GitHub, e.g. "apollostack/GitHunt-API" */
  repoFullName: string;
  /** The type of vote - UP, DOWN, or CANCEL */
  type: VoteType;
}
export interface SubmitCommentMutationArgs {
  /** The full repository name from GitHub, e.g. "apollostack/GitHunt-API" */
  repoFullName: string;
  /** The text content for the new comment */
  commentContent: string;
}
export interface CommentAddedSubscriptionArgs {
  repoFullName: string;
}

// ====================================================
// Enums
// ====================================================

/** A list of options for the sort order of the feed */
export enum FeedType {
  HOT = 'HOT',
  NEW = 'NEW',
  TOP = 'TOP'
}
/** The type of vote to record, when submitting a vote */
export enum VoteType {
  UP = 'UP',
  DOWN = 'DOWN',
  CANCEL = 'CANCEL'
}

// ====================================================
// END: Typescript template
// ====================================================

// ====================================================
// Documents
// ====================================================

export type OnCommentAddedVariables = {
  repoFullName: string;
};

export type OnCommentAddedSubscription = {
  __typename?: 'Subscription';

  commentAdded?: OnCommentAddedCommentAdded | null;
};

export type OnCommentAddedCommentAdded = {
  __typename?: 'Comment';

  id: number;

  postedBy: OnCommentAddedPostedBy;

  createdAt: number;

  content: string;
};

export type OnCommentAddedPostedBy = {
  __typename?: 'User';

  login: string;

  html_url: string;
};

export type CommentVariables = {
  repoFullName: string;
  limit?: number | null;
  offset?: number | null;
};

export type CommentQuery = {
  __typename?: 'Query';

  currentUser?: CommentCurrentUser | null;

  entry?: CommentEntry | null;
};

export type CommentCurrentUser = {
  __typename?: 'User';

  login: string;

  html_url: string;
};

export type CommentEntry = {
  __typename?: 'Entry';

  id: number;

  postedBy: CommentPostedBy;

  createdAt: number;

  comments: CommentComments[];

  commentCount: number;

  repository: CommentRepository;
};

export type CommentPostedBy = {
  __typename?: 'User';

  login: string;

  html_url: string;
};

export type CommentComments = CommentsPageCommentFragment;

export type CommentRepository = {
  __typename?: CommentRepositoryInlineFragment['__typename'];

  full_name: string;

  html_url: string;
} & (CommentRepositoryInlineFragment);

export type CommentRepositoryInlineFragment = {
  __typename?: 'Repository';

  description?: string | null;

  open_issues_count?: number | null;

  stargazers_count: number;
};

export type CurrentUserForProfileVariables = {};

export type CurrentUserForProfileQuery = {
  __typename?: 'Query';

  currentUser?: CurrentUserForProfileCurrentUser | null;
};

export type CurrentUserForProfileCurrentUser = {
  __typename?: 'User';

  login: string;

  avatar_url: string;
};

export type GetFeedVariables = {
  type: FeedType;
  offset?: number | null;
  limit?: number | null;
};

export type GetFeedQuery = {
  __typename?: 'Query';

  currentUser?: GetFeedCurrentUser | null;

  feed?: GetFeedFeed[] | null;
};

export type GetFeedCurrentUser = {
  __typename?: 'User';

  login: string;
};

export type GetFeedFeed = FeedEntryFragment;

export type SubmitRepositoryVariables = {
  repoFullName: string;
};

export type SubmitRepositoryMutation = {
  __typename?: 'Mutation';

  submitRepository?: SubmitRepositorySubmitRepository | null;
};

export type SubmitRepositorySubmitRepository = {
  __typename?: 'Entry';

  createdAt: number;
};

export type SubmitCommentVariables = {
  repoFullName: string;
  commentContent: string;
};

export type SubmitCommentMutation = {
  __typename?: 'Mutation';

  submitComment?: SubmitCommentSubmitComment | null;
};

export type SubmitCommentSubmitComment = CommentsPageCommentFragment;

export type VoteVariables = {
  repoFullName: string;
  type: VoteType;
};

export type VoteMutation = {
  __typename?: 'Mutation';

  vote?: VoteVote | null;
};

export type VoteVote = {
  __typename?: 'Entry';

  score: number;

  id: number;

  vote: Vote_Vote;
};

export type Vote_Vote = {
  __typename?: 'Vote';

  vote_value: number;
};

export type CommentsPageCommentFragment = {
  __typename?: 'Comment';

  id: number;

  postedBy: CommentsPageCommentPostedBy;

  createdAt: number;

  content: string;
};

export type CommentsPageCommentPostedBy = {
  __typename?: 'User';

  login: string;

  html_url: string;
};

export type FeedEntryFragment =
  | {
      __typename?: 'Entry';

      id: number;

      commentCount: number;

      repository: FeedEntryRepository;
    } & VoteButtonsFragment
  | RepoInfoFragment;

export type FeedEntryRepository = {
  __typename?: 'Repository';

  full_name: string;

  html_url: string;

  owner?: FeedEntryOwner | null;
};

export type FeedEntryOwner = {
  __typename?: 'User';

  avatar_url: string;
};

export type RepoInfoFragment = {
  __typename?: 'Entry';

  createdAt: number;

  repository: RepoInfoRepository;

  postedBy: RepoInfoPostedBy;
};

export type RepoInfoRepository = {
  __typename?: 'Repository';

  description?: string | null;

  stargazers_count: number;

  open_issues_count?: number | null;
};

export type RepoInfoPostedBy = {
  __typename?: 'User';

  html_url: string;

  login: string;
};

export type VoteButtonsFragment = {
  __typename?: 'Entry';

  score: number;

  vote: VoteButtonsVote;
};

export type VoteButtonsVote = {
  __typename?: 'Vote';

  vote_value: number;
};

import * as ReactApollo from 'react-apollo';
import * as React from 'react';

import gql from 'graphql-tag';

// ====================================================
// Fragments
// ====================================================

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
  ${RepoInfoFragmentDoc}
`;

// ====================================================
// Components
// ====================================================

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
export class OnCommentAddedComponent extends React.Component<
  Partial<ReactApollo.SubscriptionProps<OnCommentAddedSubscription, OnCommentAddedVariables>>
> {
  render() {
    return (
      <ReactApollo.Subscription<OnCommentAddedSubscription, OnCommentAddedVariables>
        subscription={OnCommentAddedDocument}
        {...(this as any)['props'] as any}
      />
    );
  }
}
export type OnCommentAddedProps<TChildProps = any> = Partial<
  ReactApollo.DataProps<OnCommentAddedSubscription, OnCommentAddedVariables>
> &
  TChildProps;
export function OnCommentAddedHOC<TProps, TChildProps = any>(
  operationOptions:
    | ReactApollo.OperationOption<
        TProps,
        OnCommentAddedSubscription,
        OnCommentAddedVariables,
        OnCommentAddedProps<TChildProps>
      >
    | undefined
) {
  return ReactApollo.graphql<
    TProps,
    OnCommentAddedSubscription,
    OnCommentAddedVariables,
    OnCommentAddedProps<TChildProps>
  >(OnCommentAddedDocument, operationOptions);
}
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

  ${CommentsPageCommentFragmentDoc}
`;
export class CommentComponent extends React.Component<Partial<ReactApollo.QueryProps<CommentQuery, CommentVariables>>> {
  render() {
    return (
      <ReactApollo.Query<CommentQuery, CommentVariables> query={CommentDocument} {...(this as any)['props'] as any} />
    );
  }
}
export type CommentProps<TChildProps = any> = Partial<ReactApollo.DataProps<CommentQuery, CommentVariables>> &
  TChildProps;
export function CommentHOC<TProps, TChildProps = any>(
  operationOptions:
    | ReactApollo.OperationOption<TProps, CommentQuery, CommentVariables, CommentProps<TChildProps>>
    | undefined
) {
  return ReactApollo.graphql<TProps, CommentQuery, CommentVariables, CommentProps<TChildProps>>(
    CommentDocument,
    operationOptions
  );
}
export const CurrentUserForProfileDocument = gql`
  query CurrentUserForProfile {
    currentUser {
      login
      avatar_url
    }
  }
`;
export class CurrentUserForProfileComponent extends React.Component<
  Partial<ReactApollo.QueryProps<CurrentUserForProfileQuery, CurrentUserForProfileVariables>>
> {
  render() {
    return (
      <ReactApollo.Query<CurrentUserForProfileQuery, CurrentUserForProfileVariables>
        query={CurrentUserForProfileDocument}
        {...(this as any)['props'] as any}
      />
    );
  }
}
export type CurrentUserForProfileProps<TChildProps = any> = Partial<
  ReactApollo.DataProps<CurrentUserForProfileQuery, CurrentUserForProfileVariables>
> &
  TChildProps;
export function CurrentUserForProfileHOC<TProps, TChildProps = any>(
  operationOptions:
    | ReactApollo.OperationOption<
        TProps,
        CurrentUserForProfileQuery,
        CurrentUserForProfileVariables,
        CurrentUserForProfileProps<TChildProps>
      >
    | undefined
) {
  return ReactApollo.graphql<
    TProps,
    CurrentUserForProfileQuery,
    CurrentUserForProfileVariables,
    CurrentUserForProfileProps<TChildProps>
  >(CurrentUserForProfileDocument, operationOptions);
}
export const GetFeedDocument = gql`
  query GetFeed($type: FeedType!, $offset: Int, $limit: Int) {
    currentUser {
      login
    }
    feed(type: $type, offset: $offset, limit: $limit) {
      ...FeedEntry
    }
  }

  ${FeedEntryFragmentDoc}
`;
export class GetFeedComponent extends React.Component<Partial<ReactApollo.QueryProps<GetFeedQuery, GetFeedVariables>>> {
  render() {
    return (
      <ReactApollo.Query<GetFeedQuery, GetFeedVariables> query={GetFeedDocument} {...(this as any)['props'] as any} />
    );
  }
}
export type GetFeedProps<TChildProps = any> = Partial<ReactApollo.DataProps<GetFeedQuery, GetFeedVariables>> &
  TChildProps;
export function GetFeedHOC<TProps, TChildProps = any>(
  operationOptions:
    | ReactApollo.OperationOption<TProps, GetFeedQuery, GetFeedVariables, GetFeedProps<TChildProps>>
    | undefined
) {
  return ReactApollo.graphql<TProps, GetFeedQuery, GetFeedVariables, GetFeedProps<TChildProps>>(
    GetFeedDocument,
    operationOptions
  );
}
export const SubmitRepositoryDocument = gql`
  mutation submitRepository($repoFullName: String!) {
    submitRepository(repoFullName: $repoFullName) {
      createdAt
    }
  }
`;
export class SubmitRepositoryComponent extends React.Component<
  Partial<ReactApollo.MutationProps<SubmitRepositoryMutation, SubmitRepositoryVariables>>
> {
  render() {
    return (
      <ReactApollo.Mutation<SubmitRepositoryMutation, SubmitRepositoryVariables>
        mutation={SubmitRepositoryDocument}
        {...(this as any)['props'] as any}
      />
    );
  }
}
export type SubmitRepositoryProps<TChildProps = any> = Partial<
  ReactApollo.MutateProps<SubmitRepositoryMutation, SubmitRepositoryVariables>
> &
  TChildProps;
export type SubmitRepositoryMutationFn = ReactApollo.MutationFn<SubmitRepositoryMutation, SubmitRepositoryVariables>;
export function SubmitRepositoryHOC<TProps, TChildProps = any>(
  operationOptions:
    | ReactApollo.OperationOption<
        TProps,
        SubmitRepositoryMutation,
        SubmitRepositoryVariables,
        SubmitRepositoryProps<TChildProps>
      >
    | undefined
) {
  return ReactApollo.graphql<
    TProps,
    SubmitRepositoryMutation,
    SubmitRepositoryVariables,
    SubmitRepositoryProps<TChildProps>
  >(SubmitRepositoryDocument, operationOptions);
}
export const SubmitCommentDocument = gql`
  mutation submitComment($repoFullName: String!, $commentContent: String!) {
    submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {
      ...CommentsPageComment
    }
  }

  ${CommentsPageCommentFragmentDoc}
`;
export class SubmitCommentComponent extends React.Component<
  Partial<ReactApollo.MutationProps<SubmitCommentMutation, SubmitCommentVariables>>
> {
  render() {
    return (
      <ReactApollo.Mutation<SubmitCommentMutation, SubmitCommentVariables>
        mutation={SubmitCommentDocument}
        {...(this as any)['props'] as any}
      />
    );
  }
}
export type SubmitCommentProps<TChildProps = any> = Partial<
  ReactApollo.MutateProps<SubmitCommentMutation, SubmitCommentVariables>
> &
  TChildProps;
export type SubmitCommentMutationFn = ReactApollo.MutationFn<SubmitCommentMutation, SubmitCommentVariables>;
export function SubmitCommentHOC<TProps, TChildProps = any>(
  operationOptions:
    | ReactApollo.OperationOption<
        TProps,
        SubmitCommentMutation,
        SubmitCommentVariables,
        SubmitCommentProps<TChildProps>
      >
    | undefined
) {
  return ReactApollo.graphql<TProps, SubmitCommentMutation, SubmitCommentVariables, SubmitCommentProps<TChildProps>>(
    SubmitCommentDocument,
    operationOptions
  );
}
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
export class VoteComponent extends React.Component<Partial<ReactApollo.MutationProps<VoteMutation, VoteVariables>>> {
  render() {
    return (
      <ReactApollo.Mutation<VoteMutation, VoteVariables> mutation={VoteDocument} {...(this as any)['props'] as any} />
    );
  }
}
export type VoteProps<TChildProps = any> = Partial<ReactApollo.MutateProps<VoteMutation, VoteVariables>> & TChildProps;
export type VoteMutationFn = ReactApollo.MutationFn<VoteMutation, VoteVariables>;
export function VoteHOC<TProps, TChildProps = any>(
  operationOptions: ReactApollo.OperationOption<TProps, VoteMutation, VoteVariables, VoteProps<TChildProps>> | undefined
) {
  return ReactApollo.graphql<TProps, VoteMutation, VoteVariables, VoteProps<TChildProps>>(
    VoteDocument,
    operationOptions
  );
}
