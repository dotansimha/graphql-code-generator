export namespace SubmitRepository {
  export type Variables = {
    repoFullName: string;
  };

  export type Mutation = {
    __typename?: 'Mutation';
    submitRepository?: SubmitRepository | null;
  };

  export type SubmitRepository = {
    __typename?: 'Entry';
    createdAt: number;
  };
}
