import { Entry } from './entry.type';
import { VoteType } from './votetype.enum';
import { Comment } from './comment.type';

export interface Mutation {
  submitRepository?: Entry; /* Submit a new repository, returns the new submission */
  vote?: Entry; /* Vote on a repository submission, returns the submission that was voted on */
  submitComment?: Comment; /* Comment on a repository, returns the new comment */
}

export interface SubmitRepositoryMutationArgs {
  repoFullName: string; /* The full repository name from GitHub, e.g. &quot;apollostack/GitHunt-API&quot; */
}
export interface VoteMutationArgs {
  repoFullName: string; /* The full repository name from GitHub, e.g. &quot;apollostack/GitHunt-API&quot; */
  type: VoteType; /* The type of vote - UP, DOWN, or CANCEL */
}
export interface SubmitCommentMutationArgs {
  repoFullName: string; /* The full repository name from GitHub, e.g. &quot;apollostack/GitHunt-API&quot; */
  commentContent: string; /* The text content for the new comment */
}
