import { CommentsPageComment } from './commentspagecomment.fragment';
export namespace SubmitComment {
  export type Variables = {
    repoFullName: string;
    commentContent: string;
  };

  export type Mutation = {
    __typename?: 'Mutation';
    submitComment?: SubmitComment | null;
  };

  export type SubmitComment = CommentsPageComment.Fragment;
}
