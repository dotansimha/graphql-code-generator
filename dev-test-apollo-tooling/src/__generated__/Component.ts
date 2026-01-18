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

export type GetFoo_superUser_groupFromAlias_managers_fooUser_profilePhoto_photoUrl = {
  __typename: 'UserPhotoUrl';
  url: string | null;
};

export type GetFoo_superUser_groupFromAlias_managers_fooUser_profilePhoto = {
  __typename: 'UserProfilePhoto';
  photoUrl: GetFoo_superUser_groupFromAlias_managers_fooUser_profilePhoto_photoUrl | null;
};

export type GetFoo_superUser_groupFromAlias_managers_fooUser = {
  __typename: 'User';
  profilePhoto: GetFoo_superUser_groupFromAlias_managers_fooUser_profilePhoto | null;
};

export type GetFoo_superUser_groupFromAlias_managers = {
  __typename: 'UserManager';
  roleType: Types.UserManagerRoleType;
  fooUser: GetFoo_superUser_groupFromAlias_managers_fooUser;
};

export type GetFoo_superUser_groupFromAlias = {
  __typename: 'SuperUserGroup';
  managers: Array<GetFoo_superUser_groupFromAlias_managers> | null;
};

export type GetFoo_superUser = {
  __typename: 'SuperUser';
  groupFromAlias: GetFoo_superUser_groupFromAlias;
};

export type GetFoo = {
  superUser: GetFoo_superUser;
};

export type GetFooVariables = Exact<{
  alias: string;
  collectionId: string;
}>;
