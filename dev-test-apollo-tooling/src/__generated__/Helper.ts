/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import type * as Types from '../unused';

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export enum UserManagerRoleType {
  ROLE_TYPE_1 = 'ROLE_TYPE_1',
  ROLE_TYPE_2 = 'ROLE_TYPE_2',
  ROLE_TYPE_3 = 'ROLE_TYPE_3',
}

export type HelperFields_fooUser_profilePhoto_photoUrl = {
  __typename: 'UserPhotoUrl';
  url: string | null;
};

export type HelperFields_fooUser_profilePhoto = {
  __typename: 'UserProfilePhoto';
  photoUrl: HelperFields_fooUser_profilePhoto_photoUrl | null;
};

export type HelperFields_fooUser = {
  __typename: 'User';
  profilePhoto: HelperFields_fooUser_profilePhoto | null;
};

export type HelperFields = {
  __typename: 'UserManager';
  roleType: Types.UserManagerRoleType;
  fooUser: HelperFields_fooUser;
};
