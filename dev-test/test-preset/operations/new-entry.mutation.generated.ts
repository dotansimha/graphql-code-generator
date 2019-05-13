import * as Types from '../types';

type Maybe<T> = T | null;

export type SubmitRepositoryMutationVariables = {
  repoFullName: Types.Scalars['String']
};


export type SubmitRepositoryMutation = ({ __typename?: 'Mutation' } & { submitRepository: Maybe<({ __typename?: 'Entry' } & Pick<Types.Entry, 'createdAt'>)> });
