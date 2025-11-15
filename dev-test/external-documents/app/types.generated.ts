type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type UserQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type UserQuery = {
  __typename?: 'Query';
  user?: { __typename?: 'User'; id: string; name: string; role: UserRole } | null;
};
