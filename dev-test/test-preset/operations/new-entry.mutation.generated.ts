import * as Types from '../types';

export type SubmitRepositoryMutationVariables = {
  repoFullName: Types.Maybe<Types.Scalars['String']>
};


export type SubmitRepositoryMutation = ({ __typename?: 'Mutation' } & { submitRepository: Types.Maybe<({ __typename?: 'Entry' } & Pick<Types.Entry, 'createdAt'>)> });
