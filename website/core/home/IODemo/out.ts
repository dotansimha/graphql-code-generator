/* OUTPUT */

interface Query {
  posts?: Post[];
}

interface Post {
  id: number;
  title: string;
  author: Author;
}

interface Author {
  id: number;
  firstName: string;
  lastName: string;
  posts?: Post[];
}

interface PostsAuthorArgs {
  findTitle?: string;
}