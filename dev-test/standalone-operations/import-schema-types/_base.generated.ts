/** UserRole Description */
export type UserRole =
  /** UserRole ADMIN */
  | 'ADMIN'
  /** UserRole CUSTOMER */
  | 'CUSTOMER';

export type UsersInput = {
  name?: string | null | undefined;
  nestedInput?: UsersInput | null | undefined;
  role?: UserRole | null | undefined;
};
