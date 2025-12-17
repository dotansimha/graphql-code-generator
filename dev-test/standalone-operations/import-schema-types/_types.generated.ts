import type * as Types from './_base.generated';

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type WithVariablesQueryVariables = Exact<{
  role?: Types.UserRole | null;
}>;

export type WithVariablesQuery = {
  __typename?: 'Query';
  user: { __typename?: 'User'; id: string; name: string } | null;
};
