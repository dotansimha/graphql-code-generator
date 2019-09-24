import * as Types from '../types.d';

export type CreateReviewForEpisodeMutationVariables = {
  episode: Types.Episode;
  review: Types.ReviewInput;
};

export type CreateReviewForEpisodeMutation = { __typename?: 'Mutation' } & { createReview: Types.Maybe<{ __typename?: 'Review' } & Pick<Types.Review, 'stars' | 'commentary'>> };
