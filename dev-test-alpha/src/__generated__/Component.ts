/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import type * as Types from '../../graphql-code-generator/dev-test-alpha/src/__generated__/globalTypes';

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export enum UserManagerRoleType {
  ROLE_TYPE_1 = 'ROLE_TYPE_1',
  ROLE_TYPE_2 = 'ROLE_TYPE_2',
  ROLE_TYPE_3 = 'ROLE_TYPE_3',
}

export type GetFoo_superUser_SuperUser_groupFromAlias_SuperUserGroup_managers_UserManager_fooUser_User_profilePhoto_UserProfilePhoto_photoUrl_UserPhotoUrl =
  {
    __typename: 'UserPhotoUrl';
    url: string | null;
  };

export type GetFoo_superUser_SuperUser_groupFromAlias_SuperUserGroup_managers_UserManager_fooUser_User_profilePhoto_UserProfilePhoto =
  {
    __typename: 'UserProfilePhoto';
    photoUrl: GetFoo_superUser_SuperUser_groupFromAlias_SuperUserGroup_managers_UserManager_fooUser_User_profilePhoto_UserProfilePhoto_photoUrl_UserPhotoUrl | null;
  };

export type GetFoo_superUser_SuperUser_groupFromAlias_SuperUserGroup_managers_UserManager_fooUser_User = {
  __typename: 'User';
  profilePhoto: GetFoo_superUser_SuperUser_groupFromAlias_SuperUserGroup_managers_UserManager_fooUser_User_profilePhoto_UserProfilePhoto | null;
};

export type GetFoo_superUser_SuperUser_groupFromAlias_SuperUserGroup_managers_UserManager = {
  __typename: 'UserManager';
  roleType: Types.UserManagerRoleType;
  fooUser: GetFoo_superUser_SuperUser_groupFromAlias_SuperUserGroup_managers_UserManager_fooUser_User;
};

export type GetFoo_superUser_SuperUser_groupFromAlias_SuperUserGroup = {
  __typename: 'SuperUserGroup';
  managers: Array<GetFoo_superUser_SuperUser_groupFromAlias_SuperUserGroup_managers_UserManager> | null;
};

export type GetFoo_superUser_SuperUser = {
  __typename: 'SuperUser';
  groupFromAlias: GetFoo_superUser_SuperUser_groupFromAlias_SuperUserGroup;
};

export type GetFoo_Query = {
  superUser: GetFoo_superUser_SuperUser;
};

export type GetFooVariables = Exact<{
  alias: string;
  collectionId: string;
}>;

export type GetFoo = GetFoo_Query;
