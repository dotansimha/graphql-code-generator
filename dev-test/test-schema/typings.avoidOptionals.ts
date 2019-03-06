type Maybe<T> = T | null;
export type Query = {
  allUsers: Array<Maybe<User>>,
  userById: Maybe<User>,
};


export type QueryUserByIdArgs = {
  id: number
};

export type User = {
  id: number,
  name: string,
  email: string,
};
