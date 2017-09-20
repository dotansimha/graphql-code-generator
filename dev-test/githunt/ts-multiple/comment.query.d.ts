import { CommentsPageComment } from './commentspagecomment.fragment';
export namespace Comment {
  export type Variables = {
    repoFullName: string;
    limit?: number;
    offset?: number;
  }

  export type Query = {
    currentUser?: CurrentUser; 
    entry?: Entry; 
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

  export type Comments = CommentsPageComment.Fragment

  export type Repository = {
    full_name: string; 
    html_url: string; 
  } & RepositoryInlineFragment

  export type RepositoryInlineFragment = {
    description?: string; 
    open_issues_count?: number; 
    stargazers_count: number; 
  } 
}
