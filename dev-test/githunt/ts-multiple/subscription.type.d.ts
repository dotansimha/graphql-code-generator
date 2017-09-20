import { Comment } from './comment.type';

export interface Subscription {
  commentAdded?: Comment; /* Subscription fires on every comment added */
}

export interface CommentAddedSubscriptionArgs {
  repoFullName: string; 
}
