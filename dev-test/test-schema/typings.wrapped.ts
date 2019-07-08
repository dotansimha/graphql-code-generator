declare namespace GraphQL {
export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
};

export type Query = {
  __typename?: 'Query',
  allUsers: Array<Maybe<User>>,
  userById?: Maybe<User>,
};


export type QueryUserByIdArgs = {
  id: Scalars['Int']
};

export type User = {
  __typename?: 'User',
  id: Scalars['Int'],
  name: Scalars['String'],
  email: Scalars['String'],
};

}