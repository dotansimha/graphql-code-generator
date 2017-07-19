export namespace HumanWithNullHeight {
  export type Variables = {
  }

  export type Query = {
    human: Human | null; 
  } 

  export type Human = {
    name: string; 
    mass: number | null; 
  }
}
