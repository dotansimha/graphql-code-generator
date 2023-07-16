export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

export type Query = {
  __typename?: 'Query';
  allUsers: Array<Maybe<User>>;
  /**
   *  Generates a new answer for th
   * guessing game
   */
  answer: Array<Scalars['Int']['output']>;
  testArr1?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  testArr2: Array<Maybe<Scalars['String']['output']>>;
  testArr3: Array<Scalars['String']['output']>;
  userById?: Maybe<User>;
};

export type QueryUserByIdArgs = {
  id: Scalars['Int']['input'];
};

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type TestQueryVariables = Exact<{ [key: string]: never }>;

export type TestQuery = {
  __typename?: 'Query';
  testArr1?: Array<string | null> | null;
  testArr2: Array<string | null>;
  testArr3: Array<string>;
};
