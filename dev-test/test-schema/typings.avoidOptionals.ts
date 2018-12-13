export type Maybe<T> = T | null;








// ====================================================
// Types
// ====================================================



export interface Query {

  allUsers: (Maybe<User>)[];

  userById: Maybe<User>;
}


export interface User {

  id: number;

  name: string;

  email: string;
}



// ====================================================
// Arguments
// ====================================================

export interface UserByIdQueryArgs {

  id: number;
}


