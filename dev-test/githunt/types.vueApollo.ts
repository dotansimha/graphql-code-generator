import gql from 'graphql-tag';
import * as VueApolloComposable from '@vue/apollo-composable';
import * as VueCompositionApi from '@vue/composition-api';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type ReactiveFunction<TParam> = () => TParam;
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
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
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
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
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
  commentAdded?: {
    __typename?: 'Comment';
    id: number;
    createdAt: number;
    content: string;
    postedBy: { __typename?: 'User'; login: string; html_url: string };
  } | null;
};

export type CommentQueryVariables = Exact<{
  repoFullName: Scalars['String'];
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
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
  currentUser?: { __typename?: 'User'; login: string; avatar_url: string } | null;
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
    description?: string | null;
    stargazers_count: number;
    open_issues_count?: number | null;
    owner?: { __typename?: 'User'; avatar_url: string } | null;
  };
  vote: { __typename?: 'Vote'; vote_value: number };
  postedBy: { __typename?: 'User'; html_url: string; login: string };
};

export type FeedQueryVariables = Exact<{
  type: FeedType;
  offset?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
}>;

export type FeedQuery = {
  __typename?: 'Query';
  currentUser?: { __typename?: 'User'; login: string } | null;
  feed?: Array<{
    __typename?: 'Entry';
    id: number;
    commentCount: number;
    score: number;
    createdAt: number;
    repository: {
      __typename?: 'Repository';
      full_name: string;
      html_url: string;
      description?: string | null;
      stargazers_count: number;
      open_issues_count?: number | null;
      owner?: { __typename?: 'User'; avatar_url: string } | null;
    };
    vote: { __typename?: 'Vote'; vote_value: number };
    postedBy: { __typename?: 'User'; html_url: string; login: string };
  } | null> | null;
};

export type SubmitRepositoryMutationVariables = Exact<{
  repoFullName: Scalars['String'];
}>;

export type SubmitRepositoryMutation = {
  __typename?: 'Mutation';
  submitRepository?: { __typename?: 'Entry'; createdAt: number } | null;
};

export type RepoInfoFragment = {
  __typename?: 'Entry';
  createdAt: number;
  repository: {
    __typename?: 'Repository';
    description?: string | null;
    stargazers_count: number;
    open_issues_count?: number | null;
  };
  postedBy: { __typename?: 'User'; html_url: string; login: string };
};

export type SubmitCommentMutationVariables = Exact<{
  repoFullName: Scalars['String'];
  commentContent: Scalars['String'];
}>;

export type SubmitCommentMutation = {
  __typename?: 'Mutation';
  submitComment?: {
    __typename?: 'Comment';
    id: number;
    createdAt: number;
    content: string;
    postedBy: { __typename?: 'User'; login: string; html_url: string };
  } | null;
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
  vote?: { __typename?: 'Entry'; score: number; id: number; vote: { __typename?: 'Vote'; vote_value: number } } | null;
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
 * To run a query within a Vue component, call `useOnCommentAddedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnCommentAddedSubscription` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param variables that will be passed into the subscription
 * @param options that will be passed into the subscription, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/subscription.html#options;
 *
 * @example
 * const { result, loading, error } = useOnCommentAddedSubscription({
 *   repoFullName: // value for 'repoFullName'
 * });
 */
export function useOnCommentAddedSubscription(
  variables:
    | OnCommentAddedSubscriptionVariables
    | VueCompositionApi.Ref<OnCommentAddedSubscriptionVariables>
    | ReactiveFunction<OnCommentAddedSubscriptionVariables>,
  options:
    | VueApolloComposable.UseSubscriptionOptions<OnCommentAddedSubscription, OnCommentAddedSubscriptionVariables>
    | VueCompositionApi.Ref<
        VueApolloComposable.UseSubscriptionOptions<OnCommentAddedSubscription, OnCommentAddedSubscriptionVariables>
      >
    | ReactiveFunction<
        VueApolloComposable.UseSubscriptionOptions<OnCommentAddedSubscription, OnCommentAddedSubscriptionVariables>
      > = {}
) {
  return VueApolloComposable.useSubscription<OnCommentAddedSubscription, OnCommentAddedSubscriptionVariables>(
    OnCommentAddedDocument,
    variables,
    options
  );
}
export type OnCommentAddedSubscriptionCompositionFunctionResult = VueApolloComposable.UseSubscriptionReturn<
  OnCommentAddedSubscription,
  OnCommentAddedSubscriptionVariables
>;
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
 * To run a query within a Vue component, call `useCommentQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommentQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param variables that will be passed into the query
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useCommentQuery({
 *   repoFullName: // value for 'repoFullName'
 *   limit: // value for 'limit'
 *   offset: // value for 'offset'
 * });
 */
export function useCommentQuery(
  variables:
    | CommentQueryVariables
    | VueCompositionApi.Ref<CommentQueryVariables>
    | ReactiveFunction<CommentQueryVariables>,
  options:
    | VueApolloComposable.UseQueryOptions<CommentQuery, CommentQueryVariables>
    | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<CommentQuery, CommentQueryVariables>>
    | ReactiveFunction<VueApolloComposable.UseQueryOptions<CommentQuery, CommentQueryVariables>> = {}
) {
  return VueApolloComposable.useQuery<CommentQuery, CommentQueryVariables>(CommentDocument, variables, options);
}
export function useCommentLazyQuery(
  variables:
    | CommentQueryVariables
    | VueCompositionApi.Ref<CommentQueryVariables>
    | ReactiveFunction<CommentQueryVariables>,
  options:
    | VueApolloComposable.UseQueryOptions<CommentQuery, CommentQueryVariables>
    | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<CommentQuery, CommentQueryVariables>>
    | ReactiveFunction<VueApolloComposable.UseQueryOptions<CommentQuery, CommentQueryVariables>> = {}
) {
  return VueApolloComposable.useLazyQuery<CommentQuery, CommentQueryVariables>(CommentDocument, variables, options);
}
export type CommentQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<
  CommentQuery,
  CommentQueryVariables
>;
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
 * To run a query within a Vue component, call `useCurrentUserForProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useCurrentUserForProfileQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useCurrentUserForProfileQuery();
 */
export function useCurrentUserForProfileQuery(
  options:
    | VueApolloComposable.UseQueryOptions<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables>
    | VueCompositionApi.Ref<
        VueApolloComposable.UseQueryOptions<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables>
      >
    | ReactiveFunction<
        VueApolloComposable.UseQueryOptions<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables>
      > = {}
) {
  return VueApolloComposable.useQuery<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables>(
    CurrentUserForProfileDocument,
    {},
    options
  );
}
export function useCurrentUserForProfileLazyQuery(
  options:
    | VueApolloComposable.UseQueryOptions<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables>
    | VueCompositionApi.Ref<
        VueApolloComposable.UseQueryOptions<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables>
      >
    | ReactiveFunction<
        VueApolloComposable.UseQueryOptions<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables>
      > = {}
) {
  return VueApolloComposable.useLazyQuery<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables>(
    CurrentUserForProfileDocument,
    {},
    options
  );
}
export type CurrentUserForProfileQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<
  CurrentUserForProfileQuery,
  CurrentUserForProfileQueryVariables
>;
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
 * To run a query within a Vue component, call `useFeedQuery` and pass it any options that fit your needs.
 * When your component renders, `useFeedQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param variables that will be passed into the query
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useFeedQuery({
 *   type: // value for 'type'
 *   offset: // value for 'offset'
 *   limit: // value for 'limit'
 * });
 */
export function useFeedQuery(
  variables: FeedQueryVariables | VueCompositionApi.Ref<FeedQueryVariables> | ReactiveFunction<FeedQueryVariables>,
  options:
    | VueApolloComposable.UseQueryOptions<FeedQuery, FeedQueryVariables>
    | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<FeedQuery, FeedQueryVariables>>
    | ReactiveFunction<VueApolloComposable.UseQueryOptions<FeedQuery, FeedQueryVariables>> = {}
) {
  return VueApolloComposable.useQuery<FeedQuery, FeedQueryVariables>(FeedDocument, variables, options);
}
export function useFeedLazyQuery(
  variables: FeedQueryVariables | VueCompositionApi.Ref<FeedQueryVariables> | ReactiveFunction<FeedQueryVariables>,
  options:
    | VueApolloComposable.UseQueryOptions<FeedQuery, FeedQueryVariables>
    | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<FeedQuery, FeedQueryVariables>>
    | ReactiveFunction<VueApolloComposable.UseQueryOptions<FeedQuery, FeedQueryVariables>> = {}
) {
  return VueApolloComposable.useLazyQuery<FeedQuery, FeedQueryVariables>(FeedDocument, variables, options);
}
export type FeedQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<FeedQuery, FeedQueryVariables>;
export const SubmitRepositoryDocument = gql`
  mutation submitRepository($repoFullName: String!) {
    submitRepository(repoFullName: $repoFullName) {
      createdAt
    }
  }
`;

/**
 * __useSubmitRepositoryMutation__
 *
 * To run a mutation, you first call `useSubmitRepositoryMutation` within a Vue component and pass it any options that fit your needs.
 * When your component renders, `useSubmitRepositoryMutation` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
 *
 * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
 *
 * @example
 * const { mutate, loading, error, onDone } = useSubmitRepositoryMutation({
 *   variables: {
 *     repoFullName: // value for 'repoFullName'
 *   },
 * });
 */
export function useSubmitRepositoryMutation(
  options:
    | VueApolloComposable.UseMutationOptions<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>
    | ReactiveFunction<
        VueApolloComposable.UseMutationOptions<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>
      >
) {
  return VueApolloComposable.useMutation<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>(
    SubmitRepositoryDocument,
    options
  );
}
export type SubmitRepositoryMutationCompositionFunctionResult = VueApolloComposable.UseMutationReturn<
  SubmitRepositoryMutation,
  SubmitRepositoryMutationVariables
>;
export const SubmitCommentDocument = gql`
  mutation submitComment($repoFullName: String!, $commentContent: String!) {
    submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {
      ...CommentsPageComment
    }
  }
  ${CommentsPageCommentFragmentDoc}
`;

/**
 * __useSubmitCommentMutation__
 *
 * To run a mutation, you first call `useSubmitCommentMutation` within a Vue component and pass it any options that fit your needs.
 * When your component renders, `useSubmitCommentMutation` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
 *
 * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
 *
 * @example
 * const { mutate, loading, error, onDone } = useSubmitCommentMutation({
 *   variables: {
 *     repoFullName: // value for 'repoFullName'
 *     commentContent: // value for 'commentContent'
 *   },
 * });
 */
export function useSubmitCommentMutation(
  options:
    | VueApolloComposable.UseMutationOptions<SubmitCommentMutation, SubmitCommentMutationVariables>
    | ReactiveFunction<VueApolloComposable.UseMutationOptions<SubmitCommentMutation, SubmitCommentMutationVariables>>
) {
  return VueApolloComposable.useMutation<SubmitCommentMutation, SubmitCommentMutationVariables>(
    SubmitCommentDocument,
    options
  );
}
export type SubmitCommentMutationCompositionFunctionResult = VueApolloComposable.UseMutationReturn<
  SubmitCommentMutation,
  SubmitCommentMutationVariables
>;
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
 * __useVoteMutation__
 *
 * To run a mutation, you first call `useVoteMutation` within a Vue component and pass it any options that fit your needs.
 * When your component renders, `useVoteMutation` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
 *
 * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
 *
 * @example
 * const { mutate, loading, error, onDone } = useVoteMutation({
 *   variables: {
 *     repoFullName: // value for 'repoFullName'
 *     type: // value for 'type'
 *   },
 * });
 */
export function useVoteMutation(
  options:
    | VueApolloComposable.UseMutationOptions<VoteMutation, VoteMutationVariables>
    | ReactiveFunction<VueApolloComposable.UseMutationOptions<VoteMutation, VoteMutationVariables>>
) {
  return VueApolloComposable.useMutation<VoteMutation, VoteMutationVariables>(VoteDocument, options);
}
export type VoteMutationCompositionFunctionResult = VueApolloComposable.UseMutationReturn<
  VoteMutation,
  VoteMutationVariables
>;
