/* tslint:disable */

// ====================================================
// START: Typescript template
// ====================================================

// ====================================================
// Types
// ====================================================

export interface Query {
  /** A feed of repository submissions */
  feed?: Entry[] | null;
  /** A single entry */
  entry?: Entry | null;
  /** Return the currently logged in user, or null if nobody is logged in */
  currentUser?: User | null;
}
/** Information about a GitHub repository submitted to GitHunt */
export interface Entry {
  /** Information about the repository from GitHub */
  repository: Repository;
  /** The GitHub user who submitted this entry */
  postedBy: User;
  /** A timestamp of when the entry was submitted */
  createdAt: number;
  /** The score of this repository, upvotes - downvotes */
  score: number;
  /** The hot score of this repository */
  hotScore: number;
  /** Comments posted about this repository */
  comments: Comment[];
  /** The number of comments posted about this repository */
  commentCount: number;
  /** The SQL ID of this entry */
  id: number;
  /** XXX to be changed */
  vote: Vote;
}
/** A repository object from the GitHub API. This uses the exact field names returned by theGitHub API for simplicity, even though the convention for GraphQL is usually to camel case. */
export interface Repository {
  /** Just the name of the repository, e.g. GitHunt-API */
  name: string;
  /** The full name of the repository with the username, e.g. apollostack/GitHunt-API */
  full_name: string;
  /** The description of the repository */
  description?: string | null;
  /** The link to the repository on GitHub */
  html_url: string;
  /** The number of people who have starred this repository on GitHub */
  stargazers_count: number;
  /** The number of open issues on this repository on GitHub */
  open_issues_count?: number | null;
  /** The owner of this repository on GitHub, e.g. apollostack */
  owner?: User | null;
}
/** A user object from the GitHub API. This uses the exact field names returned from the GitHub API. */
export interface User {
  /** The name of the user, e.g. apollostack */
  login: string;
  /** The URL to a directly embeddable image for this user's avatar */
  avatar_url: string;
  /** The URL of this user's GitHub page */
  html_url: string;
}
/** A comment about an entry, submitted by a user */
export interface Comment {
  /** The SQL ID of this entry */
  id: number;
  /** The GitHub user who posted the comment */
  postedBy: User;
  /** A timestamp of when the comment was posted */
  createdAt: number;
  /** The text of the comment */
  content: string;
  /** The repository which this comment is about */
  repoName: string;
}
/** XXX to be removed */
export interface Vote {
  vote_value: number;
}

export interface Mutation {
  /** Submit a new repository, returns the new submission */
  submitRepository?: Entry | null;
  /** Vote on a repository submission, returns the submission that was voted on */
  vote?: Entry | null;
  /** Comment on a repository, returns the new comment */
  submitComment?: Comment | null;
}

export interface Subscription {
  /** Subscription fires on every comment added */
  commentAdded?: Comment | null;
}

// ====================================================
// Arguments
// ====================================================

export interface FeedQueryArgs {
  /** The sort order for the feed */
  type: FeedType;
  /** The number of items to skip, for pagination */
  offset?: number | null;
  /** The number of items to fetch starting from the offset, for pagination */
  limit?: number | null;
}
export interface EntryQueryArgs {
  /** The full repository name from GitHub, e.g. "apollostack/GitHunt-API" */
  repoFullName: string;
}
export interface CommentsEntryArgs {
  limit?: number | null;

  offset?: number | null;
}
export interface SubmitRepositoryMutationArgs {
  /** The full repository name from GitHub, e.g. "apollostack/GitHunt-API" */
  repoFullName: string;
}
export interface VoteMutationArgs {
  /** The full repository name from GitHub, e.g. "apollostack/GitHunt-API" */
  repoFullName: string;
  /** The type of vote - UP, DOWN, or CANCEL */
  type: VoteType;
}
export interface SubmitCommentMutationArgs {
  /** The full repository name from GitHub, e.g. "apollostack/GitHunt-API" */
  repoFullName: string;
  /** The text content for the new comment */
  commentContent: string;
}
export interface CommentAddedSubscriptionArgs {
  repoFullName: string;
}

// ====================================================
// Enums
// ====================================================

/** A list of options for the sort order of the feed */
export enum FeedType {
  HOT = 'HOT',
  NEW = 'NEW',
  TOP = 'TOP'
}
/** The type of vote to record, when submitting a vote */
export enum VoteType {
  UP = 'UP',
  DOWN = 'DOWN',
  CANCEL = 'CANCEL'
}

// ====================================================
// END: Typescript template
// ====================================================

// ====================================================
// Documents
// ====================================================

export type OnCommentAddedVariables = {
  repoFullName: string;
};

export type OnCommentAddedSubscription = {
  __typename?: 'Subscription';

  commentAdded?: OnCommentAddedCommentAdded | null;
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
  limit?: number | null;
  offset?: number | null;
};

export type CommentQuery = {
  __typename?: 'Query';

  currentUser?: CommentCurrentUser | null;

  entry?: CommentEntry | null;
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
} & (CommentRepositoryInlineFragment);

export type CommentRepositoryInlineFragment = {
  __typename?: 'Repository';

  description?: string | null;

  open_issues_count?: number | null;

  stargazers_count: number;
};

export type CurrentUserForProfileVariables = {};

export type CurrentUserForProfileQuery = {
  __typename?: 'Query';

  currentUser?: CurrentUserForProfileCurrentUser | null;
};

export type CurrentUserForProfileCurrentUser = {
  __typename?: 'User';

  login: string;

  avatar_url: string;
};

export type FeedVariables = {
  type: FeedType;
  offset?: number | null;
  limit?: number | null;
};

export type FeedQuery = {
  __typename?: 'Query';

  currentUser?: FeedCurrentUser | null;

  feed?: FeedFeed[] | null;
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

  submitRepository?: SubmitRepositorySubmitRepository | null;
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

  submitComment?: SubmitCommentSubmitComment | null;
};

export type SubmitCommentSubmitComment = CommentsPageCommentFragment;

export type VoteVariables = {
  repoFullName: string;
  type: VoteType;
};

export type VoteMutation = {
  __typename?: 'Mutation';

  vote?: VoteVote | null;
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

export type FeedEntryFragment =
  | {
      __typename?: 'Entry';

      id: number;

      commentCount: number;

      repository: FeedEntryRepository;
    } & VoteButtonsFragment
  | RepoInfoFragment;

export type FeedEntryRepository = {
  __typename?: 'Repository';

  full_name: string;

  html_url: string;

  owner?: FeedEntryOwner | null;
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

  description?: string | null;

  stargazers_count: number;

  open_issues_count?: number | null;
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
