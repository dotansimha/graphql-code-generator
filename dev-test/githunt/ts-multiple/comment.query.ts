import { CommentsPageComment } from './commentspagecomment.fragment';
export namespace Comment {
  export type Variables = {
    repoFullName: string;
    limit?: number | null;
    offset?: number | null;
  };

  export type Query = {
    __typename?: 'Query';
    currentUser?: CurrentUser | null;
    entry?: Entry | null;
  };

  export type CurrentUser = {
    __typename?: 'User';
    login: string;
    html_url: string;
  };

  export type Entry = {
    __typename?: 'Entry';
    id: number;
    postedBy: PostedBy;
    createdAt: number;
    comments: (Comments | null)[];
    commentCount: number;
    repository: Repository;
  };

  export type PostedBy = {
    __typename?: 'User';
    login: string;
    html_url: string;
  };

  export type Comments = CommentsPageComment.Fragment;

  export type Repository = {
    __typename?: RepositoryInlineFragment['__typename'];
    full_name: string;
    html_url: string;
  } & (RepositoryInlineFragment);

  export type RepositoryInlineFragment = {
    __typename?: 'Repository';
    description?: string | null;
    open_issues_count?: number | null;
    stargazers_count: number;
  };
}
