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

/** A repository object from the GitHub API. This uses the exact field names returned by the
 * GitHub API for simplicity, even though the convention for GraphQL is usually to camel case.
 */
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


export type OnCommentAddedSubscriptionMyOperation = ({ __typename?: 'Subscription' } & { commentAdded: Maybe<({ __typename?: 'Comment' } & Pick<Comment, 'id' | 'createdAt' | 'content'> & { postedBy: ({ __typename?: 'User' } & Pick<User, 'login' | 'html_url'>) })> });

export type CommentQueryVariables = {
  repoFullName: Scalars['String'],
  limit?: Maybe<Scalars['Int']>,
  offset?: Maybe<Scalars['Int']>
};


export type CommentQueryMyOperation = ({ __typename?: 'Query' } & { currentUser: Maybe<({ __typename?: 'User' } & Pick<User, 'login' | 'html_url'>)>, entry: Maybe<({ __typename?: 'Entry' } & Pick<Entry, 'id' | 'createdAt' | 'commentCount'> & { postedBy: ({ __typename?: 'User' } & Pick<User, 'login' | 'html_url'>), comments: Array<Maybe<({ __typename?: 'Comment' } & CommentsPageCommentFragment)>>, repository: ({ __typename?: 'Repository' } & Pick<Repository, 'full_name' | 'html_url'> & ({ __typename?: 'Repository' } & Pick<Repository, 'description' | 'open_issues_count' | 'stargazers_count'>)) })> });

export type CommentsPageCommentFragment = ({ __typename?: 'Comment' } & Pick<Comment, 'id' | 'createdAt' | 'content'> & { postedBy: ({ __typename?: 'User' } & Pick<User, 'login' | 'html_url'>) });

export type CurrentUserForProfileQueryVariables = {};


export type CurrentUserForProfileQueryMyOperation = ({ __typename?: 'Query' } & { currentUser: Maybe<({ __typename?: 'User' } & Pick<User, 'login' | 'avatar_url'>)> });

export type FeedEntryFragment = ({ __typename?: 'Entry' } & Pick<Entry, 'id' | 'commentCount'> & { repository: ({ __typename?: 'Repository' } & Pick<Repository, 'full_name' | 'html_url'> & { owner: Maybe<({ __typename?: 'User' } & Pick<User, 'avatar_url'>)> }) } & (VoteButtonsFragment & RepoInfoFragment));

export type FeedQueryVariables = {
  type: FeedType,
  offset?: Maybe<Scalars['Int']>,
  limit?: Maybe<Scalars['Int']>
};


export type FeedQueryMyOperation = ({ __typename?: 'Query' } & { currentUser: Maybe<({ __typename?: 'User' } & Pick<User, 'login'>)>, feed: Maybe<Array<Maybe<({ __typename?: 'Entry' } & FeedEntryFragment)>>> });

export type SubmitRepositoryMutationVariables = {
  repoFullName: Scalars['String']
};


export type SubmitRepositoryMutationMyOperation = ({ __typename?: 'Mutation' } & { submitRepository: Maybe<({ __typename?: 'Entry' } & Pick<Entry, 'createdAt'>)> });

export type RepoInfoFragment = ({ __typename?: 'Entry' } & Pick<Entry, 'createdAt'> & { repository: ({ __typename?: 'Repository' } & Pick<Repository, 'description' | 'stargazers_count' | 'open_issues_count'>), postedBy: ({ __typename?: 'User' } & Pick<User, 'html_url' | 'login'>) });

export type SubmitCommentMutationVariables = {
  repoFullName: Scalars['String'],
  commentContent: Scalars['String']
};


export type SubmitCommentMutationMyOperation = ({ __typename?: 'Mutation' } & { submitComment: Maybe<({ __typename?: 'Comment' } & CommentsPageCommentFragment)> });

export type VoteButtonsFragment = ({ __typename?: 'Entry' } & Pick<Entry, 'score'> & { vote: ({ __typename?: 'Vote' } & Pick<Vote, 'vote_value'>) });

export type VoteMutationVariables = {
  repoFullName: Scalars['String'],
  type: VoteType
};


export type VoteMutationMyOperation = ({ __typename?: 'Mutation' } & { vote: Maybe<({ __typename?: 'Entry' } & Pick<Entry, 'score' | 'id'> & { vote: ({ __typename?: 'Vote' } & Pick<Vote, 'vote_value'>) })> });
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
export type OnCommentAddedComponentProps = Omit<ReactApollo.SubscriptionProps<OnCommentAddedSubscriptionMyOperation, OnCommentAddedSubscriptionVariables>, 'subscription'>;

    export const OnCommentAddedComponent = (props: OnCommentAddedComponentProps) => (
      <ReactApollo.Subscription<OnCommentAddedSubscriptionMyOperation, OnCommentAddedSubscriptionVariables> subscription={OnCommentAddedDocument} {...props} />
    );
    
export type OnCommentAddedProps<TChildProps = {}> = Partial<ReactApollo.DataProps<OnCommentAddedSubscriptionMyOperation, OnCommentAddedSubscriptionVariables>> & TChildProps;
export function withOnCommentAdded<TProps, TChildProps = {}>(operationOptions?: ReactApollo.OperationOption<
  TProps,
  OnCommentAddedSubscriptionMyOperation,
  OnCommentAddedSubscriptionVariables,
  OnCommentAddedProps<TChildProps>>) {
    return ReactApollo.withSubscription<TProps, OnCommentAddedSubscriptionMyOperation, OnCommentAddedSubscriptionVariables, OnCommentAddedProps<TChildProps>>(OnCommentAddedDocument, {
      alias: 'withOnCommentAdded',
      ...operationOptions
    });
};
export type OnCommentAddedSubscriptionResult = ReactApollo.SubscriptionResult<OnCommentAddedSubscriptionMyOperation>;
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
export type CommentComponentProps = Omit<ReactApollo.QueryProps<CommentQueryMyOperation, CommentQueryVariables>, 'query'> & ({ variables: CommentQueryVariables; skip?: boolean; } | { skip: boolean; });

    export const CommentComponent = (props: CommentComponentProps) => (
      <ReactApollo.Query<CommentQueryMyOperation, CommentQueryVariables> query={CommentDocument} {...props} />
    );
    
export type CommentProps<TChildProps = {}> = Partial<ReactApollo.DataProps<CommentQueryMyOperation, CommentQueryVariables>> & TChildProps;
export function withComment<TProps, TChildProps = {}>(operationOptions?: ReactApollo.OperationOption<
  TProps,
  CommentQueryMyOperation,
  CommentQueryVariables,
  CommentProps<TChildProps>>) {
    return ReactApollo.withQuery<TProps, CommentQueryMyOperation, CommentQueryVariables, CommentProps<TChildProps>>(CommentDocument, {
      alias: 'withComment',
      ...operationOptions
    });
};
export type CommentQueryResult = ReactApollo.QueryResult<CommentQueryMyOperation, CommentQueryVariables>;
export const CurrentUserForProfileDocument = gql`
    query CurrentUserForProfile {
  currentUser {
    login
    avatar_url
  }
}
    `;
export type CurrentUserForProfileComponentProps = Omit<ReactApollo.QueryProps<CurrentUserForProfileQueryMyOperation, CurrentUserForProfileQueryVariables>, 'query'>;

    export const CurrentUserForProfileComponent = (props: CurrentUserForProfileComponentProps) => (
      <ReactApollo.Query<CurrentUserForProfileQueryMyOperation, CurrentUserForProfileQueryVariables> query={CurrentUserForProfileDocument} {...props} />
    );
    
export type CurrentUserForProfileProps<TChildProps = {}> = Partial<ReactApollo.DataProps<CurrentUserForProfileQueryMyOperation, CurrentUserForProfileQueryVariables>> & TChildProps;
export function withCurrentUserForProfile<TProps, TChildProps = {}>(operationOptions?: ReactApollo.OperationOption<
  TProps,
  CurrentUserForProfileQueryMyOperation,
  CurrentUserForProfileQueryVariables,
  CurrentUserForProfileProps<TChildProps>>) {
    return ReactApollo.withQuery<TProps, CurrentUserForProfileQueryMyOperation, CurrentUserForProfileQueryVariables, CurrentUserForProfileProps<TChildProps>>(CurrentUserForProfileDocument, {
      alias: 'withCurrentUserForProfile',
      ...operationOptions
    });
};
export type CurrentUserForProfileQueryResult = ReactApollo.QueryResult<CurrentUserForProfileQueryMyOperation, CurrentUserForProfileQueryVariables>;
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
export type FeedComponentProps = Omit<ReactApollo.QueryProps<FeedQueryMyOperation, FeedQueryVariables>, 'query'> & ({ variables: FeedQueryVariables; skip?: boolean; } | { skip: boolean; });

    export const FeedComponent = (props: FeedComponentProps) => (
      <ReactApollo.Query<FeedQueryMyOperation, FeedQueryVariables> query={FeedDocument} {...props} />
    );
    
export type FeedProps<TChildProps = {}> = Partial<ReactApollo.DataProps<FeedQueryMyOperation, FeedQueryVariables>> & TChildProps;
export function withFeed<TProps, TChildProps = {}>(operationOptions?: ReactApollo.OperationOption<
  TProps,
  FeedQueryMyOperation,
  FeedQueryVariables,
  FeedProps<TChildProps>>) {
    return ReactApollo.withQuery<TProps, FeedQueryMyOperation, FeedQueryVariables, FeedProps<TChildProps>>(FeedDocument, {
      alias: 'withFeed',
      ...operationOptions
    });
};
export type FeedQueryResult = ReactApollo.QueryResult<FeedQueryMyOperation, FeedQueryVariables>;
export const SubmitRepositoryDocument = gql`
    mutation submitRepository($repoFullName: String!) {
  submitRepository(repoFullName: $repoFullName) {
    createdAt
  }
}
    `;
export type SubmitRepositoryMutationFn = ReactApollo.MutationFn<SubmitRepositoryMutationMyOperation, SubmitRepositoryMutationVariables>;
export type SubmitRepositoryComponentProps = Omit<ReactApollo.MutationProps<SubmitRepositoryMutationMyOperation, SubmitRepositoryMutationVariables>, 'mutation'>;

    export const SubmitRepositoryComponent = (props: SubmitRepositoryComponentProps) => (
      <ReactApollo.Mutation<SubmitRepositoryMutationMyOperation, SubmitRepositoryMutationVariables> mutation={SubmitRepositoryDocument} {...props} />
    );
    
export type SubmitRepositoryProps<TChildProps = {}> = Partial<ReactApollo.MutateProps<SubmitRepositoryMutationMyOperation, SubmitRepositoryMutationVariables>> & TChildProps;
export function withSubmitRepository<TProps, TChildProps = {}>(operationOptions?: ReactApollo.OperationOption<
  TProps,
  SubmitRepositoryMutationMyOperation,
  SubmitRepositoryMutationVariables,
  SubmitRepositoryProps<TChildProps>>) {
    return ReactApollo.withMutation<TProps, SubmitRepositoryMutationMyOperation, SubmitRepositoryMutationVariables, SubmitRepositoryProps<TChildProps>>(SubmitRepositoryDocument, {
      alias: 'withSubmitRepository',
      ...operationOptions
    });
};
export type SubmitRepositoryMutationResult = ReactApollo.MutationResult<SubmitRepositoryMutationMyOperation>;
export type SubmitRepositoryMutationOptions = ReactApollo.MutationOptions<SubmitRepositoryMutationMyOperation, SubmitRepositoryMutationVariables>;
export const SubmitCommentDocument = gql`
    mutation submitComment($repoFullName: String!, $commentContent: String!) {
  submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {
    ...CommentsPageComment
  }
}
    ${CommentsPageCommentFragmentDoc}`;
export type SubmitCommentMutationFn = ReactApollo.MutationFn<SubmitCommentMutationMyOperation, SubmitCommentMutationVariables>;
export type SubmitCommentComponentProps = Omit<ReactApollo.MutationProps<SubmitCommentMutationMyOperation, SubmitCommentMutationVariables>, 'mutation'>;

    export const SubmitCommentComponent = (props: SubmitCommentComponentProps) => (
      <ReactApollo.Mutation<SubmitCommentMutationMyOperation, SubmitCommentMutationVariables> mutation={SubmitCommentDocument} {...props} />
    );
    
export type SubmitCommentProps<TChildProps = {}> = Partial<ReactApollo.MutateProps<SubmitCommentMutationMyOperation, SubmitCommentMutationVariables>> & TChildProps;
export function withSubmitComment<TProps, TChildProps = {}>(operationOptions?: ReactApollo.OperationOption<
  TProps,
  SubmitCommentMutationMyOperation,
  SubmitCommentMutationVariables,
  SubmitCommentProps<TChildProps>>) {
    return ReactApollo.withMutation<TProps, SubmitCommentMutationMyOperation, SubmitCommentMutationVariables, SubmitCommentProps<TChildProps>>(SubmitCommentDocument, {
      alias: 'withSubmitComment',
      ...operationOptions
    });
};
export type SubmitCommentMutationResult = ReactApollo.MutationResult<SubmitCommentMutationMyOperation>;
export type SubmitCommentMutationOptions = ReactApollo.MutationOptions<SubmitCommentMutationMyOperation, SubmitCommentMutationVariables>;
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
export type VoteMutationFn = ReactApollo.MutationFn<VoteMutationMyOperation, VoteMutationVariables>;
export type VoteComponentProps = Omit<ReactApollo.MutationProps<VoteMutationMyOperation, VoteMutationVariables>, 'mutation'>;

    export const VoteComponent = (props: VoteComponentProps) => (
      <ReactApollo.Mutation<VoteMutationMyOperation, VoteMutationVariables> mutation={VoteDocument} {...props} />
    );
    
export type VoteProps<TChildProps = {}> = Partial<ReactApollo.MutateProps<VoteMutationMyOperation, VoteMutationVariables>> & TChildProps;
export function withVote<TProps, TChildProps = {}>(operationOptions?: ReactApollo.OperationOption<
  TProps,
  VoteMutationMyOperation,
  VoteMutationVariables,
  VoteProps<TChildProps>>) {
    return ReactApollo.withMutation<TProps, VoteMutationMyOperation, VoteMutationVariables, VoteProps<TChildProps>>(VoteDocument, {
      alias: 'withVote',
      ...operationOptions
    });
};
export type VoteMutationResult = ReactApollo.MutationResult<VoteMutationMyOperation>;
export type VoteMutationOptions = ReactApollo.MutationOptions<VoteMutationMyOperation, VoteMutationVariables>;