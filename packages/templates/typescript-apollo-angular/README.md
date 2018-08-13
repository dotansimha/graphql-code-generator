# TypeScript Apollo Angular Template

This template generates Apollo services (`Query`, `Mutation`, `Subscription`) with TypeScript typings.
This template is extended version of TypeScript template, so the configuration is same with `graphql-codegen-typescript-template`.

- Example Input

```graphql
query MyFeed {
  feed {
    id
    commentCount
  }
}
```

- Example Usage

```ts
import { MyFeedGQL } from './graphql';

@Component({
  selector: 'feed',
  template: `
    <h1>Feed:</h1>
    <ul>
      <li *ngFor="let item of feed | async"> {{item.id}} </li>
    </ul>
  `
})
export class FeedComponent {
  feed: Observable<any>;

  constructor(feedGQL: MyFeedGQL) {
    this.feed = feedGQL.watch().valueChanges.pipe(map(result => result.data.feed));
  }
}
```

## Generator Config

This generator supports custom config and output behavior. Use to following flags/environment variables to modify your output as you wish:

### `noGraphqlTag` (or `CODEGEN_NO_GRAPHQL_TAG`, default value: `false`)

This will cause the codegen to output parsed documents and not use a literal tag of `graphql-tag` package.
