// tslint:disable

export interface CreateMessageInput {
  description: string;
}

// ====================================================
// Documents
// ====================================================

export type GetMessagesVariables = {
  tab: string;
};

export type GetMessagesQuery = {
  __typename?: 'Query';

  messages?: GetMessagesMessages[] | null;
};

export type GetMessagesMessages = {
  __typename?: 'Message';

  id: string;
};

export type CreateMessageVariables = {
  args: CreateMessageInput;
};

export type CreateMessageMutation = {
  __typename?: 'Mutation';

  createMessage?: CreateMessageCreateMessage | null;
};

export type CreateMessageCreateMessage = {
  __typename?: 'Message';

  id: string;
};

export type DeclineVariables = {
  id: string;
  reason: string;
};

export type DeclineMutation = {
  __typename?: 'Mutation';

  decline?: DeclineDecline | null;
};

export type DeclineDecline = {
  __typename?: 'Message';

  id: string;
};

export type ApproveVariables = {
  id: string;
};

export type ApproveMutation = {
  __typename?: 'Mutation';

  approve?: ApproveApprove | null;
};

export type ApproveApprove = {
  __typename?: 'Message';

  id: string;
};

export type EscalateVariables = {
  id: string;
};

export type EscalateMutation = {
  __typename?: 'Mutation';

  escalate?: EscalateEscalate | null;
};

export type EscalateEscalate = {
  __typename?: 'Message';

  id: string;
};

import * as ReactApollo from 'react-apollo';
import * as React from 'react';

import gql from 'graphql-tag';

// ====================================================
// Components
// ====================================================

export const GetMessagesDocument = gql`
  query GetMessages($tab: String!) {
    messages(tab: $tab) {
      id
    }
  }
`;
export class GetMessagesComponent extends React.Component<
  Partial<ReactApollo.QueryProps<GetMessagesQuery, GetMessagesVariables>>
> {
  render() {
    return (
      <ReactApollo.Query<GetMessagesQuery, GetMessagesVariables>
        query={GetMessagesDocument}
        {...(this as any)['props'] as any}
      />
    );
  }
}
export type GetMessagesProps = Partial<ReactApollo.DataProps<GetMessagesQuery, GetMessagesVariables>>;
export function GetMessagesHOC<TProps>(
  operationOptions:
    | ReactApollo.OperationOption<TProps, GetMessagesQuery, GetMessagesVariables, GetMessagesProps>
    | undefined
) {
  return ReactApollo.graphql<TProps, GetMessagesQuery, GetMessagesVariables>(GetMessagesDocument, operationOptions);
}
export const CreateMessageDocument = gql`
  mutation CreateMessage($args: CreateMessageInput!) {
    createMessage(args: $args) {
      id
    }
  }
`;
export class CreateMessageComponent extends React.Component<
  Partial<ReactApollo.MutationProps<CreateMessageMutation, CreateMessageVariables>>
> {
  render() {
    return (
      <ReactApollo.Mutation<CreateMessageMutation, CreateMessageVariables>
        mutation={CreateMessageDocument}
        {...(this as any)['props'] as any}
      />
    );
  }
}
export type CreateMessageProps = Partial<ReactApollo.MutateProps<CreateMessageMutation, CreateMessageVariables>>;
export type CreateMessageMutationFn = ReactApollo.MutationFn<CreateMessageMutation, CreateMessageVariables>;
export function CreateMessageHOC<TProps>(
  operationOptions:
    | ReactApollo.OperationOption<TProps, CreateMessageMutation, CreateMessageVariables, CreateMessageProps>
    | undefined
) {
  return ReactApollo.graphql<TProps, CreateMessageMutation, CreateMessageVariables>(
    CreateMessageDocument,
    operationOptions
  );
}
export const DeclineDocument = gql`
  mutation Decline($id: ID!, $reason: String!) {
    decline(id: $id, reason: $reason) {
      id
    }
  }
`;
export class DeclineComponent extends React.Component<
  Partial<ReactApollo.MutationProps<DeclineMutation, DeclineVariables>>
> {
  render() {
    return (
      <ReactApollo.Mutation<DeclineMutation, DeclineVariables>
        mutation={DeclineDocument}
        {...(this as any)['props'] as any}
      />
    );
  }
}
export type DeclineProps = Partial<ReactApollo.MutateProps<DeclineMutation, DeclineVariables>>;
export type DeclineMutationFn = ReactApollo.MutationFn<DeclineMutation, DeclineVariables>;
export function DeclineHOC<TProps>(
  operationOptions: ReactApollo.OperationOption<TProps, DeclineMutation, DeclineVariables, DeclineProps> | undefined
) {
  return ReactApollo.graphql<TProps, DeclineMutation, DeclineVariables>(DeclineDocument, operationOptions);
}
export const ApproveDocument = gql`
  mutation Approve($id: ID!) {
    approve(id: $id) {
      id
    }
  }
`;
export class ApproveComponent extends React.Component<
  Partial<ReactApollo.MutationProps<ApproveMutation, ApproveVariables>>
> {
  render() {
    return (
      <ReactApollo.Mutation<ApproveMutation, ApproveVariables>
        mutation={ApproveDocument}
        {...(this as any)['props'] as any}
      />
    );
  }
}
export type ApproveProps = Partial<ReactApollo.MutateProps<ApproveMutation, ApproveVariables>>;
export type ApproveMutationFn = ReactApollo.MutationFn<ApproveMutation, ApproveVariables>;
export function ApproveHOC<TProps>(
  operationOptions: ReactApollo.OperationOption<TProps, ApproveMutation, ApproveVariables, ApproveProps> | undefined
) {
  return ReactApollo.graphql<TProps, ApproveMutation, ApproveVariables>(ApproveDocument, operationOptions);
}
export const EscalateDocument = gql`
  mutation Escalate($id: ID!) {
    escalate(id: $id) {
      id
    }
  }
`;
export class EscalateComponent extends React.Component<
  Partial<ReactApollo.MutationProps<EscalateMutation, EscalateVariables>>
> {
  render() {
    return (
      <ReactApollo.Mutation<EscalateMutation, EscalateVariables>
        mutation={EscalateDocument}
        {...(this as any)['props'] as any}
      />
    );
  }
}
export type EscalateProps = Partial<ReactApollo.MutateProps<EscalateMutation, EscalateVariables>>;
export type EscalateMutationFn = ReactApollo.MutationFn<EscalateMutation, EscalateVariables>;
export function EscalateHOC<TProps>(
  operationOptions: ReactApollo.OperationOption<TProps, EscalateMutation, EscalateVariables, EscalateProps> | undefined
) {
  return ReactApollo.graphql<TProps, EscalateMutation, EscalateVariables>(EscalateDocument, operationOptions);
}
