export namespace FeedEntry {
  export type Fragment = {
    id: number; 
    commentCount: number; 
    repository: Repository; 
  }  & VoteButtons.Fragment & RepoInfo.Fragment
  export type Repository = {
    full_name: string; 
    html_url: string; 
    owner?: Owner; 
  } 
  export type Owner = {
    avatar_url: string; 
  } 
}