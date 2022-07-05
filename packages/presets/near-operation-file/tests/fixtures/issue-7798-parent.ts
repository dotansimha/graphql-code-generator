import { UserNameFragment } from './issue-7798-child.js';

export const UserFragment = /* GraphQL */ `
  fragment User on User {
    ...UserName
  }
  ${UserNameFragment}
`;
