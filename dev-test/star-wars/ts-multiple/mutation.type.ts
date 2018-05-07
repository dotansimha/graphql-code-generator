import { Review } from './review.type';
import { Episode } from './episode.enum';
import { ReviewInput } from './reviewinput.input-type';
/** The mutation type, represents all updates we can make to our data */
export interface Mutation {
  createReview?: Review | null;
}

export interface CreateReviewMutationArgs {
  episode?: Episode | null;
  review: ReviewInput;
}
