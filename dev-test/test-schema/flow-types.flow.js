/* @flow */

export type Query = {
  allUsers: Array<?User>,
  userById: ?User,
};


export type QueryUserByIdArgs = {
  id: number
};

export type User = {
  id: number,
  name: string,
  email: string,
};
