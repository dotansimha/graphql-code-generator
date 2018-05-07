import { Comment } from './comment.type';

export interface Subscription {
  commentAdded?: Comment | null /** Subscription fires on every comment added */;
}

export interface CommentAddedSubscriptionArgs {
  repoFullName: string;
}
