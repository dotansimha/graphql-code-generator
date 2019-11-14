import gql from 'graphql-tag';

// tslint:disable-next-line:variable-name
export const GetMessages = gql`
  query GetMessages($tab: String!) {
    messages(tab: $tab) {
      id
    }
  }
`;

// tslint:disable-next-line:variable-name
export const CreateMessage = gql`
  mutation CreateMessage($args: CreateMessageInput!) {
    createMessage(args: $args) {
      id
    }
  }
`;

// tslint:disable-next-line:variable-name
export const Decline = gql`
  mutation Decline($id: ID!, $reason: String!) {
    decline(id: $id, reason: $reason) {
      id
    }
  }
`;

// tslint:disable-next-line:variable-name
export const Approve = gql`
  mutation Approve($id: ID!) {
    approve(id: $id) {
      id
    }
  }
`;

// tslint:disable-next-line:variable-name
export const Escalate = gql`
  mutation Escalate($id: ID!) {
    escalate(id: $id) {
      id
    }
  }
`;
