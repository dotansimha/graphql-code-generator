export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type User = {
  __typename?: 'User';
  id: Scalars['Int'];
  name: Scalars['String'];
  email: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  allUsers: Array<Maybe<User>>;
  userById?: Maybe<User>;
  /**
   *  Generates a new answer for th
   * guessing game
   */
  answer: Array<Scalars['Int']>;
  testArr1?: Maybe<Array<Maybe<Scalars['String']>>>;
  testArr2: Array<Maybe<Scalars['String']>>;
  testArr3: Array<Scalars['String']>;
};

export type QueryUserByIdArgs = {
  id: Scalars['Int'];
};

export type TestQueryVariables = Exact<{ [key: string]: never }>;

export type TestQuery = {
  __typename?: 'Query';
  testArr1?: Maybe<Array<Maybe<string>>>;
  testArr2: Array<Maybe<string>>;
  testArr3: Array<string>;
};
