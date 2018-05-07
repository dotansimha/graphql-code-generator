import { User } from './user.type';
/** A comment about an entry, submitted by a user */
export interface Comment {
  id: number /** The SQL ID of this entry */;
  postedBy: User /** The GitHub user who posted the comment */;
  createdAt: number /** A timestamp of when the comment was posted */;
  content: string /** The text of the comment */;
  repoName: string /** The repository which this comment is about */;
}
