export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
import { GraphQLResolveInfo } from 'graphql';
import { DocumentNode, parse } from 'graphql';
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Mutation = {
  __typename?: 'Mutation';
  doSomething: SomeResult;
};

export type Query = {
  __typename?: 'Query';
  foo: Scalars['String'];
};

export type SomeResult = {
  __typename?: 'SomeResult';
  changed: User;
};

export type User = {
  __typename?: 'User';
  age: Scalars['Int'];
  id?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
};

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  SomeResult: ResolverTypeWrapper<SomeResult>;
  String: ResolverTypeWrapper<Scalars['String']>;
  User: ResolverTypeWrapper<User>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean'];
  Int: Scalars['Int'];
  Mutation: {};
  Query: {};
  SomeResult: SomeResult;
  String: Scalars['String'];
  User: User;
};

export type MutationResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']
> = {
  doSomething?: Resolver<ResolversTypes['SomeResult'], ParentType, ContextType>;
};

export type QueryResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']
> = {
  foo?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type SomeResultResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['SomeResult'] = ResolversParentTypes['SomeResult']
> = {
  changed?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']
> = {
  age?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  SomeResult?: SomeResultResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
};

type RawSdlToResolversMapping = {
  'type Query {\n  foo: String!\n}\n\nextend type User {\n  age: Int!\n}': { Query?: Pick<QueryResolvers, 'foo'> } & {
    User?: Pick<UserResolvers, 'age'>;
  };
  'type Mutation {\n  doSomething: SomeResult!\n}\n\ntype SomeResult {\n  changed: User!\n}\n\ntype User {\n  id: String\n  name: String\n}': {
    Mutation?: Pick<MutationResolvers, 'doSomething'>;
  } & { SomeResult?: Pick<SomeResultResolvers, 'changed'> } & { User?: Pick<UserResolvers, 'id' | 'name'> };
};
type SdlToResolversMapping = { [K in keyof RawSdlToResolversMapping as Trim<K>]: RawSdlToResolversMapping[K] };
type Whitespace = '\n' | ' ';
type Trim<T> = T extends `${Whitespace}${infer U}`
  ? Trim<U>
  : T extends `${infer U}${Whitespace}`
  ? Trim<U>
  : T extends `${infer A}\n  ${infer B}`
  ? Trim<`${A}\n${B}`>
  : T extends `${infer A}    ${infer B}`
  ? Trim<`${A}  ${B}`>
  : T;
interface TsqlDocumentNode<T> extends DocumentNode {
  $__type: T;
}
export type ResolversOf<T> = T extends TsqlDocumentNode<infer R> ? R : never;

export function typeDefs<TDocumentString extends string>(
  source: TDocumentString
): Trim<TDocumentString> extends keyof SdlToResolversMapping
  ? TsqlDocumentNode<SdlToResolversMapping[Trim<TDocumentString>]>
  : never {
  return parse(source) as any;
}
