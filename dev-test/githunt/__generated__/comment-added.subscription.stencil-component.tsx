import gql from 'graphql-tag';
import 'stencil-apollo';
import { Component, Prop, h } from '@stencil/core';
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };

declare global {
  export type OnCommentAddedSubscriptionVariables = Exact<{
    repoFullName: Types.Scalars['String'];
  }>;

  export type OnCommentAddedSubscription = { __typename?: 'Subscription' } & {
    commentAdded?: Types.Maybe<
      { __typename?: 'Comment' } & Pick<Types.Comment, 'id' | 'createdAt' | 'content'> & {
          postedBy: { __typename?: 'User' } & Pick<Types.User, 'login' | 'html_url'>;
        }
    >;
  };
}

const OnCommentAddedDocument = gql`
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

@Component({
  tag: 'apollo-on-comment-added',
})
export class OnCommentAddedComponent {
  @Prop() renderer: import('stencil-apollo').SubscriptionRenderer<
    OnCommentAddedSubscription,
    OnCommentAddedSubscriptionVariables
  >;
  @Prop() variables: OnCommentAddedSubscriptionVariables;
  render() {
    return (
      <apollo-subscription subscription={OnCommentAddedDocument} variables={this.variables} renderer={this.renderer} />
    );
  }
}
