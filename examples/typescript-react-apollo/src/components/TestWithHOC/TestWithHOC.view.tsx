import * as React from 'react';
import { DataProps } from 'react-apollo';
import { AllPosts, UpvotePost } from '../../generated-models';

interface TestWithHOCViewProps extends DataProps<AllPosts.Query, AllPosts.Variables> {}

export class TestWithHOCView extends React.Component<TestWithHOCViewProps> {
  render() {
    if (this.props.data.loading) return 'Loading...';
    if (this.props.data.error) return `Error! ${this.props.data.error.message}`;
    return (
      <ul>
        {this.props.data.posts.map(post => (
          <li key={post.id}>
            {post.title} by {post.author.firstName} {post.author.lastName} ({post.votes} votes){' '}
            <UpvotePost.Component>
              {upvotePost => <button onClick={() => upvotePost({ variables: { postId: post.id } })}>Upvote</button>}
            </UpvotePost.Component>
          </li>
        ))}
      </ul>
    );
  }
}
