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

---

The `dev-test-apollo-tooling` is an example of migrating project from Apollo tooling to GrpahQL Codegen.

It attempts to generate the output as close as possible to Apollo tooling.

Note, this project is currently a WORK IN PROGRESS, requiring
a patch to `near-operation-file`.

How to run this project:

1. Make sure you have the correct `yarn` version installed (check root package.json, `packageManager` entry). Otherwise you migth have lots of unexplainable bugs.

2. In the monorepo root run:
   `yarn clean && yarn install && yarn build`

3. Patch the `near-operation-file` manually (automatic not always works), in the monrepo root run:
   `yarn postinstall`

4. Now go to the `dev-test-apollo-tooling` directory and run:

```
cd dev-test-apollo-tooling
yarn install
yarn start
```

The following will generate type files in `src/__generated__/*`.
