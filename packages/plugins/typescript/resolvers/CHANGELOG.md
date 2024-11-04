# @graphql-codegen/typescript-resolvers

## 4.4.0

### Minor Changes

- [#9989](https://github.com/dotansimha/graphql-code-generator/pull/9989) [`55a1e9e`](https://github.com/dotansimha/graphql-code-generator/commit/55a1e9e63830df17ed40602ea7e322bbf48b17bc) Thanks [@eddeee888](https://github.com/eddeee888)! - Add `generateInternalResolversIfNeeded` option

  This option can be used to generate more correct types for internal resolvers. For example, only generate `__resolveReference` if the federation object has a resolvable `@key`.

  In the future, this option can be extended to support other internal resolvers e.g. `__isTypeOf` is only generated for implementing types and union members.

- [#10141](https://github.com/dotansimha/graphql-code-generator/pull/10141) [`a235051`](https://github.com/dotansimha/graphql-code-generator/commit/a23505180ac2f275a55ece27162ec9bfcdc52e03) Thanks [@eddeee888](https://github.com/eddeee888)! - Add avoidCheckingAbstractTypesRecursively to avoid checking and generating abstract types recursively

  For users that already sets recursive default mappers e.g. `Partial<{T}>` or `DeepPartial<{T}>`, having both options on will cause a nested loop which eventually crashes Codegen. In such case, setting `avoidCheckingAbstractTypesRecursively: true` allows users to continue to use recursive default mappers as before.

### Patch Changes

- Updated dependencies [[`55a1e9e`](https://github.com/dotansimha/graphql-code-generator/commit/55a1e9e63830df17ed40602ea7e322bbf48b17bc), [`a235051`](https://github.com/dotansimha/graphql-code-generator/commit/a23505180ac2f275a55ece27162ec9bfcdc52e03)]:
  - @graphql-codegen/visitor-plugin-common@5.5.0
  - @graphql-codegen/plugin-helpers@5.1.0
  - @graphql-codegen/typescript@4.1.1

## 4.3.0

### Minor Changes

- [#10077](https://github.com/dotansimha/graphql-code-generator/pull/10077) [`3f4f546`](https://github.com/dotansimha/graphql-code-generator/commit/3f4f5466ff168ad822b9a00d83d3779078e6d8c4) Thanks [@eddeee888](https://github.com/eddeee888)! - Extend `config.avoidOptions` to support query, mutation and subscription

  Previously, `config.avoidOptions.resolvers` was being used to make query, mutation and subscription fields non-optional.
  Now, `config.avoidOptions.query`, `config.avoidOptions.mutation` and `config.avoidOptions.subscription` can be used to target the respective types.

### Patch Changes

- Updated dependencies [[`3f4f546`](https://github.com/dotansimha/graphql-code-generator/commit/3f4f5466ff168ad822b9a00d83d3779078e6d8c4)]:
  - @graphql-codegen/visitor-plugin-common@5.4.0
  - @graphql-codegen/typescript@4.1.0

## 4.2.1

### Patch Changes

- [#10014](https://github.com/dotansimha/graphql-code-generator/pull/10014) [`79fee3c`](https://github.com/dotansimha/graphql-code-generator/commit/79fee3cada20d683d250aad5aa5fef9d6ed9f4d2) Thanks [@eddeee888](https://github.com/eddeee888)! - Fix object types with fields being abstract types not pointing to resolver types correctly

- Updated dependencies [[`79fee3c`](https://github.com/dotansimha/graphql-code-generator/commit/79fee3cada20d683d250aad5aa5fef9d6ed9f4d2)]:
  - @graphql-codegen/visitor-plugin-common@5.3.1
  - @graphql-codegen/typescript@4.0.9

## 4.2.0

### Minor Changes

- [#10007](https://github.com/dotansimha/graphql-code-generator/pull/10007) [`808ada5`](https://github.com/dotansimha/graphql-code-generator/commit/808ada595d83d39cad045da5824cac6378e9eca3) Thanks [@eddeee888](https://github.com/eddeee888)! - Add generated resolvers map type name to typescript-resolvers plugin meta

### Patch Changes

- Updated dependencies [[`808ada5`](https://github.com/dotansimha/graphql-code-generator/commit/808ada595d83d39cad045da5824cac6378e9eca3), [`14ce39e`](https://github.com/dotansimha/graphql-code-generator/commit/14ce39e41dfee38c652be736664177fa2b1df421)]:
  - @graphql-codegen/visitor-plugin-common@5.3.0
  - @graphql-codegen/typescript@4.0.8

## 4.1.0

### Minor Changes

- [#9961](https://github.com/dotansimha/graphql-code-generator/pull/9961) [`dfc5310`](https://github.com/dotansimha/graphql-code-generator/commit/dfc5310ab476bed6deaefc608f311ff368722f7e) Thanks [@eddeee888](https://github.com/eddeee888)! - Update typescript-resolvers to report generated resolver types in the run to meta field in the output

### Patch Changes

- [#9944](https://github.com/dotansimha/graphql-code-generator/pull/9944) [`156cc2b`](https://github.com/dotansimha/graphql-code-generator/commit/156cc2b9a2a5129beba121cfa987b04e29899431) Thanks [@eddeee888](https://github.com/eddeee888)! - Add \_ prefix to generated `RefType` in `ResolversInterfaceTypes` and `ResolversUnionTypes` as it is sometimes unused

- [#9962](https://github.com/dotansimha/graphql-code-generator/pull/9962) [`b49457b`](https://github.com/dotansimha/graphql-code-generator/commit/b49457b5f29328d2dc23c642788a2e697cb8966e) Thanks [@eddeee888](https://github.com/eddeee888)! - Fix interface mappers not working in nested/self-referencing scenarios

- Updated dependencies [[`dfc5310`](https://github.com/dotansimha/graphql-code-generator/commit/dfc5310ab476bed6deaefc608f311ff368722f7e), [`156cc2b`](https://github.com/dotansimha/graphql-code-generator/commit/156cc2b9a2a5129beba121cfa987b04e29899431), [`dfc5310`](https://github.com/dotansimha/graphql-code-generator/commit/dfc5310ab476bed6deaefc608f311ff368722f7e), [`b49457b`](https://github.com/dotansimha/graphql-code-generator/commit/b49457b5f29328d2dc23c642788a2e697cb8966e)]:
  - @graphql-codegen/plugin-helpers@5.0.4
  - @graphql-codegen/visitor-plugin-common@5.2.0
  - @graphql-codegen/typescript@4.0.7

## 4.0.6

### Patch Changes

- Updated dependencies [[`920b443`](https://github.com/dotansimha/graphql-code-generator/commit/920b443a401b8cc4811f64ec5b25fc7b4ae32b53), [`ed9c205`](https://github.com/dotansimha/graphql-code-generator/commit/ed9c205d15d7f14ed73e54aecf40e4fad5664e9d)]:
  - @graphql-codegen/visitor-plugin-common@5.1.0
  - @graphql-codegen/typescript@4.0.6

## 4.0.5

### Patch Changes

- Updated dependencies [[`53f270a`](https://github.com/dotansimha/graphql-code-generator/commit/53f270acfa1da992e0f9d2e50921bb588392f8a5)]:
  - @graphql-codegen/visitor-plugin-common@5.0.0
  - @graphql-codegen/typescript@4.0.5

## 4.0.4

### Patch Changes

- [#9813](https://github.com/dotansimha/graphql-code-generator/pull/9813) [`4e69568`](https://github.com/dotansimha/graphql-code-generator/commit/4e6956899c96f8954cea8d5bbe32aa35a70cc653) Thanks [@saihaj](https://github.com/saihaj)! - bumping for a release

- Updated dependencies [[`4e69568`](https://github.com/dotansimha/graphql-code-generator/commit/4e6956899c96f8954cea8d5bbe32aa35a70cc653)]:
  - @graphql-codegen/visitor-plugin-common@4.1.2
  - @graphql-codegen/typescript@4.0.4
  - @graphql-codegen/plugin-helpers@5.0.3

## 4.0.3

### Patch Changes

- [#9673](https://github.com/dotansimha/graphql-code-generator/pull/9673) [`7718a8113`](https://github.com/dotansimha/graphql-code-generator/commit/7718a8113dc6282475cb738f1e28698b8221fa2f) Thanks [@maclockard](https://github.com/maclockard)! - Respect avoidOptionals when all arguments are optional

- Updated dependencies [[`7718a8113`](https://github.com/dotansimha/graphql-code-generator/commit/7718a8113dc6282475cb738f1e28698b8221fa2f)]:
  - @graphql-codegen/visitor-plugin-common@4.1.1
  - @graphql-codegen/typescript@4.0.3

## 4.0.2

### Patch Changes

- [#9811](https://github.com/dotansimha/graphql-code-generator/pull/9811) [`d8364e045`](https://github.com/dotansimha/graphql-code-generator/commit/d8364e045a46ca6e8173583b5108d161c6832975) Thanks [@saihaj](https://github.com/saihaj)! - dependencies updates:
  - Updated dependency [`tslib@~2.6.0` ↗︎](https://www.npmjs.com/package/tslib/v/2.6.0) (from `~2.5.0`, in `dependencies`)
- Updated dependencies [[`d8364e045`](https://github.com/dotansimha/graphql-code-generator/commit/d8364e045a46ca6e8173583b5108d161c6832975), [`d8364e045`](https://github.com/dotansimha/graphql-code-generator/commit/d8364e045a46ca6e8173583b5108d161c6832975), [`d8364e045`](https://github.com/dotansimha/graphql-code-generator/commit/d8364e045a46ca6e8173583b5108d161c6832975), [`d8364e045`](https://github.com/dotansimha/graphql-code-generator/commit/d8364e045a46ca6e8173583b5108d161c6832975), [`d8364e045`](https://github.com/dotansimha/graphql-code-generator/commit/d8364e045a46ca6e8173583b5108d161c6832975)]:
  - @graphql-codegen/plugin-helpers@5.0.2
  - @graphql-codegen/typescript@4.0.2
  - @graphql-codegen/visitor-plugin-common@4.1.0

## 4.0.1

### Patch Changes

- [#9497](https://github.com/dotansimha/graphql-code-generator/pull/9497) [`2276708d0`](https://github.com/dotansimha/graphql-code-generator/commit/2276708d0ea2aab4942136923651226de4aabe5a) Thanks [@eddeee888](https://github.com/eddeee888)! - Revert default ID scalar input type to string

  We changed the ID Scalar input type from `string` to `string | number` in the latest major version of `typescript` plugin. This causes issues for server plugins (e.g. typescript-resolvers) that depends on `typescript` plugin. This is because the scalar type needs to be manually inverted on setup which is confusing.

- Updated dependencies [[`2276708d0`](https://github.com/dotansimha/graphql-code-generator/commit/2276708d0ea2aab4942136923651226de4aabe5a)]:
  - @graphql-codegen/visitor-plugin-common@4.0.1
  - @graphql-codegen/typescript@4.0.1

## 4.0.0

### Major Changes

- [#9375](https://github.com/dotansimha/graphql-code-generator/pull/9375) [`ba84a3a27`](https://github.com/dotansimha/graphql-code-generator/commit/ba84a3a2758d94dac27fcfbb1bafdf3ed7c32929) Thanks [@eddeee888](https://github.com/eddeee888)! - Implement Scalars with input/output types

  In GraphQL, Scalar types can be different for client and server. For example, given the native GraphQL ID:

  - A client may send `string` or `number` in the input
  - A client receives `string` in its selection set (i.e output)
  - A server receives `string` in the resolver (GraphQL parses `string` or `number` received from the client to `string`)
  - A server may return `string` or `number` (GraphQL serializes the value to `string` before sending it to the client )

  Currently, we represent every Scalar with only one type. This is what codegen generates as base type:

  ```ts
  export type Scalars = {
    ID: string
  }
  ```

  Then, this is used in both input and output type e.g.

  ```ts
  export type Book = {
    __typename?: 'Book'
    id: Scalars['ID'] // Output's ID can be `string` 👍
  }

  export type QueryBookArgs = {
    id: Scalars['ID'] // Input's ID can be `string` or `number`. However, the type is only `string` here 👎
  }
  ```

  This PR extends each Scalar to have input and output:

  ```ts
  export type Scalars = {
    ID: {
      input: string | number
      output: string
    }
  }
  ```

  Then, each input/output GraphQL type can correctly refer to the correct input/output scalar type:

  ```ts
  export type Book = {
    __typename?: 'Book'
    id: Scalars['ID']['output'] // Output's ID can be `string` 👍
  }

  export type QueryBookArgs = {
    id: Scalars['ID']['input'] // Input's ID can be `string` or `number` 👍
  }
  ```

  Note that for `typescript-resolvers`, the type of ID needs to be inverted. However, the referenced types in GraphQL input/output types should still work correctly:

  ```ts
  export type Scalars = {
    ID: {
      input: string;
      output: string | number;
    }
  }

  export type Book = {
    __typename?: "Book";
    id: Scalars["ID"]['output']; // Resolvers can return `string` or `number` in ID fields 👍
  };

  export type QueryBookArgs = {
    id: Scalars["ID"]['input']; // Resolvers receive `string` in ID fields 👍
  };

  export type ResolversTypes = {
    ID: ID: ResolverTypeWrapper<Scalars['ID']['output']>; // Resolvers can return `string` or `number` in ID fields 👍
  }

  export type ResolversParentTypes = {
    ID: Scalars['ID']['output']; // Resolvers receive `string` or `number` from parents 👍
  };
  ```

  ***

  Config changes:

  1. Scalars option can now take input/output types:

  ```ts
  config: {
    scalars: {
      ID: {
        input: 'string',
        output: 'string | number'
      }
    }
  }
  ```

  2. If a string is given (instead of an object with input/output fields), it will be used as both input and output types:

  ```ts
  config: {
    scalars: {
      ID: 'string' // This means `string` will be used for both ID's input and output types
    }
  }
  ```

  3. BREAKING CHANGE: External module Scalar types need to be an object with input/output fields

  ```ts
  config: {
    scalars: {
      ID: './path/to/scalar-module'
    }
  }
  ```

  If correctly, wired up, the following will be generated:

  ```ts
  // Previously, imported `ID` type can be a primitive type, now it must be an object with input/output fields
  import { ID } from './path/to/scalar-module'

  export type Scalars = {
    ID: { input: ID['input']; output: ID['output'] }
  }
  ```

  ***

  BREAKING CHANGE: This changes Scalar types which could be referenced in other plugins. If you are a plugin maintainer and reference Scalar, please update your plugin to use the correct input/output types.

- [`bb66c2a31`](https://github.com/dotansimha/graphql-code-generator/commit/bb66c2a31985c1375912ccd6b2b02933f313c9c0) Thanks [@n1ru4l](https://github.com/n1ru4l)! - Require Node.js `>= 16`. Drop support for Node.js 14

### Minor Changes

- [#9196](https://github.com/dotansimha/graphql-code-generator/pull/9196) [`3848a2b73`](https://github.com/dotansimha/graphql-code-generator/commit/3848a2b73339fe9f474b31647b71e75b9ca52a96) Thanks [@beerose](https://github.com/beerose)! - Add `@defer` directive support

  When a query includes a deferred fragment field, the server will return a partial response with the non-deferred fields first, followed by the remaining fields once they have been resolved.

  Once start using the `@defer` directive in your queries, the generated code will automatically include support for the directive.

  ```jsx
  // src/index.tsx
  import { graphql } from './gql'
  const OrdersFragment = graphql(`
    fragment OrdersFragment on User {
      orders {
        id
        total
      }
    }
  `)
  const GetUserQuery = graphql(`
    query GetUser($id: ID!) {
      user(id: $id) {
        id
        name
        ...OrdersFragment @defer
      }
    }
  `)
  ```

  The generated type for `GetUserQuery` will have information that the fragment is _incremental,_ meaning it may not be available right away.

  ```tsx
  // gql/graphql.ts
  export type GetUserQuery = { __typename?: 'Query'; id: string; name: string } & ({
    __typename?: 'Query'
  } & {
    ' $fragmentRefs'?: { OrdersFragment: Incremental<OrdersFragment> }
  })
  ```

  Apart from generating code that includes support for the `@defer` directive, the Codegen also exports a utility function called `isFragmentReady`. You can use it to conditionally render components based on whether the data for a deferred
  fragment is available:

  ```jsx
  const OrdersList = (props: { data: FragmentType<typeof OrdersFragment> }) => {
    const data = useFragment(OrdersFragment, props.data);
    return (
      // render orders list
    )
  };

  function App() {
    const { data } = useQuery(GetUserQuery);
    return (
      {data && (
        <>
          {isFragmentReady(GetUserQuery, OrdersFragment, data)
  					&& <OrdersList data={data} />}
        </>
      )}
    );
  }
  export default App;
  ```

- [#9339](https://github.com/dotansimha/graphql-code-generator/pull/9339) [`50471e651`](https://github.com/dotansimha/graphql-code-generator/commit/50471e6514557db827cd26157262401c6c600a8c) Thanks [@AaronMoat](https://github.com/AaronMoat)! - Add excludeTypes config to resolversNonOptionalTypename

  This disables the adding of `__typename` in resolver types for any specified typename. This could be useful e.g. if you're wanting to enable this for all new types going forward but not do a big migration.

  Usage example:

  ```typescript
  const config: CodegenConfig = {
    schema: 'src/schema/**/*.graphql',
    generates: {
      'src/schema/types.ts': {
        plugins: ['typescript', 'typescript-resolvers'],
        config: {
          resolversNonOptionalTypename: {
            unionMember: true,
            excludeTypes: ['MyType']
          }
        }
      }
    }
  }
  ```

- [#9229](https://github.com/dotansimha/graphql-code-generator/pull/9229) [`5aa95aa96`](https://github.com/dotansimha/graphql-code-generator/commit/5aa95aa969993043ba5e9d5dabebd7127ea5e22c) Thanks [@eddeee888](https://github.com/eddeee888)! - Use generic to simplify ResolversUnionTypes

  This follows the `ResolversInterfaceTypes`'s approach where the `RefType` generic is used to refer back to `ResolversTypes` or `ResolversParentTypes` in cases of nested Union types

- [#9304](https://github.com/dotansimha/graphql-code-generator/pull/9304) [`e1dc75f3c`](https://github.com/dotansimha/graphql-code-generator/commit/e1dc75f3c598bf7f83138ca533619716fc73f823) Thanks [@esfomeado](https://github.com/esfomeado)! - Added support for disabling suffixes on Enums.

- [#9229](https://github.com/dotansimha/graphql-code-generator/pull/9229) [`5aa95aa96`](https://github.com/dotansimha/graphql-code-generator/commit/5aa95aa969993043ba5e9d5dabebd7127ea5e22c) Thanks [@eddeee888](https://github.com/eddeee888)! - Extract interfaces to ResolversInterfaceTypes and add to resolversNonOptionalTypename

  1. `ResolversInterfaceTypes` is a new type that keeps track of a GraphQL interface and its implementing types.

  For example, consider this schema:

  ```graphql
  extend type Query {
    character(id: ID!): CharacterNode
  }

  interface CharacterNode {
    id: ID!
  }

  type Wizard implements CharacterNode {
    id: ID!
    screenName: String!
    spells: [String!]!
  }

  type Fighter implements CharacterNode {
    id: ID!
    screenName: String!
    powerLevel: Int!
  }
  ```

  The generated types will look like this:

  ```ts
  export type ResolversInterfaceTypes<RefType extends Record<string, unknown>> = {
    CharacterNode: Fighter | Wizard
  }

  export type ResolversTypes = {
    // other types...
    CharacterNode: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['CharacterNode']>
    Fighter: ResolverTypeWrapper<Fighter>
    Wizard: ResolverTypeWrapper<Wizard>
    // other types...
  }

  export type ResolversParentTypes = {
    // other types...
    CharacterNode: ResolversInterfaceTypes<ResolversParentTypes>['CharacterNode']
    Fighter: Fighter
    Wizard: Wizard
    // other types...
  }
  ```

  The `RefType` generic is used to reference back to `ResolversTypes` and `ResolversParentTypes` in some cases such as field returning a Union.

  2. `resolversNonOptionalTypename` also affects `ResolversInterfaceTypes`

  Using the schema above, if we use `resolversNonOptionalTypename` option:

  ```typescript
  const config: CodegenConfig = {
    schema: 'src/schema/**/*.graphql',
    generates: {
      'src/schema/types.ts': {
        plugins: ['typescript', 'typescript-resolvers'],
        config: {
          resolversNonOptionalTypename: true // Or `resolversNonOptionalTypename: { interfaceImplementingType: true }`
        }
      }
    }
  }
  ```

  Then, the generated type looks like this:

  ```ts
  export type ResolversInterfaceTypes<RefType extends Record<string, unknown>> = {
    CharacterNode: (Fighter & { __typename: 'Fighter' }) | (Wizard & { __typename: 'Wizard' })
  }

  export type ResolversTypes = {
    // other types...
    CharacterNode: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['CharacterNode']>
    Fighter: ResolverTypeWrapper<Fighter>
    Wizard: ResolverTypeWrapper<Wizard>
    // other types...
  }

  export type ResolversParentTypes = {
    // other types...
    CharacterNode: ResolversInterfaceTypes<ResolversParentTypes>['CharacterNode']
    Fighter: Fighter
    Wizard: Wizard
    // other types...
  }
  ```

### Patch Changes

- [#9449](https://github.com/dotansimha/graphql-code-generator/pull/9449) [`4d9ea1a5a`](https://github.com/dotansimha/graphql-code-generator/commit/4d9ea1a5a94cd3458c1bd868ce1ab1cb806257f2) Thanks [@n1ru4l](https://github.com/n1ru4l)! - dependencies updates:
  - Updated dependency [`@graphql-tools/utils@^10.0.0` ↗︎](https://www.npmjs.com/package/@graphql-tools/utils/v/10.0.0) (from `^9.0.0`, in `dependencies`)
- Updated dependencies [[`4d9ea1a5a`](https://github.com/dotansimha/graphql-code-generator/commit/4d9ea1a5a94cd3458c1bd868ce1ab1cb806257f2), [`4d9ea1a5a`](https://github.com/dotansimha/graphql-code-generator/commit/4d9ea1a5a94cd3458c1bd868ce1ab1cb806257f2), [`f46803a8c`](https://github.com/dotansimha/graphql-code-generator/commit/f46803a8c70840280529a52acbb111c865712af2), [`3848a2b73`](https://github.com/dotansimha/graphql-code-generator/commit/3848a2b73339fe9f474b31647b71e75b9ca52a96), [`ba84a3a27`](https://github.com/dotansimha/graphql-code-generator/commit/ba84a3a2758d94dac27fcfbb1bafdf3ed7c32929), [`63827fabe`](https://github.com/dotansimha/graphql-code-generator/commit/63827fabede76b2380d40392aba2a3ccb099f0c4), [`50471e651`](https://github.com/dotansimha/graphql-code-generator/commit/50471e6514557db827cd26157262401c6c600a8c), [`5aa95aa96`](https://github.com/dotansimha/graphql-code-generator/commit/5aa95aa969993043ba5e9d5dabebd7127ea5e22c), [`ca02ad172`](https://github.com/dotansimha/graphql-code-generator/commit/ca02ad172a0e8f52570fdef4271ec286d883236d), [`e1dc75f3c`](https://github.com/dotansimha/graphql-code-generator/commit/e1dc75f3c598bf7f83138ca533619716fc73f823), [`bb66c2a31`](https://github.com/dotansimha/graphql-code-generator/commit/bb66c2a31985c1375912ccd6b2b02933f313c9c0), [`5950f5a68`](https://github.com/dotansimha/graphql-code-generator/commit/5950f5a6843cdd92b9d5b8ced3a97b68eadf9f30), [`5aa95aa96`](https://github.com/dotansimha/graphql-code-generator/commit/5aa95aa969993043ba5e9d5dabebd7127ea5e22c)]:
  - @graphql-codegen/plugin-helpers@5.0.0
  - @graphql-codegen/visitor-plugin-common@4.0.0
  - @graphql-codegen/typescript@4.0.0

## 3.2.1

### Patch Changes

- [#9231](https://github.com/dotansimha/graphql-code-generator/pull/9231) [`402cb8ac0`](https://github.com/dotansimha/graphql-code-generator/commit/402cb8ac0f0c347b186d295c4b69c19e25a65d00) Thanks [@eddeee888](https://github.com/eddeee888)! - Implement resolversNonOptionalTypename for mapper cases

- Updated dependencies [[`386cf9044`](https://github.com/dotansimha/graphql-code-generator/commit/386cf9044a41d87ed45069b22d26b30f4b262a85), [`402cb8ac0`](https://github.com/dotansimha/graphql-code-generator/commit/402cb8ac0f0c347b186d295c4b69c19e25a65d00)]:
  - @graphql-codegen/visitor-plugin-common@3.1.1
  - @graphql-codegen/typescript@3.0.4

## 3.2.0

### Minor Changes

- [#9146](https://github.com/dotansimha/graphql-code-generator/pull/9146) [`9f4d9c5a4`](https://github.com/dotansimha/graphql-code-generator/commit/9f4d9c5a479d34da25df8e060a8c2b3b162647dd) Thanks [@eddeee888](https://github.com/eddeee888)! - [typescript-resolvers] Add `resolversNonOptionalTypename` config option.

  This is extending on `ResolversUnionTypes` implemented in https://github.com/dotansimha/graphql-code-generator/pull/9069

  `resolversNonOptionalTypename` adds non-optional `__typename` to union members of `ResolversUnionTypes`, without affecting the union members' base intefaces.

  A common use case for non-optional `__typename` of union members is using it as the common field to work out the final schema type. This makes implementing the union's `__resolveType` very simple as we can use `__typename` to decide which union member the resolved object is. Without this, we have to check the existence of field/s on the incoming object which could be verbose.

  For example, consider this schema:

  ```graphql
  type Query {
    book(id: ID!): BookPayload!
  }

  type Book {
    id: ID!
    isbn: String!
  }

  type BookResult {
    node: Book
  }

  type PayloadError {
    message: String!
  }

  union BookPayload = BookResult | PayloadError
  ```

  _With optional `__typename`:_ We need to check existence of certain fields to resolve type in the union resolver:

  ```ts
  // Query/book.ts
  export const book = async () => {
    try {
      const book = await fetchBook()
      // 1. No `__typename` in resolver results...
      return {
        node: book
      }
    } catch (e) {
      return {
        message: 'Failed to fetch book'
      }
    }
  }

  // BookPayload.ts
  export const BookPayload = {
    __resolveType: parent => {
      // 2. ... means more checks in `__resolveType`
      if ('message' in parent) {
        return 'PayloadError'
      }
      return 'BookResult'
    }
  }
  ```

  _With non-optional `__typename`:_ Resolvers declare the type. This which gives us better TypeScript support in resolvers and simplify `__resolveType` implementation:

  ```ts
  // Query/book.ts
  export const book = async () => {
    try {
      const book = await fetchBook()
      // 1. `__typename` is declared in resolver results...
      return {
        __typename: 'BookResult', // 1a. this also types `node` for us 🎉
        node: book
      }
    } catch (e) {
      return {
        __typename: 'PayloadError',
        message: 'Failed to fetch book'
      }
    }
  }

  // BookPayload.ts
  export const BookPayload = {
    __resolveType: parent => parent.__typename // 2. ... means a very simple check in `__resolveType`
  }
  ```

  _Using `resolversNonOptionalTypename`:_ add it into `typescript-resolvers` plugin config:

  ```ts
  // codegen.ts
  const config: CodegenConfig = {
    schema: 'src/schema/**/*.graphql',
    generates: {
      'src/schema/types.ts': {
        plugins: ['typescript', 'typescript-resolvers'],
        config: {
          resolversNonOptionalTypename: true // Or `resolversNonOptionalTypename: { unionMember: true }`
        }
      }
    }
  }
  ```

### Patch Changes

- [#9206](https://github.com/dotansimha/graphql-code-generator/pull/9206) [`e56790104`](https://github.com/dotansimha/graphql-code-generator/commit/e56790104ae56d6c5b48ef71823345bd09d3b835) Thanks [@eddeee888](https://github.com/eddeee888)! - Fix `ResolversUnionTypes` being used in `ResolversParentTypes`

  Previously, objects with mappable fields are converted to Omit format that references its own type group or `ResolversTypes` or `ResolversParentTypes` e.g.

  ```ts
  export type ResolversTypes = {
    Book: ResolverTypeWrapper<BookMapper>
    BookPayload: ResolversTypes['BookResult'] | ResolversTypes['StandardError']
    // Note: `result` on the next line references `ResolversTypes["Book"]`
    BookResult: ResolverTypeWrapper<Omit<BookResult, 'result'> & { result?: Maybe<ResolversTypes['Book']> }>
    StandardError: ResolverTypeWrapper<StandardError>
  }

  export type ResolversParentTypes = {
    Book: BookMapper
    BookPayload: ResolversParentTypes['BookResult'] | ResolversParentTypes['StandardError']
    // Note: `result` on the next line references `ResolversParentTypes["Book"]`
    BookResult: Omit<BookResult, 'result'> & { result?: Maybe<ResolversParentTypes['Book']> }
    StandardError: StandardError
  }
  ```

  In https://github.com/dotansimha/graphql-code-generator/pull/9069, we extracted resolver union types to its own group:

  ```ts
  export type ResolversUnionTypes = {
    // Note: `result` on the next line references `ResolversTypes["Book"]` which is only correct for the `ResolversTypes` case
    BookPayload: (Omit<BookResult, 'result'> & { result?: Maybe<ResolversTypes['Book']> }) | StandardError
  }

  export type ResolversTypes = {
    Book: ResolverTypeWrapper<BookMapper>
    BookPayload: ResolverTypeWrapper<ResolversUnionTypes['BookPayload']>
    BookResult: ResolverTypeWrapper<Omit<BookResult, 'result'> & { result?: Maybe<ResolversTypes['Book']> }>
    StandardError: ResolverTypeWrapper<StandardError>
  }

  export type ResolversParentTypes = {
    Book: BookMapper
    BookPayload: ResolversUnionTypes['BookPayload']
    BookResult: Omit<BookResult, 'result'> & { result?: Maybe<ResolversParentTypes['Book']> }
    StandardError: StandardError
  }
  ```

  This change creates an extra `ResolversUnionParentTypes` that is referenced by `ResolversParentTypes` to ensure backwards compatibility:

  ```ts
  export type ResolversUnionTypes = {
    BookPayload: (Omit<BookResult, 'result'> & { result?: Maybe<ResolversParentTypes['Book']> }) | StandardError
  }

  // ... and the reference is changed in ResolversParentTypes:
  export type ResolversParentTypes = {
    // ... other fields
    BookPayload: ResolversUnionParentTypes['BookPayload']
  }
  ```

- [`f104619ac`](https://github.com/dotansimha/graphql-code-generator/commit/f104619acd27c9d62a06bc577737500880731087) Thanks [@saihaj](https://github.com/saihaj)! - Resolve issue with nesting fields in `@provides` directive being prevented

- Updated dependencies [[`e56790104`](https://github.com/dotansimha/graphql-code-generator/commit/e56790104ae56d6c5b48ef71823345bd09d3b835), [`b7dacb21f`](https://github.com/dotansimha/graphql-code-generator/commit/b7dacb21fb0ed1173d1e45120dc072e29231ed29), [`f104619ac`](https://github.com/dotansimha/graphql-code-generator/commit/f104619acd27c9d62a06bc577737500880731087), [`92d86b009`](https://github.com/dotansimha/graphql-code-generator/commit/92d86b009579edf70f60b0b8e28658af93ff9fd1), [`acb647e4e`](https://github.com/dotansimha/graphql-code-generator/commit/acb647e4efbddecf732b6e55dc47ac40c9bdaf08), [`9f4d9c5a4`](https://github.com/dotansimha/graphql-code-generator/commit/9f4d9c5a479d34da25df8e060a8c2b3b162647dd)]:
  - @graphql-codegen/visitor-plugin-common@3.1.0
  - @graphql-codegen/plugin-helpers@4.2.0
  - @graphql-codegen/typescript@3.0.3

## 3.1.1

### Patch Changes

- [#9110](https://github.com/dotansimha/graphql-code-generator/pull/9110) [`ba0610bbd`](https://github.com/dotansimha/graphql-code-generator/commit/ba0610bbd4578d8a82078014766f56d8ae5fcf7a) Thanks [@gilgardosh](https://github.com/gilgardosh)! - Custom mappers with placeholder will apply omit

- [#9069](https://github.com/dotansimha/graphql-code-generator/pull/9069) [`4b49f6fbe`](https://github.com/dotansimha/graphql-code-generator/commit/4b49f6fbed802907b460bfb7b6e9a85f88c555bc) Thanks [@eddeee888](https://github.com/eddeee888)! - Extract union types to ResolversUnionTypes

- Updated dependencies [[`ba0610bbd`](https://github.com/dotansimha/graphql-code-generator/commit/ba0610bbd4578d8a82078014766f56d8ae5fcf7a), [`4b49f6fbe`](https://github.com/dotansimha/graphql-code-generator/commit/4b49f6fbed802907b460bfb7b6e9a85f88c555bc), [`b343626c9`](https://github.com/dotansimha/graphql-code-generator/commit/b343626c978b9ee0f14e314cea6c01ae3dad057c)]:
  - @graphql-codegen/visitor-plugin-common@3.0.2
  - @graphql-codegen/typescript@3.0.2

## 3.1.0

### Minor Changes

- [#8853](https://github.com/dotansimha/graphql-code-generator/pull/8853) [`b13aa7449`](https://github.com/dotansimha/graphql-code-generator/commit/b13aa7449637eaf28976ea7e31730b0290609919) Thanks [@KGAdamCook](https://github.com/KGAdamCook)! - Updated customResolveInfo to use the correct importType for external imports

### Patch Changes

- [#8879](https://github.com/dotansimha/graphql-code-generator/pull/8879) [`8206b268d`](https://github.com/dotansimha/graphql-code-generator/commit/8206b268dfb485a748fd7783a163cb0ee9931491) Thanks [@renovate](https://github.com/apps/renovate)! - dependencies updates:
  - Updated dependency [`tslib@~2.5.0` ↗︎](https://www.npmjs.com/package/tslib/v/2.5.0) (from `~2.4.0`, in `dependencies`)
- Updated dependencies [[`8206b268d`](https://github.com/dotansimha/graphql-code-generator/commit/8206b268dfb485a748fd7783a163cb0ee9931491), [`8206b268d`](https://github.com/dotansimha/graphql-code-generator/commit/8206b268dfb485a748fd7783a163cb0ee9931491), [`8206b268d`](https://github.com/dotansimha/graphql-code-generator/commit/8206b268dfb485a748fd7783a163cb0ee9931491), [`a118c307a`](https://github.com/dotansimha/graphql-code-generator/commit/a118c307a35bbb97b7cbca0f178a88276032a26c), [`6b6fe3cbc`](https://github.com/dotansimha/graphql-code-generator/commit/6b6fe3cbcc7de748754703adce0f62f3e070a098), [`a3309e63e`](https://github.com/dotansimha/graphql-code-generator/commit/a3309e63efed880e6f74ce6fcbf82dd3d7857a15)]:
  - @graphql-codegen/plugin-helpers@4.1.0
  - @graphql-codegen/typescript@3.0.1
  - @graphql-codegen/visitor-plugin-common@3.0.1

## 3.0.0

### Major Changes

- [#8885](https://github.com/dotansimha/graphql-code-generator/pull/8885) [`fd0b0c813`](https://github.com/dotansimha/graphql-code-generator/commit/fd0b0c813015cae4f6f6bda5f4c5515e544eb76d) Thanks [@n1ru4l](https://github.com/n1ru4l)! - drop Node.js 12 support

### Patch Changes

- [#8871](https://github.com/dotansimha/graphql-code-generator/pull/8871) [`fc79b65d4`](https://github.com/dotansimha/graphql-code-generator/commit/fc79b65d4914fd25ae6bd5d58ebc7ded573a08a5) Thanks [@B2o5T](https://github.com/B2o5T)! - eslint fixes

- Updated dependencies [[`fc79b65d4`](https://github.com/dotansimha/graphql-code-generator/commit/fc79b65d4914fd25ae6bd5d58ebc7ded573a08a5), [`fd0b0c813`](https://github.com/dotansimha/graphql-code-generator/commit/fd0b0c813015cae4f6f6bda5f4c5515e544eb76d)]:
  - @graphql-codegen/visitor-plugin-common@3.0.0
  - @graphql-codegen/plugin-helpers@4.0.0
  - @graphql-codegen/typescript@3.0.0

## 2.7.13

### Patch Changes

- Updated dependencies [[`a98198524`](https://github.com/dotansimha/graphql-code-generator/commit/a9819852443884b43de7c15040ccffc205f9177a)]:
  - @graphql-codegen/visitor-plugin-common@2.13.8
  - @graphql-codegen/typescript@2.8.8

## 2.7.12

### Patch Changes

- Updated dependencies [[`eb454d06c`](https://github.com/dotansimha/graphql-code-generator/commit/eb454d06c977f11f7d4a7b0b07eb80f8fd590560)]:
  - @graphql-codegen/visitor-plugin-common@2.13.7
  - @graphql-codegen/typescript@2.8.7

## 2.7.11

### Patch Changes

- [#8771](https://github.com/dotansimha/graphql-code-generator/pull/8771) [`ed87c782b`](https://github.com/dotansimha/graphql-code-generator/commit/ed87c782bf3292bfbee772c6962d6cbc43a9abe7) Thanks [@renovate](https://github.com/apps/renovate)! - dependencies updates:
  - Updated dependency [`@graphql-tools/utils@^9.0.0` ↗︎](https://www.npmjs.com/package/@graphql-tools/utils/v/9.0.0) (from `^8.8.0`, in `dependencies`)
- Updated dependencies [[`ed87c782b`](https://github.com/dotansimha/graphql-code-generator/commit/ed87c782bf3292bfbee772c6962d6cbc43a9abe7), [`ed87c782b`](https://github.com/dotansimha/graphql-code-generator/commit/ed87c782bf3292bfbee772c6962d6cbc43a9abe7), [`6c6b6f2df`](https://github.com/dotansimha/graphql-code-generator/commit/6c6b6f2df88a3a37b437a25320dab5590f033316)]:
  - @graphql-codegen/plugin-helpers@3.1.2
  - @graphql-codegen/visitor-plugin-common@2.13.6
  - @graphql-codegen/typescript@2.8.6

## 2.7.10

### Patch Changes

- [`46f75304a`](https://github.com/dotansimha/graphql-code-generator/commit/46f75304a69a13e8b5f58303f65c81b30a2ad96a) Thanks [@saihaj](https://github.com/saihaj)! - fix the version of `@graphql-codegen/plugin-helpers@3.1.1`

- Updated dependencies [[`307a5d350`](https://github.com/dotansimha/graphql-code-generator/commit/307a5d350643dd065d228b04ef3b4bd70cac0e81), [`46f75304a`](https://github.com/dotansimha/graphql-code-generator/commit/46f75304a69a13e8b5f58303f65c81b30a2ad96a)]:
  - @graphql-codegen/plugin-helpers@3.1.1
  - @graphql-codegen/visitor-plugin-common@2.13.5
  - @graphql-codegen/typescript@2.8.5

## 2.7.9

### Patch Changes

- Updated dependencies [[`a6c2097f4`](https://github.com/dotansimha/graphql-code-generator/commit/a6c2097f4789c0cce4296ce349790ce29943ed22), [`a6c2097f4`](https://github.com/dotansimha/graphql-code-generator/commit/a6c2097f4789c0cce4296ce349790ce29943ed22), [`f79a00e8a`](https://github.com/dotansimha/graphql-code-generator/commit/f79a00e8ae073eab426ca08795c924e716123482), [`c802a0c0b`](https://github.com/dotansimha/graphql-code-generator/commit/c802a0c0b775cfabc5ace3e7fb6655540c6c4d84)]:
  - @graphql-codegen/plugin-helpers@3.0.0
  - @graphql-codegen/visitor-plugin-common@2.13.4
  - @graphql-codegen/typescript@2.8.4

## 2.7.8

### Patch Changes

- Updated dependencies [[`62f655452`](https://github.com/dotansimha/graphql-code-generator/commit/62f6554520955dd675e11c920f35ef9bf0aaeffe)]:
  - @graphql-codegen/visitor-plugin-common@2.13.3
  - @graphql-codegen/typescript@2.8.3

## 2.7.7

### Patch Changes

- Updated dependencies [[`ef4c2c9c2`](https://github.com/dotansimha/graphql-code-generator/commit/ef4c2c9c233c68830f10eb4c167c7cceead27122)]:
  - @graphql-codegen/visitor-plugin-common@2.13.2
  - @graphql-codegen/typescript@2.8.2

## 2.7.6

### Patch Changes

- Updated dependencies [[`63dc8f205`](https://github.com/dotansimha/graphql-code-generator/commit/63dc8f2054e27b944f7d8dc59db8afa85760a127)]:
  - @graphql-codegen/visitor-plugin-common@2.13.1
  - @graphql-codegen/plugin-helpers@2.7.2
  - @graphql-codegen/typescript@2.8.1

## 2.7.5

### Patch Changes

- Updated dependencies [[`a46b8d99c`](https://github.com/dotansimha/graphql-code-generator/commit/a46b8d99c797283d773ec14163c62be9c84d4c2b)]:
  - @graphql-codegen/visitor-plugin-common@2.13.0
  - @graphql-codegen/typescript@2.7.5

## 2.7.4

### Patch Changes

- Updated dependencies [[`1bd7f771c`](https://github.com/dotansimha/graphql-code-generator/commit/1bd7f771ccb949a5a37395c7c57cb41c19340714)]:
  - @graphql-codegen/visitor-plugin-common@2.12.2
  - @graphql-codegen/typescript@2.7.4

## 2.7.3

### Patch Changes

- [#8189](https://github.com/dotansimha/graphql-code-generator/pull/8189) [`b408f8238`](https://github.com/dotansimha/graphql-code-generator/commit/b408f8238c00bbb4cd448501093856c06cfde50f) Thanks [@n1ru4l](https://github.com/n1ru4l)! - Fix CommonJS TypeScript resolution with `moduleResolution` `node16` or `nodenext`

- Updated dependencies [[`b408f8238`](https://github.com/dotansimha/graphql-code-generator/commit/b408f8238c00bbb4cd448501093856c06cfde50f), [`47d0a57e2`](https://github.com/dotansimha/graphql-code-generator/commit/47d0a57e27dd0d2334670bfc6c81c45e00ff4e74)]:
  - @graphql-codegen/visitor-plugin-common@2.12.1
  - @graphql-codegen/typescript@2.7.3
  - @graphql-codegen/plugin-helpers@2.6.2

## 2.7.2

### Patch Changes

- Updated dependencies [2cbcbb371]
  - @graphql-codegen/visitor-plugin-common@2.12.0
  - @graphql-codegen/plugin-helpers@2.6.0
  - @graphql-codegen/typescript@2.7.2

## 2.7.1

### Patch Changes

- 525ad580b: Revert breaking change for Next.js applications that are incapable of resolving an import with a `.js` extension.
- Updated dependencies [525ad580b]
  - @graphql-codegen/visitor-plugin-common@2.11.1
  - @graphql-codegen/typescript@2.7.1

## 2.7.0

### Minor Changes

- d84afec09: Support TypeScript ESM modules (`"module": "node16"` and `"moduleResolution": "node16"`).

  [More information on the TypeScript Release Notes.](https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#ecmascript-module-support-in-node-js)

### Patch Changes

- Updated dependencies [68bb30e19]
- Updated dependencies [d84afec09]
- Updated dependencies [a4fe5006b]
- Updated dependencies [8e44df58b]
  - @graphql-codegen/visitor-plugin-common@2.11.0
  - @graphql-codegen/typescript@2.7.0
  - @graphql-codegen/plugin-helpers@2.5.0

## 2.6.7

### Patch Changes

- Updated dependencies [aa1e6eafd]
- Updated dependencies [a42fcbfe4]
- Updated dependencies [8b10f22be]
  - @graphql-codegen/typescript@2.6.0
  - @graphql-codegen/visitor-plugin-common@2.10.0

## 2.6.6

### Patch Changes

- Updated dependencies [d16bebacb]
  - @graphql-codegen/visitor-plugin-common@2.9.1
  - @graphql-codegen/typescript@2.5.1

## 2.6.5

### Patch Changes

- Updated dependencies [c3d7b7226]
  - @graphql-codegen/visitor-plugin-common@2.9.0
  - @graphql-codegen/typescript@2.5.0

## 2.6.4

### Patch Changes

- Updated dependencies [f1fb77bd4]
  - @graphql-codegen/visitor-plugin-common@2.8.0
  - @graphql-codegen/typescript@2.4.11

## 2.6.3

### Patch Changes

- Updated dependencies [9a5f31cb6]
  - @graphql-codegen/typescript@2.4.10
  - @graphql-codegen/visitor-plugin-common@2.7.6

## 2.6.2

### Patch Changes

- Updated dependencies [2966686e9]
  - @graphql-codegen/visitor-plugin-common@2.7.5
  - @graphql-codegen/typescript@2.4.9

## 2.6.1

### Patch Changes

- 337fd4f77: WP: [typescript-resolvers] Add directiveContextTypes option
- Updated dependencies [337fd4f77]
  - @graphql-codegen/visitor-plugin-common@2.7.4
  - @graphql-codegen/typescript@2.4.8

## 2.6.0

### Minor Changes

- a3b348cd7: feat(resolvers): add factory signature to 'selectionSet' param of stitching resolvers

## 2.5.4

### Patch Changes

- Updated dependencies [54718c039]
  - @graphql-codegen/typescript@2.4.7
  - @graphql-codegen/visitor-plugin-common@2.7.3

## 2.5.3

### Patch Changes

- 1f5aaf097: Fix #7566 external resolver name export for directiveResolverMappings
- Updated dependencies [11d05e361]
  - @graphql-codegen/visitor-plugin-common@2.7.2
  - @graphql-codegen/typescript@2.4.6

## 2.5.2

### Patch Changes

- Updated dependencies [fd55e2039]
  - @graphql-codegen/visitor-plugin-common@2.7.1
  - @graphql-codegen/typescript@2.4.5

## 2.5.1

### Patch Changes

- Updated dependencies [1479233df]
  - @graphql-codegen/visitor-plugin-common@2.7.0
  - @graphql-codegen/typescript@2.4.4

## 2.5.0

### Minor Changes

- bef4376d5: fix: RequireFields generic making all other fields optional

### Patch Changes

- c8ef37ae0: fix(typescript-resolvers): Fix optional field types
- Updated dependencies [c8ef37ae0]
- Updated dependencies [754a33715]
- Updated dependencies [bef4376d5]
- Updated dependencies [be7cb3a82]
  - @graphql-codegen/visitor-plugin-common@2.6.0
  - @graphql-codegen/plugin-helpers@2.4.0
  - @graphql-codegen/typescript@2.4.3

## 2.4.3

### Patch Changes

- 6002feb3d: Fix exports in package.json files for react-native projects
- Updated dependencies [6002feb3d]
  - @graphql-codegen/visitor-plugin-common@2.5.2
  - @graphql-codegen/typescript@2.4.2
  - @graphql-codegen/plugin-helpers@2.3.2

## 2.4.2

### Patch Changes

- Updated dependencies [a9f1f1594]
- Updated dependencies [9ea6621ec]
  - @graphql-codegen/visitor-plugin-common@2.5.1
  - @graphql-codegen/typescript@2.4.1

## 2.4.1

### Patch Changes

- 3d57ec666: loosen return type of SubscriptionSubscribeFn from `PromiseOrValue<AsyncIterator>` to `PromiseOrValue<AsyncIterable>`. This fixes type conflicts with libraries such as `ix/asynciterable` and is what `graphql-js` expects.

## 2.4.0

### Minor Changes

- 97ddb487a: feat: GraphQL v16 compatibility

### Patch Changes

- Updated dependencies [97ddb487a]
  - @graphql-codegen/visitor-plugin-common@2.5.0
  - @graphql-codegen/typescript@2.3.0
  - @graphql-codegen/plugin-helpers@2.3.0

## 2.3.2

### Patch Changes

- Updated dependencies [ad02cb9b8]
  - @graphql-codegen/visitor-plugin-common@2.4.0
  - @graphql-codegen/typescript@2.2.4

## 2.3.1

### Patch Changes

- Updated dependencies [b9e85adae]
- Updated dependencies [7c60e5acc]
- Updated dependencies [3c2c847be]
  - @graphql-codegen/visitor-plugin-common@2.3.0
  - @graphql-codegen/plugin-helpers@2.2.0
  - @graphql-codegen/typescript@2.2.3

## 2.3.0

### Minor Changes

- 46b38d9c1: Add makeResolverTypeCallable property to config which allows a resolver function to be called

## 2.2.1

### Patch Changes

- Updated dependencies [0b090e31a]
  - @graphql-codegen/visitor-plugin-common@2.2.1
  - @graphql-codegen/typescript@2.2.2

## 2.2.0

### Minor Changes

- 5086791ac: Allow overwriting the resolver type signature based on directive usages.

  **WARNING:** Using this option does only change the generated type definitions.

  For actually ensuring that a type is correct at runtime you will have to use schema transforms (e.g. with [@graphql-tools/utils mapSchema](https://www.graphql-tools.com/docs/schema-directives)) that apply those rules! Otherwise, you might end up with a runtime type mismatch which could cause unnoticed bugs or runtime errors.

  Example configuration:

  ```yaml
  config:
    # This was possible before
    customResolverFn: ../resolver-types.ts#UnauthenticatedResolver
    # This is new
    directiveResolverMappings:
      authenticated: ../resolvers-types.ts#AuthenticatedResolver
  ```

  Example mapping file (`resolver-types.ts`):

  ```ts
  export type UnauthenticatedContext = {
    user: null
  }

  export type AuthenticatedContext = {
    user: { id: string }
  }

  export type UnauthenticatedResolver<TResult, TParent, _TContext, TArgs> = (
    parent: TParent,
    args: TArgs,
    context: UnauthenticatedContext,
    info: GraphQLResolveInfo
  ) => Promise<TResult> | TResult

  export type AuthenticatedResolver<TResult, TParent, _TContext, TArgs> = (
    parent: TParent,
    args: TArgs,
    context: AuthenticatedContext,
    info: GraphQLResolveInfo
  ) => Promise<TResult> | TResult
  ```

  Example Schema:

  ```graphql
  directive @authenticated on FIELD_DEFINITION

  type Query {
    yee: String
    foo: String @authenticated
  }
  ```

### Patch Changes

- Updated dependencies [d6c2d4c09]
- Updated dependencies [feeae1c66]
- Updated dependencies [8261e4161]
- Updated dependencies [5086791ac]
  - @graphql-codegen/visitor-plugin-common@2.2.0
  - @graphql-codegen/typescript@2.2.0

## 2.1.2

### Patch Changes

- Updated dependencies [6470e6cc9]
- Updated dependencies [263570e50]
- Updated dependencies [35199dedf]
  - @graphql-codegen/visitor-plugin-common@2.1.2
  - @graphql-codegen/plugin-helpers@2.1.1
  - @graphql-codegen/typescript@2.1.2

## 2.1.1

### Patch Changes

- Updated dependencies [aabeff181]
  - @graphql-codegen/visitor-plugin-common@2.1.1
  - @graphql-codegen/typescript@2.1.1

## 2.1.0

### Minor Changes

- 39773f59b: enhance(plugins): use getDocumentNodeFromSchema and other utilities from @graphql-tools/utils
- 440172cfe: support ESM

### Patch Changes

- 24185985a: bump graphql-tools package versions
- 440172cfe: export config types
- Updated dependencies [290170262]
- Updated dependencies [24185985a]
- Updated dependencies [39773f59b]
- Updated dependencies [440172cfe]
  - @graphql-codegen/visitor-plugin-common@2.1.0
  - @graphql-codegen/plugin-helpers@2.1.0
  - @graphql-codegen/typescript@2.1.0

## 2.0.0

### Major Changes

- d80efdec4: Set `noSchemaStitching: true` by default.

  If you need the resolvers signature to support schema-stitching, please add to your config:

  ```yaml
  noSchemaStitching: false
  ```

- d80efdec4: Remove deprecated `IDirectiveResolvers` and `IResolvers` signatures

  Please use `DirectiveResolvers` and `Resolvers` types instead.

- b0cb13df4: Update to latest `graphql-tools` and `graphql-config` version.

  ‼️ ‼️ ‼️ Please note ‼️ ‼️ ‼️:

  This is a breaking change since Node 10 is no longer supported in `graphql-tools`, and also no longer supported for Codegen packages.

### Patch Changes

- Updated dependencies [d80efdec4]
- Updated dependencies [d80efdec4]
- Updated dependencies [b0cb13df4]
  - @graphql-codegen/visitor-plugin-common@2.0.0
  - @graphql-codegen/typescript@2.0.0
  - @graphql-codegen/plugin-helpers@2.0.0

## 1.20.0

### Minor Changes

- 8e4d5826: Add a new type for StitchResolver without selectionSet
- 9005cc17: add `allowEnumStringTypes` option for allowing string literals as valid return types from resolvers in addition to enum values.\_

### Patch Changes

- df19a4ed: Allow multiple `{T}` instances in defaultMapper
- Updated dependencies [df19a4ed]
- Updated dependencies [470336a1]
- Updated dependencies [9005cc17]
  - @graphql-codegen/visitor-plugin-common@1.22.0
  - @graphql-codegen/plugin-helpers@1.18.8
  - @graphql-codegen/typescript@1.23.0

## 1.19.5

### Patch Changes

- Updated dependencies [6762aff5]
  - @graphql-codegen/visitor-plugin-common@1.21.3
  - @graphql-codegen/typescript@1.22.4

## 1.19.4

### Patch Changes

- Updated dependencies [6aaecf1c]
  - @graphql-codegen/visitor-plugin-common@1.21.2
  - @graphql-codegen/typescript@1.22.3

## 1.19.3

### Patch Changes

- Updated dependencies [cf1e5abc]
  - @graphql-codegen/visitor-plugin-common@1.21.1
  - @graphql-codegen/typescript@1.22.2

## 1.19.2

### Patch Changes

- dfd25caf: chore(deps): bump graphql-tools versions
- Updated dependencies [dfd25caf]
- Updated dependencies [8da7dff6]
  - @graphql-codegen/visitor-plugin-common@1.21.0
  - @graphql-codegen/plugin-helpers@1.18.7
  - @graphql-codegen/typescript@1.22.1

## 1.19.1

### Patch Changes

- d9212aa0: fix(visitor-plugin-common): guard for a runtime type error
- Updated dependencies [d9212aa0]
- Updated dependencies [f0b5ea53]
- Updated dependencies [097bea2f]
  - @graphql-codegen/visitor-plugin-common@1.20.0
  - @graphql-codegen/typescript@1.22.0
  - @graphql-codegen/plugin-helpers@1.18.5

## 1.19.0

### Minor Changes

- d4942d04: NEW CONFIG (`onlyResolveTypeForInterfaces`): Allow to generate only \_\_resolveType for interfaces

### Patch Changes

- 29b75b1e: enhance(namingConvention): use change-case-all instead of individual packages for naming convention
- Updated dependencies [e947f8e3]
- Updated dependencies [29b75b1e]
- Updated dependencies [d4942d04]
- Updated dependencies [1f6f3db6]
- Updated dependencies [29b75b1e]
  - @graphql-codegen/visitor-plugin-common@1.19.0
  - @graphql-codegen/typescript@1.21.1
  - @graphql-codegen/plugin-helpers@1.18.3

## 1.18.2

### Patch Changes

- 5749cb8a: chore: fix type-level incompatibilities of the `avoidOptionals`
- Updated dependencies [34b8087e]
- Updated dependencies [5749cb8a]
- Updated dependencies [5a12fe58]
  - @graphql-codegen/typescript@1.21.0
  - @graphql-codegen/visitor-plugin-common@1.18.3

## 1.18.1

### Patch Changes

- fd5843a7: Fixed a bug where some import namespacing is missed when generating resolver types.
- Updated dependencies [64293437]
- Updated dependencies [fd5843a7]
- Updated dependencies [d75051f5]
  - @graphql-codegen/visitor-plugin-common@1.17.22

## 1.18.0

### Minor Changes

- 8356f8a2: Added a new config flag for customizing `isTypeOf` and `resolveType` prefix (`internalResolversPrefix`)

### Patch Changes

- Updated dependencies [8356f8a2]
- Updated dependencies [1d6a593f]
  - @graphql-codegen/visitor-plugin-common@1.17.21
  - @graphql-codegen/typescript@1.19.0

## 1.17.12

### Patch Changes

- 1183d173: Bump all packages to resolve issues with shared dependencies
- Updated dependencies [1183d173]
  - @graphql-codegen/visitor-plugin-common@1.17.20
  - @graphql-codegen/typescript@1.18.1
  - @graphql-codegen/plugin-helpers@1.18.2

## 1.17.11

### Patch Changes

- faa13973: Fixed issues with mappers setup
- Updated dependencies [faa13973]
  - @graphql-codegen/visitor-plugin-common@1.17.18

## 1.17.10

### Patch Changes

- d2cde3d5: fixed isTypeOf resolvers signature
- 89a6aa80: Fixes issues with typesSuffix and arguments type name
- Updated dependencies [d2cde3d5]
- Updated dependencies [89a6aa80]
- Updated dependencies [f603b8f8]
- Updated dependencies [7ad7a1ae]
- Updated dependencies [da8bdd17]
  - @graphql-codegen/visitor-plugin-common@1.17.15
  - @graphql-codegen/typescript@1.17.10
  - @graphql-codegen/plugin-helpers@1.17.9

## 1.17.9

### Patch Changes

- ed7f6b97: Fix issues with mappers not being applied for interfaces or unions

## 1.17.8

### Patch Changes

- 1d7c6432: Bump all packages to allow "^" in deps and fix compatibility issues
- 1d7c6432: Bump versions of @graphql-tools/ packages to fix issues with loading schemas and SDL comments
- af3803b8: only transform federated parent types when they contain @external directive
- Updated dependencies [1d7c6432]
- Updated dependencies [1d7c6432]
  - @graphql-codegen/visitor-plugin-common@1.17.13
  - @graphql-codegen/plugin-helpers@1.17.8
  - @graphql-codegen/typescript@1.17.8
