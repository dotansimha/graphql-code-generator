import { api } from '../../packages/plugins/typescript/rtk-query/tests/baseApi';
module.hot?.accept();
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

/** A comment about an entry, submitted by a user */
export type Comment = {
  __typename?: 'Comment';
  /** The text of the comment */
  content: Scalars['String'];
  /** A timestamp of when the comment was posted */
  createdAt: Scalars['Float'];
  /** The SQL ID of this entry */
  id: Scalars['Int'];
  /** The GitHub user who posted the comment */
  postedBy: User;
  /** The repository which this comment is about */
  repoName: Scalars['String'];
};

/** Information about a GitHub repository submitted to GitHunt */
export type Entry = {
  __typename?: 'Entry';
  /** The number of comments posted about this repository */
  commentCount: Scalars['Int'];
  /** Comments posted about this repository */
  comments: Array<Maybe<Comment>>;
  /** A timestamp of when the entry was submitted */
  createdAt: Scalars['Float'];
  /** The hot score of this repository */
  hotScore: Scalars['Float'];
  /** The SQL ID of this entry */
  id: Scalars['Int'];
  /** The GitHub user who submitted this entry */
  postedBy: User;
  /** Information about the repository from GitHub */
  repository: Repository;
  /** The score of this repository, upvotes - downvotes */
  score: Scalars['Int'];
  /** XXX to be changed */
  vote: Vote;
};

/** Information about a GitHub repository submitted to GitHunt */
export type EntryCommentsArgs = {
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};

/** A list of options for the sort order of the feed */
export enum FeedType {
  /** Sort by a combination of freshness and score, using Reddit's algorithm */
  Hot = 'HOT',
  /** Newest entries first */
  New = 'NEW',
  /** Highest score entries first */
  Top = 'TOP',
}

export type Mutation = {
  __typename?: 'Mutation';
  /** Comment on a repository, returns the new comment */
  submitComment?: Maybe<Comment>;
  /** Submit a new repository, returns the new submission */
  submitRepository?: Maybe<Entry>;
  /** Vote on a repository submission, returns the submission that was voted on */
  vote?: Maybe<Entry>;
};

export type MutationSubmitCommentArgs = {
  commentContent: Scalars['String'];
  repoFullName: Scalars['String'];
};

export type MutationSubmitRepositoryArgs = {
  repoFullName: Scalars['String'];
};

export type MutationVoteArgs = {
  repoFullName: Scalars['String'];
  type: VoteType;
};

export type Query = {
  __typename?: 'Query';
  /** Return the currently logged in user, or null if nobody is logged in */
  currentUser?: Maybe<User>;
  /** A single entry */
  entry?: Maybe<Entry>;
  /** A feed of repository submissions */
  feed?: Maybe<Array<Maybe<Entry>>>;
};

export type QueryEntryArgs = {
  repoFullName: Scalars['String'];
};

export type QueryFeedArgs = {
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  type: FeedType;
};

/**
 * A repository object from the GitHub API. This uses the exact field names returned by the
 * GitHub API for simplicity, even though the convention for GraphQL is usually to camel case.
 */
export type Repository = {
  __typename?: 'Repository';
  /** The description of the repository */
  description?: Maybe<Scalars['String']>;
  /** The full name of the repository with the username, e.g. apollostack/GitHunt-API */
  full_name: Scalars['String'];
  /** The link to the repository on GitHub */
  html_url: Scalars['String'];
  /** Just the name of the repository, e.g. GitHunt-API */
  name: Scalars['String'];
  /** The number of open issues on this repository on GitHub */
  open_issues_count?: Maybe<Scalars['Int']>;
  /** The owner of this repository on GitHub, e.g. apollostack */
  owner?: Maybe<User>;
  /** The number of people who have starred this repository on GitHub */
  stargazers_count: Scalars['Int'];
};

export type Subscription = {
  __typename?: 'Subscription';
  /** Subscription fires on every comment added */
  commentAdded?: Maybe<Comment>;
};

export type SubscriptionCommentAddedArgs = {
  repoFullName: Scalars['String'];
};

/** A user object from the GitHub API. This uses the exact field names returned from the GitHub API. */
export type User = {
  __typename?: 'User';
  /** The URL to a directly embeddable image for this user's avatar */
  avatar_url: Scalars['String'];
  /** The URL of this user's GitHub page */
  html_url: Scalars['String'];
  /** The name of the user, e.g. apollostack */
  login: Scalars['String'];
};

/** XXX to be removed */
export type Vote = {
  __typename?: 'Vote';
  vote_value: Scalars['Int'];
};

/** The type of vote to record, when submitting a vote */
export enum VoteType {
  Cancel = 'CANCEL',
  Down = 'DOWN',
  Up = 'UP',
}

export type OnCommentAddedSubscriptionVariables = Exact<{
  repoFullName: Scalars['String'];
}>;

export type OnCommentAddedSubscription = {
  __typename?: 'Subscription';
  commentAdded?: Maybe<{
    __typename?: 'Comment';
    id: number;
    createdAt: number;
    content: string;
    postedBy: { __typename?: 'User'; login: string; html_url: string };
  }>;
};

export type CommentQueryVariables = Exact<{
  repoFullName: Scalars['String'];
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
}>;

export type CommentQuery = {
  __typename?: 'Query';
  currentUser?: Maybe<{ __typename?: 'User'; login: string; html_url: string }>;
  entry?: Maybe<{
    __typename?: 'Entry';
    id: number;
    createdAt: number;
    commentCount: number;
    postedBy: { __typename?: 'User'; login: string; html_url: string };
    comments: Array<
      Maybe<{
        __typename?: 'Comment';
        id: number;
        createdAt: number;
        content: string;
        postedBy: { __typename?: 'User'; login: string; html_url: string };
      }>
    >;
    repository: {
      __typename?: 'Repository';
      description?: Maybe<string>;
      open_issues_count?: Maybe<number>;
      stargazers_count: number;
      full_name: string;
      html_url: string;
    };
  }>;
};

export type CommentsPageCommentFragment = {
  __typename?: 'Comment';
  id: number;
  createdAt: number;
  content: string;
  postedBy: { __typename?: 'User'; login: string; html_url: string };
};

export type CurrentUserForProfileQueryVariables = Exact<{ [key: string]: never }>;

export type CurrentUserForProfileQuery = {
  __typename?: 'Query';
  currentUser?: Maybe<{ __typename?: 'User'; login: string; avatar_url: string }>;
};

export type FeedEntryFragment = {
  __typename?: 'Entry';
  id: number;
  commentCount: number;
  score: number;
  createdAt: number;
  repository: {
    __typename?: 'Repository';
    full_name: string;
    html_url: string;
    description?: Maybe<string>;
    stargazers_count: number;
    open_issues_count?: Maybe<number>;
    owner?: Maybe<{ __typename?: 'User'; avatar_url: string }>;
  };
  vote: { __typename?: 'Vote'; vote_value: number };
  postedBy: { __typename?: 'User'; html_url: string; login: string };
};

export type FeedQueryVariables = Exact<{
  type: FeedType;
  offset?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
}>;

export type FeedQuery = {
  __typename?: 'Query';
  currentUser?: Maybe<{ __typename?: 'User'; login: string }>;
  feed?: Maybe<
    Array<
      Maybe<{
        __typename?: 'Entry';
        id: number;
        commentCount: number;
        score: number;
        createdAt: number;
        repository: {
          __typename?: 'Repository';
          full_name: string;
          html_url: string;
          description?: Maybe<string>;
          stargazers_count: number;
          open_issues_count?: Maybe<number>;
          owner?: Maybe<{ __typename?: 'User'; avatar_url: string }>;
        };
        vote: { __typename?: 'Vote'; vote_value: number };
        postedBy: { __typename?: 'User'; html_url: string; login: string };
      }>
    >
  >;
};

export type SubmitRepositoryMutationVariables = Exact<{
  repoFullName: Scalars['String'];
}>;

export type SubmitRepositoryMutation = {
  __typename?: 'Mutation';
  submitRepository?: Maybe<{ __typename?: 'Entry'; createdAt: number }>;
};

export type RepoInfoFragment = {
  __typename?: 'Entry';
  createdAt: number;
  repository: {
    __typename?: 'Repository';
    description?: Maybe<string>;
    stargazers_count: number;
    open_issues_count?: Maybe<number>;
  };
  postedBy: { __typename?: 'User'; html_url: string; login: string };
};

export type SubmitCommentMutationVariables = Exact<{
  repoFullName: Scalars['String'];
  commentContent: Scalars['String'];
}>;

export type SubmitCommentMutation = {
  __typename?: 'Mutation';
  submitComment?: Maybe<{
    __typename?: 'Comment';
    id: number;
    createdAt: number;
    content: string;
    postedBy: { __typename?: 'User'; login: string; html_url: string };
  }>;
};

export type VoteButtonsFragment = {
  __typename?: 'Entry';
  score: number;
  vote: { __typename?: 'Vote'; vote_value: number };
};

export type VoteMutationVariables = Exact<{
  repoFullName: Scalars['String'];
  type: VoteType;
}>;

export type VoteMutation = {
  __typename?: 'Mutation';
  vote?: Maybe<{ __typename?: 'Entry'; score: number; id: number; vote: { __typename?: 'Vote'; vote_value: number } }>;
};

export const CommentsPageCommentFragmentDoc = `
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
export const VoteButtonsFragmentDoc = `
    fragment VoteButtons on Entry {
  score
  vote {
    vote_value
  }
}
    `;
export const RepoInfoFragmentDoc = `
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
export const FeedEntryFragmentDoc = `
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
export const OnCommentAddedDocument = `
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
export const CommentDocument = `
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
export const CurrentUserForProfileDocument = `
    query CurrentUserForProfile {
  currentUser {
    login
    avatar_url
  }
}
    `;
export const FeedDocument = `
    query Feed($type: FeedType!, $offset: Int, $limit: Int) {
  currentUser {
    login
  }
  feed(type: $type, offset: $offset, limit: $limit) {
    ...FeedEntry
  }
}
    ${FeedEntryFragmentDoc}`;
export const SubmitRepositoryDocument = `
    mutation submitRepository($repoFullName: String!) {
  submitRepository(repoFullName: $repoFullName) {
    createdAt
  }
}
    `;
export const SubmitCommentDocument = `
    mutation submitComment($repoFullName: String!, $commentContent: String!) {
  submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {
    ...CommentsPageComment
  }
}
    ${CommentsPageCommentFragmentDoc}`;
export const VoteDocument = `
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

const injectedRtkApi = api.injectEndpoints({
  overrideExisting: module.hot?.status() === 'apply',
  endpoints: build => ({
    Comment: build.query<CommentQuery, CommentQueryVariables>({
      query: variables => ({ document: CommentDocument, variables }),
    }),
    CurrentUserForProfile: build.query<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables | void>({
      query: variables => ({ document: CurrentUserForProfileDocument, variables }),
    }),
    Feed: build.query<FeedQuery, FeedQueryVariables>({
      query: variables => ({ document: FeedDocument, variables }),
    }),
    submitRepository: build.mutation<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>({
      query: variables => ({ document: SubmitRepositoryDocument, variables }),
    }),
    submitComment: build.mutation<SubmitCommentMutation, SubmitCommentMutationVariables>({
      query: variables => ({ document: SubmitCommentDocument, variables }),
    }),
    vote: build.mutation<VoteMutation, VoteMutationVariables>({
      query: variables => ({ document: VoteDocument, variables }),
    }),
  }),
});

export { injectedRtkApi as api };
export const {
  useCommentQuery,
  useLazyCommentQuery,
  useCurrentUserForProfileQuery,
  useLazyCurrentUserForProfileQuery,
  useFeedQuery,
  useLazyFeedQuery,
  useSubmitRepositoryMutation,
  useSubmitCommentMutation,
  useVoteMutation,
} = injectedRtkApi;
