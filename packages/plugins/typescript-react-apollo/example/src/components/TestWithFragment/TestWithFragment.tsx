import * as React from 'react';
import { AllPostsWithFragmentComponent, UpvotePostComponent } from '../../generated-models';

export class TestWithFragment extends React.Component {
  render() {
    return (
      <AllPostsWithFragmentComponent>
        {({ loading, error, data }) => {
          if (loading) {
            return 'Loading...';
          }
          if (error) {
            return `Error! ${error.message}`;
          }
          return (
            <ul>
              {data &&
                data.posts &&
                data.posts.map(
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
        }}
      </AllPostsWithFragmentComponent>
    );
  }
}
