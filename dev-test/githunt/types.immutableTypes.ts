type Maybe<T> = T | null;
export type Comment = {
  readonly id: number,
  readonly postedBy: User,
  readonly createdAt: number,
  readonly content: string,
  readonly repoName: string,
};

export type Entry = {
  readonly repository: Repository,
  readonly postedBy: User,
  readonly createdAt: number,
  readonly score: number,
  readonly hotScore: number,
  readonly comments: ReadonlyArray<Maybe<Comment>>,
  readonly commentCount: number,
  readonly id: number,
  readonly vote: Vote,
};


export type EntryCommentsArgs = {
  limit?: Maybe<number>,
  offset?: Maybe<number>
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
  repoFullName: string
};


export type MutationVoteArgs = {
  repoFullName: string,
  type: VoteType
};


export type MutationSubmitCommentArgs = {
  repoFullName: string,
  commentContent: string
};

export type Query = {
  readonly feed?: Maybe<ReadonlyArray<Maybe<Entry>>>,
  readonly entry?: Maybe<Entry>,
  readonly currentUser?: Maybe<User>,
};


export type QueryFeedArgs = {
  type: FeedType,
  offset?: Maybe<number>,
  limit?: Maybe<number>
};


export type QueryEntryArgs = {
  repoFullName: string
};

export type Repository = {
  readonly name: string,
  readonly full_name: string,
  readonly description?: Maybe<string>,
  readonly html_url: string,
  readonly stargazers_count: number,
  readonly open_issues_count?: Maybe<number>,
  readonly owner?: Maybe<User>,
};

export type Subscription = {
  readonly commentAdded?: Maybe<Comment>,
};


export type SubscriptionCommentAddedArgs = {
  repoFullName: string
};

export type User = {
  readonly login: string,
  readonly avatar_url: string,
  readonly html_url: string,
};

export type Vote = {
  readonly vote_value: number,
};

export enum VoteType {
  Up = 'UP',
  Down = 'DOWN',
  Cancel = 'CANCEL'
}
export type OnCommentAddedSubscriptionVariables = {
  repoFullName: string
};


export type OnCommentAddedSubscription = ({ readonly __typename?: 'Subscription' } & { readonly commentAdded: Maybe<({ readonly __typename?: 'Comment' } & Pick<Comment, 'id' | 'createdAt' | 'content'> & { readonly postedBy: ({ readonly __typename?: 'User' } & Pick<User, 'login' | 'html_url'>) })> });

export type CommentQueryVariables = {
  repoFullName: string,
  limit?: Maybe<number>,
  offset?: Maybe<number>
};


export type CommentQuery = ({ readonly __typename?: 'Query' } & { readonly currentUser: Maybe<({ readonly __typename?: 'User' } & Pick<User, 'login' | 'html_url'>)>, readonly entry: Maybe<({ readonly __typename?: 'Entry' } & Pick<Entry, 'id' | 'createdAt' | 'commentCount'> & { readonly postedBy: ({ readonly __typename?: 'User' } & Pick<User, 'login' | 'html_url'>), readonly comments: ReadonlyArray<Maybe<({ readonly __typename?: 'Comment' } & CommentsPageCommentFragment)>>, readonly repository: ({ readonly __typename?: 'Repository' } & Pick<Repository, 'full_name' | 'html_url'> & (({ readonly __typename?: 'Repository' } & Pick<Repository, 'description' | 'open_issues_count' | 'stargazers_count'>))) })> });

export type CommentsPageCommentFragment = ({ readonly __typename?: 'Comment' } & Pick<Comment, 'id' | 'createdAt' | 'content'> & { readonly postedBy: ({ readonly __typename?: 'User' } & Pick<User, 'login' | 'html_url'>) });

export type CurrentUserForProfileQueryVariables = {};


export type CurrentUserForProfileQuery = ({ readonly __typename?: 'Query' } & { readonly currentUser: Maybe<({ readonly __typename?: 'User' } & Pick<User, 'login' | 'avatar_url'>)> });

export type FeedEntryFragment = ({ readonly __typename?: 'Entry' } & Pick<Entry, 'id' | 'commentCount'> & { readonly repository: ({ readonly __typename?: 'Repository' } & Pick<Repository, 'full_name' | 'html_url'> & { readonly owner: Maybe<({ readonly __typename?: 'User' } & Pick<User, 'avatar_url'>)> }) } & (VoteButtonsFragment & RepoInfoFragment));

export type FeedQueryVariables = {
  type: FeedType,
  offset?: Maybe<number>,
  limit?: Maybe<number>
};


export type FeedQuery = ({ readonly __typename?: 'Query' } & { readonly currentUser: Maybe<({ readonly __typename?: 'User' } & Pick<User, 'login'>)>, readonly feed: Maybe<ReadonlyArray<Maybe<({ readonly __typename?: 'Entry' } & FeedEntryFragment)>>> });

export type SubmitRepositoryMutationVariables = {
  repoFullName: string
};


export type SubmitRepositoryMutation = ({ readonly __typename?: 'Mutation' } & { readonly submitRepository: Maybe<({ readonly __typename?: 'Entry' } & Pick<Entry, 'createdAt'>)> });

export type RepoInfoFragment = ({ readonly __typename?: 'Entry' } & Pick<Entry, 'createdAt'> & { readonly repository: ({ readonly __typename?: 'Repository' } & Pick<Repository, 'description' | 'stargazers_count' | 'open_issues_count'>), readonly postedBy: ({ readonly __typename?: 'User' } & Pick<User, 'html_url' | 'login'>) });

export type SubmitCommentMutationVariables = {
  repoFullName: string,
  commentContent: string
};


export type SubmitCommentMutation = ({ readonly __typename?: 'Mutation' } & { readonly submitComment: Maybe<({ readonly __typename?: 'Comment' } & CommentsPageCommentFragment)> });

export type VoteButtonsFragment = ({ readonly __typename?: 'Entry' } & Pick<Entry, 'score'> & { readonly vote: ({ readonly __typename?: 'Vote' } & Pick<Vote, 'vote_value'>) });

export type VoteMutationVariables = {
  repoFullName: string,
  type: VoteType
};


export type VoteMutation = ({ readonly __typename?: 'Mutation' } & { readonly vote: Maybe<({ readonly __typename?: 'Entry' } & Pick<Entry, 'score' | 'id'> & { readonly vote: ({ readonly __typename?: 'Vote' } & Pick<Vote, 'vote_value'>) })> });
