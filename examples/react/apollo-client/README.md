# Using GraphQL Code Generator with Apollo Client and React

This example illustrates how to use GraphQL Code Generator in a React application using the Apollo React GraphQL Client.

You will find the TypeScript-based codegen configuration in [`codegen.ts`](./codegen.ts).

This simple codegen configuration generates types and helpers in the [`src/gql`](./src/gql/) folder that help you to get typed GraphQL Queries and Mutations seamlessly ⚡️

<br />

For a step-by-step implementation tutorial, please refer to the related guide:

https://www.the-guild.dev/graphql/codegen/docs/guides/react-vue-angular

--

Please note that the `client` preset used in this example is compatible with `@apollo/client` (since `3.2.0`, not when using React Components (`<Query>`)).
