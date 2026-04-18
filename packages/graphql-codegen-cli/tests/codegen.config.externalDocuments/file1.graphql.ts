export const doc1 = /* GraphQL */ `
  query Root {
    user {
      id
    }
  }
`;

// Duplicate of doc1, so should be deduped
export const doc2 = /* GraphQL */ `
  query Root {
    user {
      id
    }
  }
`;
