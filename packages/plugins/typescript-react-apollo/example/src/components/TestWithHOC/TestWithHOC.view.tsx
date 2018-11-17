import * as React from 'react';
import { DataProps } from 'react-apollo';
import { AllPostsQuery, AllPostsVariables, UpvotePostComponent } from '../../generated-models';

export interface TestWithHOCViewProps extends DataProps<AllPostsQuery, AllPostsVariables> {}

export class TestWithHOCView extends React.Component<TestWithHOCViewProps> {
  render() {
    if (this.props.data.loading) return 'Loading...';
    if (this.props.data.error) return `Error! ${this.props.data.error.message}`;
    return (
      <ul>
        {this.props &&
          this.props.data &&
          this.props.data.posts &&
          this.props.data.posts.map(
            post =>
              post &&
              post.author && (
                <li key={post.id}>
                  {post.title} by {post.author.firstName} {post.author.lastName} ({post.votes} votes){' '}
                  <UpvotePostComponent>
                    {upvotePost => (
                      <button onClick={() => upvotePost({ variables: { postId: post.id } })}>Upvote</button>
                    )}
                  </UpvotePostComponent>
                </li>
              )
          )}
      </ul>
    );
  }
}
