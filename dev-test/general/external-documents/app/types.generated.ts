/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type UserRole = 'ADMIN' | 'CUSTOMER';

export type UserQueryVariables = Exact<{
  id: string | number;
}>;

export type UserQuery = { user: { id: string; name: string; role: UserRole } | null };
