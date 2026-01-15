type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type OnCommentAddedSubscriptionVariables = Exact<{
  repoFullName: string;
}>;

export type OnCommentAddedSubscription = {
  readonly commentAdded: {
    readonly id: number;
    readonly createdAt: number;
    readonly content: string;
    readonly postedBy: { readonly login: string; readonly html_url: string };
  } | null;
};

export type CommentQueryVariables = Exact<{
  repoFullName: string;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
}>;

export type CommentQuery = {
  readonly currentUser: { readonly login: string; readonly html_url: string } | null;
  readonly entry: {
    readonly id: number;
    readonly createdAt: number;
    readonly commentCount: number;
    readonly postedBy: { readonly login: string; readonly html_url: string };
    readonly comments: ReadonlyArray<{
      readonly id: number;
      readonly createdAt: number;
      readonly content: string;
      readonly postedBy: { readonly login: string; readonly html_url: string };
    } | null>;
    readonly repository: {
      readonly description: string | null;
      readonly open_issues_count: number | null;
      readonly stargazers_count: number;
      readonly full_name: string;
      readonly html_url: string;
    };
  } | null;
};

export type CommentsPageCommentFragment = {
  readonly id: number;
  readonly createdAt: number;
  readonly content: string;
  readonly postedBy: { readonly login: string; readonly html_url: string };
};

export type CurrentUserForProfileQueryVariables = Exact<{ [key: string]: never }>;

export type CurrentUserForProfileQuery = {
  readonly currentUser: { readonly login: string; readonly avatar_url: string } | null;
};

export type FeedEntryFragment = {
  readonly id: number;
  readonly commentCount: number;
  readonly score: number;
  readonly createdAt: number;
  readonly repository: {
    readonly full_name: string;
    readonly html_url: string;
    readonly description: string | null;
    readonly stargazers_count: number;
    readonly open_issues_count: number | null;
    readonly owner: { readonly avatar_url: string } | null;
  };
  readonly vote: { readonly vote_value: number };
  readonly postedBy: { readonly html_url: string; readonly login: string };
};

export type FeedQueryVariables = Exact<{
  type: FeedType;
  offset?: number | null | undefined;
  limit?: number | null | undefined;
}>;

export type FeedQuery = {
  readonly currentUser: { readonly login: string } | null;
  readonly feed: ReadonlyArray<{
    readonly id: number;
    readonly commentCount: number;
    readonly score: number;
    readonly createdAt: number;
    readonly repository: {
      readonly full_name: string;
      readonly html_url: string;
      readonly description: string | null;
      readonly stargazers_count: number;
      readonly open_issues_count: number | null;
      readonly owner: { readonly avatar_url: string } | null;
    };
    readonly vote: { readonly vote_value: number };
    readonly postedBy: { readonly html_url: string; readonly login: string };
  } | null> | null;
};

export type SubmitRepositoryMutationVariables = Exact<{
  repoFullName: string;
}>;

export type SubmitRepositoryMutation = { readonly submitRepository: { readonly createdAt: number } | null };

export type RepoInfoFragment = {
  readonly createdAt: number;
  readonly repository: {
    readonly description: string | null;
    readonly stargazers_count: number;
    readonly open_issues_count: number | null;
  };
  readonly postedBy: { readonly html_url: string; readonly login: string };
};

export type SubmitCommentMutationVariables = Exact<{
  repoFullName: string;
  commentContent: string;
}>;

export type SubmitCommentMutation = {
  readonly submitComment: {
    readonly id: number;
    readonly createdAt: number;
    readonly content: string;
    readonly postedBy: { readonly login: string; readonly html_url: string };
  } | null;
};

export type VoteButtonsFragment = { readonly score: number; readonly vote: { readonly vote_value: number } };

export type VoteMutationVariables = Exact<{
  repoFullName: string;
  type: VoteType;
}>;

export type VoteMutation = {
  readonly vote: { readonly score: number; readonly id: number; readonly vote: { readonly vote_value: number } } | null;
};
