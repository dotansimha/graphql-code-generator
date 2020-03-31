export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type TestQueryVariables = {};

export type TestQuery = {
  __typename?: 'Query';
  testArr1?: Maybe<Array<Maybe<string>>>;
  testArr2: Array<Maybe<string>>;
  testArr3: Array<string>;
};
