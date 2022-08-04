import gql from 'graphql-tag';
import 'stencil-apollo';
import { Component, Prop, h } from '@stencil/core';

declare global {
  export type OnCommentAddedSubscriptionVariables = Types.Exact<{
    repoFullName: Types.Scalars['String'];
  }>;

  export type OnCommentAddedSubscription = {
    __typename?: 'Subscription';
    commentAdded?: {
      __typename?: 'Comment';
      id: number;
      createdAt: number;
      content: string;
      postedBy: { __typename?: 'User'; login: string; html_url: string };
    } | null;
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
