export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Query = {
  __typename?: 'Query';
  allUsers: Array<Maybe<User>>;
  /**
   *  Generates a new answer for th
   * guessing game
   */
  answer: Array<Scalars['Int']>;
  testArr1?: Maybe<Array<Maybe<Scalars['String']>>>;
  testArr2: Array<Maybe<Scalars['String']>>;
  testArr3: Array<Scalars['String']>;
  userById?: Maybe<User>;
};

export type QueryUserByIdArgs = {
  id: Scalars['Int'];
};

export type User = {
  __typename?: 'User';
  email: Scalars['String'];
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type TestQueryVariables = Exact<{ [key: string]: never }>;

export type TestQuery = {
  __typename?: 'Query';
  testArr1?: Array<string | null> | null;
  testArr2: Array<string | null>;
  testArr3: Array<string>;
};
