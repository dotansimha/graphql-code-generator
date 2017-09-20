export namespace CommentsPageComment {
  export type Fragment = {
    id: number; 
    postedBy: PostedBy; 
    createdAt: number; 
    content: string; 
  } 
  export type PostedBy = {
    login: string; 
    html_url: string; 
  } 
}