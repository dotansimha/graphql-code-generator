export namespace OnCommentAdded {
  export type Variables = {
    repoFullName: string;
  }

  export type Subscription = {
    commentAdded?: CommentAdded; 
  } 

  export type CommentAdded = {
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
