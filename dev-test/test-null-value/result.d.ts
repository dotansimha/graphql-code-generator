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

export type BaseCartLine = {
  id: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
};

export type BaseCartLineConnection = {
  id: Scalars['String']['output'];
  nodes: Array<BaseCartLine>;
};

export type Cart = {
  id: Scalars['String']['output'];
  lines: BaseCartLineConnection;
};

export type CartLine = BaseCartLine & {
  id: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
};

export type ComponentizableCartLine = BaseCartLine & {
  id: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
};

export type QueryRoot = {
  cart?: Maybe<Cart>;
};

export type CartLineFragment = { id: string; quantity: number };

export type TestQueryVariables = Exact<{ [key: string]: never }>;

export type TestQuery = { cart?: { lines: { nodes: Array<{ id: string; quantity: number }> } } | null };
