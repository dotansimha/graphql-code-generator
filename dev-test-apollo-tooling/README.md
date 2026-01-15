The `dev-test-apollo-tooling` project is an example of migrating from Apollo tooling to GraphQL Codegen. It attempts to generate output as close as possible to Apollo tooling’s output. Note: **this project is a work in progress** and currently requires a patch to `near-operation-file`. We will fix this package soon.

How to run this project:

1. Make sure you have the correct Yarn version installed (check the root package.json, `packageManager` entry). Otherwise, you might run into unexplained bugs.
2. In the monorepo root, run:

yarn clean && yarn install && yarn build`

3. Patch `near-operation-file` manually (the automatic patch doesn’t always work). In the monorepo root, run:

yarn postinstall

4. Go to the `dev-test-apollo-tooling` directory and run:

cd dev-test-apollo-tooling
yarn install
yarn start

This will generate type files in `dev-test-apollo-tooling/src/__generated__/*`.
