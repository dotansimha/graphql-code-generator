type Maybe<T> = T | null;
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
};

export type Comment = {
  readonly id: Scalars['Int'],
  readonly postedBy: User,
  readonly createdAt: Scalars['Float'],
  readonly content: Scalars['String'],
  readonly repoName: Scalars['String'],
};

export type Entry = {
  readonly repository: Repository,
  readonly postedBy: User,
  readonly createdAt: Scalars['Float'],
  readonly score: Scalars['Int'],
  readonly hotScore: Scalars['Float'],
  readonly comments: ReadonlyArray<Maybe<Comment>>,
  readonly commentCount: Scalars['Int'],
  readonly id: Scalars['Int'],
  readonly vote: Vote,
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
  readonly submitRepository?: Maybe<Entry>,
  readonly vote?: Maybe<Entry>,
  readonly submitComment?: Maybe<Comment>,
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
  readonly feed?: Maybe<ReadonlyArray<Maybe<Entry>>>,
  readonly entry?: Maybe<Entry>,
  readonly currentUser?: Maybe<User>,
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
  readonly name: Scalars['String'],
  readonly full_name: Scalars['String'],
  readonly description?: Maybe<Scalars['String']>,
  readonly html_url: Scalars['String'],
  readonly stargazers_count: Scalars['Int'],
  readonly open_issues_count?: Maybe<Scalars['Int']>,
  readonly owner?: Maybe<User>,
};

export type Subscription = {
  readonly commentAdded?: Maybe<Comment>,
};


export type SubscriptionCommentAddedArgs = {
  repoFullName: Scalars['String']
};

export type User = {
  readonly login: Scalars['String'],
  readonly avatar_url: Scalars['String'],
  readonly html_url: Scalars['String'],
};

export type Vote = {
  readonly vote_value: Scalars['Int'],
};

export enum VoteType {
  Up = 'UP',
  Down = 'DOWN',
  Cancel = 'CANCEL'
}
export type OnCommentAddedSubscriptionVariables = {
  repoFullName: Scalars['String']
};


export type OnCommentAddedSubscription = ({ readonly __typename?: 'Subscription' } & { readonly commentAdded: Maybe<({ readonly __typename?: 'Comment' } & Pick<Comment, 'id' | 'createdAt' | 'content'> & { readonly postedBy: ({ readonly __typename?: 'User' } & Pick<User, 'login' | 'html_url'>) })> });

export type CommentQueryVariables = {
  repoFullName: Scalars['String'],
  limit?: Maybe<Scalars['Int']>,
  offset?: Maybe<Scalars['Int']>
};


export type CommentQuery = ({ readonly __typename?: 'Query' } & { readonly currentUser: Maybe<({ readonly __typename?: 'User' } & Pick<User, 'login' | 'html_url'>)>, readonly entry: Maybe<({ readonly __typename?: 'Entry' } & Pick<Entry, 'id' | 'createdAt' | 'commentCount'> & { readonly postedBy: ({ readonly __typename?: 'User' } & Pick<User, 'login' | 'html_url'>), readonly comments: ReadonlyArray<Maybe<({ readonly __typename?: 'Comment' } & CommentsPageCommentFragment)>>, readonly repository: ({ readonly __typename?: 'Repository' } & Pick<Repository, 'full_name' | 'html_url'> & (({ readonly __typename?: 'Repository' } & Pick<Repository, 'description' | 'open_issues_count' | 'stargazers_count'>))) })> });

export type CommentsPageCommentFragment = ({ readonly __typename?: 'Comment' } & Pick<Comment, 'id' | 'createdAt' | 'content'> & { readonly postedBy: ({ readonly __typename?: 'User' } & Pick<User, 'login' | 'html_url'>) });

export type CurrentUserForProfileQueryVariables = {};


export type CurrentUserForProfileQuery = ({ readonly __typename?: 'Query' } & { readonly currentUser: Maybe<({ readonly __typename?: 'User' } & Pick<User, 'login' | 'avatar_url'>)> });

export type FeedEntryFragment = ({ readonly __typename?: 'Entry' } & Pick<Entry, 'id' | 'commentCount'> & { readonly repository: ({ readonly __typename?: 'Repository' } & Pick<Repository, 'full_name' | 'html_url'> & { readonly owner: Maybe<({ readonly __typename?: 'User' } & Pick<User, 'avatar_url'>)> }) } & (VoteButtonsFragment & RepoInfoFragment));

export type FeedQueryVariables = {
  type: FeedType,
  offset?: Maybe<Scalars['Int']>,
  limit?: Maybe<Scalars['Int']>
};


export type FeedQuery = ({ readonly __typename?: 'Query' } & { readonly currentUser: Maybe<({ readonly __typename?: 'User' } & Pick<User, 'login'>)>, readonly feed: Maybe<ReadonlyArray<Maybe<({ readonly __typename?: 'Entry' } & FeedEntryFragment)>>> });

export type SubmitRepositoryMutationVariables = {
  repoFullName: Scalars['String']
};


export type SubmitRepositoryMutation = ({ readonly __typename?: 'Mutation' } & { readonly submitRepository: Maybe<({ readonly __typename?: 'Entry' } & Pick<Entry, 'createdAt'>)> });

export type RepoInfoFragment = ({ readonly __typename?: 'Entry' } & Pick<Entry, 'createdAt'> & { readonly repository: ({ readonly __typename?: 'Repository' } & Pick<Repository, 'description' | 'stargazers_count' | 'open_issues_count'>), readonly postedBy: ({ readonly __typename?: 'User' } & Pick<User, 'html_url' | 'login'>) });

export type SubmitCommentMutationVariables = {
  repoFullName: Scalars['String'],
  commentContent: Scalars['String']
};


export type SubmitCommentMutation = ({ readonly __typename?: 'Mutation' } & { readonly submitComment: Maybe<({ readonly __typename?: 'Comment' } & CommentsPageCommentFragment)> });

export type VoteButtonsFragment = ({ readonly __typename?: 'Entry' } & Pick<Entry, 'score'> & { readonly vote: ({ readonly __typename?: 'Vote' } & Pick<Vote, 'vote_value'>) });

export type VoteMutationVariables = {
  repoFullName: Scalars['String'],
  type: VoteType
};


export type VoteMutation = ({ readonly __typename?: 'Mutation' } & { readonly vote: Maybe<({ readonly __typename?: 'Entry' } & Pick<Entry, 'score' | 'id'> & { readonly vote: ({ readonly __typename?: 'Vote' } & Pick<Vote, 'vote_value'>) })> });
