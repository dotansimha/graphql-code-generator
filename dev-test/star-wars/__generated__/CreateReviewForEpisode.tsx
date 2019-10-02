import * as Types from '../types.d';

import gql from 'graphql-tag';
import * as ApolloReactCommon from '@apollo/react-common';
import * as React from 'react';
import * as ApolloReactComponents from '@apollo/react-components';
import * as ApolloReactHoc from '@apollo/react-hoc';
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type CreateReviewForEpisodeMutationVariables = {
  episode: Types.Episode;
  review: Types.ReviewInput;
};

export type CreateReviewForEpisodeMutation = { __typename?: 'Mutation' } & { createReview: Types.Maybe<{ __typename?: 'Review' } & Pick<Types.Review, 'stars' | 'commentary'>> };

export const CreateReviewForEpisodeDocument = gql`
  mutation CreateReviewForEpisode($episode: Episode!, $review: ReviewInput!) {
    createReview(episode: $episode, review: $review) {
      stars
      commentary
    }
  }
`;
export type CreateReviewForEpisodeMutationFn = ApolloReactCommon.MutationFunction<CreateReviewForEpisodeMutation, CreateReviewForEpisodeMutationVariables>;
export type CreateReviewForEpisodeComponentProps = Omit<ApolloReactComponents.MutationComponentOptions<CreateReviewForEpisodeMutation, CreateReviewForEpisodeMutationVariables>, 'mutation'>;

export const CreateReviewForEpisodeComponent = (props: CreateReviewForEpisodeComponentProps) => (
  <ApolloReactComponents.Mutation<CreateReviewForEpisodeMutation, CreateReviewForEpisodeMutationVariables> mutation={CreateReviewForEpisodeDocument} {...props} />
);

export type CreateReviewForEpisodeProps<TChildProps = {}> = ApolloReactHoc.MutateProps<CreateReviewForEpisodeMutation, CreateReviewForEpisodeMutationVariables> & TChildProps;
export function withCreateReviewForEpisode<TProps, TChildProps = {}>(operationOptions?: ApolloReactHoc.OperationOption<TProps, CreateReviewForEpisodeMutation, CreateReviewForEpisodeMutationVariables, CreateReviewForEpisodeProps<TChildProps>>) {
  return ApolloReactHoc.withMutation<TProps, CreateReviewForEpisodeMutation, CreateReviewForEpisodeMutationVariables, CreateReviewForEpisodeProps<TChildProps>>(CreateReviewForEpisodeDocument, {
    alias: 'createReviewForEpisode',
    ...operationOptions,
  });
}
export type CreateReviewForEpisodeMutationResult = ApolloReactCommon.MutationResult<CreateReviewForEpisodeMutation>;
export type CreateReviewForEpisodeMutationOptions = ApolloReactCommon.BaseMutationOptions<CreateReviewForEpisodeMutation, CreateReviewForEpisodeMutationVariables>;
