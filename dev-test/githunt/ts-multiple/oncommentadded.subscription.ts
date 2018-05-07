export namespace OnCommentAdded {
  export type Variables = {
    repoFullName: string;
  };

  export type Subscription = {
    __typename?: 'Subscription';
    commentAdded?: CommentAdded | null;
  };

  export type CommentAdded = {
    __typename?: 'Comment';
    id: number;
    postedBy: PostedBy;
    createdAt: number;
    content: string;
  };

  export type PostedBy = {
    __typename?: 'User';
    login: string;
    html_url: string;
  };
}
