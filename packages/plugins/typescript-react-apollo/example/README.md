# React Apollo TypeScript Example Project

This project shows an example usage of `graphql-code-generator` and `graphql-code-generator-typescript-react-apollo-template` with a remote endpoint.

When you start the project by the `yarn start` or `npm start`, it scans the schema on the remote endpoint defined as an env variable in `generate-types` script on `package.json` file, and your definitions in `src`; and generates reusable Components and HOCs.

If you don't know which one you should use, please check the following docs to learn more about HOCs;
<https://reactjs.org/docs/higher-order-components.html>

## What's included

- Generated models -> `src/generated-models.tsx`
- Example with HOC
- Example with Component
