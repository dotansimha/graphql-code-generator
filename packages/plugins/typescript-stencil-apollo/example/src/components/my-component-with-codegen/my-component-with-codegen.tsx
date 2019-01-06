import { Component, Prop } from '@stencil/core';
import ApolloClient from 'apollo-boost';
import { UpvotePost, AllPosts } from '../../generated-models';

const client = new ApolloClient({
  uri: 'https://0vw9j9w0l5.lp.gql.zone/graphql'
});

@Component({
  tag: 'my-component-with-codegen',
  styleUrl: 'my-component-with-codegen.css'
})
export class MyComponentWithCodegen {
  @Prop() first: string;
  @Prop() last: string;

  renderUpvoteButton(postId) {
    return (
      <UpvotePost.Component
        variables={{ postId }}
        onReady={upvotePost => <button onClick={() => upvotePost({})}>Upvote</button>}
      />
    );
  }

  render() {
    return (
      <apollo-provider client={client}>
        <AllPosts.Component
          onReady={({ data, loading }) => {
            if (loading) {
              return 'Loading...';
            }
            return (
              <ul>
                {data.posts.map(post => (
                  <li>
                    {post.title} by {post.author.firstName} {post.author.lastName} ({post.votes} votes){' '}
                    {this.renderUpvoteButton(post.id)}
                  </li>
                ))}
              </ul>
            );
          }}
        />
      </apollo-provider>
    );
  }
}
