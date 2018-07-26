/* tslint:disable */
import { GraphQLResolveInfo } from 'graphql';

type Resolver<Result, Args = any> = (
  parent: any,
  args: Args,
  context: any,
  info: GraphQLResolveInfo
) => Promise<Result> | Result;

export interface Query {
  feed?: Entry[] | null /** A feed of repository submissions */;
  entry?: Entry | null /** A single entry */;
  currentUser?: User | null /** Return the currently logged in user, or null if nobody is logged in */;
}
/** Information about a GitHub repository submitted to GitHunt */
export interface Entry {
  repository: Repository /** Information about the repository from GitHub */;
  postedBy: User /** The GitHub user who submitted this entry */;
  createdAt: number /** A timestamp of when the entry was submitted */;
  score: number /** The score of this repository, upvotes - downvotes */;
  hotScore: number /** The hot score of this repository */;
  comments: Comment[] /** Comments posted about this repository */;
  commentCount: number /** The number of comments posted about this repository */;
  id: number /** The SQL ID of this entry */;
  vote: Vote /** XXX to be changed */;
}
/** A repository object from the GitHub API. This uses the exact field names returned by theGitHub API for simplicity, even though the convention for GraphQL is usually to camel case. */
export interface Repository {
  name: string /** Just the name of the repository, e.g. GitHunt-API */;
  full_name: string /** The full name of the repository with the username, e.g. apollostack/GitHunt-API */;
  description?: string | null /** The description of the repository */;
  html_url: string /** The link to the repository on GitHub */;
  stargazers_count: number /** The number of people who have starred this repository on GitHub */;
  open_issues_count?: number | null /** The number of open issues on this repository on GitHub */;
  owner?: User | null /** The owner of this repository on GitHub, e.g. apollostack */;
}
/** A user object from the GitHub API. This uses the exact field names returned from the GitHub API. */
export interface User {
  login: string /** The name of the user, e.g. apollostack */;
  avatar_url: string /** The URL to a directly embeddable image for this user's avatar */;
  html_url: string /** The URL of this user's GitHub page */;
}
/** A comment about an entry, submitted by a user */
export interface Comment {
  id: number /** The SQL ID of this entry */;
  postedBy: User /** The GitHub user who posted the comment */;
  createdAt: number /** A timestamp of when the comment was posted */;
  content: string /** The text of the comment */;
  repoName: string /** The repository which this comment is about */;
}
/** XXX to be removed */
export interface Vote {
  vote_value: number;
}

export interface Mutation {
  submitRepository?: Entry | null /** Submit a new repository, returns the new submission */;
  vote?: Entry | null /** Vote on a repository submission, returns the submission that was voted on */;
  submitComment?: Comment | null /** Comment on a repository, returns the new comment */;
}

export interface Subscription {
  commentAdded?: Comment | null /** Subscription fires on every comment added */;
}
export interface FeedQueryArgs {
  type: FeedType /** The sort order for the feed */;
  offset?: number | null /** The number of items to skip, for pagination */;
  limit?: number | null /** The number of items to fetch starting from the offset, for pagination */;
}
export interface EntryQueryArgs {
  repoFullName: string /** The full repository name from GitHub, e.g. "apollostack/GitHunt-API" */;
}
export interface CommentsEntryArgs {
  limit?: number | null;
  offset?: number | null;
}
export interface SubmitRepositoryMutationArgs {
  repoFullName: string /** The full repository name from GitHub, e.g. "apollostack/GitHunt-API" */;
}
export interface VoteMutationArgs {
  repoFullName: string /** The full repository name from GitHub, e.g. "apollostack/GitHunt-API" */;
  type: VoteType /** The type of vote - UP, DOWN, or CANCEL */;
}
export interface SubmitCommentMutationArgs {
  repoFullName: string /** The full repository name from GitHub, e.g. "apollostack/GitHunt-API" */;
  commentContent: string /** The text content for the new comment */;
}
export interface CommentAddedSubscriptionArgs {
  repoFullName: string;
}
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

export interface QueryResolvers {
  feed?: QueryFeedResolver /** A feed of repository submissions */;
  entry?: QueryEntryResolver /** A single entry */;
  currentUser?: QueryCurrentUserResolver /** Return the currently logged in user, or null if nobody is logged in */;
}

export type QueryFeedResolver = Resolver<Entry[] | null>;
export interface QueryFeedArgs {
  type: FeedType /** The sort order for the feed */;
  offset?: number | null /** The number of items to skip, for pagination */;
  limit?: number | null /** The number of items to fetch starting from the offset, for pagination */;
}

export type QueryEntryResolver = Resolver<Entry | null>;
export interface QueryEntryArgs {
  repoFullName: string /** The full repository name from GitHub, e.g. "apollostack/GitHunt-API" */;
}

export type QueryCurrentUserResolver = Resolver<User | null>; /** Information about a GitHub repository submitted to GitHunt */
export interface EntryResolvers {
  repository?: EntryRepositoryResolver /** Information about the repository from GitHub */;
  postedBy?: EntryPostedByResolver /** The GitHub user who submitted this entry */;
  createdAt?: EntryCreatedAtResolver /** A timestamp of when the entry was submitted */;
  score?: EntryScoreResolver /** The score of this repository, upvotes - downvotes */;
  hotScore?: EntryHotScoreResolver /** The hot score of this repository */;
  comments?: EntryCommentsResolver /** Comments posted about this repository */;
  commentCount?: EntryCommentCountResolver /** The number of comments posted about this repository */;
  id?: EntryIdResolver /** The SQL ID of this entry */;
  vote?: EntryVoteResolver /** XXX to be changed */;
}

export type EntryRepositoryResolver = Resolver<Repository>;
export type EntryPostedByResolver = Resolver<User>;
export type EntryCreatedAtResolver = Resolver<number>;
export type EntryScoreResolver = Resolver<number>;
export type EntryHotScoreResolver = Resolver<number>;
export type EntryCommentsResolver = Resolver<Comment[]>;
export interface EntryCommentsArgs {
  limit?: number | null;
  offset?: number | null;
}

export type EntryCommentCountResolver = Resolver<number>;
export type EntryIdResolver = Resolver<number>;
export type EntryVoteResolver = Resolver<
  Vote
>; /** A repository object from the GitHub API. This uses the exact field names returned by theGitHub API for simplicity, even though the convention for GraphQL is usually to camel case. */
export interface RepositoryResolvers {
  name?: RepositoryNameResolver /** Just the name of the repository, e.g. GitHunt-API */;
  full_name?: RepositoryFull_nameResolver /** The full name of the repository with the username, e.g. apollostack/GitHunt-API */;
  description?: RepositoryDescriptionResolver /** The description of the repository */;
  html_url?: RepositoryHtml_urlResolver /** The link to the repository on GitHub */;
  stargazers_count?: RepositoryStargazers_countResolver /** The number of people who have starred this repository on GitHub */;
  open_issues_count?: RepositoryOpen_issues_countResolver /** The number of open issues on this repository on GitHub */;
  owner?: RepositoryOwnerResolver /** The owner of this repository on GitHub, e.g. apollostack */;
}

export type RepositoryNameResolver = Resolver<string>;
export type RepositoryFull_nameResolver = Resolver<string>;
export type RepositoryDescriptionResolver = Resolver<string | null>;
export type RepositoryHtml_urlResolver = Resolver<string>;
export type RepositoryStargazers_countResolver = Resolver<number>;
export type RepositoryOpen_issues_countResolver = Resolver<number | null>;
export type RepositoryOwnerResolver = Resolver<User | null>; /** A user object from the GitHub API. This uses the exact field names returned from the GitHub API. */
export interface UserResolvers {
  login?: UserLoginResolver /** The name of the user, e.g. apollostack */;
  avatar_url?: UserAvatar_urlResolver /** The URL to a directly embeddable image for this user's avatar */;
  html_url?: UserHtml_urlResolver /** The URL of this user's GitHub page */;
}

export type UserLoginResolver = Resolver<string>;
export type UserAvatar_urlResolver = Resolver<string>;
export type UserHtml_urlResolver = Resolver<string>; /** A comment about an entry, submitted by a user */
export interface CommentResolvers {
  id?: CommentIdResolver /** The SQL ID of this entry */;
  postedBy?: CommentPostedByResolver /** The GitHub user who posted the comment */;
  createdAt?: CommentCreatedAtResolver /** A timestamp of when the comment was posted */;
  content?: CommentContentResolver /** The text of the comment */;
  repoName?: CommentRepoNameResolver /** The repository which this comment is about */;
}

export type CommentIdResolver = Resolver<number>;
export type CommentPostedByResolver = Resolver<User>;
export type CommentCreatedAtResolver = Resolver<number>;
export type CommentContentResolver = Resolver<string>;
export type CommentRepoNameResolver = Resolver<string>; /** XXX to be removed */
export interface VoteResolvers {
  vote_value?: VoteVote_valueResolver;
}

export type VoteVote_valueResolver = Resolver<number>;
export interface MutationResolvers {
  submitRepository?: MutationSubmitRepositoryResolver /** Submit a new repository, returns the new submission */;
  vote?: MutationVoteResolver /** Vote on a repository submission, returns the submission that was voted on */;
  submitComment?: MutationSubmitCommentResolver /** Comment on a repository, returns the new comment */;
}

export type MutationSubmitRepositoryResolver = Resolver<Entry | null>;
export interface MutationSubmitRepositoryArgs {
  repoFullName: string /** The full repository name from GitHub, e.g. "apollostack/GitHunt-API" */;
}

export type MutationVoteResolver = Resolver<Entry | null>;
export interface MutationVoteArgs {
  repoFullName: string /** The full repository name from GitHub, e.g. "apollostack/GitHunt-API" */;
  type: VoteType /** The type of vote - UP, DOWN, or CANCEL */;
}

export type MutationSubmitCommentResolver = Resolver<Comment | null>;
export interface MutationSubmitCommentArgs {
  repoFullName: string /** The full repository name from GitHub, e.g. "apollostack/GitHunt-API" */;
  commentContent: string /** The text content for the new comment */;
}

export interface SubscriptionResolvers {
  commentAdded?: SubscriptionCommentAddedResolver /** Subscription fires on every comment added */;
}

export type SubscriptionCommentAddedResolver = Resolver<Comment | null>;
export interface SubscriptionCommentAddedArgs {
  repoFullName: string;
}

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

export type FeedEntryFragment = {
  __typename?: 'Entry';
  id: number;
  commentCount: number;
  repository: FeedEntryRepository;
} & VoteButtonsFragment &
  RepoInfoFragment;

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
