import gql from 'graphql-tag';
import {
  createMutationFunction,
  createSmartQueryOptionsFunction,
  createSmartSubscriptionOptionsFunction,
} from 'vue-apollo-smart-ops';
import { ApolloError } from 'apollo-client';
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
  /** The SQL ID of this entry */
  id: Scalars['Int'];
  /** The GitHub user who posted the comment */
  postedBy: User;
  /** A timestamp of when the comment was posted */
  createdAt: Scalars['Float'];
  /** The text of the comment */
  content: Scalars['String'];
  /** The repository which this comment is about */
  repoName: Scalars['String'];
};

/** Information about a GitHub repository submitted to GitHunt */
export type Entry = {
  __typename?: 'Entry';
  /** Information about the repository from GitHub */
  repository: Repository;
  /** The GitHub user who submitted this entry */
  postedBy: User;
  /** A timestamp of when the entry was submitted */
  createdAt: Scalars['Float'];
  /** The score of this repository, upvotes - downvotes */
  score: Scalars['Int'];
  /** The hot score of this repository */
  hotScore: Scalars['Float'];
  /** Comments posted about this repository */
  comments: Array<Maybe<Comment>>;
  /** The number of comments posted about this repository */
  commentCount: Scalars['Int'];
  /** The SQL ID of this entry */
  id: Scalars['Int'];
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
  /** Submit a new repository, returns the new submission */
  submitRepository?: Maybe<Entry>;
  /** Vote on a repository submission, returns the submission that was voted on */
  vote?: Maybe<Entry>;
  /** Comment on a repository, returns the new comment */
  submitComment?: Maybe<Comment>;
};

export type MutationSubmitRepositoryArgs = {
  repoFullName: Scalars['String'];
};

export type MutationVoteArgs = {
  repoFullName: Scalars['String'];
  type: VoteType;
};

export type MutationSubmitCommentArgs = {
  repoFullName: Scalars['String'];
  commentContent: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  /** A feed of repository submissions */
  feed?: Maybe<Array<Maybe<Entry>>>;
  /** A single entry */
  entry?: Maybe<Entry>;
  /** Return the currently logged in user, or null if nobody is logged in */
  currentUser?: Maybe<User>;
};

export type QueryFeedArgs = {
  type: FeedType;
  offset?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
};

export type QueryEntryArgs = {
  repoFullName: Scalars['String'];
};

/**
 * A repository object from the GitHub API. This uses the exact field names returned by the
 * GitHub API for simplicity, even though the convention for GraphQL is usually to camel case.
 */
export type Repository = {
  __typename?: 'Repository';
  /** Just the name of the repository, e.g. GitHunt-API */
  name: Scalars['String'];
  /** The full name of the repository with the username, e.g. apollostack/GitHunt-API */
  full_name: Scalars['String'];
  /** The description of the repository */
  description?: Maybe<Scalars['String']>;
  /** The link to the repository on GitHub */
  html_url: Scalars['String'];
  /** The number of people who have starred this repository on GitHub */
  stargazers_count: Scalars['Int'];
  /** The number of open issues on this repository on GitHub */
  open_issues_count?: Maybe<Scalars['Int']>;
  /** The owner of this repository on GitHub, e.g. apollostack */
  owner?: Maybe<User>;
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
  /** The name of the user, e.g. apollostack */
  login: Scalars['String'];
  /** The URL to a directly embeddable image for this user's avatar */
  avatar_url: Scalars['String'];
  /** The URL of this user's GitHub page */
  html_url: Scalars['String'];
};

/** XXX to be removed */
export type Vote = {
  __typename?: 'Vote';
  vote_value: Scalars['Int'];
};

/** The type of vote to record, when submitting a vote */
export enum VoteType {
  Up = 'UP',
  Down = 'DOWN',
  Cancel = 'CANCEL',
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

/**
 * __useOnCommentAddedSubscription__
 *
 * To use a Smart Subscription within a Vue component, call `useOnCommentAddedSubscription` as the value for a `$subscribe` key
 * in the component's `apollo` config, passing any options required for the subscription.
 *
 * @param options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/core/ApolloClient/#ApolloClient.subscribe
 *
 * @example
 * {
 *   apollo: {
 *     $subscribe: {
 *       onCommentAdded: useOnCommentAddedSubscription({
 *         variables: {
 *           repoFullName: // value for 'repoFullName'
 *         },
 *         loadingKey: 'loading',
 *         fetchPolicy: 'no-cache',
 *       }),
 *     },
 *   }
 * }
 */
export const useOnCommentAddedSubscription = createSmartSubscriptionOptionsFunction<
  OnCommentAddedSubscription,
  OnCommentAddedSubscriptionVariables,
  ApolloError
>(OnCommentAddedDocument);

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

/**
 * __useCommentQuery__
 *
 * To use a Smart Query within a Vue component, call `useCommentQuery` as the value for a query key
 * in the component's `apollo` config, passing any options required for the query.
 *
 * @param options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/core/ApolloClient/#ApolloClient.query
 *
 * @example
 * {
 *   apollo: {
 *     comment: useCommentQuery({
 *       variables: {
 *         repoFullName: // value for 'repoFullName'
 *         limit: // value for 'limit'
 *         offset: // value for 'offset'
 *       },
 *       loadingKey: 'loading',
 *       fetchPolicy: 'no-cache',
 *     }),
 *   }
 * }
 */
export const useCommentQuery = createSmartQueryOptionsFunction<CommentQuery, CommentQueryVariables, ApolloError>(
  CommentDocument
);

export const CurrentUserForProfileDocument = gql`
  query CurrentUserForProfile {
    currentUser {
      login
      avatar_url
    }
  }
`;

/**
 * __useCurrentUserForProfileQuery__
 *
 * To use a Smart Query within a Vue component, call `useCurrentUserForProfileQuery` as the value for a query key
 * in the component's `apollo` config, passing any options required for the query.
 *
 * @param options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/core/ApolloClient/#ApolloClient.query
 *
 * @example
 * {
 *   apollo: {
 *     currentUserForProfile: useCurrentUserForProfileQuery({
 *       variables: {},
 *       loadingKey: 'loading',
 *       fetchPolicy: 'no-cache',
 *     }),
 *   }
 * }
 */
export const useCurrentUserForProfileQuery = createSmartQueryOptionsFunction<
  CurrentUserForProfileQuery,
  CurrentUserForProfileQueryVariables,
  ApolloError
>(CurrentUserForProfileDocument);

export const FeedDocument = gql`
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

/**
 * __useFeedQuery__
 *
 * To use a Smart Query within a Vue component, call `useFeedQuery` as the value for a query key
 * in the component's `apollo` config, passing any options required for the query.
 *
 * @param options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/core/ApolloClient/#ApolloClient.query
 *
 * @example
 * {
 *   apollo: {
 *     feed: useFeedQuery({
 *       variables: {
 *         type: // value for 'type'
 *         offset: // value for 'offset'
 *         limit: // value for 'limit'
 *       },
 *       loadingKey: 'loading',
 *       fetchPolicy: 'no-cache',
 *     }),
 *   }
 * }
 */
export const useFeedQuery = createSmartQueryOptionsFunction<FeedQuery, FeedQueryVariables, ApolloError>(FeedDocument);

export const SubmitRepositoryDocument = gql`
  mutation submitRepository($repoFullName: String!) {
    submitRepository(repoFullName: $repoFullName) {
      createdAt
    }
  }
`;

/**
 * __submitRepositoryMutation__
 *
 * To run a mutation, you call `submitRepositoryMutation` within a Vue component and pass it
 * your Vue app instance along with any options that fit your needs.
 *
 * @param app, a reference to your Vue app instance (which must have a `$apollo` property)
 * @param options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/core/ApolloClient/#ApolloClient.mutate
 * @param client (optional), which can be an instance of `DollarApollo` or the `mutate()` function provided by an `<ApolloMutation>` component
 *
 * @example
 * const { success, data, errors } = submitRepositoryMutation(this, {
 *   variables: {
 *     repoFullName: // value for 'repoFullName'
 *   },
 * });
 */
export const submitRepositoryMutation = createMutationFunction<
  SubmitRepositoryMutation,
  SubmitRepositoryMutationVariables,
  ApolloError
>(SubmitRepositoryDocument);

export const SubmitCommentDocument = gql`
  mutation submitComment($repoFullName: String!, $commentContent: String!) {
    submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {
      ...CommentsPageComment
    }
  }
  ${CommentsPageCommentFragmentDoc}
`;

/**
 * __submitCommentMutation__
 *
 * To run a mutation, you call `submitCommentMutation` within a Vue component and pass it
 * your Vue app instance along with any options that fit your needs.
 *
 * @param app, a reference to your Vue app instance (which must have a `$apollo` property)
 * @param options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/core/ApolloClient/#ApolloClient.mutate
 * @param client (optional), which can be an instance of `DollarApollo` or the `mutate()` function provided by an `<ApolloMutation>` component
 *
 * @example
 * const { success, data, errors } = submitCommentMutation(this, {
 *   variables: {
 *     repoFullName: // value for 'repoFullName'
 *     commentContent: // value for 'commentContent'
 *   },
 * });
 */
export const submitCommentMutation = createMutationFunction<
  SubmitCommentMutation,
  SubmitCommentMutationVariables,
  ApolloError
>(SubmitCommentDocument);

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

/**
 * __voteMutation__
 *
 * To run a mutation, you call `voteMutation` within a Vue component and pass it
 * your Vue app instance along with any options that fit your needs.
 *
 * @param app, a reference to your Vue app instance (which must have a `$apollo` property)
 * @param options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/core/ApolloClient/#ApolloClient.mutate
 * @param client (optional), which can be an instance of `DollarApollo` or the `mutate()` function provided by an `<ApolloMutation>` component
 *
 * @example
 * const { success, data, errors } = voteMutation(this, {
 *   variables: {
 *     repoFullName: // value for 'repoFullName'
 *     type: // value for 'type'
 *   },
 * });
 */
export const voteMutation = createMutationFunction<VoteMutation, VoteMutationVariables, ApolloError>(VoteDocument);
