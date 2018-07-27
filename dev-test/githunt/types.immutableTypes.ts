/* tslint:disable */
import { GraphQLResolveInfo } from 'graphql';

export type Resolver<Parent, Result, Args = any> = (
  parent?: Parent,
  args?: Args,
  context?: any,
  info?: GraphQLResolveInfo
) => Promise<Result> | Result;

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

export namespace QueryResolvers {
  export interface Resolvers {
    feed?: FeedResolver /** A feed of repository submissions */;
    entry?: EntryResolver /** A single entry */;
    currentUser?: CurrentUserResolver /** Return the currently logged in user, or null if nobody is logged in */;
  }

  export type FeedResolver = Resolver<Query, ReadonlyArray<Entry | null> | null, FeedArgs>;
  export interface FeedArgs {
    type: FeedType /** The sort order for the feed */;
    offset?: number | null /** The number of items to skip, for pagination */;
    limit?: number | null /** The number of items to fetch starting from the offset, for pagination */;
  }

  export type EntryResolver = Resolver<Query, Entry | null, EntryArgs>;
  export interface EntryArgs {
    repoFullName: string /** The full repository name from GitHub, e.g. "apollostack/GitHunt-API" */;
  }

  export type CurrentUserResolver = Resolver<Query, User | null>;
}
/** Information about a GitHub repository submitted to GitHunt */
/** Information about a GitHub repository submitted to GitHunt */
export namespace EntryResolvers {
  export interface Resolvers {
    repository?: RepositoryResolver /** Information about the repository from GitHub */;
    postedBy?: PostedByResolver /** The GitHub user who submitted this entry */;
    createdAt?: CreatedAtResolver /** A timestamp of when the entry was submitted */;
    score?: ScoreResolver /** The score of this repository, upvotes - downvotes */;
    hotScore?: HotScoreResolver /** The hot score of this repository */;
    comments?: CommentsResolver /** Comments posted about this repository */;
    commentCount?: CommentCountResolver /** The number of comments posted about this repository */;
    id?: IdResolver /** The SQL ID of this entry */;
    vote?: VoteResolver /** XXX to be changed */;
  }

  export type RepositoryResolver = Resolver<Entry, Repository>;
  export type PostedByResolver = Resolver<Entry, User>;
  export type CreatedAtResolver = Resolver<Entry, number>;
  export type ScoreResolver = Resolver<Entry, number>;
  export type HotScoreResolver = Resolver<Entry, number>;
  export type CommentsResolver = Resolver<Entry, ReadonlyArray<Comment | null>, CommentsArgs>;
  export interface CommentsArgs {
    limit?: number | null;
    offset?: number | null;
  }

  export type CommentCountResolver = Resolver<Entry, number>;
  export type IdResolver = Resolver<Entry, number>;
  export type VoteResolver = Resolver<Entry, Vote>;
}
/** A repository object from the GitHub API. This uses the exact field names returned by theGitHub API for simplicity, even though the convention for GraphQL is usually to camel case. */
/** A repository object from the GitHub API. This uses the exact field names returned by theGitHub API for simplicity, even though the convention for GraphQL is usually to camel case. */
export namespace RepositoryResolvers {
  export interface Resolvers {
    name?: NameResolver /** Just the name of the repository, e.g. GitHunt-API */;
    full_name?: FullNameResolver /** The full name of the repository with the username, e.g. apollostack/GitHunt-API */;
    description?: DescriptionResolver /** The description of the repository */;
    html_url?: HtmlUrlResolver /** The link to the repository on GitHub */;
    stargazers_count?: StargazersCountResolver /** The number of people who have starred this repository on GitHub */;
    open_issues_count?: OpenIssuesCountResolver /** The number of open issues on this repository on GitHub */;
    owner?: OwnerResolver /** The owner of this repository on GitHub, e.g. apollostack */;
  }

  export type NameResolver = Resolver<Repository, string>;
  export type FullNameResolver = Resolver<Repository, string>;
  export type DescriptionResolver = Resolver<Repository, string | null>;
  export type HtmlUrlResolver = Resolver<Repository, string>;
  export type StargazersCountResolver = Resolver<Repository, number>;
  export type OpenIssuesCountResolver = Resolver<Repository, number | null>;
  export type OwnerResolver = Resolver<Repository, User | null>;
}
/** A user object from the GitHub API. This uses the exact field names returned from the GitHub API. */
/** A user object from the GitHub API. This uses the exact field names returned from the GitHub API. */
export namespace UserResolvers {
  export interface Resolvers {
    login?: LoginResolver /** The name of the user, e.g. apollostack */;
    avatar_url?: AvatarUrlResolver /** The URL to a directly embeddable image for this user's avatar */;
    html_url?: HtmlUrlResolver /** The URL of this user's GitHub page */;
  }

  export type LoginResolver = Resolver<User, string>;
  export type AvatarUrlResolver = Resolver<User, string>;
  export type HtmlUrlResolver = Resolver<User, string>;
}
/** A comment about an entry, submitted by a user */
/** A comment about an entry, submitted by a user */
export namespace CommentResolvers {
  export interface Resolvers {
    id?: IdResolver /** The SQL ID of this entry */;
    postedBy?: PostedByResolver /** The GitHub user who posted the comment */;
    createdAt?: CreatedAtResolver /** A timestamp of when the comment was posted */;
    content?: ContentResolver /** The text of the comment */;
    repoName?: RepoNameResolver /** The repository which this comment is about */;
  }

  export type IdResolver = Resolver<Comment, number>;
  export type PostedByResolver = Resolver<Comment, User>;
  export type CreatedAtResolver = Resolver<Comment, number>;
  export type ContentResolver = Resolver<Comment, string>;
  export type RepoNameResolver = Resolver<Comment, string>;
}
/** XXX to be removed */
/** XXX to be removed */
export namespace VoteResolvers {
  export interface Resolvers {
    vote_value?: VoteValueResolver;
  }

  export type VoteValueResolver = Resolver<Vote, number>;
}

export namespace MutationResolvers {
  export interface Resolvers {
    submitRepository?: SubmitRepositoryResolver /** Submit a new repository, returns the new submission */;
    vote?: VoteResolver /** Vote on a repository submission, returns the submission that was voted on */;
    submitComment?: SubmitCommentResolver /** Comment on a repository, returns the new comment */;
  }

  export type SubmitRepositoryResolver = Resolver<Mutation, Entry | null, SubmitRepositoryArgs>;
  export interface SubmitRepositoryArgs {
    repoFullName: string /** The full repository name from GitHub, e.g. "apollostack/GitHunt-API" */;
  }

  export type VoteResolver = Resolver<Mutation, Entry | null, VoteArgs>;
  export interface VoteArgs {
    repoFullName: string /** The full repository name from GitHub, e.g. "apollostack/GitHunt-API" */;
    type: VoteType /** The type of vote - UP, DOWN, or CANCEL */;
  }

  export type SubmitCommentResolver = Resolver<Mutation, Comment | null, SubmitCommentArgs>;
  export interface SubmitCommentArgs {
    repoFullName: string /** The full repository name from GitHub, e.g. "apollostack/GitHunt-API" */;
    commentContent: string /** The text content for the new comment */;
  }
}

export namespace SubscriptionResolvers {
  export interface Resolvers {
    commentAdded?: CommentAddedResolver /** Subscription fires on every comment added */;
  }

  export type CommentAddedResolver = Resolver<Subscription, Comment | null, CommentAddedArgs>;
  export interface CommentAddedArgs {
    repoFullName: string;
  }
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
    readonly vote: Vote;
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
