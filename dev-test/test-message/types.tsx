import * as Operations from './documents';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type CreateMessageInput = {
  description: Scalars['String'];
};

export type Message = {
  __typename?: 'Message';
  id: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  approve?: Maybe<Message>;
  createMessage?: Maybe<Message>;
  decline?: Maybe<Message>;
  escalate?: Maybe<Message>;
};

export type MutationApproveArgs = {
  id: Scalars['ID'];
};

export type MutationCreateMessageArgs = {
  args: CreateMessageInput;
};

export type MutationDeclineArgs = {
  id: Scalars['ID'];
  reason: Scalars['String'];
};

export type MutationEscalateArgs = {
  id: Scalars['ID'];
};

export type Query = {
  __typename?: 'Query';
  messages?: Maybe<Array<Maybe<Message>>>;
};

export type QueryMessagesArgs = {
  tab: Scalars['String'];
};

export type GetMessagesQueryVariables = Exact<{
  tab: Scalars['String'];
}>;

export type GetMessagesQuery = {
  __typename?: 'Query';
  messages?: Array<{ __typename?: 'Message'; id: string } | null> | null;
};

export type CreateMessageMutationVariables = Exact<{
  args: CreateMessageInput;
}>;

export type CreateMessageMutation = {
  __typename?: 'Mutation';
  createMessage?: { __typename?: 'Message'; id: string } | null;
};

export type DeclineMutationVariables = Exact<{
  id: Scalars['ID'];
  reason: Scalars['String'];
}>;

export type DeclineMutation = { __typename?: 'Mutation'; decline?: { __typename?: 'Message'; id: string } | null };

export type ApproveMutationVariables = Exact<{
  id: Scalars['ID'];
}>;

export type ApproveMutation = { __typename?: 'Mutation'; approve?: { __typename?: 'Message'; id: string } | null };

export type EscalateMutationVariables = Exact<{
  id: Scalars['ID'];
}>;

export type EscalateMutation = { __typename?: 'Mutation'; escalate?: { __typename?: 'Message'; id: string } | null };

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
export function useGetMessagesQuery(baseOptions: Apollo.QueryHookOptions<GetMessagesQuery, GetMessagesQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetMessagesQuery, GetMessagesQueryVariables>(Operations.GetMessages, options);
}
export function useGetMessagesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetMessagesQuery, GetMessagesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetMessagesQuery, GetMessagesQueryVariables>(Operations.GetMessages, options);
}
export type GetMessagesQueryHookResult = ReturnType<typeof useGetMessagesQuery>;
export type GetMessagesLazyQueryHookResult = ReturnType<typeof useGetMessagesLazyQuery>;
export type GetMessagesQueryResult = Apollo.QueryResult<GetMessagesQuery, GetMessagesQueryVariables>;

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
  baseOptions?: Apollo.MutationHookOptions<CreateMessageMutation, CreateMessageMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreateMessageMutation, CreateMessageMutationVariables>(Operations.CreateMessage, options);
}
export type CreateMessageMutationHookResult = ReturnType<typeof useCreateMessageMutation>;
export type CreateMessageMutationResult = Apollo.MutationResult<CreateMessageMutation>;
export type CreateMessageMutationOptions = Apollo.BaseMutationOptions<
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
  baseOptions?: Apollo.MutationHookOptions<DeclineMutation, DeclineMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<DeclineMutation, DeclineMutationVariables>(Operations.Decline, options);
}
export type DeclineMutationHookResult = ReturnType<typeof useDeclineMutation>;
export type DeclineMutationResult = Apollo.MutationResult<DeclineMutation>;
export type DeclineMutationOptions = Apollo.BaseMutationOptions<DeclineMutation, DeclineMutationVariables>;

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
  baseOptions?: Apollo.MutationHookOptions<ApproveMutation, ApproveMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<ApproveMutation, ApproveMutationVariables>(Operations.Approve, options);
}
export type ApproveMutationHookResult = ReturnType<typeof useApproveMutation>;
export type ApproveMutationResult = Apollo.MutationResult<ApproveMutation>;
export type ApproveMutationOptions = Apollo.BaseMutationOptions<ApproveMutation, ApproveMutationVariables>;

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
  baseOptions?: Apollo.MutationHookOptions<EscalateMutation, EscalateMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<EscalateMutation, EscalateMutationVariables>(Operations.Escalate, options);
}
export type EscalateMutationHookResult = ReturnType<typeof useEscalateMutation>;
export type EscalateMutationResult = Apollo.MutationResult<EscalateMutation>;
export type EscalateMutationOptions = Apollo.BaseMutationOptions<EscalateMutation, EscalateMutationVariables>;
