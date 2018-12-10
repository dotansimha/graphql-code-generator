






// ====================================================
// Types
// ====================================================



export interface Query {

  allUsers: (User | null)[];

  userById?: User | null;
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


