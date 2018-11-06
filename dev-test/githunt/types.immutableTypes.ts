/* tslint:disable */

// ====================================================
// START: Typescript template
// ====================================================

// ====================================================
// Types
// ====================================================

export interface Query {
  /** A feed of repository submissions */
  readonly feed?: ReadonlyArray<Entry | null> | null;
  /** A single entry */
  readonly entry?: Entry | null;
  /** Return the currently logged in user, or null if nobody is logged in */
  readonly currentUser?: User | null;
}
/** Information about a GitHub repository submitted to GitHunt */
export interface Entry {
  /** Information about the repository from GitHub */
  readonly repository: Repository;
  /** The GitHub user who submitted this entry */
  readonly postedBy: User;
  /** A timestamp of when the entry was submitted */
  readonly createdAt: number;
  /** The score of this repository, upvotes - downvotes */
  readonly score: number;
  /** The hot score of this repository */
  readonly hotScore: number;
  /** Comments posted about this repository */
  readonly comments: ReadonlyArray<Comment | null>;
  /** The number of comments posted about this repository */
  readonly commentCount: number;
  /** The SQL ID of this entry */
  readonly id: number;
  /** XXX to be changed */
  readonly vote: Vote;
}
/** A repository object from the GitHub API. This uses the exact field names returned by theGitHub API for simplicity, even though the convention for GraphQL is usually to camel case. */
export interface Repository {
  /** Just the name of the repository, e.g. GitHunt-API */
  readonly name: string;
  /** The full name of the repository with the username, e.g. apollostack/GitHunt-API */
  readonly full_name: string;
  /** The description of the repository */
  readonly description?: string | null;
  /** The link to the repository on GitHub */
  readonly html_url: string;
  /** The number of people who have starred this repository on GitHub */
  readonly stargazers_count: number;
  /** The number of open issues on this repository on GitHub */
  readonly open_issues_count?: number | null;
  /** The owner of this repository on GitHub, e.g. apollostack */
  readonly owner?: User | null;
}
/** A user object from the GitHub API. This uses the exact field names returned from the GitHub API. */
export interface User {
  /** The name of the user, e.g. apollostack */
  readonly login: string;
  /** The URL to a directly embeddable image for this user's avatar */
  readonly avatar_url: string;
  /** The URL of this user's GitHub page */
  readonly html_url: string;
}
/** A comment about an entry, submitted by a user */
export interface Comment {
  /** The SQL ID of this entry */
  readonly id: number;
  /** The GitHub user who posted the comment */
  readonly postedBy: User;
  /** A timestamp of when the comment was posted */
  readonly createdAt: number;
  /** The text of the comment */
  readonly content: string;
  /** The repository which this comment is about */
  readonly repoName: string;
}
/** XXX to be removed */
export interface Vote {
  readonly vote_value: number;
}

export interface Mutation {
  /** Submit a new repository, returns the new submission */
  readonly submitRepository?: Entry | null;
  /** Vote on a repository submission, returns the submission that was voted on */
  readonly vote?: Entry | null;
  /** Comment on a repository, returns the new comment */
  readonly submitComment?: Comment | null;
}

export interface Subscription {
  /** Subscription fires on every comment added */
  readonly commentAdded?: Comment | null;
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
  export type Fragment =
    | {
        readonly __typename?: 'Entry';

        readonly id: number;

        readonly commentCount: number;

        readonly repository: Repository;
      } & VoteButtons.Fragment
    | RepoInfo.Fragment;

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
