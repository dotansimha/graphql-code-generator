import * as Types from '../types';

export type CurrentUserForProfileQueryVariables = {};


export type CurrentUserForProfileQuery = ({ __typename?: 'Query' } & { currentUser: Types.Maybe<({ __typename?: 'User' } & Pick<Types.User, 'login' | 'avatar_url'>)> });
