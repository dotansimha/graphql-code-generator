import * as Operations from './documents';
import * as ApolloReactCommon from '@apollo/client';
import * as ApolloReactHooks from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Message = {
  __typename?: 'Message';
  id: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  messages?: Maybe<Array<Maybe<Message>>>;
};

export type QueryMessagesArgs = {
  tab: Scalars['String'];
};

export type CreateMessageInput = {
  description: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createMessage?: Maybe<Message>;
  approve?: Maybe<Message>;
  decline?: Maybe<Message>;
  escalate?: Maybe<Message>;
};

export type MutationCreateMessageArgs = {
  args: CreateMessageInput;
};

export type MutationApproveArgs = {
  id: Scalars['ID'];
};

export type MutationDeclineArgs = {
  id: Scalars['ID'];
  reason: Scalars['String'];
};

export type MutationEscalateArgs = {
  id: Scalars['ID'];
};

export type GetMessagesQueryVariables = Exact<{
  tab: Scalars['String'];
}>;

export type GetMessagesQuery = { __typename?: 'Query' } & {
  messages?: Maybe<Array<Maybe<{ __typename?: 'Message' } & Pick<Message, 'id'>>>>;
};

export type CreateMessageMutationVariables = Exact<{
  args: CreateMessageInput;
}>;

export type CreateMessageMutation = { __typename?: 'Mutation' } & {
  createMessage?: Maybe<{ __typename?: 'Message' } & Pick<Message, 'id'>>;
};

export type DeclineMutationVariables = Exact<{
  id: Scalars['ID'];
  reason: Scalars['String'];
}>;

export type DeclineMutation = { __typename?: 'Mutation' } & {
  decline?: Maybe<{ __typename?: 'Message' } & Pick<Message, 'id'>>;
};

export type ApproveMutationVariables = Exact<{
  id: Scalars['ID'];
}>;

export type ApproveMutation = { __typename?: 'Mutation' } & {
  approve?: Maybe<{ __typename?: 'Message' } & Pick<Message, 'id'>>;
};

export type EscalateMutationVariables = Exact<{
  id: Scalars['ID'];
}>;

export type EscalateMutation = { __typename?: 'Mutation' } & {
  escalate?: Maybe<{ __typename?: 'Message' } & Pick<Message, 'id'>>;
};

/**
 * __useGetMessagesQuery__
 *
 * To run a query within a React component, call `useGetMessagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMessagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMessagesQuery({
 *   variables: {
 *      tab: // value for 'tab'
 *   },
 * });
 */
export function useGetMessagesQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<GetMessagesQuery, GetMessagesQueryVariables>
) {
  return ApolloReactHooks.useQuery<GetMessagesQuery, GetMessagesQueryVariables>(Operations.GetMessages, baseOptions);
}
export function useGetMessagesLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetMessagesQuery, GetMessagesQueryVariables>
) {
  return ApolloReactHooks.useLazyQuery<GetMessagesQuery, GetMessagesQueryVariables>(
    Operations.GetMessages,
    baseOptions
  );
}
export type GetMessagesQueryHookResult = ReturnType<typeof useGetMessagesQuery>;
export type GetMessagesLazyQueryHookResult = ReturnType<typeof useGetMessagesLazyQuery>;
export type GetMessagesQueryResult = ApolloReactCommon.QueryResult<GetMessagesQuery, GetMessagesQueryVariables>;

/**
 * __useCreateMessageMutation__
 *
 * To run a mutation, you first call `useCreateMessageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateMessageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createMessageMutation, { data, loading, error }] = useCreateMessageMutation({
 *   variables: {
 *      args: // value for 'args'
 *   },
 * });
 */
export function useCreateMessageMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<CreateMessageMutation, CreateMessageMutationVariables>
) {
  return ApolloReactHooks.useMutation<CreateMessageMutation, CreateMessageMutationVariables>(
    Operations.CreateMessage,
    baseOptions
  );
}
export type CreateMessageMutationHookResult = ReturnType<typeof useCreateMessageMutation>;
export type CreateMessageMutationResult = ApolloReactCommon.MutationResult<CreateMessageMutation>;
export type CreateMessageMutationOptions = ApolloReactCommon.BaseMutationOptions<
  CreateMessageMutation,
  CreateMessageMutationVariables
>;

/**
 * __useDeclineMutation__
 *
 * To run a mutation, you first call `useDeclineMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeclineMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [declineMutation, { data, loading, error }] = useDeclineMutation({
 *   variables: {
 *      id: // value for 'id'
 *      reason: // value for 'reason'
 *   },
 * });
 */
export function useDeclineMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<DeclineMutation, DeclineMutationVariables>
) {
  return ApolloReactHooks.useMutation<DeclineMutation, DeclineMutationVariables>(Operations.Decline, baseOptions);
}
export type DeclineMutationHookResult = ReturnType<typeof useDeclineMutation>;
export type DeclineMutationResult = ApolloReactCommon.MutationResult<DeclineMutation>;
export type DeclineMutationOptions = ApolloReactCommon.BaseMutationOptions<DeclineMutation, DeclineMutationVariables>;

/**
 * __useApproveMutation__
 *
 * To run a mutation, you first call `useApproveMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useApproveMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [approveMutation, { data, loading, error }] = useApproveMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useApproveMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<ApproveMutation, ApproveMutationVariables>
) {
  return ApolloReactHooks.useMutation<ApproveMutation, ApproveMutationVariables>(Operations.Approve, baseOptions);
}
export type ApproveMutationHookResult = ReturnType<typeof useApproveMutation>;
export type ApproveMutationResult = ApolloReactCommon.MutationResult<ApproveMutation>;
export type ApproveMutationOptions = ApolloReactCommon.BaseMutationOptions<ApproveMutation, ApproveMutationVariables>;

/**
 * __useEscalateMutation__
 *
 * To run a mutation, you first call `useEscalateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEscalateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [escalateMutation, { data, loading, error }] = useEscalateMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useEscalateMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<EscalateMutation, EscalateMutationVariables>
) {
  return ApolloReactHooks.useMutation<EscalateMutation, EscalateMutationVariables>(Operations.Escalate, baseOptions);
}
export type EscalateMutationHookResult = ReturnType<typeof useEscalateMutation>;
export type EscalateMutationResult = ApolloReactCommon.MutationResult<EscalateMutation>;
export type EscalateMutationOptions = ApolloReactCommon.BaseMutationOptions<
  EscalateMutation,
  EscalateMutationVariables
>;
