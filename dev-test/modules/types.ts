import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

export type Article = {
  __typename?: 'Article';
  author: User;
  id: Scalars['ID']['output'];
  text: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type CreditCard = {
  __typename?: 'CreditCard';
  cardNumber: Scalars['Int']['output'];
  cardOwner: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

export type Donation = {
  __typename?: 'Donation';
  amount: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  recipient: User;
  sender: User;
};

export type DonationInput = {
  amount: Scalars['Float']['input'];
  paymentOption: Scalars['ID']['input'];
  user: Scalars['ID']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  donate?: Maybe<Donation>;
  pong?: Maybe<Scalars['Int']['output']>;
};

export type MutationDonateArgs = {
  donation?: InputMaybe<DonationInput>;
};

export type PaymentOption = CreditCard | Paypal;

export type Paypal = {
  __typename?: 'Paypal';
  id: Scalars['ID']['output'];
  url: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  articleById?: Maybe<Article>;
  articles?: Maybe<Array<Article>>;
  articlesByUser?: Maybe<Array<Article>>;
  ping?: Maybe<Scalars['Int']['output']>;
  userById?: Maybe<User>;
  users?: Maybe<Array<User>>;
};

export type QueryArticleByIdArgs = {
  id: Scalars['ID']['input'];
};

export type QueryArticlesByUserArgs = {
  userId: Scalars['ID']['input'];
};

export type QueryUserByIdArgs = {
  id: Scalars['ID']['input'];
};

export type User = {
  __typename?: 'User';
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  paymentOptions?: Maybe<Array<PaymentOption>>;
};

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<
  TResult,
  TParent = Record<PropertyKey, never>,
  TContext = Record<PropertyKey, never>,
  TArgs = Record<PropertyKey, never>
> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

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

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = Record<PropertyKey, never>,
  TContext = Record<PropertyKey, never>,
  TArgs = Record<PropertyKey, never>
> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = Record<PropertyKey, never>,
  TParent = Record<PropertyKey, never>,
  TContext = Record<PropertyKey, never>,
  TArgs = Record<PropertyKey, never>
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping of union types */
export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
  PaymentOption: CreditCard | Paypal;
};

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Article: ResolverTypeWrapper<Omit<Article, 'author'> & { author: ResolversTypes['User'] }>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CreditCard: ResolverTypeWrapper<CreditCard>;
  Donation: ResolverTypeWrapper<
    Omit<Donation, 'recipient' | 'sender'> & { recipient: ResolversTypes['User']; sender: ResolversTypes['User'] }
  >;
  DonationInput: DonationInput;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  PaymentOption: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['PaymentOption']>;
  Paypal: ResolverTypeWrapper<Paypal>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  User: ResolverTypeWrapper<
    Omit<User, 'paymentOptions'> & { paymentOptions?: Maybe<Array<ResolversTypes['PaymentOption']>> }
  >;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Article: Omit<Article, 'author'> & { author: ResolversParentTypes['User'] };
  Boolean: Scalars['Boolean']['output'];
  CreditCard: CreditCard;
  Donation: Omit<Donation, 'recipient' | 'sender'> & {
    recipient: ResolversParentTypes['User'];
    sender: ResolversParentTypes['User'];
  };
  DonationInput: DonationInput;
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Mutation: Record<PropertyKey, never>;
  PaymentOption: ResolversUnionTypes<ResolversParentTypes>['PaymentOption'];
  Paypal: Paypal;
  Query: Record<PropertyKey, never>;
  String: Scalars['String']['output'];
  User: Omit<User, 'paymentOptions'> & { paymentOptions?: Maybe<Array<ResolversParentTypes['PaymentOption']>> };
};

export type ArticleResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Article'] = ResolversParentTypes['Article']
> = {
  author?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type CreditCardResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['CreditCard'] = ResolversParentTypes['CreditCard']
> = {
  cardNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  cardOwner?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DonationResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Donation'] = ResolversParentTypes['Donation']
> = {
  amount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  recipient?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  sender?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
};

export type MutationResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']
> = {
  donate?: Resolver<Maybe<ResolversTypes['Donation']>, ParentType, ContextType, Partial<MutationDonateArgs>>;
  pong?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
};

export type PaymentOptionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PaymentOption'] = ResolversParentTypes['PaymentOption']
> = {
  __resolveType: TypeResolveFn<'CreditCard' | 'Paypal', ParentType, ContextType>;
};

export type PaypalResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Paypal'] = ResolversParentTypes['Paypal']
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']
> = {
  articleById?: Resolver<
    Maybe<ResolversTypes['Article']>,
    ParentType,
    ContextType,
    RequireFields<QueryArticleByIdArgs, 'id'>
  >;
  articles?: Resolver<Maybe<Array<ResolversTypes['Article']>>, ParentType, ContextType>;
  articlesByUser?: Resolver<
    Maybe<Array<ResolversTypes['Article']>>,
    ParentType,
    ContextType,
    RequireFields<QueryArticlesByUserArgs, 'userId'>
  >;
  ping?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  userById?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserByIdArgs, 'id'>>;
  users?: Resolver<Maybe<Array<ResolversTypes['User']>>, ParentType, ContextType>;
};

export type UserResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']
> = {
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  paymentOptions?: Resolver<Maybe<Array<ResolversTypes['PaymentOption']>>, ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Article?: ArticleResolvers<ContextType>;
  CreditCard?: CreditCardResolvers<ContextType>;
  Donation?: DonationResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  PaymentOption?: PaymentOptionResolvers<ContextType>;
  Paypal?: PaypalResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
};
