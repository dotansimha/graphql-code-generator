/* tslint:disable */
import { GraphQLResolveInfo } from 'graphql';

export type Resolver<Result, Parent = any, Context = any, Args = any> = (
  parent?: Parent,
  args?: Args,
  context?: Context,
  info?: GraphQLResolveInfo
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

export interface QueryResolvers<Context = any, Parent = Query> {
  feed?: QueryFeedResolver<Entry[] | null, Parent, Context> /** A feed of repository submissions */;
  entry?: QueryEntryResolver<Entry | null, Parent, Context> /** A single entry */;
  currentUser?: QueryCurrentUserResolver<
    User | null,
    Parent,
    Context
  > /** Return the currently logged in user, or null if nobody is logged in */;
}

export type QueryFeedResolver<R = Entry[] | null, Parent = Query, Context = any> = Resolver<R, Parent, Context>;
export interface QueryFeedArgs {
  type: FeedType /** The sort order for the feed */;
  offset?: number | null /** The number of items to skip, for pagination */;
  limit?: number | null /** The number of items to fetch starting from the offset, for pagination */;
}

export type QueryEntryResolver<R = Entry | null, Parent = Query, Context = any> = Resolver<R, Parent, Context>;
export interface QueryEntryArgs {
  repoFullName: string /** The full repository name from GitHub, e.g. "apollostack/GitHunt-API" */;
}

export type QueryCurrentUserResolver<R = User | null, Parent = Query, Context = any> = Resolver<R, Parent, Context>;
/** Information about a GitHub repository submitted to GitHunt */
export interface EntryResolvers<Context = any, Parent = Entry> {
  repository?: EntryRepositoryResolver<Repository, Parent, Context> /** Information about the repository from GitHub */;
  postedBy?: EntryPostedByResolver<User, Parent, Context> /** The GitHub user who submitted this entry */;
  createdAt?: EntryCreatedAtResolver<number, Parent, Context> /** A timestamp of when the entry was submitted */;
  score?: EntryScoreResolver<number, Parent, Context> /** The score of this repository, upvotes - downvotes */;
  hotScore?: EntryHotScoreResolver<number, Parent, Context> /** The hot score of this repository */;
  comments?: EntryCommentsResolver<Comment[], Parent, Context> /** Comments posted about this repository */;
  commentCount?: EntryCommentCountResolver<
    number,
    Parent,
    Context
  > /** The number of comments posted about this repository */;
  id?: EntryIdResolver<number, Parent, Context> /** The SQL ID of this entry */;
  vote?: EntryVoteResolver<Vote, Parent, Context> /** XXX to be changed */;
}

export type EntryRepositoryResolver<R = Repository, Parent = Entry, Context = any> = Resolver<R, Parent, Context>;
export type EntryPostedByResolver<R = User, Parent = Entry, Context = any> = Resolver<R, Parent, Context>;
export type EntryCreatedAtResolver<R = number, Parent = Entry, Context = any> = Resolver<R, Parent, Context>;
export type EntryScoreResolver<R = number, Parent = Entry, Context = any> = Resolver<R, Parent, Context>;
export type EntryHotScoreResolver<R = number, Parent = Entry, Context = any> = Resolver<R, Parent, Context>;
export type EntryCommentsResolver<R = Comment[], Parent = Entry, Context = any> = Resolver<R, Parent, Context>;
export interface EntryCommentsArgs {
  limit?: number | null;
  offset?: number | null;
}

export type EntryCommentCountResolver<R = number, Parent = Entry, Context = any> = Resolver<R, Parent, Context>;
export type EntryIdResolver<R = number, Parent = Entry, Context = any> = Resolver<R, Parent, Context>;
export type EntryVoteResolver<R = Vote, Parent = Entry, Context = any> = Resolver<R, Parent, Context>;
/** A repository object from the GitHub API. This uses the exact field names returned by theGitHub API for simplicity, even though the convention for GraphQL is usually to camel case. */
export interface RepositoryResolvers<Context = any, Parent = Repository> {
  name?: RepositoryNameResolver<string, Parent, Context> /** Just the name of the repository, e.g. GitHunt-API */;
  full_name?: RepositoryFullNameResolver<
    string,
    Parent,
    Context
  > /** The full name of the repository with the username, e.g. apollostack/GitHunt-API */;
  description?: RepositoryDescriptionResolver<string | null, Parent, Context> /** The description of the repository */;
  html_url?: RepositoryHtmlUrlResolver<string, Parent, Context> /** The link to the repository on GitHub */;
  stargazers_count?: RepositoryStargazersCountResolver<
    number,
    Parent,
    Context
  > /** The number of people who have starred this repository on GitHub */;
  open_issues_count?: RepositoryOpenIssuesCountResolver<
    number | null,
    Parent,
    Context
  > /** The number of open issues on this repository on GitHub */;
  owner?: RepositoryOwnerResolver<
    User | null,
    Parent,
    Context
  > /** The owner of this repository on GitHub, e.g. apollostack */;
}

export type RepositoryNameResolver<R = string, Parent = Repository, Context = any> = Resolver<R, Parent, Context>;
export type RepositoryFullNameResolver<R = string, Parent = Repository, Context = any> = Resolver<R, Parent, Context>;
export type RepositoryDescriptionResolver<R = string | null, Parent = Repository, Context = any> = Resolver<
  R,
  Parent,
  Context
>;
export type RepositoryHtmlUrlResolver<R = string, Parent = Repository, Context = any> = Resolver<R, Parent, Context>;
export type RepositoryStargazersCountResolver<R = number, Parent = Repository, Context = any> = Resolver<
  R,
  Parent,
  Context
>;
export type RepositoryOpenIssuesCountResolver<R = number | null, Parent = Repository, Context = any> = Resolver<
  R,
  Parent,
  Context
>;
export type RepositoryOwnerResolver<R = User | null, Parent = Repository, Context = any> = Resolver<R, Parent, Context>;
/** A user object from the GitHub API. This uses the exact field names returned from the GitHub API. */
export interface UserResolvers<Context = any, Parent = User> {
  login?: UserLoginResolver<string, Parent, Context> /** The name of the user, e.g. apollostack */;
  avatar_url?: UserAvatarUrlResolver<
    string,
    Parent,
    Context
  > /** The URL to a directly embeddable image for this user's avatar */;
  html_url?: UserHtmlUrlResolver<string, Parent, Context> /** The URL of this user's GitHub page */;
}

export type UserLoginResolver<R = string, Parent = User, Context = any> = Resolver<R, Parent, Context>;
export type UserAvatarUrlResolver<R = string, Parent = User, Context = any> = Resolver<R, Parent, Context>;
export type UserHtmlUrlResolver<R = string, Parent = User, Context = any> = Resolver<R, Parent, Context>;
/** A comment about an entry, submitted by a user */
export interface CommentResolvers<Context = any, Parent = Comment> {
  id?: CommentIdResolver<number, Parent, Context> /** The SQL ID of this entry */;
  postedBy?: CommentPostedByResolver<User, Parent, Context> /** The GitHub user who posted the comment */;
  createdAt?: CommentCreatedAtResolver<number, Parent, Context> /** A timestamp of when the comment was posted */;
  content?: CommentContentResolver<string, Parent, Context> /** The text of the comment */;
  repoName?: CommentRepoNameResolver<string, Parent, Context> /** The repository which this comment is about */;
}

export type CommentIdResolver<R = number, Parent = Comment, Context = any> = Resolver<R, Parent, Context>;
export type CommentPostedByResolver<R = User, Parent = Comment, Context = any> = Resolver<R, Parent, Context>;
export type CommentCreatedAtResolver<R = number, Parent = Comment, Context = any> = Resolver<R, Parent, Context>;
export type CommentContentResolver<R = string, Parent = Comment, Context = any> = Resolver<R, Parent, Context>;
export type CommentRepoNameResolver<R = string, Parent = Comment, Context = any> = Resolver<R, Parent, Context>;
/** XXX to be removed */
export interface VoteResolvers<Context = any, Parent = Vote> {
  vote_value?: VoteVoteValueResolver<number, Parent, Context>;
}

export type VoteVoteValueResolver<R = number, Parent = Vote, Context = any> = Resolver<R, Parent, Context>;

export interface MutationResolvers<Context = any, Parent = Mutation> {
  submitRepository?: MutationSubmitRepositoryResolver<
    Entry | null,
    Parent,
    Context
  > /** Submit a new repository, returns the new submission */;
  vote?: MutationVoteResolver<
    Entry | null,
    Parent,
    Context
  > /** Vote on a repository submission, returns the submission that was voted on */;
  submitComment?: MutationSubmitCommentResolver<
    Comment | null,
    Parent,
    Context
  > /** Comment on a repository, returns the new comment */;
}

export type MutationSubmitRepositoryResolver<R = Entry | null, Parent = Mutation, Context = any> = Resolver<
  R,
  Parent,
  Context
>;
export interface MutationSubmitRepositoryArgs {
  repoFullName: string /** The full repository name from GitHub, e.g. "apollostack/GitHunt-API" */;
}

export type MutationVoteResolver<R = Entry | null, Parent = Mutation, Context = any> = Resolver<R, Parent, Context>;
export interface MutationVoteArgs {
  repoFullName: string /** The full repository name from GitHub, e.g. "apollostack/GitHunt-API" */;
  type: VoteType /** The type of vote - UP, DOWN, or CANCEL */;
}

export type MutationSubmitCommentResolver<R = Comment | null, Parent = Mutation, Context = any> = Resolver<
  R,
  Parent,
  Context
>;
export interface MutationSubmitCommentArgs {
  repoFullName: string /** The full repository name from GitHub, e.g. "apollostack/GitHunt-API" */;
  commentContent: string /** The text content for the new comment */;
}

export interface SubscriptionResolvers<Context = any, Parent = Subscription> {
  commentAdded?: SubscriptionCommentAddedResolver<
    Comment | null,
    Parent,
    Context
  > /** Subscription fires on every comment added */;
}

export type SubscriptionCommentAddedResolver<R = Comment | null, Parent = Subscription, Context = any> = Resolver<
  R,
  Parent,
  Context
>;
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
  vote: VoteVote;
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
