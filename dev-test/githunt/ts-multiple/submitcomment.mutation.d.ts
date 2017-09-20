import { CommentsPageComment } from './commentspagecomment.fragment';
export namespace SubmitComment {
  export type Variables = {
    repoFullName: string;
    commentContent: string;
  }

  export type Mutation = {
    submitComment?: SubmitComment; 
  } 

  export type SubmitComment = CommentsPageComment.Fragment
}
