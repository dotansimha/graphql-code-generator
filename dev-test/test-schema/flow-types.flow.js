// @flow

export type Query = {
  allUsers: Array<?User>,
  userById: ?User
};

export type User = {
  id: number,
  name: string,
  email: string
};
