// tslint:disable

export interface AdditionalEntityFields {
  path?: string | null;

  type?: string | null;
}

export enum Role {
  Admin = 'ADMIN',
  Writer = 'WRITER',
  Reader = 'READER'
}

// ====================================================
// Scalars
// ====================================================

// ====================================================
// Interfaces
// ====================================================

export interface User {
  id?: string | null;

  username?: string | null;

  role?: Role | null;

  likedPosts?: (Post | null)[] | null;

  followerUsers?: (User | null)[] | null;

  followingUsers?: (User | null)[] | null;
}

// ====================================================
// Types
// ====================================================

export interface Post {
  id?: string | null;

  title?: string | null;

  content?: string | null;

  createdAt?: Date | null;

  author?: User | null;
}

export interface AdminUser extends User {
  id?: string | null;

  username?: string | null;

  role?: Role | null;

  likedPosts?: (Post | null)[] | null;

  followerUsers?: (User | null)[] | null;

  followingUsers?: (User | null)[] | null;

  posts?: (Post | null)[] | null;
}

export interface WriterUser {
  id?: string | null;

  username?: string | null;

  role?: Role | null;

  likedPosts?: (Post | null)[] | null;

  followerUsers?: (User | null)[] | null;

  followingUsers?: (User | null)[] | null;

  posts?: (Post | null)[] | null;
}

export interface ReaderUser {
  id?: string | null;

  username?: string | null;

  role?: Role | null;

  likedPosts?: (Post | null)[] | null;

  followerUsers?: (User | null)[] | null;

  followingUsers?: (User | null)[] | null;
}

// ====================================================
// Arguments
// ====================================================

export interface FollowerUsersAdminUserArgs {
  skip?: number | null;

  limit?: number | null;
}
export interface FollowingUsersAdminUserArgs {
  skip?: number | null;

  limit?: number | null;
}
export interface PostsAdminUserArgs {
  skip?: number | null;

  limit?: number | null;
}
export interface LikedPostsWriterUserArgs {
  skip?: number | null;

  limit?: number | null;
}
export interface FollowerUsersWriterUserArgs {
  skip?: number | null;

  limit?: number | null;
}
export interface FollowingUsersWriterUserArgs {
  skip?: number | null;

  limit?: number | null;
}
export interface PostsWriterUserArgs {
  skip?: number | null;

  limit?: number | null;
}
export interface LikedPostsReaderUserArgs {
  skip?: number | null;

  limit?: number | null;
}
export interface FollowerUsersReaderUserArgs {
  skip?: number | null;

  limit?: number | null;
}
export interface FollowingUsersReaderUserArgs {
  skip?: number | null;

  limit?: number | null;
}

import { ObjectID } from 'mongodb';

export interface UserDbInterface {
  role: string | null;
  _id: ObjectID | null;
  username: string | null;
  followingUserIds: (ObjectID | null)[] | null;
}

export interface PostDbObject {
  _id: ObjectID | null;
  title: string | null;
  content: string | null;
  createdAt: Date | null;
  userId: ObjectID | null;
}

export interface AdminUserDbObject extends UserDbInterface {
  _id: ObjectID | null;
  username: string | null;
  role: string | null;
  followingUserIds: (ObjectID | null)[] | null;
}

export interface WriterUserDbObject {
  _id: ObjectID | null;
  username: string | null;
  role: string | null;
  followingUserIds: (ObjectID | null)[] | null;
}

export interface ReaderUserDbObject {
  _id: ObjectID | null;
  username: string | null;
  role: string | null;
  followingUserIds: (ObjectID | null)[] | null;
}
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';

export type Resolver<Result, Parent = {}, Context = {}, Args = {}> = (
  parent: Parent,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo
) => Promise<Result> | Result;

export interface ISubscriptionResolverObject<Result, Parent, Context, Args> {
  subscribe<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: Context,
    info: GraphQLResolveInfo
  ): AsyncIterator<R | Result> | Promise<AsyncIterator<R | Result>>;
  resolve?<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: Context,
    info: GraphQLResolveInfo
  ): R | Result | Promise<R | Result>;
}

export type SubscriptionResolver<Result, Parent = {}, Context = {}, Args = {}> =
  | ((...args: any[]) => ISubscriptionResolverObject<Result, Parent, Context, Args>)
  | ISubscriptionResolverObject<Result, Parent, Context, Args>;

type Maybe<T> = T | null | undefined;

export type TypeResolveFn<Types, Parent = {}, Context = {}> = (
  parent: Parent,
  context: Context,
  info: GraphQLResolveInfo
) => Maybe<Types>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult, TArgs = {}, TContext = {}> = (
  next: NextResolverFn<TResult>,
  source: any,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export namespace PostResolvers {
  export interface Resolvers<Context = {}, TypeParent = Post> {
    id?: IdResolver<string | null, TypeParent, Context>;

    title?: TitleResolver<string | null, TypeParent, Context>;

    content?: ContentResolver<string | null, TypeParent, Context>;

    createdAt?: CreatedAtResolver<Date | null, TypeParent, Context>;

    author?: AuthorResolver<User | null, TypeParent, Context>;
  }

  export type IdResolver<R = string | null, Parent = Post, Context = {}> = Resolver<R, Parent, Context>;
  export type TitleResolver<R = string | null, Parent = Post, Context = {}> = Resolver<R, Parent, Context>;
  export type ContentResolver<R = string | null, Parent = Post, Context = {}> = Resolver<R, Parent, Context>;
  export type CreatedAtResolver<R = Date | null, Parent = Post, Context = {}> = Resolver<R, Parent, Context>;
  export type AuthorResolver<R = User | null, Parent = Post, Context = {}> = Resolver<R, Parent, Context>;
}

export namespace AdminUserResolvers {
  export interface Resolvers<Context = {}, TypeParent = AdminUser> {
    id?: IdResolver<string | null, TypeParent, Context>;

    username?: UsernameResolver<string | null, TypeParent, Context>;

    role?: RoleResolver<Role | null, TypeParent, Context>;

    likedPosts?: LikedPostsResolver<(Post | null)[] | null, TypeParent, Context>;

    followerUsers?: FollowerUsersResolver<(User | null)[] | null, TypeParent, Context>;

    followingUsers?: FollowingUsersResolver<(User | null)[] | null, TypeParent, Context>;

    posts?: PostsResolver<(Post | null)[] | null, TypeParent, Context>;
  }

  export type IdResolver<R = string | null, Parent = AdminUser, Context = {}> = Resolver<R, Parent, Context>;
  export type UsernameResolver<R = string | null, Parent = AdminUser, Context = {}> = Resolver<R, Parent, Context>;
  export type RoleResolver<R = Role | null, Parent = AdminUser, Context = {}> = Resolver<R, Parent, Context>;
  export type LikedPostsResolver<R = (Post | null)[] | null, Parent = AdminUser, Context = {}> = Resolver<
    R,
    Parent,
    Context
  >;
  export type FollowerUsersResolver<R = (User | null)[] | null, Parent = AdminUser, Context = {}> = Resolver<
    R,
    Parent,
    Context,
    FollowerUsersArgs
  >;
  export interface FollowerUsersArgs {
    skip?: number | null;

    limit?: number | null;
  }

  export type FollowingUsersResolver<R = (User | null)[] | null, Parent = AdminUser, Context = {}> = Resolver<
    R,
    Parent,
    Context,
    FollowingUsersArgs
  >;
  export interface FollowingUsersArgs {
    skip?: number | null;

    limit?: number | null;
  }

  export type PostsResolver<R = (Post | null)[] | null, Parent = AdminUser, Context = {}> = Resolver<
    R,
    Parent,
    Context,
    PostsArgs
  >;
  export interface PostsArgs {
    skip?: number | null;

    limit?: number | null;
  }
}

export namespace WriterUserResolvers {
  export interface Resolvers<Context = {}, TypeParent = WriterUser> {
    id?: IdResolver<string | null, TypeParent, Context>;

    username?: UsernameResolver<string | null, TypeParent, Context>;

    role?: RoleResolver<Role | null, TypeParent, Context>;

    likedPosts?: LikedPostsResolver<(Post | null)[] | null, TypeParent, Context>;

    followerUsers?: FollowerUsersResolver<(User | null)[] | null, TypeParent, Context>;

    followingUsers?: FollowingUsersResolver<(User | null)[] | null, TypeParent, Context>;

    posts?: PostsResolver<(Post | null)[] | null, TypeParent, Context>;
  }

  export type IdResolver<R = string | null, Parent = WriterUser, Context = {}> = Resolver<R, Parent, Context>;
  export type UsernameResolver<R = string | null, Parent = WriterUser, Context = {}> = Resolver<R, Parent, Context>;
  export type RoleResolver<R = Role | null, Parent = WriterUser, Context = {}> = Resolver<R, Parent, Context>;
  export type LikedPostsResolver<R = (Post | null)[] | null, Parent = WriterUser, Context = {}> = Resolver<
    R,
    Parent,
    Context,
    LikedPostsArgs
  >;
  export interface LikedPostsArgs {
    skip?: number | null;

    limit?: number | null;
  }

  export type FollowerUsersResolver<R = (User | null)[] | null, Parent = WriterUser, Context = {}> = Resolver<
    R,
    Parent,
    Context,
    FollowerUsersArgs
  >;
  export interface FollowerUsersArgs {
    skip?: number | null;

    limit?: number | null;
  }

  export type FollowingUsersResolver<R = (User | null)[] | null, Parent = WriterUser, Context = {}> = Resolver<
    R,
    Parent,
    Context,
    FollowingUsersArgs
  >;
  export interface FollowingUsersArgs {
    skip?: number | null;

    limit?: number | null;
  }

  export type PostsResolver<R = (Post | null)[] | null, Parent = WriterUser, Context = {}> = Resolver<
    R,
    Parent,
    Context,
    PostsArgs
  >;
  export interface PostsArgs {
    skip?: number | null;

    limit?: number | null;
  }
}

export namespace ReaderUserResolvers {
  export interface Resolvers<Context = {}, TypeParent = ReaderUser> {
    id?: IdResolver<string | null, TypeParent, Context>;

    username?: UsernameResolver<string | null, TypeParent, Context>;

    role?: RoleResolver<Role | null, TypeParent, Context>;

    likedPosts?: LikedPostsResolver<(Post | null)[] | null, TypeParent, Context>;

    followerUsers?: FollowerUsersResolver<(User | null)[] | null, TypeParent, Context>;

    followingUsers?: FollowingUsersResolver<(User | null)[] | null, TypeParent, Context>;
  }

  export type IdResolver<R = string | null, Parent = ReaderUser, Context = {}> = Resolver<R, Parent, Context>;
  export type UsernameResolver<R = string | null, Parent = ReaderUser, Context = {}> = Resolver<R, Parent, Context>;
  export type RoleResolver<R = Role | null, Parent = ReaderUser, Context = {}> = Resolver<R, Parent, Context>;
  export type LikedPostsResolver<R = (Post | null)[] | null, Parent = ReaderUser, Context = {}> = Resolver<
    R,
    Parent,
    Context,
    LikedPostsArgs
  >;
  export interface LikedPostsArgs {
    skip?: number | null;

    limit?: number | null;
  }

  export type FollowerUsersResolver<R = (User | null)[] | null, Parent = ReaderUser, Context = {}> = Resolver<
    R,
    Parent,
    Context,
    FollowerUsersArgs
  >;
  export interface FollowerUsersArgs {
    skip?: number | null;

    limit?: number | null;
  }

  export type FollowingUsersResolver<R = (User | null)[] | null, Parent = ReaderUser, Context = {}> = Resolver<
    R,
    Parent,
    Context,
    FollowingUsersArgs
  >;
  export interface FollowingUsersArgs {
    skip?: number | null;

    limit?: number | null;
  }
}

export namespace UserResolvers {
  export interface Resolvers {
    __resolveType: ResolveType;
  }
  export type ResolveType<R = 'AdminUser', Parent = AdminUser, Context = {}> = TypeResolveFn<R, Parent, Context>;
}

export type UnionDirectiveResolver<Result> = DirectiveResolverFn<Result, UnionDirectiveArgs, {}>;
export interface UnionDirectiveArgs {
  discriminatorField?: string | null;
}

export type AbstractEntityDirectiveResolver<Result> = DirectiveResolverFn<Result, AbstractEntityDirectiveArgs, {}>;
export interface AbstractEntityDirectiveArgs {
  discriminatorField: string;
}

export type EntityDirectiveResolver<Result> = DirectiveResolverFn<Result, EntityDirectiveArgs, {}>;
export interface EntityDirectiveArgs {
  embedded?: boolean | null;

  additionalFields?: (AdditionalEntityFields | null)[] | null;
}

export type ColumnDirectiveResolver<Result> = DirectiveResolverFn<Result, ColumnDirectiveArgs, {}>;
export interface ColumnDirectiveArgs {
  name?: string | null;

  overrideType?: string | null;

  overrideIsArray?: boolean | null;
}

export type IdDirectiveResolver<Result> = DirectiveResolverFn<Result, {}, {}>;
export type LinkDirectiveResolver<Result> = DirectiveResolverFn<Result, {}, {}>;
export type EmbeddedDirectiveResolver<Result> = DirectiveResolverFn<Result, {}, {}>;
export type MapDirectiveResolver<Result> = DirectiveResolverFn<Result, MapDirectiveArgs, {}>;
export interface MapDirectiveArgs {
  path: string;
}

/** Directs the executor to skip this field or fragment when the `if` argument is true. */
export type SkipDirectiveResolver<Result> = DirectiveResolverFn<Result, SkipDirectiveArgs, {}>;
export interface SkipDirectiveArgs {
  /** Skipped when true. */
  if: boolean;
}

/** Directs the executor to include this field or fragment only when the `if` argument is true. */
export type IncludeDirectiveResolver<Result> = DirectiveResolverFn<Result, IncludeDirectiveArgs, {}>;
export interface IncludeDirectiveArgs {
  /** Included when true. */
  if: boolean;
}

/** Marks an element of a GraphQL schema as no longer supported. */
export type DeprecatedDirectiveResolver<Result> = DirectiveResolverFn<Result, DeprecatedDirectiveArgs, {}>;
export interface DeprecatedDirectiveArgs {
  /** Explains why this element was deprecated, usually also including a suggestion for how to access supported similar data. Formatted using the Markdown syntax (as specified by [CommonMark](https://commonmark.org/). */
  reason?: string | null;
}

export interface DateScalarConfig extends GraphQLScalarTypeConfig<Date, any> {
  name: 'Date';
}

export interface IResolvers {
  Post?: PostResolvers.Resolvers;
  AdminUser?: AdminUserResolvers.Resolvers;
  WriterUser?: WriterUserResolvers.Resolvers;
  ReaderUser?: ReaderUserResolvers.Resolvers;
  User?: UserResolvers.Resolvers;
  Date?: GraphQLScalarType;
}

export interface IDirectiveResolvers<Result> {
  union?: UnionDirectiveResolver<Result>;
  abstractEntity?: AbstractEntityDirectiveResolver<Result>;
  entity?: EntityDirectiveResolver<Result>;
  column?: ColumnDirectiveResolver<Result>;
  id?: IdDirectiveResolver<Result>;
  link?: LinkDirectiveResolver<Result>;
  embedded?: EmbeddedDirectiveResolver<Result>;
  map?: MapDirectiveResolver<Result>;
  skip?: SkipDirectiveResolver<Result>;
  include?: IncludeDirectiveResolver<Result>;
  deprecated?: DeprecatedDirectiveResolver<Result>;
}
