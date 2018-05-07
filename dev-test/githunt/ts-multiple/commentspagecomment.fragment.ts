export namespace CommentsPageComment {
  export type Fragment = {
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
