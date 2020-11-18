import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
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

/** A list of options for the sort order of the feed */
export enum FeedType {
  /** Sort by a combination of freshness and score, using Reddit's algorithm */
  Hot = 'HOT',
  /** Newest entries first */
  New = 'NEW',
  /** Highest score entries first */
  Top = 'TOP',
}

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

/** XXX to be removed */
export type Vote = {
  __typename?: 'Vote';
  vote_value: Scalars['Int'];
};

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

/** The type of vote to record, when submitting a vote */
export enum VoteType {
  Up = 'UP',
  Down = 'DOWN',
  Cancel = 'CANCEL',
}

export type Subscription = {
  __typename?: 'Subscription';
  /** Subscription fires on every comment added */
  commentAdded?: Maybe<Comment>;
};

export type SubscriptionCommentAddedArgs = {
  repoFullName: Scalars['String'];
};

export type OnCommentAddedSubscriptionVariables = Exact<{
  repoFullName: Scalars['String'];
}>;

export type OnCommentAddedSubscriptionMyOperation = { __typename?: 'Subscription' } & {
  commentAdded?: Maybe<
    { __typename?: 'Comment' } & Pick<Comment, 'id' | 'createdAt' | 'content'> & {
        postedBy: { __typename?: 'User' } & Pick<User, 'login' | 'html_url'>;
      }
  >;
};

export type CommentQueryVariables = Exact<{
  repoFullName: Scalars['String'];
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
}>;

export type CommentQueryMyOperation = { __typename?: 'Query' } & {
  currentUser?: Maybe<{ __typename?: 'User' } & Pick<User, 'login' | 'html_url'>>;
  entry?: Maybe<
    { __typename?: 'Entry' } & Pick<Entry, 'id' | 'createdAt' | 'commentCount'> & {
        postedBy: { __typename?: 'User' } & Pick<User, 'login' | 'html_url'>;
        comments: Array<Maybe<{ __typename?: 'Comment' } & CommentsPageCommentFragment>>;
        repository: { __typename?: 'Repository' } & Pick<
          Repository,
          'description' | 'open_issues_count' | 'stargazers_count' | 'full_name' | 'html_url'
        >;
      }
  >;
};

export type CommentsPageCommentFragment = { __typename?: 'Comment' } & Pick<Comment, 'id' | 'createdAt' | 'content'> & {
    postedBy: { __typename?: 'User' } & Pick<User, 'login' | 'html_url'>;
  };

export type CurrentUserForProfileQueryVariables = Exact<{ [key: string]: never }>;

export type CurrentUserForProfileQueryMyOperation = { __typename?: 'Query' } & {
  currentUser?: Maybe<{ __typename?: 'User' } & Pick<User, 'login' | 'avatar_url'>>;
};

export type FeedEntryFragment = { __typename?: 'Entry' } & Pick<Entry, 'id' | 'commentCount'> & {
    repository: { __typename?: 'Repository' } & Pick<Repository, 'full_name' | 'html_url'> & {
        owner?: Maybe<{ __typename?: 'User' } & Pick<User, 'avatar_url'>>;
      };
  } & VoteButtonsFragment &
  RepoInfoFragment;

export type FeedQueryVariables = Exact<{
  type: FeedType;
  offset?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
}>;

export type FeedQueryMyOperation = { __typename?: 'Query' } & {
  currentUser?: Maybe<{ __typename?: 'User' } & Pick<User, 'login'>>;
  feed?: Maybe<Array<Maybe<{ __typename?: 'Entry' } & FeedEntryFragment>>>;
};

export type SubmitRepositoryMutationVariables = Exact<{
  repoFullName: Scalars['String'];
}>;

export type SubmitRepositoryMutationMyOperation = { __typename?: 'Mutation' } & {
  submitRepository?: Maybe<{ __typename?: 'Entry' } & Pick<Entry, 'createdAt'>>;
};

export type RepoInfoFragment = { __typename?: 'Entry' } & Pick<Entry, 'createdAt'> & {
    repository: { __typename?: 'Repository' } & Pick<
      Repository,
      'description' | 'stargazers_count' | 'open_issues_count'
    >;
    postedBy: { __typename?: 'User' } & Pick<User, 'html_url' | 'login'>;
  };

export type SubmitCommentMutationVariables = Exact<{
  repoFullName: Scalars['String'];
  commentContent: Scalars['String'];
}>;

export type SubmitCommentMutationMyOperation = { __typename?: 'Mutation' } & {
  submitComment?: Maybe<{ __typename?: 'Comment' } & CommentsPageCommentFragment>;
};

export type VoteButtonsFragment = { __typename?: 'Entry' } & Pick<Entry, 'score'> & {
    vote: { __typename?: 'Vote' } & Pick<Vote, 'vote_value'>;
  };

export type VoteMutationVariables = Exact<{
  repoFullName: Scalars['String'];
  type: VoteType;
}>;

export type VoteMutationMyOperation = { __typename?: 'Mutation' } & {
  vote?: Maybe<
    { __typename?: 'Entry' } & Pick<Entry, 'score' | 'id'> & {
        vote: { __typename?: 'Vote' } & Pick<Vote, 'vote_value'>;
      }
  >;
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
 * To run a query within a React component, call `useOnCommentAddedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnCommentAddedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnCommentAddedSubscription({
 *   variables: {
 *      repoFullName: // value for 'repoFullName'
 *   },
 * });
 */
export function useOnCommentAddedSubscription(
  baseOptions: Apollo.SubscriptionHookOptions<
    OnCommentAddedSubscriptionMyOperation,
    OnCommentAddedSubscriptionVariables
  >
) {
  return Apollo.useSubscription<OnCommentAddedSubscriptionMyOperation, OnCommentAddedSubscriptionVariables>(
    OnCommentAddedDocument,
    baseOptions
  );
}
export type OnCommentAddedSubscriptionHookResult = ReturnType<typeof useOnCommentAddedSubscription>;
export type OnCommentAddedSubscriptionResult = Apollo.SubscriptionResult<OnCommentAddedSubscriptionMyOperation>;
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
 * To run a query within a React component, call `useCommentQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommentQuery({
 *   variables: {
 *      repoFullName: // value for 'repoFullName'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useCommentQuery(baseOptions: Apollo.QueryHookOptions<CommentQueryMyOperation, CommentQueryVariables>) {
  return Apollo.useQuery<CommentQueryMyOperation, CommentQueryVariables>(CommentDocument, baseOptions);
}
export function useCommentLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<CommentQueryMyOperation, CommentQueryVariables>
) {
  return Apollo.useLazyQuery<CommentQueryMyOperation, CommentQueryVariables>(CommentDocument, baseOptions);
}
export type CommentQueryHookResult = ReturnType<typeof useCommentQuery>;
export type CommentLazyQueryHookResult = ReturnType<typeof useCommentLazyQuery>;
export type CommentQueryResult = Apollo.QueryResult<CommentQueryMyOperation, CommentQueryVariables>;
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
 * To run a query within a React component, call `useCurrentUserForProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useCurrentUserForProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCurrentUserForProfileQuery({
 *   variables: {
 *   },
 * });
 */
export function useCurrentUserForProfileQuery(
  baseOptions?: Apollo.QueryHookOptions<CurrentUserForProfileQueryMyOperation, CurrentUserForProfileQueryVariables>
) {
  return Apollo.useQuery<CurrentUserForProfileQueryMyOperation, CurrentUserForProfileQueryVariables>(
    CurrentUserForProfileDocument,
    baseOptions
  );
}
export function useCurrentUserForProfileLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<CurrentUserForProfileQueryMyOperation, CurrentUserForProfileQueryVariables>
) {
  return Apollo.useLazyQuery<CurrentUserForProfileQueryMyOperation, CurrentUserForProfileQueryVariables>(
    CurrentUserForProfileDocument,
    baseOptions
  );
}
export type CurrentUserForProfileQueryHookResult = ReturnType<typeof useCurrentUserForProfileQuery>;
export type CurrentUserForProfileLazyQueryHookResult = ReturnType<typeof useCurrentUserForProfileLazyQuery>;
export type CurrentUserForProfileQueryResult = Apollo.QueryResult<
  CurrentUserForProfileQueryMyOperation,
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
 * To run a query within a React component, call `useFeedQuery` and pass it any options that fit your needs.
 * When your component renders, `useFeedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFeedQuery({
 *   variables: {
 *      type: // value for 'type'
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useFeedQuery(baseOptions: Apollo.QueryHookOptions<FeedQueryMyOperation, FeedQueryVariables>) {
  return Apollo.useQuery<FeedQueryMyOperation, FeedQueryVariables>(FeedDocument, baseOptions);
}
export function useFeedLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FeedQueryMyOperation, FeedQueryVariables>) {
  return Apollo.useLazyQuery<FeedQueryMyOperation, FeedQueryVariables>(FeedDocument, baseOptions);
}
export type FeedQueryHookResult = ReturnType<typeof useFeedQuery>;
export type FeedLazyQueryHookResult = ReturnType<typeof useFeedLazyQuery>;
export type FeedQueryResult = Apollo.QueryResult<FeedQueryMyOperation, FeedQueryVariables>;
export const SubmitRepositoryDocument = gql`
  mutation submitRepository($repoFullName: String!) {
    submitRepository(repoFullName: $repoFullName) {
      createdAt
    }
  }
`;
export type SubmitRepositoryMutationFn = Apollo.MutationFunction<
  SubmitRepositoryMutationMyOperation,
  SubmitRepositoryMutationVariables
>;

/**
 * __useSubmitRepositoryMutation__
 *
 * To run a mutation, you first call `useSubmitRepositoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitRepositoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitRepositoryMutation, { data, loading, error }] = useSubmitRepositoryMutation({
 *   variables: {
 *      repoFullName: // value for 'repoFullName'
 *   },
 * });
 */
export function useSubmitRepositoryMutation(
  baseOptions?: Apollo.MutationHookOptions<SubmitRepositoryMutationMyOperation, SubmitRepositoryMutationVariables>
) {
  return Apollo.useMutation<SubmitRepositoryMutationMyOperation, SubmitRepositoryMutationVariables>(
    SubmitRepositoryDocument,
    baseOptions
  );
}
export type SubmitRepositoryMutationHookResult = ReturnType<typeof useSubmitRepositoryMutation>;
export type SubmitRepositoryMutationResult = Apollo.MutationResult<SubmitRepositoryMutationMyOperation>;
export type SubmitRepositoryMutationOptions = Apollo.BaseMutationOptions<
  SubmitRepositoryMutationMyOperation,
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
export type SubmitCommentMutationFn = Apollo.MutationFunction<
  SubmitCommentMutationMyOperation,
  SubmitCommentMutationVariables
>;

/**
 * __useSubmitCommentMutation__
 *
 * To run a mutation, you first call `useSubmitCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitCommentMutation, { data, loading, error }] = useSubmitCommentMutation({
 *   variables: {
 *      repoFullName: // value for 'repoFullName'
 *      commentContent: // value for 'commentContent'
 *   },
 * });
 */
export function useSubmitCommentMutation(
  baseOptions?: Apollo.MutationHookOptions<SubmitCommentMutationMyOperation, SubmitCommentMutationVariables>
) {
  return Apollo.useMutation<SubmitCommentMutationMyOperation, SubmitCommentMutationVariables>(
    SubmitCommentDocument,
    baseOptions
  );
}
export type SubmitCommentMutationHookResult = ReturnType<typeof useSubmitCommentMutation>;
export type SubmitCommentMutationResult = Apollo.MutationResult<SubmitCommentMutationMyOperation>;
export type SubmitCommentMutationOptions = Apollo.BaseMutationOptions<
  SubmitCommentMutationMyOperation,
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
export type VoteMutationFn = Apollo.MutationFunction<VoteMutationMyOperation, VoteMutationVariables>;

/**
 * __useVoteMutation__
 *
 * To run a mutation, you first call `useVoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useVoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [voteMutation, { data, loading, error }] = useVoteMutation({
 *   variables: {
 *      repoFullName: // value for 'repoFullName'
 *      type: // value for 'type'
 *   },
 * });
 */
export function useVoteMutation(
  baseOptions?: Apollo.MutationHookOptions<VoteMutationMyOperation, VoteMutationVariables>
) {
  return Apollo.useMutation<VoteMutationMyOperation, VoteMutationVariables>(VoteDocument, baseOptions);
}
export type VoteMutationHookResult = ReturnType<typeof useVoteMutation>;
export type VoteMutationResult = Apollo.MutationResult<VoteMutationMyOperation>;
export type VoteMutationOptions = Apollo.BaseMutationOptions<VoteMutationMyOperation, VoteMutationVariables>;
