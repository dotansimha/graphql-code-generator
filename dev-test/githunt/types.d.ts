/* tslint:disable */

export interface Query {
  feed: Entry[] | null; /* A feed of repository submissions */
  entry: Entry | null; /* A single entry */
  currentUser: User | null; /* Return the currently logged in user, or null if nobody is logged in */
}
/* Information about a GitHub repository submitted to GitHunt */
export interface Entry {
  repository: Repository; /* Information about the repository from GitHub */
  postedBy: User; /* The GitHub user who submitted this entry */
  createdAt: number; /* A timestamp of when the entry was submitted */
  score: number; /* The score of this repository, upvotes - downvotes */
  hotScore: number; /* The hot score of this repository */
  comments: Comment[]; /* Comments posted about this repository */
  commentCount: number; /* The number of comments posted about this repository */
  id: number; /* The SQL ID of this entry */
  vote: Vote; /* XXX to be changed */
}
/* A repository object from the GitHub API. This uses the exact field names returned by the
GitHub API for simplicity, even though the convention for GraphQL is usually to camel case. */
export interface Repository {
  name: string; /* Just the name of the repository, e.g. GitHunt-API */
  full_name: string; /* The full name of the repository with the username, e.g. apollostack/GitHunt-API */
  description: string | null; /* The description of the repository */
  html_url: string; /* The link to the repository on GitHub */
  stargazers_count: number; /* The number of people who have starred this repository on GitHub */
  open_issues_count: number | null; /* The number of open issues on this repository on GitHub */
  owner: User | null; /* The owner of this repository on GitHub, e.g. apollostack */
}
/* A user object from the GitHub API. This uses the exact field names returned from the GitHub API. */
export interface User {
  login: string; /* The name of the user, e.g. apollostack */
  avatar_url: string; /* The URL to a directly embeddable image for this user&#x27;s avatar */
  html_url: string; /* The URL of this user&#x27;s GitHub page */
}
/* A comment about an entry, submitted by a user */
export interface Comment {
  id: number; /* The SQL ID of this entry */
  postedBy: User; /* The GitHub user who posted the comment */
  createdAt: number; /* A timestamp of when the comment was posted */
  content: string; /* The text of the comment */
  repoName: string; /* The repository which this comment is about */
}
/* XXX to be removed */
export interface Vote {
  vote_value: number; 
}

export interface Mutation {
  submitRepository: Entry | null; /* Submit a new repository, returns the new submission */
  vote: Entry | null; /* Vote on a repository submission, returns the submission that was voted on */
  submitComment: Comment | null; /* Comment on a repository, returns the new comment */
}

export interface Subscription {
  commentAdded: Comment | null; /* Subscription fires on every comment added */
}
export interface FeedQueryArgs {
  type: FeedType; /* The sort order for the feed */
  offset: number | null; /* The number of items to skip, for pagination */
  limit: number | null; /* The number of items to fetch starting from the offset, for pagination */
}
export interface EntryQueryArgs {
  repoFullName: string; /* The full repository name from GitHub, e.g. &quot;apollostack/GitHunt-API&quot; */
}
export interface CommentsEntryArgs {
  limit: number | null; 
  offset: number | null; 
}
export interface SubmitRepositoryMutationArgs {
  repoFullName: string; /* The full repository name from GitHub, e.g. &quot;apollostack/GitHunt-API&quot; */
}
export interface VoteMutationArgs {
  repoFullName: string; /* The full repository name from GitHub, e.g. &quot;apollostack/GitHunt-API&quot; */
  type: VoteType; /* The type of vote - UP, DOWN, or CANCEL */
}
export interface SubmitCommentMutationArgs {
  repoFullName: string; /* The full repository name from GitHub, e.g. &quot;apollostack/GitHunt-API&quot; */
  commentContent: string; /* The text content for the new comment */
}
export interface CommentAddedSubscriptionArgs {
  repoFullName: string; 
}
/* A list of options for the sort order of the feed */
export type FeedType = "HOT" | "NEW" | "TOP";

/* The type of vote to record, when submitting a vote */
export type VoteType = "UP" | "DOWN" | "CANCEL";

export namespace OnCommentAdded {
  export type Variables = {
    repoFullName: string;
  }

  export type Subscription = {
    commentAdded: CommentAdded | null; 
  }

  export type CommentAdded = {
    id: number; 
    postedBy: PostedBy; 
    createdAt: number; 
    content: string; 
  }

  export type PostedBy = {
    login: string; 
    html_url: string; 
  }
}
export namespace Comment {
  export type Variables = {
    repoFullName: string;
    limit: number | null;
    offset: number | null;
  }

  export type Query = {
    currentUser: CurrentUser | null; 
    entry: Entry | null; 
  }

  export type CurrentUser = {
    login: string; 
    html_url: string; 
  }

  export type Entry = {
    id: number; 
    postedBy: PostedBy; 
    createdAt: number; 
    comments: Comments[]; 
    commentCount: number; 
    repository: Repository; 
  }

  export type PostedBy = {
    login: string; 
    html_url: string; 
  }

  export type Comments = {
  } & CommentsPageComment.Fragment

  export type Repository = {
    full_name: string; 
    html_url: string; 
  } & RepositoryInlineFragment

  export type RepositoryInlineFragment = {
    description: string | null; 
    open_issues_count: number | null; 
    stargazers_count: number; 
  }
}
export namespace CurrentUserForProfile {
  export type Variables = {
  }

  export type Query = {
    currentUser: CurrentUser | null; 
  }

  export type CurrentUser = {
    login: string; 
    avatar_url: string; 
  }
}
export namespace Feed {
  export type Variables = {
    type: FeedType;
    offset: number | null;
    limit: number | null;
  }

  export type Query = {
    currentUser: CurrentUser | null; 
    feed: Feed[] | null; 
  }

  export type CurrentUser = {
    login: string; 
  }

  export type Feed = {
  } & FeedEntry.Fragment
}
export namespace SubmitRepository {
  export type Variables = {
    repoFullName: string;
  }

  export type Mutation = {
    submitRepository: SubmitRepository | null; 
  }

  export type SubmitRepository = {
    createdAt: number; 
  }
}
export namespace SubmitComment {
  export type Variables = {
    repoFullName: string;
    commentContent: string;
  }

  export type Mutation = {
    submitComment: SubmitComment | null; 
  }

  export type SubmitComment = {
  } & CommentsPageComment.Fragment
}
export namespace Vote {
  export type Variables = {
    repoFullName: string;
    type: VoteType;
  }

  export type Mutation = {
    vote: Vote | null; 
  }

  export type Vote = {
    score: number; 
    id: number; 
    vote: _Vote; 
  }

  export type _Vote = {
    vote_value: number; 
  }
}

export namespace CommentsPageComment {
  export type Fragment = {
    id: number; 
    postedBy: PostedBy; 
    createdAt: number; 
    content: string; 
  }

  export type PostedBy = {
    login: string; 
    html_url: string; 
  }
}

export namespace FeedEntry {
  export type Fragment = {
    id: number; 
    commentCount: number; 
    repository: Repository; 
  } & VoteButtons.Fragment & RepoInfo.Fragment

  export type Repository = {
    full_name: string; 
    html_url: string; 
    owner: Owner | null; 
  }

  export type Owner = {
    avatar_url: string; 
  }
}

export namespace RepoInfo {
  export type Fragment = {
    createdAt: number; 
    repository: Repository; 
    postedBy: PostedBy; 
  }

  export type Repository = {
    description: string | null; 
    stargazers_count: number; 
    open_issues_count: number | null; 
  }

  export type PostedBy = {
    html_url: string; 
    login: string; 
  }
}

export namespace VoteButtons {
  export type Fragment = {
    score: number; 
    vote: Vote; 
  }

  export type Vote = {
    vote_value: number; 
  }
}
