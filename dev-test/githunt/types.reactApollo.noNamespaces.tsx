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



  export type OnCommentAddedVariables = {
    repoFullName: string;
  }

  export type OnCommentAddedSubscription = {
    __typename?: "Subscription";
    
    commentAdded: Maybe<OnCommentAddedCommentAdded>;
  }

  export type OnCommentAddedCommentAdded = {
    __typename?: "Comment";
    
    id: number;
    
    postedBy: OnCommentAddedPostedBy;
    
    createdAt: number;
    
    content: string;
  } 

  export type OnCommentAddedPostedBy = {
    __typename?: "User";
    
    login: string;
    
    html_url: string;
  } 

  export type CommentVariables = {
    repoFullName: string;
    limit?: Maybe<number>;
    offset?: Maybe<number>;
  }

  export type CommentQuery = {
    __typename?: "Query";
    
    currentUser: Maybe<CommentCurrentUser>;
    
    entry: Maybe<CommentEntry>;
  }

  export type CommentCurrentUser = {
    __typename?: "User";
    
    login: string;
    
    html_url: string;
  } 

  export type CommentEntry = {
    __typename?: "Entry";
    
    id: number;
    
    postedBy: CommentPostedBy;
    
    createdAt: number;
    
    comments: (Maybe<CommentComments>)[];
    
    commentCount: number;
    
    repository: CommentRepository;
  } 

  export type CommentPostedBy = {
    __typename?: "User";
    
    login: string;
    
    html_url: string;
  } 

  export type CommentComments = CommentsPageCommentFragment

  export type CommentRepository = {
    __typename?: CommentRepositoryInlineFragment["__typename"];
    
    full_name: string;
    
    html_url: string;
  }  & CommentRepositoryInlineFragment

  export type CommentRepositoryInlineFragment = {
    __typename?: "Repository";
    
    description: Maybe<string>;
    
    open_issues_count: Maybe<number>;
    
    stargazers_count: number;
  } 

  export type CurrentUserForProfileVariables = {
  }

  export type CurrentUserForProfileQuery = {
    __typename?: "Query";
    
    currentUser: Maybe<CurrentUserForProfileCurrentUser>;
  }

  export type CurrentUserForProfileCurrentUser = {
    __typename?: "User";
    
    login: string;
    
    avatar_url: string;
  } 

  export type FeedVariables = {
    type: FeedType;
    offset?: Maybe<number>;
    limit?: Maybe<number>;
  }

  export type FeedQuery = {
    __typename?: "Query";
    
    currentUser: Maybe<FeedCurrentUser>;
    
    feed: Maybe<(Maybe<FeedFeed>)[]>;
  }

  export type FeedCurrentUser = {
    __typename?: "User";
    
    login: string;
  } 

  export type FeedFeed = FeedEntryFragment

  export type SubmitRepositoryVariables = {
    repoFullName: string;
  }

  export type SubmitRepositoryMutation = {
    __typename?: "Mutation";
    
    submitRepository: Maybe<SubmitRepositorySubmitRepository>;
  }

  export type SubmitRepositorySubmitRepository = {
    __typename?: "Entry";
    
    createdAt: number;
  } 

  export type SubmitCommentVariables = {
    repoFullName: string;
    commentContent: string;
  }

  export type SubmitCommentMutation = {
    __typename?: "Mutation";
    
    submitComment: Maybe<SubmitCommentSubmitComment>;
  }

  export type SubmitCommentSubmitComment = CommentsPageCommentFragment

  export type VoteVariables = {
    repoFullName: string;
    type: VoteType;
  }

  export type VoteMutation = {
    __typename?: "Mutation";
    
    vote: Maybe<VoteVote>;
  }

  export type VoteVote = {
    __typename?: "Entry";
    
    score: number;
    
    id: number;
    
    vote: Vote_Vote;
  } 

  export type Vote_Vote = {
    __typename?: "Vote";
    
    vote_value: number;
  } 

  export type CommentsPageCommentFragment = {
    __typename?: "Comment";
    
    id: number;
    
    postedBy: CommentsPageCommentPostedBy;
    
    createdAt: number;
    
    content: string;
  }

  export type CommentsPageCommentPostedBy = {
    __typename?: "User";
    
    login: string;
    
    html_url: string;
  }

  export type FeedEntryFragment = {
    __typename?: "Entry";
    
    id: number;
    
    commentCount: number;
    
    repository: FeedEntryRepository;
  } & (VoteButtonsFragment & RepoInfoFragment)

  export type FeedEntryRepository = {
    __typename?: "Repository";
    
    full_name: string;
    
    html_url: string;
    
    owner: Maybe<FeedEntryOwner>;
  }

  export type FeedEntryOwner = {
    __typename?: "User";
    
    avatar_url: string;
  }

  export type RepoInfoFragment = {
    __typename?: "Entry";
    
    createdAt: number;
    
    repository: RepoInfoRepository;
    
    postedBy: RepoInfoPostedBy;
  }

  export type RepoInfoRepository = {
    __typename?: "Repository";
    
    description: Maybe<string>;
    
    stargazers_count: number;
    
    open_issues_count: Maybe<number>;
  }

  export type RepoInfoPostedBy = {
    __typename?: "User";
    
    html_url: string;
    
    login: string;
  }

  export type VoteButtonsFragment = {
    __typename?: "Entry";
    
    score: number;
    
    vote: VoteButtonsVote;
  }

  export type VoteButtonsVote = {
    __typename?: "Vote";
    
    vote_value: number;
  }

import * as ReactApollo from 'react-apollo';
import * as React from 'react';
import gql from 'graphql-tag';



// ====================================================
// Fragments
// ====================================================



          export const CommentsPageCommentFragmentDoc = gql`
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
        

          export const VoteButtonsFragmentDoc = gql`
    fragment VoteButtons on Entry {
  score
  vote {
    vote_value
  }
}
    
      
    
  `;
        

          export const RepoInfoFragmentDoc = gql`
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
        

          export const FeedEntryFragmentDoc = gql`
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
    
      ${VoteButtonsFragmentDoc}
${RepoInfoFragmentDoc}
    
  `;
        



// ====================================================
// Components
// ====================================================


    export const OnCommentAddedDocument = gql`
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
     export class OnCommentAddedComponent extends React.Component<Partial<ReactApollo.SubscriptionProps<OnCommentAddedSubscription, OnCommentAddedVariables>>> {
        render(){
            return (
                <ReactApollo.Subscription<OnCommentAddedSubscription, OnCommentAddedVariables>
                subscription={ OnCommentAddedDocument }
                {...(this as any)['props'] as any}
                />
            );
        }
    }
    export type OnCommentAddedProps<TChildProps = any> = 
            Partial<
                ReactApollo.DataProps<
                                        OnCommentAddedSubscription, 
                                        OnCommentAddedVariables
                                    >
                    >
         & TChildProps;
    export function OnCommentAddedHOC<TProps, TChildProps = any>(operationOptions: 
            ReactApollo.OperationOption<
                TProps, 
                OnCommentAddedSubscription,
                OnCommentAddedVariables,
                OnCommentAddedProps<TChildProps>
            > | undefined){
        return ReactApollo.graphql<TProps, OnCommentAddedSubscription, OnCommentAddedVariables, OnCommentAddedProps<TChildProps>>(
            OnCommentAddedDocument,
            operationOptions
        );
    };
    export const CommentDocument = gql`
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
    
      ${CommentsPageCommentFragmentDoc}
    
  `;
     export class CommentComponent extends React.Component<Partial<ReactApollo.QueryProps<CommentQuery, CommentVariables>>> {
        render(){
            return (
                <ReactApollo.Query<CommentQuery, CommentVariables>
                query={ CommentDocument }
                {...(this as any)['props'] as any}
                />
            );
        }
    }
    export type CommentProps<TChildProps = any> = 
            Partial<
                ReactApollo.DataProps<
                                        CommentQuery, 
                                        CommentVariables
                                    >
                    >
         & TChildProps;
    export function CommentHOC<TProps, TChildProps = any>(operationOptions: 
            ReactApollo.OperationOption<
                TProps, 
                CommentQuery,
                CommentVariables,
                CommentProps<TChildProps>
            > | undefined){
        return ReactApollo.graphql<TProps, CommentQuery, CommentVariables, CommentProps<TChildProps>>(
            CommentDocument,
            operationOptions
        );
    };
    export const CurrentUserForProfileDocument = gql`
    query CurrentUserForProfile {
  currentUser {
    login
    avatar_url
  }
}
    
      
    
  `;
     export class CurrentUserForProfileComponent extends React.Component<Partial<ReactApollo.QueryProps<CurrentUserForProfileQuery, CurrentUserForProfileVariables>>> {
        render(){
            return (
                <ReactApollo.Query<CurrentUserForProfileQuery, CurrentUserForProfileVariables>
                query={ CurrentUserForProfileDocument }
                {...(this as any)['props'] as any}
                />
            );
        }
    }
    export type CurrentUserForProfileProps<TChildProps = any> = 
            Partial<
                ReactApollo.DataProps<
                                        CurrentUserForProfileQuery, 
                                        CurrentUserForProfileVariables
                                    >
                    >
         & TChildProps;
    export function CurrentUserForProfileHOC<TProps, TChildProps = any>(operationOptions: 
            ReactApollo.OperationOption<
                TProps, 
                CurrentUserForProfileQuery,
                CurrentUserForProfileVariables,
                CurrentUserForProfileProps<TChildProps>
            > | undefined){
        return ReactApollo.graphql<TProps, CurrentUserForProfileQuery, CurrentUserForProfileVariables, CurrentUserForProfileProps<TChildProps>>(
            CurrentUserForProfileDocument,
            operationOptions
        );
    };
    export const FeedDocument = gql`
    query Feed($type: FeedType!, $offset: Int, $limit: Int) {
  currentUser {
    login
  }
  feed(type: $type, offset: $offset, limit: $limit) {
    ...FeedEntry
  }
}
    
      ${FeedEntryFragmentDoc}
    
  `;
     export class FeedComponent extends React.Component<Partial<ReactApollo.QueryProps<FeedQuery, FeedVariables>>> {
        render(){
            return (
                <ReactApollo.Query<FeedQuery, FeedVariables>
                query={ FeedDocument }
                {...(this as any)['props'] as any}
                />
            );
        }
    }
    export type FeedProps<TChildProps = any> = 
            Partial<
                ReactApollo.DataProps<
                                        FeedQuery, 
                                        FeedVariables
                                    >
                    >
         & TChildProps;
    export function FeedHOC<TProps, TChildProps = any>(operationOptions: 
            ReactApollo.OperationOption<
                TProps, 
                FeedQuery,
                FeedVariables,
                FeedProps<TChildProps>
            > | undefined){
        return ReactApollo.graphql<TProps, FeedQuery, FeedVariables, FeedProps<TChildProps>>(
            FeedDocument,
            operationOptions
        );
    };
    export const SubmitRepositoryDocument = gql`
    mutation submitRepository($repoFullName: String!) {
  submitRepository(repoFullName: $repoFullName) {
    createdAt
  }
}
    
      
    
  `;
     export class SubmitRepositoryComponent extends React.Component<Partial<ReactApollo.MutationProps<SubmitRepositoryMutation, SubmitRepositoryVariables>>> {
        render(){
            return (
                <ReactApollo.Mutation<SubmitRepositoryMutation, SubmitRepositoryVariables>
                mutation={ SubmitRepositoryDocument }
                {...(this as any)['props'] as any}
                />
            );
        }
    }
    export type SubmitRepositoryProps<TChildProps = any> = 
            Partial<
                ReactApollo.MutateProps<
                                        SubmitRepositoryMutation, 
                                        SubmitRepositoryVariables
                                        >
                >
         & TChildProps;
    export type SubmitRepositoryMutationFn = ReactApollo.MutationFn<SubmitRepositoryMutation, SubmitRepositoryVariables>;
    export function SubmitRepositoryHOC<TProps, TChildProps = any>(operationOptions: 
            ReactApollo.OperationOption<
                TProps, 
                SubmitRepositoryMutation,
                SubmitRepositoryVariables,
                SubmitRepositoryProps<TChildProps>
            > | undefined){
        return ReactApollo.graphql<TProps, SubmitRepositoryMutation, SubmitRepositoryVariables, SubmitRepositoryProps<TChildProps>>(
            SubmitRepositoryDocument,
            operationOptions
        );
    };
    export const SubmitCommentDocument = gql`
    mutation submitComment($repoFullName: String!, $commentContent: String!) {
  submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {
    ...CommentsPageComment
  }
}
    
      ${CommentsPageCommentFragmentDoc}
    
  `;
     export class SubmitCommentComponent extends React.Component<Partial<ReactApollo.MutationProps<SubmitCommentMutation, SubmitCommentVariables>>> {
        render(){
            return (
                <ReactApollo.Mutation<SubmitCommentMutation, SubmitCommentVariables>
                mutation={ SubmitCommentDocument }
                {...(this as any)['props'] as any}
                />
            );
        }
    }
    export type SubmitCommentProps<TChildProps = any> = 
            Partial<
                ReactApollo.MutateProps<
                                        SubmitCommentMutation, 
                                        SubmitCommentVariables
                                        >
                >
         & TChildProps;
    export type SubmitCommentMutationFn = ReactApollo.MutationFn<SubmitCommentMutation, SubmitCommentVariables>;
    export function SubmitCommentHOC<TProps, TChildProps = any>(operationOptions: 
            ReactApollo.OperationOption<
                TProps, 
                SubmitCommentMutation,
                SubmitCommentVariables,
                SubmitCommentProps<TChildProps>
            > | undefined){
        return ReactApollo.graphql<TProps, SubmitCommentMutation, SubmitCommentVariables, SubmitCommentProps<TChildProps>>(
            SubmitCommentDocument,
            operationOptions
        );
    };
    export const VoteDocument = gql`
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
     export class VoteComponent extends React.Component<Partial<ReactApollo.MutationProps<VoteMutation, VoteVariables>>> {
        render(){
            return (
                <ReactApollo.Mutation<VoteMutation, VoteVariables>
                mutation={ VoteDocument }
                {...(this as any)['props'] as any}
                />
            );
        }
    }
    export type VoteProps<TChildProps = any> = 
            Partial<
                ReactApollo.MutateProps<
                                        VoteMutation, 
                                        VoteVariables
                                        >
                >
         & TChildProps;
    export type VoteMutationFn = ReactApollo.MutationFn<VoteMutation, VoteVariables>;
    export function VoteHOC<TProps, TChildProps = any>(operationOptions: 
            ReactApollo.OperationOption<
                TProps, 
                VoteMutation,
                VoteVariables,
                VoteProps<TChildProps>
            > | undefined){
        return ReactApollo.graphql<TProps, VoteMutation, VoteVariables, VoteProps<TChildProps>>(
            VoteDocument,
            operationOptions
        );
    };
