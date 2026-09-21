This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# Using GraphQL Code Generator with NextJS 13 (App Router) and Apollo Client

This example illustrates using GraphQL Code Generator in a Next.JS 13 application using Apollo as a GraphQL Client.
This covers usage of GraphQL operations in :
- Server side (React Server Components)
- Client components
- Client components (with Suspense)

You will find the TypeScript-based codegen configuration in [`codegen.ts`](./src/gql/codegen.config.ts).

This simple codegen configuration generates types and helpers in the [`src/gql/codegen`](./src/gql/codegen) folder that help you to get typed GraphQL Queries and Mutations seamlessly ⚡️

<br />

For detailed guide for setting up Apollo Client with NextJS 13 refer to : https://www.apollographql.com/blog/apollo-client/next-js/how-to-use-apollo-client-with-next-js-13

For a step-by-step implementation tutorial, please refer to the related guide:
https://www.the-guild.dev/graphql/codegen/docs/guides/react-vue-angular
