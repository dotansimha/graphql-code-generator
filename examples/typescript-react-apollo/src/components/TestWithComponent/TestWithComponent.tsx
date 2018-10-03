import * as React from 'react';
import { AllPosts, UpvotePost } from '../../generated-models';

export class TestWithComponent extends React.Component {
  render() {
    return (
      <AllPosts.Component>
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
                        <UpvotePost.Component>
                          {upvotePost => (
                            <button onClick={() => upvotePost({ variables: { postId: post.id } })}>Upvote</button>
                          )}
                        </UpvotePost.Component>
                      </li>
                    )
                )}
            </ul>
          );
        }}
      </AllPosts.Component>
    );
  }
}
