# Apollo Angular Template

This template generates Apollo services (`Query`, `Mutation`, `Subscription`) with TypeScript typings.
This template is extended version of TypeScript template, so the configuration is same with `graphql-codegen-typescript-template`.

It will generate a ready to use in your component, strongly typed Angular service, for every defined query, mutation or subscription.

To learn about it, please read the ["Query, Mutation, Subscription services"](http://apollographql.com/docs/angular/basics/services.html) chapter of Apollo Angular documentation.

## Install

All you need to do to use Apollo Angular template is to install two packages:

```bash
npm install \
  graphql-code-generator \
  graphql-codegen-apollo-angular-template \
  --save-dev
```

Now let’s set up a npm script to run gql-gen command:

```bash
gql-gen --schema https://fakerql.com/graphql --template graphql-codegen-apollo-angular-template --out ./src/generated/graphql.ts
\"./src/**/*.graphql\"
```

It might seem like a lot but let’s split that into smaller pieces and explain each one of them.

- **--schema** - path of a file with schema or an URL of a GraphQL endpoint
- **--template** - name of a template, equals name of a package (in our case, apollo-angular template)
- **--out** - path of an output file
- glob based on which GraphQL Codegen will try to find documents

## Client side schema

Just add

- **--clientSchema** - path of a file with schema

## Example

You simply create a `.graphql` file and write a query:

```graphql
query MyFeed {
  feed {
    id
    commentCount
  }
}
```

By running `gql-gen` you get a file with types and services that you can use:

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
