---
id: typescript-apollo-angular
title: Typescript Apollo Angular
---

This plugin generates Apollo services (`Query`, `Mutation` and `Subscription`) with TypeScript typings.

It will generate a strongly typed Angular service for every defined query, mutation or subscription. The generated Angular services are ready to inject and use within your Angular component.

To shed some more light regards this template, it's recommended to go through the ["Query, Mutation, Subscription services"](http://apollographql.com/docs/angular/basics/services.html) chapter of Apollo Angular docs and to read the ["Code Generation with Apollo Angular"](https://medium.com/the-guild/apollo-angular-code-generation-7903da1f8559) article.

## Installation

Install using `npm` (or `yarn`):

    $ npm install @graphql-codegen/typescript-apollo-angular

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
  `,
})
export class FeedComponent {
  feed: Observable<Feed[]>;

  constructor(feedGQL: MyFeedGQL) {
    this.feed = feedGQL.watch().valueChanges.pipe(map(result => result.data.feed));
  }
}
```

## Configuration

The output of this template can be controlled using a specified config file which consists of the fields below. Each config field is followed by its matching environment variable, which can be used as an alternative method to control the template's behavior:

#### `gqlImport` (default value: `import gql from 'graphql-tag'`)

Customize from which module will `gql` be imported from. This is useful if you want to use modules other than `graphql-tag`, e.g. `graphql.macro`. You can also control the imported GraphQL-parse function identifier e.g. `gatsby#graphql`, which will result in `import { graphql as gql } from 'gatsby'`.

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

#### `NgModule`

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

GraphQL Code Generator allows to define `ngModule` as part of the plugin's config so it's globally available:

```yaml
# ...
config:
  ngModule: ./path/to/module#MyModule
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

You can define a global value of `namedClient`:

```yaml
# ...
config:
  namedClient: 'customName'
```
