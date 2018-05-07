/* tslint:disable */

export interface Query {
  readonly allUsers: ReadonlyArray<User | null>;
  readonly userById?: User | null;
}

export interface User {
  readonly id: number;
  readonly name: string;
  readonly email: string;
}
export interface UserByIdQueryArgs {
  id: number;
}
