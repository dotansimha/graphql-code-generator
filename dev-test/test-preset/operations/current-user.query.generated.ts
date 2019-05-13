import * as Types from '../types';

type Maybe<T> = T | null;

export type CurrentUserForProfileQueryVariables = {};


export type CurrentUserForProfileQuery = ({ __typename?: 'Query' } & { currentUser: Maybe<({ __typename?: 'User' } & Pick<Types.User, 'login' | 'avatar_url'>)> });
