---
'@graphql-codegen/typescript-resolvers': patch
---

loosen return type of SubscriptionSubscribeFn from `PromiseOrValue<AsyncIterator>` to `PromiseOrValue<AsyncIterable>`. This fixes type conflicts with libraries such as `ix/asynciterable` and is what `graphql-js` expects.
