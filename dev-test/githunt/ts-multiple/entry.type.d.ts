import { Repository } from './repository.type';
import { User } from './user.type';
import { Comment } from './comment.type';
import { Vote } from './vote.type';
/* Information about a GitHub repository submitted to GitHunt */
export interface Entry {
  repository: Repository; /* Information about the repository from GitHub */
  postedBy: User; /* The GitHub user who submitted this entry */
  createdAt: number; /* A timestamp of when the entry was submitted */
  score: number; /* The score of this repository, upvotes - downvotes */
  hotScore: number; /* The hot score of this repository */
  comments: Comment[]; /* Comments posted about this repository */
  commentCount: number; /* The number of comments posted about this repository */
  id: number; /* The SQL ID of this entry */
  vote: Vote; /* XXX to be changed */
}

export interface CommentsEntryArgs {
  limit?: number; 
  offset?: number; 
}
