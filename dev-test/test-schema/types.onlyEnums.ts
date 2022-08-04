export type TestQueryVariables = Exact<{ [key: string]: never }>;

export type TestQuery = {
  __typename?: 'Query';
  testArr1?: Array<string | null> | null;
  testArr2: Array<string | null>;
  testArr3: Array<string>;
};
