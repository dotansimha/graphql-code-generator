export namespace SubmitRepository {
  export type Variables = {
    repoFullName: string;
  }

  export type Mutation = {
    submitRepository?: SubmitRepository; 
  } 

  export type SubmitRepository = {
    createdAt: number; 
  } 
}
