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
  answer: Array<Scalars['Int']>,
  testArr1?: Maybe<Array<Maybe<Scalars['String']>>>,
  testArr2: Array<Maybe<Scalars['String']>>,
  testArr3: Array<Scalars['String']>,
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
export type TestQueryVariables = {};


export type TestQuery = { __typename?: 'Query', testArr1: Maybe<Array<Maybe<string>>>, testArr2: Array<Maybe<string>>, testArr3: Array<string> };
