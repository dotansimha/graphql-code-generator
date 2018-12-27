// tslint:disable
export type Maybe<T> = T | null;


export interface CreateMessageInput {
  
  description: string;
}


// ====================================================
// Documents
// ====================================================



  export type GetMessagesVariables = {
    tab: string;
  }

  export type GetMessagesQuery = {
    __typename?: "Query";
    
    messages: Maybe<GetMessagesMessages[]>;
  }

  export type GetMessagesMessages = {
    __typename?: "Message";
    
    id: string;
  } 

  export type CreateMessageVariables = {
    args: CreateMessageInput;
  }

  export type CreateMessageMutation = {
    __typename?: "Mutation";
    
    createMessage: Maybe<CreateMessageCreateMessage>;
  }

  export type CreateMessageCreateMessage = {
    __typename?: "Message";
    
    id: string;
  } 

  export type DeclineVariables = {
    id: string;
    reason: string;
  }

  export type DeclineMutation = {
    __typename?: "Mutation";
    
    decline: Maybe<DeclineDecline>;
  }

  export type DeclineDecline = {
    __typename?: "Message";
    
    id: string;
  } 

  export type ApproveVariables = {
    id: string;
  }

  export type ApproveMutation = {
    __typename?: "Mutation";
    
    approve: Maybe<ApproveApprove>;
  }

  export type ApproveApprove = {
    __typename?: "Message";
    
    id: string;
  } 

  export type EscalateVariables = {
    id: string;
  }

  export type EscalateMutation = {
    __typename?: "Mutation";
    
    escalate: Maybe<EscalateEscalate>;
  }

  export type EscalateEscalate = {
    __typename?: "Message";
    
    id: string;
  } 

import { FunctionalComponent } from '@stencil/core';

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
    export interface ComponentProps {
        variables ?: GetMessagesVariables;
        onReady ?: import('stencil-apollo/dist/types/components/apollo-query/types').OnQueryReadyFn<GetMessagesQuery, GetMessagesVariables>;
    }
     export const GetMessagesComponent: FunctionalComponent<ComponentProps> = (props, children) => {
        return (
            <apollo-query
            query={ GetMessagesDocument }
            {...props}
            >
                {children}
            </apollo-query>
        );
    }
    export const CreateMessageDocument = gql`
    mutation CreateMessage($args: CreateMessageInput!) {
  createMessage(args: $args) {
    id
  }
}
    
      
    
  `;
    export interface ComponentProps {
        variables ?: CreateMessageVariables;
        onReady ?: import('stencil-apollo/dist/types/components/apollo-mutation/types').OnMutationReadyFn<CreateMessageMutation, CreateMessageVariables>;
    }
     export const CreateMessageComponent: FunctionalComponent<ComponentProps> = (props, children) => {
        return (
            <apollo-mutation
            mutation={ CreateMessageDocument }
            {...props}
            >
                {children}
            </apollo-mutation>
        );
    }
    export const DeclineDocument = gql`
    mutation Decline($id: ID!, $reason: String!) {
  decline(id: $id, reason: $reason) {
    id
  }
}
    
      
    
  `;
    export interface ComponentProps {
        variables ?: DeclineVariables;
        onReady ?: import('stencil-apollo/dist/types/components/apollo-mutation/types').OnMutationReadyFn<DeclineMutation, DeclineVariables>;
    }
     export const DeclineComponent: FunctionalComponent<ComponentProps> = (props, children) => {
        return (
            <apollo-mutation
            mutation={ DeclineDocument }
            {...props}
            >
                {children}
            </apollo-mutation>
        );
    }
    export const ApproveDocument = gql`
    mutation Approve($id: ID!) {
  approve(id: $id) {
    id
  }
}
    
      
    
  `;
    export interface ComponentProps {
        variables ?: ApproveVariables;
        onReady ?: import('stencil-apollo/dist/types/components/apollo-mutation/types').OnMutationReadyFn<ApproveMutation, ApproveVariables>;
    }
     export const ApproveComponent: FunctionalComponent<ComponentProps> = (props, children) => {
        return (
            <apollo-mutation
            mutation={ ApproveDocument }
            {...props}
            >
                {children}
            </apollo-mutation>
        );
    }
    export const EscalateDocument = gql`
    mutation Escalate($id: ID!) {
  escalate(id: $id) {
    id
  }
}
    
      
    
  `;
    export interface ComponentProps {
        variables ?: EscalateVariables;
        onReady ?: import('stencil-apollo/dist/types/components/apollo-mutation/types').OnMutationReadyFn<EscalateMutation, EscalateVariables>;
    }
     export const EscalateComponent: FunctionalComponent<ComponentProps> = (props, children) => {
        return (
            <apollo-mutation
            mutation={ EscalateDocument }
            {...props}
            >
                {children}
            </apollo-mutation>
        );
    }
