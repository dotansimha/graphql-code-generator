---
id: typescript-apollo-angular
title: Typescript Apollo Angular
---

This plugin generates Apollo services (`Query`, `Mutation` and `Subscription`) with TypeScript typings.

It will generate a strongly typed Angular service for every defined query, mutation or subscription. The generated Angular services are ready to inject and use within your Angular component.

To shed some more light regards this template, it's recommended to go through the ["Query, Mutation, Subscription services"](http://apollographql.com/docs/angular/basics/services.html) chapter of Apollo Angular docs and to read the ["Code Generation with Apollo Angular"](https://medium.com/the-guild/apollo-angular-code-generation-7903da1f8559) article.

## Installation

Install using `npm` (or `yarn`):

    $ npm install graphql-codegen-typescript-apollo-angular

## Example

Simply create a `.graphql` file and write a random query like so:

```graphql
query MyFeed {
  feed {
    id
    commentCount
  }
}
```

Using `gql-gen` you can generate a file with types and services that you can use when coding an Angular component:

```ts
import { MyFeedGQL, Feed } from './graphql';

@Component({
  selector: 'feed',
  template: `
    <h1>Feed:</h1>
    <ul>
      <li *ngFor="let item of (feed | async)">{{ item.id }}</li>
    </ul>
  `
})
export class FeedComponent {
  feed: Observable<Feed>;

  constructor(feedGQL: MyFeedGQL) {
    this.feed = feedGQL.watch().valueChanges.pipe(map(result => result.data.feed));
  }
}
```

## Configuration

The output of this template can be controlled using a specified config file which consists of the fields below. Each config field is followed by its matching environment variable, which can be used as an alternative method to control the template's behavior:

#### `noGraphqlTag` (default value: `false`)

This will cause the codegen to output parsed documents and not use a literal tag of the `graphql-tag` package.

```yaml
# ...
generates:
  path/to/output:
    config:
      noGraphqlTag: true
    plugins:
      - typescript-apollo-angular
      # ...
```
