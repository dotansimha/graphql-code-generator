// tslint:disable
export type Maybe<T> = T | null;


export interface AdditionalEntityFields {
  
  path?: Maybe<string>;
  
  type?: Maybe<string>;
}

  export enum Role {
    Admin = "ADMIN",
    Writer = "WRITER",
    Reader = "READER",
  }






// ====================================================
// Scalars
// ====================================================





// ====================================================
// Interfaces
// ====================================================



export interface User {
  
  id?: Maybe<string>;
  
  username?: Maybe<string>;
  
  role?: Maybe<Role>;
  
  likedPosts?: Maybe<(Maybe<Post>)[]>;
  
  followerUsers?: Maybe<(Maybe<User>)[]>;
  
  followingUsers?: Maybe<(Maybe<User>)[]>;
}




// ====================================================
// Types
// ====================================================



export interface Post {
  
  id?: Maybe<string>;
  
  title?: Maybe<string>;
  
  content?: Maybe<string>;
  
  createdAt?: Maybe<Date>;
  
  author?: Maybe<User>;
}


export interface AdminUser extends User {
  
  id?: Maybe<string>;
  
  username?: Maybe<string>;
  
  role?: Maybe<Role>;
  
  likedPosts?: Maybe<(Maybe<Post>)[]>;
  
  followerUsers?: Maybe<(Maybe<User>)[]>;
  
  followingUsers?: Maybe<(Maybe<User>)[]>;
  
  posts?: Maybe<(Maybe<Post>)[]>;
}


export interface WriterUser {
  
  id?: Maybe<string>;
  
  username?: Maybe<string>;
  
  role?: Maybe<Role>;
  
  likedPosts?: Maybe<(Maybe<Post>)[]>;
  
  followerUsers?: Maybe<(Maybe<User>)[]>;
  
  followingUsers?: Maybe<(Maybe<User>)[]>;
  
  posts?: Maybe<(Maybe<Post>)[]>;
}


export interface ReaderUser {
  
  id?: Maybe<string>;
  
  username?: Maybe<string>;
  
  role?: Maybe<Role>;
  
  likedPosts?: Maybe<(Maybe<Post>)[]>;
  
  followerUsers?: Maybe<(Maybe<User>)[]>;
  
  followingUsers?: Maybe<(Maybe<User>)[]>;
}



// ====================================================
// Arguments
// ====================================================

export interface FollowerUsersAdminUserArgs {
  
  skip?: Maybe<number>;
  
  limit?: Maybe<number>;
}
export interface FollowingUsersAdminUserArgs {
  
  skip?: Maybe<number>;
  
  limit?: Maybe<number>;
}
export interface PostsAdminUserArgs {
  
  skip?: Maybe<number>;
  
  limit?: Maybe<number>;
}
export interface LikedPostsWriterUserArgs {
  
  skip?: Maybe<number>;
  
  limit?: Maybe<number>;
}
export interface FollowerUsersWriterUserArgs {
  
  skip?: Maybe<number>;
  
  limit?: Maybe<number>;
}
export interface FollowingUsersWriterUserArgs {
  
  skip?: Maybe<number>;
  
  limit?: Maybe<number>;
}
export interface PostsWriterUserArgs {
  
  skip?: Maybe<number>;
  
  limit?: Maybe<number>;
}
export interface LikedPostsReaderUserArgs {
  
  skip?: Maybe<number>;
  
  limit?: Maybe<number>;
}
export interface FollowerUsersReaderUserArgs {
  
  skip?: Maybe<number>;
  
  limit?: Maybe<number>;
}
export interface FollowingUsersReaderUserArgs {
  
  skip?: Maybe<number>;
  
  limit?: Maybe<number>;
}


import { ObjectID } from 'mongodb';



export interface UserDbInterface {
role: Maybe<string>
_id: Maybe<ObjectID>
username: Maybe<string>
followingUserIds: Maybe<(Maybe<ObjectID>)[]>
}

export interface PostDbObject {
_id: Maybe<ObjectID>
title: Maybe<string>
content: Maybe<string>
createdAt: Maybe<Date>
userId: Maybe<ObjectID>
}

export interface AdminUserDbObject  extends UserDbInterface {
_id: Maybe<ObjectID>
username: Maybe<string>
role: Maybe<string>
followingUserIds: Maybe<(Maybe<ObjectID>)[]>
}

export interface WriterUserDbObject {
_id: Maybe<ObjectID>
username: Maybe<string>
role: Maybe<string>
followingUserIds: Maybe<(Maybe<ObjectID>)[]>
}

export interface ReaderUserDbObject {
_id: Maybe<ObjectID>
username: Maybe<string>
role: Maybe<string>
followingUserIds: Maybe<(Maybe<ObjectID>)[]>
}
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';





export type Resolver<Result, Parent = {}, TContext = {}, Args = {}> = (
  parent: Parent,
  args: Args,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<Result> | Result;

export interface ISubscriptionResolverObject<Result, Parent, TContext, Args> {
  subscribe<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: TContext,
    info: GraphQLResolveInfo
  ): AsyncIterator<R | Result> | Promise<AsyncIterator<R | Result>>;
  resolve?<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: TContext,
    info: GraphQLResolveInfo
  ): R | Result | Promise<R | Result>;
}

export type SubscriptionResolver<Result, Parent = {}, TContext = {}, Args = {}> =
  | ((...args: any[]) => ISubscriptionResolverObject<Result, Parent, TContext, Args>)
  | ISubscriptionResolverObject<Result, Parent, TContext, Args>;

export type TypeResolveFn<Types, Parent = {}, TContext = {}> = (
  parent: Parent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<Types>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult, TArgs = {}, TContext = {}> = (
  next: NextResolverFn<TResult>,
  source: any,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>;


export namespace PostResolvers {
  export interface Resolvers<TContext = {}, TypeParent = Post> {
    
    id?: IdResolver<Maybe<string>, TypeParent, TContext>;
    
    title?: TitleResolver<Maybe<string>, TypeParent, TContext>;
    
    content?: ContentResolver<Maybe<string>, TypeParent, TContext>;
    
    createdAt?: CreatedAtResolver<Maybe<Date>, TypeParent, TContext>;
    
    author?: AuthorResolver<Maybe<User>, TypeParent, TContext>;
  }


  export type IdResolver<R = Maybe<string>, Parent = Post, TContext = {}> = Resolver<R, Parent, TContext>;
  export type TitleResolver<R = Maybe<string>, Parent = Post, TContext = {}> = Resolver<R, Parent, TContext>;
  export type ContentResolver<R = Maybe<string>, Parent = Post, TContext = {}> = Resolver<R, Parent, TContext>;
  export type CreatedAtResolver<R = Maybe<Date>, Parent = Post, TContext = {}> = Resolver<R, Parent, TContext>;
  export type AuthorResolver<R = Maybe<User>, Parent = Post, TContext = {}> = Resolver<R, Parent, TContext>;
}

export namespace AdminUserResolvers {
  export interface Resolvers<TContext = {}, TypeParent = AdminUser> {
    
    id?: IdResolver<Maybe<string>, TypeParent, TContext>;
    
    username?: UsernameResolver<Maybe<string>, TypeParent, TContext>;
    
    role?: RoleResolver<Maybe<Role>, TypeParent, TContext>;
    
    likedPosts?: LikedPostsResolver<Maybe<(Maybe<Post>)[]>, TypeParent, TContext>;
    
    followerUsers?: FollowerUsersResolver<Maybe<(Maybe<User>)[]>, TypeParent, TContext>;
    
    followingUsers?: FollowingUsersResolver<Maybe<(Maybe<User>)[]>, TypeParent, TContext>;
    
    posts?: PostsResolver<Maybe<(Maybe<Post>)[]>, TypeParent, TContext>;
  }


  export type IdResolver<R = Maybe<string>, Parent = AdminUser, TContext = {}> = Resolver<R, Parent, TContext>;
  export type UsernameResolver<R = Maybe<string>, Parent = AdminUser, TContext = {}> = Resolver<R, Parent, TContext>;
  export type RoleResolver<R = Maybe<Role>, Parent = AdminUser, TContext = {}> = Resolver<R, Parent, TContext>;
  export type LikedPostsResolver<R = Maybe<(Maybe<Post>)[]>, Parent = AdminUser, TContext = {}> = Resolver<R, Parent, TContext>;
  export type FollowerUsersResolver<R = Maybe<(Maybe<User>)[]>, Parent = AdminUser, TContext = {}> = Resolver<R, Parent, TContext, FollowerUsersArgs>;
  export interface FollowerUsersArgs {
    
    skip?: Maybe<number>;
    
    limit?: Maybe<number>;
  }


  export type FollowingUsersResolver<R = Maybe<(Maybe<User>)[]>, Parent = AdminUser, TContext = {}> = Resolver<R, Parent, TContext, FollowingUsersArgs>;
  export interface FollowingUsersArgs {
    
    skip?: Maybe<number>;
    
    limit?: Maybe<number>;
  }


  export type PostsResolver<R = Maybe<(Maybe<Post>)[]>, Parent = AdminUser, TContext = {}> = Resolver<R, Parent, TContext, PostsArgs>;
  export interface PostsArgs {
    
    skip?: Maybe<number>;
    
    limit?: Maybe<number>;
  }


}

export namespace WriterUserResolvers {
  export interface Resolvers<TContext = {}, TypeParent = WriterUser> {
    
    id?: IdResolver<Maybe<string>, TypeParent, TContext>;
    
    username?: UsernameResolver<Maybe<string>, TypeParent, TContext>;
    
    role?: RoleResolver<Maybe<Role>, TypeParent, TContext>;
    
    likedPosts?: LikedPostsResolver<Maybe<(Maybe<Post>)[]>, TypeParent, TContext>;
    
    followerUsers?: FollowerUsersResolver<Maybe<(Maybe<User>)[]>, TypeParent, TContext>;
    
    followingUsers?: FollowingUsersResolver<Maybe<(Maybe<User>)[]>, TypeParent, TContext>;
    
    posts?: PostsResolver<Maybe<(Maybe<Post>)[]>, TypeParent, TContext>;
  }


  export type IdResolver<R = Maybe<string>, Parent = WriterUser, TContext = {}> = Resolver<R, Parent, TContext>;
  export type UsernameResolver<R = Maybe<string>, Parent = WriterUser, TContext = {}> = Resolver<R, Parent, TContext>;
  export type RoleResolver<R = Maybe<Role>, Parent = WriterUser, TContext = {}> = Resolver<R, Parent, TContext>;
  export type LikedPostsResolver<R = Maybe<(Maybe<Post>)[]>, Parent = WriterUser, TContext = {}> = Resolver<R, Parent, TContext, LikedPostsArgs>;
  export interface LikedPostsArgs {
    
    skip?: Maybe<number>;
    
    limit?: Maybe<number>;
  }


  export type FollowerUsersResolver<R = Maybe<(Maybe<User>)[]>, Parent = WriterUser, TContext = {}> = Resolver<R, Parent, TContext, FollowerUsersArgs>;
  export interface FollowerUsersArgs {
    
    skip?: Maybe<number>;
    
    limit?: Maybe<number>;
  }


  export type FollowingUsersResolver<R = Maybe<(Maybe<User>)[]>, Parent = WriterUser, TContext = {}> = Resolver<R, Parent, TContext, FollowingUsersArgs>;
  export interface FollowingUsersArgs {
    
    skip?: Maybe<number>;
    
    limit?: Maybe<number>;
  }


  export type PostsResolver<R = Maybe<(Maybe<Post>)[]>, Parent = WriterUser, TContext = {}> = Resolver<R, Parent, TContext, PostsArgs>;
  export interface PostsArgs {
    
    skip?: Maybe<number>;
    
    limit?: Maybe<number>;
  }


}

export namespace ReaderUserResolvers {
  export interface Resolvers<TContext = {}, TypeParent = ReaderUser> {
    
    id?: IdResolver<Maybe<string>, TypeParent, TContext>;
    
    username?: UsernameResolver<Maybe<string>, TypeParent, TContext>;
    
    role?: RoleResolver<Maybe<Role>, TypeParent, TContext>;
    
    likedPosts?: LikedPostsResolver<Maybe<(Maybe<Post>)[]>, TypeParent, TContext>;
    
    followerUsers?: FollowerUsersResolver<Maybe<(Maybe<User>)[]>, TypeParent, TContext>;
    
    followingUsers?: FollowingUsersResolver<Maybe<(Maybe<User>)[]>, TypeParent, TContext>;
  }


  export type IdResolver<R = Maybe<string>, Parent = ReaderUser, TContext = {}> = Resolver<R, Parent, TContext>;
  export type UsernameResolver<R = Maybe<string>, Parent = ReaderUser, TContext = {}> = Resolver<R, Parent, TContext>;
  export type RoleResolver<R = Maybe<Role>, Parent = ReaderUser, TContext = {}> = Resolver<R, Parent, TContext>;
  export type LikedPostsResolver<R = Maybe<(Maybe<Post>)[]>, Parent = ReaderUser, TContext = {}> = Resolver<R, Parent, TContext, LikedPostsArgs>;
  export interface LikedPostsArgs {
    
    skip?: Maybe<number>;
    
    limit?: Maybe<number>;
  }


  export type FollowerUsersResolver<R = Maybe<(Maybe<User>)[]>, Parent = ReaderUser, TContext = {}> = Resolver<R, Parent, TContext, FollowerUsersArgs>;
  export interface FollowerUsersArgs {
    
    skip?: Maybe<number>;
    
    limit?: Maybe<number>;
  }


  export type FollowingUsersResolver<R = Maybe<(Maybe<User>)[]>, Parent = ReaderUser, TContext = {}> = Resolver<R, Parent, TContext, FollowingUsersArgs>;
  export interface FollowingUsersArgs {
    
    skip?: Maybe<number>;
    
    limit?: Maybe<number>;
  }


}


export namespace UserResolvers {
  export interface Resolvers {
    __resolveType: ResolveType;
  }
  export type ResolveType<R = 'AdminUser', Parent = AdminUser, TContext = {}> = TypeResolveFn<R, Parent, TContext>;
  
}



export type UnionDirectiveResolver<Result> = DirectiveResolverFn<Result, UnionDirectiveArgs, {}>;
export interface UnionDirectiveArgs {
  
  discriminatorField?: Maybe<string>;
}


export type AbstractEntityDirectiveResolver<Result> = DirectiveResolverFn<Result, AbstractEntityDirectiveArgs, {}>;
export interface AbstractEntityDirectiveArgs {
  
  discriminatorField: string;
}


export type EntityDirectiveResolver<Result> = DirectiveResolverFn<Result, EntityDirectiveArgs, {}>;
export interface EntityDirectiveArgs {
  
  embedded?: Maybe<boolean>;
  
  additionalFields?: Maybe<(Maybe<AdditionalEntityFields>)[]>;
}


export type ColumnDirectiveResolver<Result> = DirectiveResolverFn<Result, ColumnDirectiveArgs, {}>;
export interface ColumnDirectiveArgs {
  
  name?: Maybe<string>;
  
  overrideType?: Maybe<string>;
  
  overrideIsArray?: Maybe<boolean>;
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
  reason?: string;
}


export interface DateScalarConfig extends GraphQLScalarTypeConfig<Date, any> {
  name: 'Date'
}

export type IResolvers<TContext = {}> = {
    Post?: PostResolvers.Resolvers<TContext>;
    AdminUser?: AdminUserResolvers.Resolvers<TContext>;
    WriterUser?: WriterUserResolvers.Resolvers<TContext>;
    ReaderUser?: ReaderUserResolvers.Resolvers<TContext>;
    User?: UserResolvers.Resolvers;
    Date?: GraphQLScalarType;
} & { [typeName: string] : never };

export type IDirectiveResolvers<Result> = {
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
} & { [directiveName: string] : never };
