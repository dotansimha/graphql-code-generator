type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type UserQueryVariables = Exact<{
  id: string;
}>;

export type UserQuery = {
  __typename?: 'Query';
  user?: { __typename?: 'User'; id: string; name: string; role: UserRole } | null;
};
