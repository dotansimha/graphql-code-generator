import { Episode } from './episode.enum';
import { ReviewInput } from './reviewinput.input-type';
export namespace CreateReviewForEpisode {
  export type Variables = {
    episode: Episode;
    review: ReviewInput;
  }

  export type Mutation = {
    createReview: CreateReview | null; 
  } 

  export type CreateReview = {
    stars: number; 
    commentary: string | null; 
  }
}
