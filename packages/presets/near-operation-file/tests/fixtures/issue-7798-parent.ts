import { UserNameFragment } from './issue-7798-child';

export const UserFragment = /* GraphQL */ `
  fragment User on User {
    ...UserName
  }
  ${UserNameFragment}
`;
