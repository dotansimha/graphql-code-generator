/* @flow */


/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
};

/** A comment about an entry, submitted by a user */
export type Comment = {
  __typename?: 'Comment',
  /** The SQL ID of this entry */
  id: $ElementType<Scalars, 'Int'>,
  /** The GitHub user who posted the comment */
  postedBy: User,
  /** A timestamp of when the comment was posted */
  createdAt: $ElementType<Scalars, 'Float'>,
  /** The text of the comment */
  content: $ElementType<Scalars, 'String'>,
  /** The repository which this comment is about */
  repoName: $ElementType<Scalars, 'String'>,
};

/** Information about a GitHub repository submitted to GitHunt */
export type Entry = {
  __typename?: 'Entry',
  /** Information about the repository from GitHub */
  repository: Repository,
  /** The GitHub user who submitted this entry */
  postedBy: User,
  /** A timestamp of when the entry was submitted */
  createdAt: $ElementType<Scalars, 'Float'>,
  /** The score of this repository, upvotes - downvotes */
  score: $ElementType<Scalars, 'Int'>,
  /** The hot score of this repository */
  hotScore: $ElementType<Scalars, 'Float'>,
  /** Comments posted about this repository */
  comments: Array<?Comment>,
  /** The number of comments posted about this repository */
  commentCount: $ElementType<Scalars, 'Int'>,
  /** The SQL ID of this entry */
  id: $ElementType<Scalars, 'Int'>,
  /** XXX to be changed */
  vote: Vote,
};


/** Information about a GitHub repository submitted to GitHunt */
export type EntryCommentsArgs = {
  limit?: ?$ElementType<Scalars, 'Int'>,
  offset?: ?$ElementType<Scalars, 'Int'>
};

export const FeedTypeValues = Object.freeze({
  /** Sort by a combination of freshness and score, using Reddit's algorithm */
  Hot: 'HOT', 
  /** Newest entries first */
  New: 'NEW', 
  /** Highest score entries first */
  Top: 'TOP'
});


/** A list of options for the sort order of the feed */
export type FeedType = $Values<typeof FeedTypeValues>;

export type Mutation = {
  __typename?: 'Mutation',
  /** Submit a new repository, returns the new submission */
  submitRepository?: ?Entry,
  /** Vote on a repository submission, returns the submission that was voted on */
  vote?: ?Entry,
  /** Comment on a repository, returns the new comment */
  submitComment?: ?Comment,
};


export type MutationSubmitRepositoryArgs = {
  repoFullName: $ElementType<Scalars, 'String'>
};


export type MutationVoteArgs = {
  repoFullName: $ElementType<Scalars, 'String'>,
  type: VoteType
};


export type MutationSubmitCommentArgs = {
  repoFullName: $ElementType<Scalars, 'String'>,
  commentContent: $ElementType<Scalars, 'String'>
};

export type Query = {
  __typename?: 'Query',
  /** A feed of repository submissions */
  feed?: ?Array<?Entry>,
  /** A single entry */
  entry?: ?Entry,
  /** Return the currently logged in user, or null if nobody is logged in */
  currentUser?: ?User,
};


export type QueryFeedArgs = {
  type: FeedType,
  offset?: ?$ElementType<Scalars, 'Int'>,
  limit?: ?$ElementType<Scalars, 'Int'>
};


export type QueryEntryArgs = {
  repoFullName: $ElementType<Scalars, 'String'>
};

/** A repository object from the GitHub API. This uses the exact field names returned by the
 * GitHub API for simplicity, even though the convention for GraphQL is usually to camel case.
 */
export type Repository = {
  __typename?: 'Repository',
  /** Just the name of the repository, e.g. GitHunt-API */
  name: $ElementType<Scalars, 'String'>,
  /** The full name of the repository with the username, e.g. apollostack/GitHunt-API */
  full_name: $ElementType<Scalars, 'String'>,
  /** The description of the repository */
  description?: ?$ElementType<Scalars, 'String'>,
  /** The link to the repository on GitHub */
  html_url: $ElementType<Scalars, 'String'>,
  /** The number of people who have starred this repository on GitHub */
  stargazers_count: $ElementType<Scalars, 'Int'>,
  /** The number of open issues on this repository on GitHub */
  open_issues_count?: ?$ElementType<Scalars, 'Int'>,
  /** The owner of this repository on GitHub, e.g. apollostack */
  owner?: ?User,
};

export type Subscription = {
  __typename?: 'Subscription',
  /** Subscription fires on every comment added */
  commentAdded?: ?Comment,
};


export type SubscriptionCommentAddedArgs = {
  repoFullName: $ElementType<Scalars, 'String'>
};

/** A user object from the GitHub API. This uses the exact field names returned from the GitHub API. */
export type User = {
  __typename?: 'User',
  /** The name of the user, e.g. apollostack */
  login: $ElementType<Scalars, 'String'>,
  /** The URL to a directly embeddable image for this user's avatar */
  avatar_url: $ElementType<Scalars, 'String'>,
  /** The URL of this user's GitHub page */
  html_url: $ElementType<Scalars, 'String'>,
};

/** XXX to be removed */
export type Vote = {
  __typename?: 'Vote',
  vote_value: $ElementType<Scalars, 'Int'>,
};

export const VoteTypeValues = Object.freeze({
  Up: 'UP', 
  Down: 'DOWN', 
  Cancel: 'CANCEL'
});


/** The type of vote to record, when submitting a vote */
export type VoteType = $Values<typeof VoteTypeValues>;
type $Pick<Origin: Object, Keys: Object> = $ObjMapi<Keys, <Key>(k: Key) => $ElementType<Origin, Key>>;

export type OnCommentAddedSubscriptionVariables = {
  repoFullName: $ElementType<Scalars, 'String'>
};


export type OnCommentAddedSubscription = ({ __typename?: 'Subscription' } & { commentAdded: ?({ __typename?: 'Comment' } & $Pick<Comment, { id: *, createdAt: *, content: * }> & { postedBy: ({ __typename?: 'User' } & $Pick<User, { login: *, html_url: * }>) }) });

export type CommentQueryVariables = {
  repoFullName: $ElementType<Scalars, 'String'>,
  limit?: ?$ElementType<Scalars, 'Int'>,
  offset?: ?$ElementType<Scalars, 'Int'>
};


export type CommentQuery = ({ __typename?: 'Query' } & { currentUser: ?({ __typename?: 'User' } & $Pick<User, { login: *, html_url: * }>), entry: ?({ __typename?: 'Entry' } & $Pick<Entry, { id: *, createdAt: *, commentCount: * }> & { postedBy: ({ __typename?: 'User' } & $Pick<User, { login: *, html_url: * }>), comments: Array<?({ __typename?: 'Comment' } & CommentsPageCommentFragment)>, repository: ({ __typename?: 'Repository' } & $Pick<Repository, { full_name: *, html_url: * }> & ({ __typename?: 'Repository' } & $Pick<Repository, { description: *, open_issues_count: *, stargazers_count: * }>)) }) });

export type CommentsPageCommentFragment = ({ __typename?: 'Comment' } & $Pick<Comment, { id: *, createdAt: *, content: * }> & { postedBy: ({ __typename?: 'User' } & $Pick<User, { login: *, html_url: * }>) });

export type CurrentUserForProfileQueryVariables = {};


export type CurrentUserForProfileQuery = ({ __typename?: 'Query' } & { currentUser: ?({ __typename?: 'User' } & $Pick<User, { login: *, avatar_url: * }>) });

export type FeedEntryFragment = ({ __typename?: 'Entry' } & $Pick<Entry, { id: *, commentCount: * }> & { repository: ({ __typename?: 'Repository' } & $Pick<Repository, { full_name: *, html_url: * }> & { owner: ?({ __typename?: 'User' } & $Pick<User, { avatar_url: * }>) }) } & (VoteButtonsFragment & RepoInfoFragment));

export type FeedQueryVariables = {
  type: FeedType,
  offset?: ?$ElementType<Scalars, 'Int'>,
  limit?: ?$ElementType<Scalars, 'Int'>
};


export type FeedQuery = ({ __typename?: 'Query' } & { currentUser: ?({ __typename?: 'User' } & $Pick<User, { login: * }>), feed: ?Array<?({ __typename?: 'Entry' } & FeedEntryFragment)> });

export type SubmitRepositoryMutationVariables = {
  repoFullName: $ElementType<Scalars, 'String'>
};


export type SubmitRepositoryMutation = ({ __typename?: 'Mutation' } & { submitRepository: ?({ __typename?: 'Entry' } & $Pick<Entry, { createdAt: * }>) });

export type RepoInfoFragment = ({ __typename?: 'Entry' } & $Pick<Entry, { createdAt: * }> & { repository: ({ __typename?: 'Repository' } & $Pick<Repository, { description: *, stargazers_count: *, open_issues_count: * }>), postedBy: ({ __typename?: 'User' } & $Pick<User, { html_url: *, login: * }>) });

export type SubmitCommentMutationVariables = {
  repoFullName: $ElementType<Scalars, 'String'>,
  commentContent: $ElementType<Scalars, 'String'>
};


export type SubmitCommentMutation = ({ __typename?: 'Mutation' } & { submitComment: ?({ __typename?: 'Comment' } & CommentsPageCommentFragment) });

export type VoteButtonsFragment = ({ __typename?: 'Entry' } & $Pick<Entry, { score: * }> & { vote: ({ __typename?: 'Vote' } & $Pick<Vote, { vote_value: * }>) });

export type VoteMutationVariables = {
  repoFullName: $ElementType<Scalars, 'String'>,
  type: VoteType
};


export type VoteMutation = ({ __typename?: 'Mutation' } & { vote: ?({ __typename?: 'Entry' } & $Pick<Entry, { score: *, id: * }> & { vote: ({ __typename?: 'Vote' } & $Pick<Vote, { vote_value: * }>) }) });
