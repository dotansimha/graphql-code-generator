# TypeScript Apollo Angular Template

This template generates Apollo services (`Query`, `Mutation`, `Subscription`) with TypeScript typings.
This template is extended version of TypeScript template, so the configuration is same with `graphql-codegen-typescript-template`.

- Example Input

```graphql
query Feed {
  feed {
    id
    commentCount
  }
}
```

- Example Usage

```ts
import { FeedQuery } from './graphql';

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

  constructor(feedQuery: FeedQuery) {
    this.feed = feedQuery.watch().valueChanges.pipe(map(result => result.data.feed));
  }
}
```
