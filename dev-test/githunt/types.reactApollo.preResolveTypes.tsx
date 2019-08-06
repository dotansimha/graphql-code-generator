// tslint:disable
import gql from 'graphql-tag';
import * as React from 'react';
import * as ReactApollo from 'react-apollo';
export type Maybe<T> = T | null;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
};

/** A comment about an entry, submitted by a user */
export type Comment = {
  __typename?: 'Comment',
  /** The SQL ID of this entry */
  id: Scalars['Int'],
  /** The GitHub user who posted the comment */
  postedBy: User,
  /** A timestamp of when the comment was posted */
  createdAt: Scalars['Float'],
  /** The text of the comment */
  content: Scalars['String'],
  /** The repository which this comment is about */
  repoName: Scalars['String'],
};

/** Information about a GitHub repository submitted to GitHunt */
export type Entry = {
  __typename?: 'Entry',
  /** Information about the repository from GitHub */
  repository: Repository,
  /** The GitHub user who submitted this entry */
  postedBy: User,
  /** A timestamp of when the entry was submitted */
  createdAt: Scalars['Float'],
  /** The score of this repository, upvotes - downvotes */
  score: Scalars['Int'],
  /** The hot score of this repository */
  hotScore: Scalars['Float'],
  /** Comments posted about this repository */
  comments: Array<Maybe<Comment>>,
  /** The number of comments posted about this repository */
  commentCount: Scalars['Int'],
  /** The SQL ID of this entry */
  id: Scalars['Int'],
  /** XXX to be changed */
  vote: Vote,
};


/** Information about a GitHub repository submitted to GitHunt */
export type EntryCommentsArgs = {
  limit?: Maybe<Scalars['Int']>,
  offset?: Maybe<Scalars['Int']>
};

/** A list of options for the sort order of the feed */
export enum FeedType {
  /** Sort by a combination of freshness and score, using Reddit's algorithm */
  Hot = 'HOT',
  /** Newest entries first */
  New = 'NEW',
  /** Highest score entries first */
  Top = 'TOP'
}

export type Mutation = {
  __typename?: 'Mutation',
  /** Submit a new repository, returns the new submission */
  submitRepository?: Maybe<Entry>,
  /** Vote on a repository submission, returns the submission that was voted on */
  vote?: Maybe<Entry>,
  /** Comment on a repository, returns the new comment */
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
  __typename?: 'Query',
  /** A feed of repository submissions */
  feed?: Maybe<Array<Maybe<Entry>>>,
  /** A single entry */
  entry?: Maybe<Entry>,
  /** Return the currently logged in user, or null if nobody is logged in */
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

/** 
 * A repository object from the GitHub API. This uses the exact field names returned by the
 * GitHub API for simplicity, even though the convention for GraphQL is usually to camel case.
 **/
export type Repository = {
  __typename?: 'Repository',
  /** Just the name of the repository, e.g. GitHunt-API */
  name: Scalars['String'],
  /** The full name of the repository with the username, e.g. apollostack/GitHunt-API */
  full_name: Scalars['String'],
  /** The description of the repository */
  description?: Maybe<Scalars['String']>,
  /** The link to the repository on GitHub */
  html_url: Scalars['String'],
  /** The number of people who have starred this repository on GitHub */
  stargazers_count: Scalars['Int'],
  /** The number of open issues on this repository on GitHub */
  open_issues_count?: Maybe<Scalars['Int']>,
  /** The owner of this repository on GitHub, e.g. apollostack */
  owner?: Maybe<User>,
};

export type Subscription = {
  __typename?: 'Subscription',
  /** Subscription fires on every comment added */
  commentAdded?: Maybe<Comment>,
};


export type SubscriptionCommentAddedArgs = {
  repoFullName: Scalars['String']
};

/** A user object from the GitHub API. This uses the exact field names returned from the GitHub API. */
export type User = {
  __typename?: 'User',
  /** The name of the user, e.g. apollostack */
  login: Scalars['String'],
  /** The URL to a directly embeddable image for this user's avatar */
  avatar_url: Scalars['String'],
  /** The URL of this user's GitHub page */
  html_url: Scalars['String'],
};

/** XXX to be removed */
export type Vote = {
  __typename?: 'Vote',
  vote_value: Scalars['Int'],
};

/** The type of vote to record, when submitting a vote */
export enum VoteType {
  Up = 'UP',
  Down = 'DOWN',
  Cancel = 'CANCEL'
}
export type OnCommentAddedSubscriptionVariables = {
  repoFullName: Scalars['String']
};


export type OnCommentAddedSubscription = { __typename?: 'Subscription', commentAdded: Maybe<{ __typename?: 'Comment', id: number, createdAt: number, content: string, postedBy: { __typename?: 'User', login: string, html_url: string } }> };

export type CommentQueryVariables = {
  repoFullName: Scalars['String'],
  limit?: Maybe<Scalars['Int']>,
  offset?: Maybe<Scalars['Int']>
};


export type CommentQuery = { __typename?: 'Query', currentUser: Maybe<{ __typename?: 'User', login: string, html_url: string }>, entry: Maybe<{ __typename?: 'Entry', id: number, createdAt: number, commentCount: number, postedBy: { __typename?: 'User', login: string, html_url: string }, comments: Array<Maybe<({ __typename?: 'Comment' } & CommentsPageCommentFragment)>>, repository: ({ __typename?: 'Repository', full_name: string, html_url: string } & { __typename?: 'Repository', description: Maybe<string>, open_issues_count: Maybe<number>, stargazers_count: number }) }> };

export type CommentsPageCommentFragment = { __typename?: 'Comment', id: number, createdAt: number, content: string, postedBy: { __typename?: 'User', login: string, html_url: string } };

export type CurrentUserForProfileQueryVariables = {};


export type CurrentUserForProfileQuery = { __typename?: 'Query', currentUser: Maybe<{ __typename?: 'User', login: string, avatar_url: string }> };

export type FeedEntryFragment = ({ __typename?: 'Entry', id: number, commentCount: number, repository: { __typename?: 'Repository', full_name: string, html_url: string, owner: Maybe<{ __typename?: 'User', avatar_url: string }> } } & (VoteButtonsFragment & RepoInfoFragment));

export type FeedQueryVariables = {
  type: FeedType,
  offset?: Maybe<Scalars['Int']>,
  limit?: Maybe<Scalars['Int']>
};


export type FeedQuery = { __typename?: 'Query', currentUser: Maybe<{ __typename?: 'User', login: string }>, feed: Maybe<Array<Maybe<({ __typename?: 'Entry' } & FeedEntryFragment)>>> };

export type SubmitRepositoryMutationVariables = {
  repoFullName: Scalars['String']
};


export type SubmitRepositoryMutation = { __typename?: 'Mutation', submitRepository: Maybe<{ __typename?: 'Entry', createdAt: number }> };

export type RepoInfoFragment = { __typename?: 'Entry', createdAt: number, repository: { __typename?: 'Repository', description: Maybe<string>, stargazers_count: number, open_issues_count: Maybe<number> }, postedBy: { __typename?: 'User', html_url: string, login: string } };

export type SubmitCommentMutationVariables = {
  repoFullName: Scalars['String'],
  commentContent: Scalars['String']
};


export type SubmitCommentMutation = { __typename?: 'Mutation', submitComment: Maybe<({ __typename?: 'Comment' } & CommentsPageCommentFragment)> };

export type VoteButtonsFragment = { __typename?: 'Entry', score: number, vote: { __typename?: 'Vote', vote_value: number } };

export type VoteMutationVariables = {
  repoFullName: Scalars['String'],
  type: VoteType
};


export type VoteMutation = { __typename?: 'Mutation', vote: Maybe<{ __typename?: 'Entry', score: number, id: number, vote: { __typename?: 'Vote', vote_value: number } }> };
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
export type OnCommentAddedComponentProps = Omit<ReactApollo.SubscriptionProps<OnCommentAddedSubscription, OnCommentAddedSubscriptionVariables>, 'subscription'>;

    export const OnCommentAddedComponent = (props: OnCommentAddedComponentProps) => (
      <ReactApollo.Subscription<OnCommentAddedSubscription, OnCommentAddedSubscriptionVariables> subscription={OnCommentAddedDocument} {...props} />
    );
    
export type OnCommentAddedProps<TChildProps = {}> = ReactApollo.DataProps<OnCommentAddedSubscription, OnCommentAddedSubscriptionVariables> & TChildProps;
export function withOnCommentAdded<TProps, TChildProps = {}>(operationOptions?: ReactApollo.OperationOption<
  TProps,
  OnCommentAddedSubscription,
  OnCommentAddedSubscriptionVariables,
  OnCommentAddedProps<TChildProps>>) {
    return ReactApollo.withSubscription<TProps, OnCommentAddedSubscription, OnCommentAddedSubscriptionVariables, OnCommentAddedProps<TChildProps>>(OnCommentAddedDocument, {
      alias: 'withOnCommentAdded',
      ...operationOptions
    });
};
export type OnCommentAddedSubscriptionResult = ReactApollo.SubscriptionResult<OnCommentAddedSubscription>;
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
export type CommentComponentProps = Omit<ReactApollo.QueryProps<CommentQuery, CommentQueryVariables>, 'query'> & ({ variables: CommentQueryVariables; skip?: boolean; } | { skip: boolean; });

    export const CommentComponent = (props: CommentComponentProps) => (
      <ReactApollo.Query<CommentQuery, CommentQueryVariables> query={CommentDocument} {...props} />
    );
    
export type CommentProps<TChildProps = {}> = ReactApollo.DataProps<CommentQuery, CommentQueryVariables> & TChildProps;
export function withComment<TProps, TChildProps = {}>(operationOptions?: ReactApollo.OperationOption<
  TProps,
  CommentQuery,
  CommentQueryVariables,
  CommentProps<TChildProps>>) {
    return ReactApollo.withQuery<TProps, CommentQuery, CommentQueryVariables, CommentProps<TChildProps>>(CommentDocument, {
      alias: 'withComment',
      ...operationOptions
    });
};
export type CommentQueryResult = ReactApollo.QueryResult<CommentQuery, CommentQueryVariables>;
export const CurrentUserForProfileDocument = gql`
    query CurrentUserForProfile {
  currentUser {
    login
    avatar_url
  }
}
    `;
export type CurrentUserForProfileComponentProps = Omit<ReactApollo.QueryProps<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables>, 'query'>;

    export const CurrentUserForProfileComponent = (props: CurrentUserForProfileComponentProps) => (
      <ReactApollo.Query<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables> query={CurrentUserForProfileDocument} {...props} />
    );
    
export type CurrentUserForProfileProps<TChildProps = {}> = ReactApollo.DataProps<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables> & TChildProps;
export function withCurrentUserForProfile<TProps, TChildProps = {}>(operationOptions?: ReactApollo.OperationOption<
  TProps,
  CurrentUserForProfileQuery,
  CurrentUserForProfileQueryVariables,
  CurrentUserForProfileProps<TChildProps>>) {
    return ReactApollo.withQuery<TProps, CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables, CurrentUserForProfileProps<TChildProps>>(CurrentUserForProfileDocument, {
      alias: 'withCurrentUserForProfile',
      ...operationOptions
    });
};
export type CurrentUserForProfileQueryResult = ReactApollo.QueryResult<CurrentUserForProfileQuery, CurrentUserForProfileQueryVariables>;
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
export type FeedComponentProps = Omit<ReactApollo.QueryProps<FeedQuery, FeedQueryVariables>, 'query'> & ({ variables: FeedQueryVariables; skip?: boolean; } | { skip: boolean; });

    export const FeedComponent = (props: FeedComponentProps) => (
      <ReactApollo.Query<FeedQuery, FeedQueryVariables> query={FeedDocument} {...props} />
    );
    
export type FeedProps<TChildProps = {}> = ReactApollo.DataProps<FeedQuery, FeedQueryVariables> & TChildProps;
export function withFeed<TProps, TChildProps = {}>(operationOptions?: ReactApollo.OperationOption<
  TProps,
  FeedQuery,
  FeedQueryVariables,
  FeedProps<TChildProps>>) {
    return ReactApollo.withQuery<TProps, FeedQuery, FeedQueryVariables, FeedProps<TChildProps>>(FeedDocument, {
      alias: 'withFeed',
      ...operationOptions
    });
};
export type FeedQueryResult = ReactApollo.QueryResult<FeedQuery, FeedQueryVariables>;
export const SubmitRepositoryDocument = gql`
    mutation submitRepository($repoFullName: String!) {
  submitRepository(repoFullName: $repoFullName) {
    createdAt
  }
}
    `;
export type SubmitRepositoryMutationFn = ReactApollo.MutationFn<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>;
export type SubmitRepositoryComponentProps = Omit<ReactApollo.MutationProps<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>, 'mutation'>;

    export const SubmitRepositoryComponent = (props: SubmitRepositoryComponentProps) => (
      <ReactApollo.Mutation<SubmitRepositoryMutation, SubmitRepositoryMutationVariables> mutation={SubmitRepositoryDocument} {...props} />
    );
    
export type SubmitRepositoryProps<TChildProps = {}> = ReactApollo.MutateProps<SubmitRepositoryMutation, SubmitRepositoryMutationVariables> & TChildProps;
export function withSubmitRepository<TProps, TChildProps = {}>(operationOptions?: ReactApollo.OperationOption<
  TProps,
  SubmitRepositoryMutation,
  SubmitRepositoryMutationVariables,
  SubmitRepositoryProps<TChildProps>>) {
    return ReactApollo.withMutation<TProps, SubmitRepositoryMutation, SubmitRepositoryMutationVariables, SubmitRepositoryProps<TChildProps>>(SubmitRepositoryDocument, {
      alias: 'withSubmitRepository',
      ...operationOptions
    });
};
export type SubmitRepositoryMutationResult = ReactApollo.MutationResult<SubmitRepositoryMutation>;
export type SubmitRepositoryMutationOptions = ReactApollo.MutationOptions<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>;
export const SubmitCommentDocument = gql`
    mutation submitComment($repoFullName: String!, $commentContent: String!) {
  submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {
    ...CommentsPageComment
  }
}
    ${CommentsPageCommentFragmentDoc}`;
export type SubmitCommentMutationFn = ReactApollo.MutationFn<SubmitCommentMutation, SubmitCommentMutationVariables>;
export type SubmitCommentComponentProps = Omit<ReactApollo.MutationProps<SubmitCommentMutation, SubmitCommentMutationVariables>, 'mutation'>;

    export const SubmitCommentComponent = (props: SubmitCommentComponentProps) => (
      <ReactApollo.Mutation<SubmitCommentMutation, SubmitCommentMutationVariables> mutation={SubmitCommentDocument} {...props} />
    );
    
export type SubmitCommentProps<TChildProps = {}> = ReactApollo.MutateProps<SubmitCommentMutation, SubmitCommentMutationVariables> & TChildProps;
export function withSubmitComment<TProps, TChildProps = {}>(operationOptions?: ReactApollo.OperationOption<
  TProps,
  SubmitCommentMutation,
  SubmitCommentMutationVariables,
  SubmitCommentProps<TChildProps>>) {
    return ReactApollo.withMutation<TProps, SubmitCommentMutation, SubmitCommentMutationVariables, SubmitCommentProps<TChildProps>>(SubmitCommentDocument, {
      alias: 'withSubmitComment',
      ...operationOptions
    });
};
export type SubmitCommentMutationResult = ReactApollo.MutationResult<SubmitCommentMutation>;
export type SubmitCommentMutationOptions = ReactApollo.MutationOptions<SubmitCommentMutation, SubmitCommentMutationVariables>;
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
export type VoteMutationFn = ReactApollo.MutationFn<VoteMutation, VoteMutationVariables>;
export type VoteComponentProps = Omit<ReactApollo.MutationProps<VoteMutation, VoteMutationVariables>, 'mutation'>;

    export const VoteComponent = (props: VoteComponentProps) => (
      <ReactApollo.Mutation<VoteMutation, VoteMutationVariables> mutation={VoteDocument} {...props} />
    );
    
export type VoteProps<TChildProps = {}> = ReactApollo.MutateProps<VoteMutation, VoteMutationVariables> & TChildProps;
export function withVote<TProps, TChildProps = {}>(operationOptions?: ReactApollo.OperationOption<
  TProps,
  VoteMutation,
  VoteMutationVariables,
  VoteProps<TChildProps>>) {
    return ReactApollo.withMutation<TProps, VoteMutation, VoteMutationVariables, VoteProps<TChildProps>>(VoteDocument, {
      alias: 'withVote',
      ...operationOptions
    });
};
export type VoteMutationResult = ReactApollo.MutationResult<VoteMutation>;
export type VoteMutationOptions = ReactApollo.MutationOptions<VoteMutation, VoteMutationVariables>;