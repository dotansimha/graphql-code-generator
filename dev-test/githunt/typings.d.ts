
export type FeedType = "HOT" | "NEW" | "TOP";

export interface Entry {
  repository: Repository;
  postedBy: User;
  createdAt: number;
  score: number;
  hotScore: number;
  comments: Array<Comment>;
  commentCount: number;
  id: number;
  vote: Vote;
}

export interface Repository {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  open_issues_count: number | null;
  owner: User | null;
}

export interface User {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface Comment {
  id: number;
  postedBy: User;
  createdAt: number;
  content: string;
  repoName: string;
}

export interface Vote {
  vote_value: number;
}

export type VoteType = "UP" | "DOWN" | "CANCEL";
