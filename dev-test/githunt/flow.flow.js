/* @flow */

export type Comment = {
  id: number,
  postedBy: User,
  createdAt: number,
  content: string,
  repoName: string,
};

export type Entry = {
  repository: Repository,
  postedBy: User,
  createdAt: number,
  score: number,
  hotScore: number,
  comments: Array<?Comment>,
  commentCount: number,
  id: number,
  vote: Vote,
};


export type EntryCommentsArgs = {
  limit?: ?number,
  offset?: ?number
};

export const FeedTypeValues = Object.freeze({
  Hot: 'HOT', 
  New: 'NEW', 
  Top: 'TOP'
});


export type FeedType = $Values<typeof FeedTypeValues>;

export type Mutation = {
  submitRepository?: ?Entry,
  vote?: ?Entry,
  submitComment?: ?Comment,
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
  feed?: ?Array<?Entry>,
  entry?: ?Entry,
  currentUser?: ?User,
};


export type QueryFeedArgs = {
  type: FeedType,
  offset?: ?number,
  limit?: ?number
};


export type QueryEntryArgs = {
  repoFullName: string
};

export type Repository = {
  name: string,
  full_name: string,
  description?: ?string,
  html_url: string,
  stargazers_count: number,
  open_issues_count?: ?number,
  owner?: ?User,
};

export type Subscription = {
  commentAdded?: ?Comment,
};


export type SubscriptionCommentAddedArgs = {
  repoFullName: string
};

export type User = {
  login: string,
  avatar_url: string,
  html_url: string,
};

export type Vote = {
  vote_value: number,
};

export const VoteTypeValues = Object.freeze({
  Up: 'UP', 
  Down: 'DOWN', 
  Cancel: 'CANCEL'
});


export type VoteType = $Values<typeof VoteTypeValues>;
type $Pick<Origin: Object, Keys: Object> = $ObjMapi<Keys, <Key>(k: Key) => $ElementType<Origin, Key>>;

export type OnCommentAddedSubscriptionVariables = {
  repoFullName: string
};


export type OnCommentAddedSubscription = ({ __typename?: 'Subscription' } & { commentAdded: ?({ __typename?: 'Comment' } & $Pick<Comment, { id: *, createdAt: *, content: * }> & { postedBy: ({ __typename?: 'User' } & $Pick<User, { login: *, html_url: * }>) }) });

export type CommentQueryVariables = {
  repoFullName: string,
  limit?: ?number,
  offset?: ?number
};


export type CommentQuery = ({ __typename?: 'Query' } & { currentUser: ?({ __typename?: 'User' } & $Pick<User, { login: *, html_url: * }>), entry: ?({ __typename?: 'Entry' } & $Pick<Entry, { id: *, createdAt: *, commentCount: * }> & { postedBy: ({ __typename?: 'User' } & $Pick<User, { login: *, html_url: * }>), comments: Array<?({ __typename?: 'Comment' } & CommentsPageCommentFragment)>, repository: ({ __typename?: 'Repository' } & $Pick<Repository, { full_name: *, html_url: * }> & (({ __typename?: 'Repository' } & $Pick<Repository, { description: *, open_issues_count: *, stargazers_count: * }>))) }) });

export type CommentsPageCommentFragment = ({ __typename?: 'Comment' } & $Pick<Comment, { id: *, createdAt: *, content: * }> & { postedBy: ({ __typename?: 'User' } & $Pick<User, { login: *, html_url: * }>) });

export type CurrentUserForProfileQueryVariables = {};


export type CurrentUserForProfileQuery = ({ __typename?: 'Query' } & { currentUser: ?({ __typename?: 'User' } & $Pick<User, { login: *, avatar_url: * }>) });

export type FeedEntryFragment = ({ __typename?: 'Entry' } & $Pick<Entry, { id: *, commentCount: * }> & { repository: ({ __typename?: 'Repository' } & $Pick<Repository, { full_name: *, html_url: * }> & { owner: ?({ __typename?: 'User' } & $Pick<User, { avatar_url: * }>) }) } & (VoteButtonsFragment & RepoInfoFragment));

export type FeedQueryVariables = {
  type: FeedType,
  offset?: ?number,
  limit?: ?number
};


export type FeedQuery = ({ __typename?: 'Query' } & { currentUser: ?({ __typename?: 'User' } & $Pick<User, { login: * }>), feed: ?Array<?({ __typename?: 'Entry' } & FeedEntryFragment)> });

export type SubmitRepositoryMutationVariables = {
  repoFullName: string
};


export type SubmitRepositoryMutation = ({ __typename?: 'Mutation' } & { submitRepository: ?({ __typename?: 'Entry' } & $Pick<Entry, { createdAt: * }>) });

export type RepoInfoFragment = ({ __typename?: 'Entry' } & $Pick<Entry, { createdAt: * }> & { repository: ({ __typename?: 'Repository' } & $Pick<Repository, { description: *, stargazers_count: *, open_issues_count: * }>), postedBy: ({ __typename?: 'User' } & $Pick<User, { html_url: *, login: * }>) });

export type SubmitCommentMutationVariables = {
  repoFullName: string,
  commentContent: string
};


export type SubmitCommentMutation = ({ __typename?: 'Mutation' } & { submitComment: ?({ __typename?: 'Comment' } & CommentsPageCommentFragment) });

export type VoteButtonsFragment = ({ __typename?: 'Entry' } & $Pick<Entry, { score: * }> & { vote: ({ __typename?: 'Vote' } & $Pick<Vote, { vote_value: * }>) });

export type VoteMutationVariables = {
  repoFullName: string,
  type: VoteType
};


export type VoteMutation = ({ __typename?: 'Mutation' } & { vote: ?({ __typename?: 'Entry' } & $Pick<Entry, { score: *, id: * }> & { vote: ({ __typename?: 'Vote' } & $Pick<Vote, { vote_value: * }>) }) });
