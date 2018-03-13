import { Episode } from './episode.enum';
import { ReviewInput } from './reviewinput.input-type';
export namespace CreateReviewForEpisode {
  export type Variables = {
    episode: Episode;
    review: ReviewInput;
  }

  export type Mutation = {
    __typename?: "Mutation";
    createReview?: CreateReview | null; 
  }

  export type CreateReview = {
    __typename?: "Review";
    stars: number; 
    commentary?: string | null; 
  }
}
