type Maybe<T> = T | null;
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
};

export type Query = {
  allUsers: Array<Maybe<User>>,
  userById?: Maybe<User>,
};


export type QueryUserByIdArgs = {
  id: Scalars['Int']
};

export type User = {
  id: Scalars['Int'],
  name: Scalars['String'],
  email: Scalars['String'],
};
