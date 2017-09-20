export namespace RepoInfo {
  export type Fragment = {
    createdAt: number; 
    repository: Repository; 
    postedBy: PostedBy; 
  } 
  export type Repository = {
    description?: string; 
    stargazers_count: number; 
    open_issues_count?: number; 
  } 
  export type PostedBy = {
    html_url: string; 
    login: string; 
  } 
}