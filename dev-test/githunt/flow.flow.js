// @flow

export type Query = {
  feed: ?Array<?Entry>,
  entry: ?Entry,
  currentUser: ?User
};

export const FeedTypeValues = {
  HOT: 'HOT',
  NEW: 'NEW',
  TOP: 'TOP'
};
export type FeedType = $Values<typeof FeedTypeValues>;

export type Entry = {
  repository: Repository,
  postedBy: User,
  createdAt: number,
  score: number,
  hotScore: number,
  comments: Array<?Comment>,
  commentCount: number,
  id: number,
  vote: Vote
};

export type Repository = {
  name: string,
  full_name: string,
  description: ?string,
  html_url: string,
  stargazers_count: number,
  open_issues_count: ?number,
  owner: ?User
};

export type User = {
  login: string,
  avatar_url: string,
  html_url: string
};

export type Comment = {
  id: number,
  postedBy: User,
  createdAt: number,
  content: string,
  repoName: string
};

export type Vote = {
  vote_value: number
};

export type Mutation = {
  submitRepository: ?Entry,
  vote: ?Entry,
  submitComment: ?Comment
};

export const VoteTypeValues = {
  UP: 'UP',
  DOWN: 'DOWN',
  CANCEL: 'CANCEL'
};
export type VoteType = $Values<typeof VoteTypeValues>;

export type Subscription = {
  commentAdded: ?Comment
};
