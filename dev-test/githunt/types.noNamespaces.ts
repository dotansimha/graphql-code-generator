export type Maybe<T> = T | null;

/** A list of options for the sort order of the feed */
export enum FeedType {
  Hot = 'HOT',
  New = 'NEW',
  Top = 'TOP'
}
/** The type of vote to record, when submitting a vote */
export enum VoteType {
  Up = 'UP',
  Down = 'DOWN',
  Cancel = 'CANCEL'
}

// ====================================================
// Documents
// ====================================================

export type OnCommentAddedVariables = {
  repoFullName: string;
};

export type OnCommentAddedSubscription = {
  __typename?: 'Subscription';

  commentAdded: Maybe<OnCommentAddedCommentAdded>;
};

export type OnCommentAddedCommentAdded = {
  __typename?: 'Comment';

  id: number;

  postedBy: OnCommentAddedPostedBy;

  createdAt: number;

  content: string;
};

export type OnCommentAddedPostedBy = {
  __typename?: 'User';

  login: string;

  html_url: string;
};

export type CommentVariables = {
  repoFullName: string;
  limit?: Maybe<number>;
  offset?: Maybe<number>;
};

export type CommentQuery = {
  __typename?: 'Query';

  currentUser: Maybe<CommentCurrentUser>;

  entry: Maybe<CommentEntry>;
};

export type CommentCurrentUser = {
  __typename?: 'User';

  login: string;

  html_url: string;
};

export type CommentEntry = {
  __typename?: 'Entry';

  id: number;

  postedBy: CommentPostedBy;

  createdAt: number;

  comments: CommentComments[];

  commentCount: number;

  repository: CommentRepository;
};

export type CommentPostedBy = {
  __typename?: 'User';

  login: string;

  html_url: string;
};

export type CommentComments = CommentsPageCommentFragment;

export type CommentRepository = {
  __typename?: CommentRepositoryInlineFragment['__typename'];

  full_name: string;

  html_url: string;
} & CommentRepositoryInlineFragment;

export type CommentRepositoryInlineFragment = {
  __typename?: 'Repository';

  description: Maybe<string>;

  open_issues_count: Maybe<number>;

  stargazers_count: number;
};

export type CurrentUserForProfileVariables = {};

export type CurrentUserForProfileQuery = {
  __typename?: 'Query';

  currentUser: Maybe<CurrentUserForProfileCurrentUser>;
};

export type CurrentUserForProfileCurrentUser = {
  __typename?: 'User';

  login: string;

  avatar_url: string;
};

export type FeedVariables = {
  type: FeedType;
  offset?: Maybe<number>;
  limit?: Maybe<number>;
};

export type FeedQuery = {
  __typename?: 'Query';

  currentUser: Maybe<FeedCurrentUser>;

  feed: Maybe<FeedFeed[]>;
};

export type FeedCurrentUser = {
  __typename?: 'User';

  login: string;
};

export type FeedFeed = FeedEntryFragment;

export type SubmitRepositoryVariables = {
  repoFullName: string;
};

export type SubmitRepositoryMutation = {
  __typename?: 'Mutation';

  submitRepository: Maybe<SubmitRepositorySubmitRepository>;
};

export type SubmitRepositorySubmitRepository = {
  __typename?: 'Entry';

  createdAt: number;
};

export type SubmitCommentVariables = {
  repoFullName: string;
  commentContent: string;
};

export type SubmitCommentMutation = {
  __typename?: 'Mutation';

  submitComment: Maybe<SubmitCommentSubmitComment>;
};

export type SubmitCommentSubmitComment = CommentsPageCommentFragment;

export type VoteVariables = {
  repoFullName: string;
  type: VoteType;
};

export type VoteMutation = {
  __typename?: 'Mutation';

  vote: Maybe<VoteVote>;
};

export type VoteVote = {
  __typename?: 'Entry';

  score: number;

  id: number;

  vote: Vote_Vote;
};

export type Vote_Vote = {
  __typename?: 'Vote';

  vote_value: number;
};

export type CommentsPageCommentFragment = {
  __typename?: 'Comment';

  id: number;

  postedBy: CommentsPageCommentPostedBy;

  createdAt: number;

  content: string;
};

export type CommentsPageCommentPostedBy = {
  __typename?: 'User';

  login: string;

  html_url: string;
};

export type FeedEntryFragment = {
  __typename?: 'Entry';

  id: number;

  commentCount: number;

  repository: FeedEntryRepository;
} & (VoteButtonsFragment & RepoInfoFragment);

export type FeedEntryRepository = {
  __typename?: 'Repository';

  full_name: string;

  html_url: string;

  owner: Maybe<FeedEntryOwner>;
};

export type FeedEntryOwner = {
  __typename?: 'User';

  avatar_url: string;
};

export type RepoInfoFragment = {
  __typename?: 'Entry';

  createdAt: number;

  repository: RepoInfoRepository;

  postedBy: RepoInfoPostedBy;
};

export type RepoInfoRepository = {
  __typename?: 'Repository';

  description: Maybe<string>;

  stargazers_count: number;

  open_issues_count: Maybe<number>;
};

export type RepoInfoPostedBy = {
  __typename?: 'User';

  html_url: string;

  login: string;
};

export type VoteButtonsFragment = {
  __typename?: 'Entry';

  score: number;

  vote: VoteButtonsVote;
};

export type VoteButtonsVote = {
  __typename?: 'Vote';

  vote_value: number;
};
