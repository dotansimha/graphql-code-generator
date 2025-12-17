type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type OnCommentAddedSubscriptionVariables = Exact<{
  repoFullName: string;
}>;

export type OnCommentAddedSubscription = {
  __typename?: 'Subscription';
  commentAdded: {
    __typename?: 'Comment';
    id: number;
    createdAt: number;
    content: string;
    postedBy: { __typename?: 'User'; login: string; html_url: string };
  } | null;
};

export type CommentQueryVariables = Exact<{
  repoFullName: string;
  limit?: number | null;
  offset?: number | null;
}>;

export type CommentQuery = {
  __typename?: 'Query';
  currentUser: { __typename?: 'User'; login: string; html_url: string } | null;
  entry: {
    __typename?: 'Entry';
    id: number;
    createdAt: number;
    commentCount: number;
    postedBy: { __typename?: 'User'; login: string; html_url: string };
    comments: Array<{
      __typename?: 'Comment';
      id: number;
      createdAt: number;
      content: string;
      postedBy: { __typename?: 'User'; login: string; html_url: string };
    } | null>;
    repository: {
      __typename?: 'Repository';
      full_name: string;
      html_url: string;
      description: string | null;
      open_issues_count: number | null;
      stargazers_count: number;
    };
  } | null;
};

export type CurrentUserForProfileQueryVariables = Exact<{ [key: string]: never }>;

export type CurrentUserForProfileQuery = {
  __typename?: 'Query';
  currentUser: { __typename?: 'User'; login: string; avatar_url: string } | null;
};

export type FeedQueryVariables = Exact<{
  type: FeedType;
  offset?: number | null;
  limit?: number | null;
}>;

export type FeedQuery = {
  __typename?: 'Query';
  currentUser: { __typename?: 'User'; login: string } | null;
  feed: Array<{
    __typename?: 'Entry';
    id: number;
    commentCount: number;
    score: number;
    createdAt: number;
    repository: {
      __typename?: 'Repository';
      full_name: string;
      html_url: string;
      description: string | null;
      stargazers_count: number;
      open_issues_count: number | null;
      owner: { __typename?: 'User'; avatar_url: string } | null;
    };
    vote: { __typename?: 'Vote'; vote_value: number };
    postedBy: { __typename?: 'User'; login: string; html_url: string };
  } | null> | null;
};

export type SubmitRepositoryMutationVariables = Exact<{
  repoFullName: string;
}>;

export type SubmitRepositoryMutation = {
  __typename?: 'Mutation';
  submitRepository: { __typename?: 'Entry'; createdAt: number } | null;
};

export type SubmitCommentMutationVariables = Exact<{
  repoFullName: string;
  commentContent: string;
}>;

export type SubmitCommentMutation = {
  __typename?: 'Mutation';
  submitComment: {
    __typename?: 'Comment';
    id: number;
    createdAt: number;
    content: string;
    postedBy: { __typename?: 'User'; login: string; html_url: string };
  } | null;
};

export type VoteMutationVariables = Exact<{
  repoFullName: string;
  type: VoteType;
}>;

export type VoteMutation = {
  __typename?: 'Mutation';
  vote: { __typename?: 'Entry'; score: number; id: number; vote: { __typename?: 'Vote'; vote_value: number } } | null;
};
