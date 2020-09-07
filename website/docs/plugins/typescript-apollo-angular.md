---
id: typescript-apollo-angular
title: TypeScript Apollo Angular
---

{@import ../plugins/client-note.md}

{@import ../generated-config/typescript-apollo-angular.md}

## How to use?

Simply create a `.graphql` file and write a random query like so:

```graphql
query MyFeed {
  feed {
    id
    commentCount
  }
}
```

Using `graphql-codegen` you can generate a file with Angular services that you can use when coding an Angular component:

```yaml
# ...
generates:
  path/to/output.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-apollo-angular
```

Then, use it:

```ts
import { MyFeedGQL, MyFeedQuery } from './graphql';
//BE SURE TO USE Observable from rxjs and not from @apollo/client/core when using map
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'feed',
  template: `
    <h1>Feed:</h1>
    <ul>
      <li *ngFor="let item of feed | async">{{ item.id }}</li>
    </ul>
  `,
})
export class FeedComponent {
  feed: Observable<MyFeedQuery['feed']>;

  constructor(feedGQL: MyFeedGQL) {
    this.feed = feedGQL.watch().valueChanges.pipe(map(result => result.data.feed));
  }
}
```

#### `@NgModule` directive

All generated services are defined with `@Injectable({ providedIn: 'root' })` and in most cases you don't need to overwrite it, because providing a service to the root injector is highly recommended. To customize that behavior you can use `@NgModule` directive, anywhere in an operation, to let the codegen know which injector should it use to create a service.

> You can't use multiple `@NgModule` directives in the same operation

```graphql
query feed {
  feed @NgModule(module: "./feed/feed.module#FeedModule") {
    id
    title
  }
}
```

#### `@namedClient` directive

Sometimes you end up with multiple Apollo clients, which means part of operations can't use the defauls. In order to customize that behavior you simply attach the `@namedClient` directive and the `typescript-apollo-angular` plugin takes care of the rest.

> You can't use multiple `@namedClient` directives in the same operation

```graphql
query feed {
  feed @namedClient(name: "custom") {
    id
    title
  }
}
```

