export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
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
  user?: Maybe<User>;
  users: Array<User>;
};

export type QueryUserArgs = {
  id: Scalars['ID']['input'];
  role?: InputMaybe<UserRole>;
};

export type QueryUsersArgs = {
  input: UsersInput;
};

export type User = {
  __typename?: 'User';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  role: UserRole;
};

/** UserRole Description */
export enum UserRole {
  /** UserRole ADMIN */
  Admin = 'ADMIN',
  /** UserRole CUSTOMER */
  Customer = 'CUSTOMER',
}

export enum UserStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
}

export type UsersInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  nestedInput?: InputMaybe<UsersInput>;
  role?: InputMaybe<UserRole>;
};
