export namespace TwoHeroes {
  export type Variables = {
  }

  export type Query = {
    r2: R2 | null; 
    luke: Luke | null; 
  } 

  export type R2 = {
    name: string; 
  }

  export type Luke = {
    name: string; 
  }
}
