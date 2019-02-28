// tslint:disable
export type Maybe<T> = T | null;

/** A list of options for the sort order of the feed */
  export enum FeedType {
    Hot = "HOT",
    New = "NEW",
    Top = "TOP",
  }
/** The type of vote to record, when submitting a vote */
  export enum VoteType {
    Up = "UP",
    Down = "DOWN",
    Cancel = "CANCEL",
  }


// ====================================================
// Documents
// ====================================================



export namespace OnCommentAdded {
  export type Variables = {
    repoFullName: string;
  }

  export type Subscription = {
    __typename?: "Subscription";
    
    commentAdded: Maybe<CommentAdded>;
  }

  export type CommentAdded = {
    __typename?: "Comment";
    
    id: number;
    
    postedBy: PostedBy;
    
    createdAt: number;
    
    content: string;
  } 

  export type PostedBy = {
    __typename?: "User";
    
    login: string;
    
    html_url: string;
  } 
}

export namespace Comment {
  export type Variables = {
    repoFullName: string;
    limit?: Maybe<number>;
    offset?: Maybe<number>;
  }

  export type Query = {
    __typename?: "Query";
    
    currentUser: Maybe<CurrentUser>;
    
    entry: Maybe<Entry>;
  }

  export type CurrentUser = {
    __typename?: "User";
    
    login: string;
    
    html_url: string;
  } 

  export type Entry = {
    __typename?: "Entry";
    
    id: number;
    
    postedBy: PostedBy;
    
    createdAt: number;
    
    comments: (Maybe<Comments>)[];
    
    commentCount: number;
    
    repository: Repository;
  } 

  export type PostedBy = {
    __typename?: "User";
    
    login: string;
    
    html_url: string;
  } 

  export type Comments = CommentsPageComment.Fragment

  export type Repository = {
    __typename?: RepositoryInlineFragment["__typename"];
    
    full_name: string;
    
    html_url: string;
  }  & RepositoryInlineFragment

  export type RepositoryInlineFragment = {
    __typename?: "Repository";
    
    description: Maybe<string>;
    
    open_issues_count: Maybe<number>;
    
    stargazers_count: number;
  } 
}

export namespace CurrentUserForProfile {
  export type Variables = {
  }

  export type Query = {
    __typename?: "Query";
    
    currentUser: Maybe<CurrentUser>;
  }

  export type CurrentUser = {
    __typename?: "User";
    
    login: string;
    
    avatar_url: string;
  } 
}

export namespace Feed {
  export type Variables = {
    type: FeedType;
    offset?: Maybe<number>;
    limit?: Maybe<number>;
  }

  export type Query = {
    __typename?: "Query";
    
    currentUser: Maybe<CurrentUser>;
    
    feed: Maybe<(Maybe<Feed>)[]>;
  }

  export type CurrentUser = {
    __typename?: "User";
    
    login: string;
  } 

  export type Feed = FeedEntry.Fragment
}

export namespace SubmitRepository {
  export type Variables = {
    repoFullName: string;
  }

  export type Mutation = {
    __typename?: "Mutation";
    
    submitRepository: Maybe<SubmitRepository>;
  }

  export type SubmitRepository = {
    __typename?: "Entry";
    
    createdAt: number;
  } 
}

export namespace SubmitComment {
  export type Variables = {
    repoFullName: string;
    commentContent: string;
  }

  export type Mutation = {
    __typename?: "Mutation";
    
    submitComment: Maybe<SubmitComment>;
  }

  export type SubmitComment = CommentsPageComment.Fragment
}

export namespace Vote {
  export type Variables = {
    repoFullName: string;
    type: VoteType;
  }

  export type Mutation = {
    __typename?: "Mutation";
    
    vote: Maybe<Vote>;
  }

  export type Vote = {
    __typename?: "Entry";
    
    score: number;
    
    id: number;
    
    vote: _Vote;
  } 

  export type _Vote = {
    __typename?: "Vote";
    
    vote_value: number;
  } 
}

export namespace CommentsPageComment {
  export type Fragment = {
    __typename?: "Comment";
    
    id: number;
    
    postedBy: PostedBy;
    
    createdAt: number;
    
    content: string;
  }

  export type PostedBy = {
    __typename?: "User";
    
    login: string;
    
    html_url: string;
  }
}

export namespace FeedEntry {
  export type Fragment = {
    __typename?: "Entry";
    
    id: number;
    
    commentCount: number;
    
    repository: Repository;
  } & (VoteButtons.Fragment & RepoInfo.Fragment)

  export type Repository = {
    __typename?: "Repository";
    
    full_name: string;
    
    html_url: string;
    
    owner: Maybe<Owner>;
  }

  export type Owner = {
    __typename?: "User";
    
    avatar_url: string;
  }
}

export namespace RepoInfo {
  export type Fragment = {
    __typename?: "Entry";
    
    createdAt: number;
    
    repository: Repository;
    
    postedBy: PostedBy;
  }

  export type Repository = {
    __typename?: "Repository";
    
    description: Maybe<string>;
    
    stargazers_count: number;
    
    open_issues_count: Maybe<number>;
  }

  export type PostedBy = {
    __typename?: "User";
    
    html_url: string;
    
    login: string;
  }
}

export namespace VoteButtons {
  export type Fragment = {
    __typename?: "Entry";
    
    score: number;
    
    vote: Vote;
  }

  export type Vote = {
    __typename?: "Vote";
    
    vote_value: number;
  }
}


    import gql from 'graphql-tag';
  import * as React from 'react';
import * as ReactApollo from 'react-apollo';




// ====================================================
// Fragments
// ====================================================



          export namespace CommentsPageComment {
            export const FragmentDoc = gql`
    fragment CommentsPageComment on Comment {
  id
  postedBy {
    login
    html_url
  }
  createdAt
  content
}
    
      
    
  `;
          }
        

          export namespace VoteButtons {
            export const FragmentDoc = gql`
    fragment VoteButtons on Entry {
  score
  vote {
    vote_value
  }
}
    
      
    
  `;
          }
        

          export namespace RepoInfo {
            export const FragmentDoc = gql`
    fragment RepoInfo on Entry {
  createdAt
  repository {
    description
    stargazers_count
    open_issues_count
  }
  postedBy {
    html_url
    login
  }
}
    
      
    
  `;
          }
        

          export namespace FeedEntry {
            export const FragmentDoc = gql`
    fragment FeedEntry on Entry {
  id
  commentCount
  repository {
    full_name
    html_url
    owner {
      avatar_url
    }
  }
  ...VoteButtons
  ...RepoInfo
}
    
      ${VoteButtons.FragmentDoc}
${RepoInfo.FragmentDoc}
    
  `;
          }
        



// ====================================================
// Components
// ====================================================


export namespace OnCommentAdded {
    export const Document = gql`
    subscription onCommentAdded($repoFullName: String!) {
  commentAdded(repoFullName: $repoFullName) {
    id
    postedBy {
      login
      html_url
    }
    createdAt
    content
  }
}
    
      
    
  `;
     export class Component extends React.Component<Partial<ReactApollo.SubscriptionProps<Subscription, Variables>>> {
        render(){
            return (
                <ReactApollo.Subscription<Subscription, Variables>
                subscription={ Document }
                {...(this as any)['props'] as any}
                />
            );
        }
    }
    export type Props<TChildProps = any> = 
            Partial<
                ReactApollo.DataProps<
                                        Subscription, 
                                        Variables
                                    >
                    >
         & TChildProps;
    export function HOC<TProps, TChildProps = any>(operationOptions: 
            ReactApollo.OperationOption<
                TProps, 
                Subscription,
                Variables,
                Props<TChildProps>
            > | undefined){
        return ReactApollo.graphql<TProps, Subscription, Variables, Props<TChildProps>>(
            Document,
            operationOptions
        );
    };
}
export namespace Comment {
    export const Document = gql`
    query Comment($repoFullName: String!, $limit: Int, $offset: Int) {
  currentUser {
    login
    html_url
  }
  entry(repoFullName: $repoFullName) {
    id
    postedBy {
      login
      html_url
    }
    createdAt
    comments(limit: $limit, offset: $offset) {
      ...CommentsPageComment
    }
    commentCount
    repository {
      full_name
      html_url
      ... on Repository {
        description
        open_issues_count
        stargazers_count
      }
    }
  }
}
    
      ${CommentsPageComment.FragmentDoc}
    
  `;
     export class Component extends React.Component<Partial<ReactApollo.QueryProps<Query, Variables>>> {
        render(){
            return (
                <ReactApollo.Query<Query, Variables>
                query={ Document }
                {...(this as any)['props'] as any}
                />
            );
        }
    }
    export type Props<TChildProps = any> = 
            Partial<
                ReactApollo.DataProps<
                                        Query, 
                                        Variables
                                    >
                    >
         & TChildProps;
    export function HOC<TProps, TChildProps = any>(operationOptions: 
            ReactApollo.OperationOption<
                TProps, 
                Query,
                Variables,
                Props<TChildProps>
            > | undefined){
        return ReactApollo.graphql<TProps, Query, Variables, Props<TChildProps>>(
            Document,
            operationOptions
        );
    };
}
export namespace CurrentUserForProfile {
    export const Document = gql`
    query CurrentUserForProfile {
  currentUser {
    login
    avatar_url
  }
}
    
      
    
  `;
     export class Component extends React.Component<Partial<ReactApollo.QueryProps<Query, Variables>>> {
        render(){
            return (
                <ReactApollo.Query<Query, Variables>
                query={ Document }
                {...(this as any)['props'] as any}
                />
            );
        }
    }
    export type Props<TChildProps = any> = 
            Partial<
                ReactApollo.DataProps<
                                        Query, 
                                        Variables
                                    >
                    >
         & TChildProps;
    export function HOC<TProps, TChildProps = any>(operationOptions: 
            ReactApollo.OperationOption<
                TProps, 
                Query,
                Variables,
                Props<TChildProps>
            > | undefined){
        return ReactApollo.graphql<TProps, Query, Variables, Props<TChildProps>>(
            Document,
            operationOptions
        );
    };
}
export namespace Feed {
    export const Document = gql`
    query Feed($type: FeedType!, $offset: Int, $limit: Int) {
  currentUser {
    login
  }
  feed(type: $type, offset: $offset, limit: $limit) {
    ...FeedEntry
  }
}
    
      ${FeedEntry.FragmentDoc}
    
  `;
     export class Component extends React.Component<Partial<ReactApollo.QueryProps<Query, Variables>>> {
        render(){
            return (
                <ReactApollo.Query<Query, Variables>
                query={ Document }
                {...(this as any)['props'] as any}
                />
            );
        }
    }
    export type Props<TChildProps = any> = 
            Partial<
                ReactApollo.DataProps<
                                        Query, 
                                        Variables
                                    >
                    >
         & TChildProps;
    export function HOC<TProps, TChildProps = any>(operationOptions: 
            ReactApollo.OperationOption<
                TProps, 
                Query,
                Variables,
                Props<TChildProps>
            > | undefined){
        return ReactApollo.graphql<TProps, Query, Variables, Props<TChildProps>>(
            Document,
            operationOptions
        );
    };
}
export namespace SubmitRepository {
    export const Document = gql`
    mutation submitRepository($repoFullName: String!) {
  submitRepository(repoFullName: $repoFullName) {
    createdAt
  }
}
    
      
    
  `;
     export class Component extends React.Component<Partial<ReactApollo.MutationProps<Mutation, Variables>>> {
        render(){
            return (
                <ReactApollo.Mutation<Mutation, Variables>
                mutation={ Document }
                {...(this as any)['props'] as any}
                />
            );
        }
    }
    export type Props<TChildProps = any> = 
            Partial<
                ReactApollo.MutateProps<
                                        Mutation, 
                                        Variables
                                        >
                >
         & TChildProps;
    export type MutationFn = ReactApollo.MutationFn<Mutation, Variables>;
    export function HOC<TProps, TChildProps = any>(operationOptions: 
            ReactApollo.OperationOption<
                TProps, 
                Mutation,
                Variables,
                Props<TChildProps>
            > | undefined){
        return ReactApollo.graphql<TProps, Mutation, Variables, Props<TChildProps>>(
            Document,
            operationOptions
        );
    };
}
export namespace SubmitComment {
    export const Document = gql`
    mutation submitComment($repoFullName: String!, $commentContent: String!) {
  submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {
    ...CommentsPageComment
  }
}
    
      ${CommentsPageComment.FragmentDoc}
    
  `;
     export class Component extends React.Component<Partial<ReactApollo.MutationProps<Mutation, Variables>>> {
        render(){
            return (
                <ReactApollo.Mutation<Mutation, Variables>
                mutation={ Document }
                {...(this as any)['props'] as any}
                />
            );
        }
    }
    export type Props<TChildProps = any> = 
            Partial<
                ReactApollo.MutateProps<
                                        Mutation, 
                                        Variables
                                        >
                >
         & TChildProps;
    export type MutationFn = ReactApollo.MutationFn<Mutation, Variables>;
    export function HOC<TProps, TChildProps = any>(operationOptions: 
            ReactApollo.OperationOption<
                TProps, 
                Mutation,
                Variables,
                Props<TChildProps>
            > | undefined){
        return ReactApollo.graphql<TProps, Mutation, Variables, Props<TChildProps>>(
            Document,
            operationOptions
        );
    };
}
export namespace Vote {
    export const Document = gql`
    mutation vote($repoFullName: String!, $type: VoteType!) {
  vote(repoFullName: $repoFullName, type: $type) {
    score
    id
    vote {
      vote_value
    }
  }
}
    
      
    
  `;
     export class Component extends React.Component<Partial<ReactApollo.MutationProps<Mutation, Variables>>> {
        render(){
            return (
                <ReactApollo.Mutation<Mutation, Variables>
                mutation={ Document }
                {...(this as any)['props'] as any}
                />
            );
        }
    }
    export type Props<TChildProps = any> = 
            Partial<
                ReactApollo.MutateProps<
                                        Mutation, 
                                        Variables
                                        >
                >
         & TChildProps;
    export type MutationFn = ReactApollo.MutationFn<Mutation, Variables>;
    export function HOC<TProps, TChildProps = any>(operationOptions: 
            ReactApollo.OperationOption<
                TProps, 
                Mutation,
                Variables,
                Props<TChildProps>
            > | undefined){
        return ReactApollo.graphql<TProps, Mutation, Variables, Props<TChildProps>>(
            Document,
            operationOptions
        );
    };
}
