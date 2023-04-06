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
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Article = {
  __typename?: 'Article';
  author: User;
  id: Scalars['ID'];
  text: Scalars['String'];
  title: Scalars['String'];
};

export type CreditCard = {
  __typename?: 'CreditCard';
  cardNumber: Scalars['Int'];
  cardOwner: Scalars['String'];
  id: Scalars['ID'];
};

export type Donation = {
  __typename?: 'Donation';
  amount: Scalars['Float'];
  id: Scalars['ID'];
  recipient: User;
  sender: User;
};

export type DonationInput = {
  amount: Scalars['Float'];
  paymentOption: Scalars['ID'];
  user: Scalars['ID'];
};

export type Mutation = {
  __typename?: 'Mutation';
  donate?: Maybe<Donation>;
  pong?: Maybe<Scalars['Int']>;
};

export type MutationDonateArgs = {
  donation?: InputMaybe<DonationInput>;
};

export type PaymentOption = CreditCard | Paypal;

export type Paypal = {
  __typename?: 'Paypal';
  id: Scalars['ID'];
  url: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  articleById?: Maybe<Article>;
  articles?: Maybe<Array<Article>>;
  articlesByUser?: Maybe<Array<Article>>;
  ping?: Maybe<Scalars['Int']>;
  userById?: Maybe<User>;
  users?: Maybe<Array<User>>;
};

export type QueryArticleByIdArgs = {
  id: Scalars['ID'];
};

export type QueryArticlesByUserArgs = {
  userId: Scalars['ID'];
};

export type QueryUserByIdArgs = {
  id: Scalars['ID'];
};

export type User = {
  __typename?: 'User';
  firstName: Scalars['String'];
  id: Scalars['ID'];
  lastName: Scalars['String'];
  paymentOptions?: Maybe<Array<PaymentOption>>;
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

/** Mapping of union types */
export type ResolversUnionTypes = {
  PaymentOption: CreditCard | Paypal;
};

/** Mapping of union parent types */
export type ResolversUnionParentTypes = {
  PaymentOption: CreditCard | Paypal;
};

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Article: ResolverTypeWrapper<Article>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  CreditCard: ResolverTypeWrapper<CreditCard>;
  Donation: ResolverTypeWrapper<Donation>;
  DonationInput: DonationInput;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Mutation: ResolverTypeWrapper<{}>;
  PaymentOption: ResolverTypeWrapper<ResolversUnionTypes['PaymentOption']>;
  Paypal: ResolverTypeWrapper<Paypal>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
  User: ResolverTypeWrapper<
    Omit<User, 'paymentOptions'> & { paymentOptions?: Maybe<Array<ResolversTypes['PaymentOption']>> }
  >;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Article: Article;
  Boolean: Scalars['Boolean'];
  CreditCard: CreditCard;
  Donation: Donation;
  DonationInput: DonationInput;
  Float: Scalars['Float'];
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  Mutation: {};
  PaymentOption: ResolversUnionParentTypes['PaymentOption'];
  Paypal: Paypal;
  Query: {};
  String: Scalars['String'];
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
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
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
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
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
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
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
