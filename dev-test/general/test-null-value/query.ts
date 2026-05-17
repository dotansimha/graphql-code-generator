export const MY_QUERY = /* GraphQL */ `
  fragment CartLine on CartLine {
    id
    quantity
  }

  query Test {
    cart {
      lines {
        nodes {
          ...CartLine
        }
      }
    }
  }
`;
