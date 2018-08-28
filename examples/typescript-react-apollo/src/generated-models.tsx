/* tslint:disable */
import { GraphQLResolveInfo } from 'graphql';

export type Resolver<Result, Parent = any, Context = any, Args = any> = (
  parent: Parent,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo
) => Promise<Result> | Result;

export type SubscriptionResolver<Result, Parent = any, Context = any, Args = any> = {
  subscribe<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: Context,
    info: GraphQLResolveInfo
  ): AsyncIterator<R | Result>;
  resolve?<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: Context,
    info: GraphQLResolveInfo
  ): R | Result | Promise<R | Result>;
};

export interface Query {
  me?: User | null;
  allUsers?: (User | null)[] | null;
  User?: User | null;
  allProducts?: (Product | null)[] | null;
  Product?: Product | null;
  Todo?: Todo | null;
  allTodos?: (Todo | null)[] | null;
  Post?: Post | null;
  allPosts?: (Post | null)[] | null;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string | null;
}

export interface Product {
  id: string;
  price: string;
  name: string;
}

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export interface Post {
  id: string;
  title: string;
  body: string;
  published: boolean;
  createdAt: string;
  author: User;
}

export interface Mutation {
  register?: AuthPayload | null;
  login?: AuthPayload | null;
  updateUser?: User | null;
  createTodo?: Todo | null;
}

export interface AuthPayload {
  token: string;
}

export interface Subscription {
  todoAdded?: Todo | null;
}
export interface AllUsersQueryArgs {
  count?: number | null;
}
export interface UserQueryArgs {
  id: string;
}
export interface AllProductsQueryArgs {
  count?: number | null;
}
export interface ProductQueryArgs {
  id: string;
}
export interface TodoQueryArgs {
  id: string;
}
export interface AllTodosQueryArgs {
  count?: number | null;
}
export interface PostQueryArgs {
  id: string;
}
export interface AllPostsQueryArgs {
  count?: number | null;
}
export interface RegisterMutationArgs {
  email: string;
  password: string;
  expiresIn?: string | null;
}
export interface LoginMutationArgs {
  email: string;
  password: string;
  expiresIn?: string | null;
}
export interface UpdateUserMutationArgs {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}
export interface CreateTodoMutationArgs {
  title: string;
  completed?: boolean | null;
}

export namespace QueryResolvers {
  export interface Resolvers<Context = any> {
    me?: MeResolver<User | null, any, Context>;
    allUsers?: AllUsersResolver<(User | null)[] | null, any, Context>;
    User?: UserResolver<User | null, any, Context>;
    allProducts?: AllProductsResolver<(Product | null)[] | null, any, Context>;
    Product?: ProductResolver<Product | null, any, Context>;
    Todo?: TodoResolver<Todo | null, any, Context>;
    allTodos?: AllTodosResolver<(Todo | null)[] | null, any, Context>;
    Post?: PostResolver<Post | null, any, Context>;
    allPosts?: AllPostsResolver<(Post | null)[] | null, any, Context>;
  }

  export type MeResolver<R = User | null, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type AllUsersResolver<R = (User | null)[] | null, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context,
    AllUsersArgs
  >;
  export interface AllUsersArgs {
    count?: number | null;
  }

  export type UserResolver<R = User | null, Parent = any, Context = any> = Resolver<R, Parent, Context, UserArgs>;
  export interface UserArgs {
    id: string;
  }

  export type AllProductsResolver<R = (Product | null)[] | null, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context,
    AllProductsArgs
  >;
  export interface AllProductsArgs {
    count?: number | null;
  }

  export type ProductResolver<R = Product | null, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context,
    ProductArgs
  >;
  export interface ProductArgs {
    id: string;
  }

  export type TodoResolver<R = Todo | null, Parent = any, Context = any> = Resolver<R, Parent, Context, TodoArgs>;
  export interface TodoArgs {
    id: string;
  }

  export type AllTodosResolver<R = (Todo | null)[] | null, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context,
    AllTodosArgs
  >;
  export interface AllTodosArgs {
    count?: number | null;
  }

  export type PostResolver<R = Post | null, Parent = any, Context = any> = Resolver<R, Parent, Context, PostArgs>;
  export interface PostArgs {
    id: string;
  }

  export type AllPostsResolver<R = (Post | null)[] | null, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context,
    AllPostsArgs
  >;
  export interface AllPostsArgs {
    count?: number | null;
  }
}

export namespace UserResolvers {
  export interface Resolvers<Context = any> {
    id?: IdResolver<string, any, Context>;
    firstName?: FirstNameResolver<string, any, Context>;
    lastName?: LastNameResolver<string, any, Context>;
    email?: EmailResolver<string, any, Context>;
    avatar?: AvatarResolver<string | null, any, Context>;
  }

  export type IdResolver<R = string, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type FirstNameResolver<R = string, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type LastNameResolver<R = string, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type EmailResolver<R = string, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type AvatarResolver<R = string | null, Parent = any, Context = any> = Resolver<R, Parent, Context>;
}

export namespace ProductResolvers {
  export interface Resolvers<Context = any> {
    id?: IdResolver<string, any, Context>;
    price?: PriceResolver<string, any, Context>;
    name?: NameResolver<string, any, Context>;
  }

  export type IdResolver<R = string, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type PriceResolver<R = string, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type NameResolver<R = string, Parent = any, Context = any> = Resolver<R, Parent, Context>;
}

export namespace TodoResolvers {
  export interface Resolvers<Context = any> {
    id?: IdResolver<string, any, Context>;
    title?: TitleResolver<string, any, Context>;
    completed?: CompletedResolver<boolean, any, Context>;
  }

  export type IdResolver<R = string, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type TitleResolver<R = string, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type CompletedResolver<R = boolean, Parent = any, Context = any> = Resolver<R, Parent, Context>;
}

export namespace PostResolvers {
  export interface Resolvers<Context = any> {
    id?: IdResolver<string, any, Context>;
    title?: TitleResolver<string, any, Context>;
    body?: BodyResolver<string, any, Context>;
    published?: PublishedResolver<boolean, any, Context>;
    createdAt?: CreatedAtResolver<string, any, Context>;
    author?: AuthorResolver<User, any, Context>;
  }

  export type IdResolver<R = string, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type TitleResolver<R = string, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type BodyResolver<R = string, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type PublishedResolver<R = boolean, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type CreatedAtResolver<R = string, Parent = any, Context = any> = Resolver<R, Parent, Context>;
  export type AuthorResolver<R = User, Parent = any, Context = any> = Resolver<R, Parent, Context>;
}

export namespace MutationResolvers {
  export interface Resolvers<Context = any> {
    register?: RegisterResolver<AuthPayload | null, any, Context>;
    login?: LoginResolver<AuthPayload | null, any, Context>;
    updateUser?: UpdateUserResolver<User | null, any, Context>;
    createTodo?: CreateTodoResolver<Todo | null, any, Context>;
  }

  export type RegisterResolver<R = AuthPayload | null, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context,
    RegisterArgs
  >;
  export interface RegisterArgs {
    email: string;
    password: string;
    expiresIn?: string | null;
  }

  export type LoginResolver<R = AuthPayload | null, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context,
    LoginArgs
  >;
  export interface LoginArgs {
    email: string;
    password: string;
    expiresIn?: string | null;
  }

  export type UpdateUserResolver<R = User | null, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context,
    UpdateUserArgs
  >;
  export interface UpdateUserArgs {
    id: string;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  }

  export type CreateTodoResolver<R = Todo | null, Parent = any, Context = any> = Resolver<
    R,
    Parent,
    Context,
    CreateTodoArgs
  >;
  export interface CreateTodoArgs {
    title: string;
    completed?: boolean | null;
  }
}

export namespace AuthPayloadResolvers {
  export interface Resolvers<Context = any> {
    token?: TokenResolver<string, any, Context>;
  }

  export type TokenResolver<R = string, Parent = any, Context = any> = Resolver<R, Parent, Context>;
}

export namespace SubscriptionResolvers {
  export interface Resolvers<Context = any> {
    todoAdded?: TodoAddedResolver<Todo | null, any, Context>;
  }

  export type TodoAddedResolver<R = Todo | null, Parent = any, Context = any> = Resolver<R, Parent, Context>;
}

export namespace UserQuery {
  export type Variables = {
    id: string;
  };

  export type Query = {
    __typename?: 'Query';
    User?: User | null;
  };

  export type User = {
    __typename?: 'User';
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string | null;
  };
}

export namespace UserQueryWithFragment {
  export type Variables = {
    id: string;
  };

  export type Query = {
    __typename?: 'Query';
    User?: User | null;
  };

  export type User = UserFragment.Fragment;
}

export namespace UserFragment {
  export type Fragment = {
    __typename?: 'User';
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string | null;
  };
}

import * as ReactApollo from 'react-apollo';
import * as React from 'react';

import gql from 'graphql-tag';

export namespace UserFragment {
  export const Document = gql`
    fragment UserFragment on User {
      id
      firstName
      lastName
      email
      avatar
    }
  `;
}

export namespace UserQuery {
  export const Document = gql`
    query UserQuery($id: ID!) {
      User(id: $id) {
        id
        firstName
        lastName
        email
        avatar
      }
    }
  `;
  export const DocumentWithFragments = {
    kind: 'Document',
    definitions: [...Document.definitions]
  };
  export interface ComponentProps {
    query?: any;
    variables?: Variables;
    children: (result: ReactApollo.QueryResult<Query, Variables>) => React.ReactNode;
  }
  export class Component extends React.Component<ComponentProps> {
    render() {
      return <ReactApollo.Query<Query, Variables> query={DocumentWithFragments} {...this.props} />;
    }
  }
}
export namespace UserQueryWithFragment {
  export const Document = gql`
    query UserQueryWithFragment($id: ID!) {
      User(id: $id) {
        ...UserFragment
      }
    }
  `;
  export const DocumentWithFragments = {
    kind: 'Document',
    definitions: [...Document.definitions, ...UserFragment.Document.definitions]
  };
  export interface ComponentProps {
    query?: any;
    variables?: Variables;
    children: (result: ReactApollo.QueryResult<Query, Variables>) => React.ReactNode;
  }
  export class Component extends React.Component<ComponentProps> {
    render() {
      return <ReactApollo.Query<Query, Variables> query={DocumentWithFragments} {...this.props} />;
    }
  }
}

export namespace UserQuery {
  export function HOC<TProps = {}>(operationOptions?: ReactApollo.OperationOption<TProps, Query, Variables>) {
    return ReactApollo.graphql<TProps, Query, Variables>(DocumentWithFragments as any, operationOptions);
  }
}
export namespace UserQueryWithFragment {
  export function HOC<TProps = {}>(operationOptions?: ReactApollo.OperationOption<TProps, Query, Variables>) {
    return ReactApollo.graphql<TProps, Query, Variables>(DocumentWithFragments as any, operationOptions);
  }
}
