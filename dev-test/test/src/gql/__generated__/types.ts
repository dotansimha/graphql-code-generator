export type Maybe<T> = T | null;
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
  things: TypeA;
};

export type TypeA = {
  __typename?: 'TypeA';
  field1?: Maybe<Scalars['String']>;
  field2?: Maybe<Scalars['String']>;
  field3?: Maybe<Scalars['String']>;
  field4?: Maybe<Scalars['String']>;
  field5?: Maybe<Scalars['String']>;
  field6?: Maybe<Scalars['String']>;
  field7?: Maybe<TypeB>;
};

export type TypeB = {
  __typename?: 'TypeB';
  param1?: Maybe<Scalars['String']>;
  param2?: Maybe<Scalars['String']>;
};
