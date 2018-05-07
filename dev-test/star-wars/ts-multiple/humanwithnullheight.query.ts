export namespace HumanWithNullHeight {
  export type Variables = {};

  export type Query = {
    __typename?: 'Query';
    human?: Human | null;
  };

  export type Human = {
    __typename?: 'Human';
    name: string;
    mass?: number | null;
  };
}
