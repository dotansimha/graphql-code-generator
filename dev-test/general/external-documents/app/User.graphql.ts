/* GraphQL */ `
  query User($id: ID!) {
    user(id: $id) {
      id
      ...UserFragment
    }
  }
`;
