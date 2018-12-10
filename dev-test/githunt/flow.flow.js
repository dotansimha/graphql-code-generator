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

export const FeedTypeValues = {
  HOT: 'HOT', 
  NEW: 'NEW', 
  TOP: 'TOP'
};
export type FeedType = $Values<typeof FeedTypeValues>;

export type Mutation = {
  submitRepository: ?Entry,
  vote: ?Entry,
  submitComment: ?Comment,
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
  feed: ?Array<?Entry>,
  entry: ?Entry,
  currentUser: ?User,
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
  description: ?string,
  html_url: string,
  stargazers_count: number,
  open_issues_count: ?number,
  owner: ?User,
};

export type Subscription = {
  commentAdded: ?Comment,
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

export const VoteTypeValues = {
  UP: 'UP', 
  DOWN: 'DOWN', 
  CANCEL: 'CANCEL'
};
export type VoteType = $Values<typeof VoteTypeValues>;
type $Pick<Origin: Object, Keys: Object> = $ObjMapi<Keys, <Key>(k: Key) => $ElementType<Origin, Key>>;

export type OnCommentAddedSubscriptionVariables = {
  repoFullName: string
};


export type OnCommentAddedSubscription = { commentAdded: ($Pick<Comment, { id: *, createdAt: *, content: * }> & { postedBy: $Pick<User, { login: *, html_url: * }> }) };

export type CommentQueryVariables = {
  repoFullName: string,
  limit?: ?number,
  offset?: ?number
};


export type CommentQuery = { currentUser: $Pick<User, { login: *, html_url: * }>, entry: ($Pick<Entry, { id: *, createdAt: *, commentCount: * }> & { postedBy: $Pick<User, { login: *, html_url: * }>, comments: CommentsPageCommentFragment, repository: ($Pick<Repository, { full_name: *, html_url: * }> & ($Pick<Repository, { description: *, open_issues_count: *, stargazers_count: * }>)) }) };

export type CommentsPageCommentFragment = ($Pick<Comment, { id: *, createdAt: *, content: * }> & { postedBy: $Pick<User, { login: *, html_url: * }> });

export type CurrentUserForProfileQueryVariables = {};


export type CurrentUserForProfileQuery = { currentUser: $Pick<User, { login: *, avatar_url: * }> };

export type FeedEntryFragment = ((VoteButtonsFragment & RepoInfoFragment) & $Pick<Entry, { id: *, commentCount: * }> & { repository: ($Pick<Repository, { full_name: *, html_url: * }> & { owner: $Pick<User, { avatar_url: * }> }) });

export type FeedQueryVariables = {
  type: FeedType,
  offset?: ?number,
  limit?: ?number
};


export type FeedQuery = { currentUser: $Pick<User, { login: * }>, feed: FeedEntryFragment };

export type SubmitRepositoryMutationVariables = {
  repoFullName: string
};


export type SubmitRepositoryMutation = { submitRepository: $Pick<Entry, { createdAt: * }> };

export type RepoInfoFragment = ($Pick<Entry, { createdAt: * }> & { repository: $Pick<Repository, { description: *, stargazers_count: *, open_issues_count: * }>, postedBy: $Pick<User, { html_url: *, login: * }> });

export type SubmitCommentMutationVariables = {
  repoFullName: string,
  commentContent: string
};


export type SubmitCommentMutation = { submitComment: CommentsPageCommentFragment };

export type VoteButtonsFragment = ($Pick<Entry, { score: * }> & { vote: $Pick<Vote, { vote_value: * }> });

export type VoteMutationVariables = {
  repoFullName: string,
  type: VoteType
};


export type VoteMutation = { vote: ($Pick<Entry, { score: *, id: * }> & { vote: $Pick<Vote, { vote_value: * }> }) };
