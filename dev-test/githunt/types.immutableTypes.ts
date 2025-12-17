type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type OnCommentAddedSubscriptionVariables = Exact<{
  repoFullName: string;
}>;

export type OnCommentAddedSubscription = {
  readonly __typename?: 'Subscription';
  readonly commentAdded: {
    readonly __typename?: 'Comment';
    readonly id: number;
    readonly createdAt: number;
    readonly content: string;
    readonly postedBy: { readonly __typename?: 'User'; readonly login: string; readonly html_url: string };
  } | null;
};

export type CommentQueryVariables = Exact<{
  repoFullName: string;
  limit?: number | null;
  offset?: number | null;
}>;

export type CommentQuery = {
  readonly __typename?: 'Query';
  readonly currentUser: { readonly __typename?: 'User'; readonly login: string; readonly html_url: string } | null;
  readonly entry: {
    readonly __typename?: 'Entry';
    readonly id: number;
    readonly createdAt: number;
    readonly commentCount: number;
    readonly postedBy: { readonly __typename?: 'User'; readonly login: string; readonly html_url: string };
    readonly comments: ReadonlyArray<{
      readonly __typename?: 'Comment';
      readonly id: number;
      readonly createdAt: number;
      readonly content: string;
      readonly postedBy: { readonly __typename?: 'User'; readonly login: string; readonly html_url: string };
    } | null>;
    readonly repository: {
      readonly __typename?: 'Repository';
      readonly description: string | null;
      readonly open_issues_count: number | null;
      readonly stargazers_count: number;
      readonly full_name: string;
      readonly html_url: string;
    };
  } | null;
};

export type CommentsPageCommentFragment = {
  readonly __typename?: 'Comment';
  readonly id: number;
  readonly createdAt: number;
  readonly content: string;
  readonly postedBy: { readonly __typename?: 'User'; readonly login: string; readonly html_url: string };
};

export type CurrentUserForProfileQueryVariables = Exact<{ [key: string]: never }>;

export type CurrentUserForProfileQuery = {
  readonly __typename?: 'Query';
  readonly currentUser: { readonly __typename?: 'User'; readonly login: string; readonly avatar_url: string } | null;
};

export type FeedEntryFragment = {
  readonly __typename?: 'Entry';
  readonly id: number;
  readonly commentCount: number;
  readonly score: number;
  readonly createdAt: number;
  readonly repository: {
    readonly __typename?: 'Repository';
    readonly full_name: string;
    readonly html_url: string;
    readonly description: string | null;
    readonly stargazers_count: number;
    readonly open_issues_count: number | null;
    readonly owner: { readonly __typename?: 'User'; readonly avatar_url: string } | null;
  };
  readonly vote: { readonly __typename?: 'Vote'; readonly vote_value: number };
  readonly postedBy: { readonly __typename?: 'User'; readonly html_url: string; readonly login: string };
};

export type FeedQueryVariables = Exact<{
  type: FeedType;
  offset?: number | null;
  limit?: number | null;
}>;

export type FeedQuery = {
  readonly __typename?: 'Query';
  readonly currentUser: { readonly __typename?: 'User'; readonly login: string } | null;
  readonly feed: ReadonlyArray<{
    readonly __typename?: 'Entry';
    readonly id: number;
    readonly commentCount: number;
    readonly score: number;
    readonly createdAt: number;
    readonly repository: {
      readonly __typename?: 'Repository';
      readonly full_name: string;
      readonly html_url: string;
      readonly description: string | null;
      readonly stargazers_count: number;
      readonly open_issues_count: number | null;
      readonly owner: { readonly __typename?: 'User'; readonly avatar_url: string } | null;
    };
    readonly vote: { readonly __typename?: 'Vote'; readonly vote_value: number };
    readonly postedBy: { readonly __typename?: 'User'; readonly html_url: string; readonly login: string };
  } | null> | null;
};

export type SubmitRepositoryMutationVariables = Exact<{
  repoFullName: string;
}>;

export type SubmitRepositoryMutation = {
  readonly __typename?: 'Mutation';
  readonly submitRepository: { readonly __typename?: 'Entry'; readonly createdAt: number } | null;
};

export type RepoInfoFragment = {
  readonly __typename?: 'Entry';
  readonly createdAt: number;
  readonly repository: {
    readonly __typename?: 'Repository';
    readonly description: string | null;
    readonly stargazers_count: number;
    readonly open_issues_count: number | null;
  };
  readonly postedBy: { readonly __typename?: 'User'; readonly html_url: string; readonly login: string };
};

export type SubmitCommentMutationVariables = Exact<{
  repoFullName: string;
  commentContent: string;
}>;

export type SubmitCommentMutation = {
  readonly __typename?: 'Mutation';
  readonly submitComment: {
    readonly __typename?: 'Comment';
    readonly id: number;
    readonly createdAt: number;
    readonly content: string;
    readonly postedBy: { readonly __typename?: 'User'; readonly login: string; readonly html_url: string };
  } | null;
};

export type VoteButtonsFragment = {
  readonly __typename?: 'Entry';
  readonly score: number;
  readonly vote: { readonly __typename?: 'Vote'; readonly vote_value: number };
};

export type VoteMutationVariables = Exact<{
  repoFullName: string;
  type: VoteType;
}>;

export type VoteMutation = {
  readonly __typename?: 'Mutation';
  readonly vote: {
    readonly __typename?: 'Entry';
    readonly score: number;
    readonly id: number;
    readonly vote: { readonly __typename?: 'Vote'; readonly vote_value: number };
  } | null;
};
