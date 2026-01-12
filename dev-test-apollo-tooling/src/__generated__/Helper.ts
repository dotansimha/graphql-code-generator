/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import type * as Types from '../../dev-test-apollo-tooling/src/__generated__/globalTypes';

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export enum UserManagerRoleType {
  ROLE_TYPE_1 = 'ROLE_TYPE_1',
  ROLE_TYPE_2 = 'ROLE_TYPE_2',
  ROLE_TYPE_3 = 'ROLE_TYPE_3',
}

export type HelperFields_UserManager_fooUser_User_profilePhoto_UserProfilePhoto_photoUrl_UserPhotoUrl = {
  __typename: 'UserPhotoUrl';
  url: string | null;
};

export type HelperFields_UserManager_fooUser_User_profilePhoto_UserProfilePhoto = {
  __typename: 'UserProfilePhoto';
  photoUrl: HelperFields_UserManager_fooUser_User_profilePhoto_UserProfilePhoto_photoUrl_UserPhotoUrl | null;
};

export type HelperFields_UserManager_fooUser_User = {
  __typename: 'User';
  profilePhoto: HelperFields_UserManager_fooUser_User_profilePhoto_UserProfilePhoto | null;
};

export type HelperFields = {
  __typename: 'UserManager';
  roleType: Types.UserManagerRoleType;
  fooUser: HelperFields_UserManager_fooUser_User;
};
