import * as React from 'react';
import { AllPostsComponent, UpvotePostComponent } from '../../generated-models';

export class TestWithComponent extends React.Component {
  render() {
    return (
      <AllPostsComponent>
        {({ data, error, loading }) => {
          if (error || loading) return '...';

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
      </AllPostsComponent>
    );
  }
}
