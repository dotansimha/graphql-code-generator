import * as Types from '../types.d.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type CreateReviewForEpisodeMutationVariables = Types.Exact<{
  episode: Types.Episode;
  review: Types.ReviewInput;
}>;

export type CreateReviewForEpisodeMutation = {
  __typename?: 'Mutation';
  createReview?: { __typename?: 'Review'; stars: number; commentary?: string | null } | null;
};

export const CreateReviewForEpisodeDocument = gql`
  mutation CreateReviewForEpisode($episode: Episode!, $review: ReviewInput!) {
    createReview(episode: $episode, review: $review) {
      stars
      commentary
    }
  }
`;
export type CreateReviewForEpisodeMutationFn = Apollo.MutationFunction<
  CreateReviewForEpisodeMutation,
  CreateReviewForEpisodeMutationVariables
>;

/**
 * __useCreateReviewForEpisodeMutation__
 *
 * To run a mutation, you first call `useCreateReviewForEpisodeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateReviewForEpisodeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createReviewForEpisodeMutation, { data, loading, error }] = useCreateReviewForEpisodeMutation({
 *   variables: {
 *      episode: // value for 'episode'
 *      review: // value for 'review'
 *   },
 * });
 */
export function useCreateReviewForEpisodeMutation(
  baseOptions?: Apollo.MutationHookOptions<CreateReviewForEpisodeMutation, CreateReviewForEpisodeMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreateReviewForEpisodeMutation, CreateReviewForEpisodeMutationVariables>(
    CreateReviewForEpisodeDocument,
    options
  );
}
export type CreateReviewForEpisodeMutationHookResult = ReturnType<typeof useCreateReviewForEpisodeMutation>;
export type CreateReviewForEpisodeMutationResult = Apollo.MutationResult<CreateReviewForEpisodeMutation>;
export type CreateReviewForEpisodeMutationOptions = Apollo.BaseMutationOptions<
  CreateReviewForEpisodeMutation,
  CreateReviewForEpisodeMutationVariables
>;
