export namespace RepoInfo {
  export type Fragment = {
    __typename?: 'Entry';
    createdAt: number;
    repository: Repository;
    postedBy: PostedBy;
  };
  export type Repository = {
    __typename?: 'Repository';
    description?: string | null;
    stargazers_count: number;
    open_issues_count?: number | null;
  };
  export type PostedBy = {
    __typename?: 'User';
    html_url: string;
    login: string;
  };
}
