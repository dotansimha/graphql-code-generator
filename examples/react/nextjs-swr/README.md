# Using GraphQL Code Generator with SWR and React

This example illustrates using GraphQL Code Generator in a React application using SWR with `graphql-request` as a GraphQL Client.

You will find the TypeScript-based codegen configuration in [`codegen.ts`](./codegen.ts).

This simple codegen configuration generates types and helpers in the [`src/gql`](./src/gql/) folder that help you to get typed GraphQL Queries and Mutations seamlessly ⚡️

<br />

For a step-by-step implementation tutorial, please refer to the related guide:

https://www.the-guild.dev/graphql/codegen/docs/guides/react-vue-angular

--

Please note that the `client` preset used in this example is compatible with `graphql-request` from `5.0` as SWR fetcher.

For indications in writing your fetcher, [please refer to our documentation](https://www.the-guild.dev/graphql/codegen/docs/guides/react-vue-angular#appendix-i-react-query-with-a-custom-fetcher-setup).
