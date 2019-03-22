---
id: from-0-18
title: Migration to 1.0.0
---

## What has changed?

Our goals (and achievements) for 1.0.0 release was:

- Rename all package from `graphql-codegen-...` to scoped packages `@graphql-codegen/...`.
- Stablize the core package and the YML configuration file.
- Remove the old, depreacted code from this repostory (everything related to `flattenDocuments` and `buildSchemaContext`).
- Separate the CLI package from the core package, and create an easy-to-use and easy-to-consume core package.
- Add better support for running the codegen in non-node environments, by clearing unused dependencies and add support for tree shaking.
- Remove the dependency for Handlebars from this repository.
- Introcude a new, easy-to-use common base for plugins, based on `Visitor` pattern, that uses `visit` from `graphql` package.
- Better unit tests for all plugins packages, by use TypeScript compiler to compile each test result- makes it much easier to detect mismatches and invalid output.
- Refactor the entire TypeScript plugin, and create better and optimized output.
- Fix most of the GitHub issues.
- Update website and documentation for all plugins.

### New TypeScript Libraries

During the refactor, we rewrote all TypeScript-related plugins. By doing that, we introducted some breaking changes.

Before those changes, you had to depend on `typescript-common` plugin, and add `typescript-server` and `typescript-client` (and others) on top of it.

Now, `typescript` plugin is the plugin you need to use for backend (it combines `typescript-common` and `typescript-server`), and use `typescript-operations` on top of it for the client-side.

The reason for this change is the fact that now `typescript-operations` uses `Pick<>` to create the client-side types, instead of generating tons of `namepsace`s and `interface`s.

## How to migrate?

First, the new packages have a different name, that means that you need to manually update those packages names, and not just it's version.

The `graphql-code-generator` package is now `@graphql-codegen/cli` and all other packages has been changes from `graphql-codegen-...` to `@graphql-codegen/...`.

So start by updating your `package.json`:

**Before:**

```json
{
  "devDependencies": {
    "graphql-code-generator": "0.18.0",
    "graphql-codegen-typescript-common": "0.18.0",
    "graphql-codegen-typescript": "0.18.0",
    "graphql-codegen-typescript-documents": "0.18.0"
  }
}
```

**After:**

```json
{
  "devDependencies": {
    "@graphql-codegen/cli": "^1.0.0",
    "@graphql-codegen/typescript": "^1.0.0",
    "@graphql-codegen/typescript-operations": "^1.0.0"
  }
}
```

Also, make sure to update your YML config file:

**Before**:

```yml
./my-file.ts:
  schema: schema.json
  plugins:
    - typescript-common
    - typescript-server
```

**After:**

```yml
./my-file.ts:
  schema: schema.json
  plugins:
    - typescript
```

And for client-side:

**Before**:

```yml
./my-file.ts:
  schema: schema.json
  plugins:
    - typescript-common
    - typescript-client
```

**After:**

```yml
./my-file.ts:
  schema: schema.json
  plugins:
    - typescript
    - typescript-operations
```

## Breaking Changes & Semver

We tried to avoid breaking changes, but it's not always possible. We had a lot of issues we couldn't fix before because we didn't want to introduce breaking changes.

It was very hard for us to track breaking changes in the past, but it it's easier for us, and we promise to be semver-compatiable.

You can find a list of all breaking changes in [GitHub Releases page](https://github.com/dotansimha/graphql-code-generator/releases/).
