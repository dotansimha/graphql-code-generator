/* tslint:disable */

export interface Query {
  readonly feed?: ReadonlyArray<Entry | null> | null /** A feed of repository submissions */;
  readonly entry?: Entry | null /** A single entry */;
  readonly currentUser?: User | null /** Return the currently logged in user, or null if nobody is logged in */;
}
/** Information about a GitHub repository submitted to GitHunt */
export interface Entry {
  readonly repository: Repository /** Information about the repository from GitHub */;
  readonly postedBy: User /** The GitHub user who submitted this entry */;
  readonly createdAt: number /** A timestamp of when the entry was submitted */;
  readonly score: number /** The score of this repository, upvotes - downvotes */;
  readonly hotScore: number /** The hot score of this repository */;
  readonly comments: ReadonlyArray<Comment | null> /** Comments posted about this repository */;
  readonly commentCount: number /** The number of comments posted about this repository */;
  readonly id: number /** The SQL ID of this entry */;
  readonly vote: Vote /** XXX to be changed */;
}
/** A repository object from the GitHub API. This uses the exact field names returned by theGitHub API for simplicity, even though the convention for GraphQL is usually to camel case. */
export interface Repository {
  readonly name: string /** Just the name of the repository, e.g. GitHunt-API */;
  readonly full_name: string /** The full name of the repository with the username, e.g. apollostack/GitHunt-API */;
  readonly description?: string | null /** The description of the repository */;
  readonly html_url: string /** The link to the repository on GitHub */;
  readonly stargazers_count: number /** The number of people who have starred this repository on GitHub */;
  readonly open_issues_count?: number | null /** The number of open issues on this repository on GitHub */;
  readonly owner?: User | null /** The owner of this repository on GitHub, e.g. apollostack */;
}
/** A user object from the GitHub API. This uses the exact field names returned from the GitHub API. */
export interface User {
  readonly login: string /** The name of the user, e.g. apollostack */;
  readonly avatar_url: string /** The URL to a directly embeddable image for this user's avatar */;
  readonly html_url: string /** The URL of this user's GitHub page */;
}
/** A comment about an entry, submitted by a user */
export interface Comment {
  readonly id: number /** The SQL ID of this entry */;
  readonly postedBy: User /** The GitHub user who posted the comment */;
  readonly createdAt: number /** A timestamp of when the comment was posted */;
  readonly content: string /** The text of the comment */;
  readonly repoName: string /** The repository which this comment is about */;
}
/** XXX to be removed */
export interface Vote {
  readonly vote_value: number;
}

export interface Mutation {
  readonly submitRepository?: Entry | null /** Submit a new repository, returns the new submission */;
  readonly vote?: Entry | null /** Vote on a repository submission, returns the submission that was voted on */;
  readonly submitComment?: Comment | null /** Comment on a repository, returns the new comment */;
}

export interface Subscription {
  readonly commentAdded?: Comment | null /** Subscription fires on every comment added */;
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
export namespace OnCommentAdded {
  export type Variables = {
    readonly repoFullName: string;
  };

  export type Subscription = {
    readonly __typename?: 'Subscription';
    readonly commentAdded?: CommentAdded | null;
  };

  export type CommentAdded = {
    readonly __typename?: 'Comment';
    readonly id: number;
    readonly postedBy: PostedBy;
    readonly createdAt: number;
    readonly content: string;
  };

  export type PostedBy = {
    readonly __typename?: 'User';
    readonly login: string;
    readonly html_url: string;
  };
}
export namespace Comment {
  export type Variables = {
    readonly repoFullName: string;
    readonly limit?: number | null;
    readonly offset?: number | null;
  };

  export type Query = {
    readonly __typename?: 'Query';
    readonly currentUser?: CurrentUser | null;
    readonly entry?: Entry | null;
  };

  export type CurrentUser = {
    readonly __typename?: 'User';
    readonly login: string;
    readonly html_url: string;
  };

  export type Entry = {
    readonly __typename?: 'Entry';
    readonly id: number;
    readonly postedBy: PostedBy;
    readonly createdAt: number;
    readonly comments: ReadonlyArray<Comments | null>;
    readonly commentCount: number;
    readonly repository: Repository;
  };

  export type PostedBy = {
    readonly __typename?: 'User';
    readonly login: string;
    readonly html_url: string;
  };

  export type Comments = CommentsPageComment.Fragment;

  export type Repository = {
    readonly __typename?: RepositoryInlineFragment['__typename'];
    readonly full_name: string;
    readonly html_url: string;
  } & (RepositoryInlineFragment);

  export type RepositoryInlineFragment = {
    readonly __typename?: 'Repository';
    readonly description?: string | null;
    readonly open_issues_count?: number | null;
    readonly stargazers_count: number;
  };
}
export namespace CurrentUserForProfile {
  export type Variables = {};

  export type Query = {
    readonly __typename?: 'Query';
    readonly currentUser?: CurrentUser | null;
  };

  export type CurrentUser = {
    readonly __typename?: 'User';
    readonly login: string;
    readonly avatar_url: string;
  };
}
export namespace Feed {
  export type Variables = {
    readonly type: FeedType;
    readonly offset?: number | null;
    readonly limit?: number | null;
  };

  export type Query = {
    readonly __typename?: 'Query';
    readonly currentUser?: CurrentUser | null;
    readonly feed?: ReadonlyArray<Feed | null> | null;
  };

  export type CurrentUser = {
    readonly __typename?: 'User';
    readonly login: string;
  };

  export type Feed = FeedEntry.Fragment;
}
export namespace SubmitRepository {
  export type Variables = {
    readonly repoFullName: string;
  };

  export type Mutation = {
    readonly __typename?: 'Mutation';
    readonly submitRepository?: SubmitRepository | null;
  };

  export type SubmitRepository = {
    readonly __typename?: 'Entry';
    readonly createdAt: number;
  };
}
export namespace SubmitComment {
  export type Variables = {
    readonly repoFullName: string;
    readonly commentContent: string;
  };

  export type Mutation = {
    readonly __typename?: 'Mutation';
    readonly submitComment?: SubmitComment | null;
  };

  export type SubmitComment = CommentsPageComment.Fragment;
}
export namespace Vote {
  export type Variables = {
    readonly repoFullName: string;
    readonly type: VoteType;
  };

  export type Mutation = {
    readonly __typename?: 'Mutation';
    readonly vote?: Vote | null;
  };

  export type Vote = {
    readonly __typename?: 'Entry';
    readonly score: number;
    readonly id: number;
    readonly vote: _Vote;
  };

  export type _Vote = {
    readonly __typename?: 'Vote';
    readonly vote_value: number;
  };
}

export namespace CommentsPageComment {
  export type Fragment = {
    readonly __typename?: 'Comment';
    readonly id: number;
    readonly postedBy: PostedBy;
    readonly createdAt: number;
    readonly content: string;
  };

  export type PostedBy = {
    readonly __typename?: 'User';
    readonly login: string;
    readonly html_url: string;
  };
}

export namespace FeedEntry {
  export type Fragment = {
    readonly __typename?: 'Entry';
    readonly id: number;
    readonly commentCount: number;
    readonly repository: Repository;
  } & VoteButtons.Fragment &
    RepoInfo.Fragment;

  export type Repository = {
    readonly __typename?: 'Repository';
    readonly full_name: string;
    readonly html_url: string;
    readonly owner?: Owner | null;
  };

  export type Owner = {
    readonly __typename?: 'User';
    readonly avatar_url: string;
  };
}

export namespace RepoInfo {
  export type Fragment = {
    readonly __typename?: 'Entry';
    readonly createdAt: number;
    readonly repository: Repository;
    readonly postedBy: PostedBy;
  };

  export type Repository = {
    readonly __typename?: 'Repository';
    readonly description?: string | null;
    readonly stargazers_count: number;
    readonly open_issues_count?: number | null;
  };

  export type PostedBy = {
    readonly __typename?: 'User';
    readonly html_url: string;
    readonly login: string;
  };
}

export namespace VoteButtons {
  export type Fragment = {
    readonly __typename?: 'Entry';
    readonly score: number;
    readonly vote: Vote;
  };

  export type Vote = {
    readonly __typename?: 'Vote';
    readonly vote_value: number;
  };
}
