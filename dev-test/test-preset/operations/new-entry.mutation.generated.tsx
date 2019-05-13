import * as Types from '../types';

export type SubmitRepositoryMutationVariables = {
  repoFullName: Types.Maybe<Types.Scalars['String']>
};


export type SubmitRepositoryMutation = ({ __typename?: 'Mutation' } & { submitRepository: Types.Maybe<({ __typename?: 'Entry' } & Pick<Types.Entry, 'createdAt'>)> });

import gql from 'graphql-tag';
import * as React from 'react';
import * as ReactApollo from 'react-apollo';
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export const SubmitRepositoryDocument = gql`
    mutation submitRepository($repoFullName: String!) {
  submitRepository(repoFullName: $repoFullName) {
    createdAt
  }
}
    `;
export type SubmitRepositoryMutationFn = ReactApollo.MutationFn<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>;

export const SubmitRepositoryComponent = (props: Omit<Omit<ReactApollo.MutationProps<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>, 'mutation'>, 'variables'> & { variables?: SubmitRepositoryMutationVariables }) => (
  <ReactApollo.Mutation<SubmitRepositoryMutation, SubmitRepositoryMutationVariables> mutation={SubmitRepositoryDocument} {...props} />
);

export type SubmitRepositoryProps<TChildProps = {}> = Partial<ReactApollo.MutateProps<SubmitRepositoryMutation, SubmitRepositoryMutationVariables>> & TChildProps;
export function withSubmitRepository<TProps, TChildProps = {}>(operationOptions?: ReactApollo.OperationOption<
  TProps,
  SubmitRepositoryMutation,
  SubmitRepositoryMutationVariables,
  SubmitRepositoryProps<TChildProps>>) {
    return ReactApollo.withMutation<TProps, SubmitRepositoryMutation, SubmitRepositoryMutationVariables, SubmitRepositoryProps<TChildProps>>(SubmitRepositoryDocument, {
      alias: 'withSubmitRepository',
      ...operationOptions
    });
}
