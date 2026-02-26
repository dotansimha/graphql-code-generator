type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type TestQueryVariables = Exact<{ [key: string]: never }>;

export type TestQuery = {
  testArr1: Array<string | null> | null;
  testArr2: Array<string | null>;
  testArr3: Array<string>;
};
