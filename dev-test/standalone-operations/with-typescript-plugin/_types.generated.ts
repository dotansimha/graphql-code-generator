import type * as Types from './_base.generated.js';

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type WithVariablesQueryVariables = Exact<{
  role?: Types.UserRole | null | undefined;
}>;

export type WithVariablesQuery = { user: { id: string; name: string } | null };

export type UsersQueryVariables = Exact<{
  input: Types.UsersInput;
}>;

export type UsersQuery = { users: Array<{ id: string }> };
