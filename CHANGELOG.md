<a name="NEXT"></a>

* Update dependencies
* Fix bugs with document finder ([#233](https://github.com/dotansimha/graphql-code-generator/issues/233), [#216](https://github.com/dotansimha/graphql-code-generator/pull/216))
* Respect `--out` when generating a project ([#210](https://github.com/dotansimha/graphql-code-generator/pull/210), Thanks @micimize)
* Automatically registerPartial custom templates without breaking normal partial registration ([#210](https://github.com/dotansimha/graphql-code-generator/pull/210), Thanks @micimize)
* Make `ts.{ schema, documents }.handlebars` work without a prefix (e.g. `ts.schema.handlebars` => `schema.ts`) ([#210](https://github.com/dotansimha/graphql-code-generator/pull/210), Thanks @micimize)
* Mark template comments as safe to avoid url escaping ([#210](https://github.com/dotansimha/graphql-code-generator/pull/210), Thanks @micimize)
* Fixed some links in the docs and add relevant docs for the included changes ([#210](https://github.com/dotansimha/graphql-code-generator/pull/210), Thanks @micimize)
* Fix export CLI short alias ([#255](https://github.com/dotansimha/graphql-code-generator/pull/255), Thanks @eritikass)

<a name="0.8.21"></a>

## [0.8.21](https://github.com/dotansimha/graphql-codegen/compare/0.8.20...0.8.21) (2018-03-17)

* Use default `.ts` extension for TypeScript generatos (instead of `.d.ts`) to avoid errors with enums (Thanks @guilhermehubner)
* Update some dependencies to the latest version.

<a name="0.8.20"></a>

## [0.8.20](https://github.com/dotansimha/graphql-codegen/compare/0.8.19...0.8.20) (2018-03-14)

* Fixed a bug with `gql` detection on TSX files

<a name="0.8.19"></a>

## [0.8.19](https://github.com/dotansimha/graphql-codegen/compare/0.8.18...0.8.19) (2018-03-13)

* Ignore commented code in document files
* Better detection for GraphQL documents usage with `gql` tag.
* Added prettier support (see README)

<a name="0.8.18"></a>

## [0.8.18](https://github.com/dotansimha/graphql-codegen/compare/0.8.16...0.8.18) (2018-03-13)

* Added `__typename` to TypeScript templates, with support for inline fragments.
* Added `stringify` Handlebars helpers for easy debugging.
* Codegen compiler: trim templates before using it.
* Refactor parts of the TypeScript templates
* Change inline fragments behavior in generated TypeScript code to use `|` instead of `&`.
* Added `--no-overwrite` flag to skip overwriting existing files
* Generator will not throw an error if a glob expression does not match any GraphQL document files
* Generator will not write a file to file system if the content is empty

<a name="0.8.16"></a>

## [0.8.16](https://github.com/dotansimha/graphql-codegen/compare/0.8.15...0.8.16) (2018-03-13)

* Handle lists and non-null properly (Thanks @FredyC)

<a name="0.8.15"></a>

## [0.8.15](https://github.com/dotansimha/graphql-codegen/compare/0.8.14...0.8.15) (2018-03-13)

* Added support for generator-specific config in `gql-gen.json` file.
* Generated config is now exposed in the template under the name `config` in the root context.
* Added `currentTime` to the context.
* Added support for GraphQL 0.13
* Updated all dependencies
* Added support for using custom `require` using `--require` flag (Thanks Jonas Kello)
* Update TypeScript enum template (Thanks @darthtrevino)

### Breaking Changes

* Changed CLI option that points to `gql-gen.json` file from `--project-config` to `--config`.

<a name="0.8.14"></a>

## [0.8.14](https://github.com/dotansimha/graphql-codegen/compare/0.8.12...0.8.14) (2017-10-29)

* (Compiler) Fixed execution context for `ifDirective` and `unlessDirective` (now the parent is also available, no need for `../`)
* (TypeScript) Fix for nullable types [Fixes #155](https://github.com/dotansimha/graphql-code-generator/issues/155)

<a name="0.8.12"></a>

## [0.8.12](https://github.com/dotansimha/graphql-codegen/compare/0.8.11...0.8.12) (2017-09-21)

* Fix for custom templates in an external project that use `.` in result file name (for example: `my-file.d.ts.schema.handlebars`)

<a name="0.8.11"></a>

## [0.8.11](https://github.com/dotansimha/graphql-codegen/compare/0.8.10...0.8.11) (2017-09-20)

* Export all available interfaces from the compiler package (Fixes [#144](https://github.com/dotansimha/graphql-code-generator/issues/144)
* Fixed incorrect typings path (Fixes [#143](https://github.com/dotansimha/graphql-code-generator/issues/143))
* Simplify fragment emitting for selection sets (Fixes [#139](https://github.com/dotansimha/graphql-code-generator/issues/139))
* Change TypeScript optional to use `?` instead of `| null` ([#142](https://github.com/dotansimha/graphql-code-generator/pull/142))
* Allow insecure HTTP requests (Fixes [#137](https://github.com/dotansimha/graphql-code-generator/issues/137))

<a name="0.8.10"></a>

## [0.8.10](https://github.com/dotansimha/graphql-codegen/compare/0.8.9...0.8.10) (2017-07-24)

* Fixed bug with relative path for export JS

<a name="0.8.9"></a>

## [0.8.9](https://github.com/dotansimha/graphql-codegen/compare/0.8.8...0.8.9) (2017-07-24)

* Fixed bug with relative path for file schema

<a name="0.8.8"></a>

## [0.8.8](https://github.com/dotansimha/graphql-codegen/compare/0.8.7...0.8.8) (2017-07-24)

* Added support for custom helpers when generating custom templates
* Added more Handlebars helpers
* Some fixed for `ifDirective` helper
* Updated docs

<a name="0.8.7"></a>

## [0.8.7](https://github.com/dotansimha/graphql-codegen/compare/0.8.6...0.8.7) (2017-07-23)

* Fixed issue with remote GraphQL endpoint and custom headers

<a name="0.8.6"></a>

## [0.8.6](https://github.com/dotansimha/graphql-codegen/compare/0.8.5...0.8.6) (2017-07-20)

* Fixed issue with loading GraphQLSchema export from JS file
* Changed `graphql` to be peer dependency to avoid multiple instance of GraphQL
* Fixed issue with custom templates without prefix name

<a name="0.8.5"></a>

## [0.8.5](https://github.com/dotansimha/graphql-codegen/compare/0.8.4...0.8.5) (2017-07-19)

* Fixed issue with missing indicators for variables and selection set node
* Better imports optimization and detection
* Removed default file extension for imports builder

<a name="0.8.4"></a>

## [0.8.4](https://github.com/dotansimha/graphql-codegen/compare/0.8.3...0.8.4) (2017-07-19)

* Fixed issue with generated result missing Fragment spread
* Fixed issue with wrong output for GraphQL primitives
* Fixed issue with default output file overrides the `out` cli parameter

<a name="0.8.3"></a>

## [0.8.3](https://github.com/dotansimha/graphql-codegen/compare/0.8.2...0.8.3) (2017-07-19)

* Fixed issue with \_\_typename in selectionSet

<a name="0.8.2"></a>

## [0.8.2](https://github.com/dotansimha/graphql-codegen/compare/0.8.1...0.8.2) (2017-07-18)

* Fixed issue with NPM installation

<a name="0.8.1"></a>

## [0.8.1](https://github.com/dotansimha/graphql-codegen/compare/0.8.0...0.8.1) (2017-07-18)

* Fixed issue with NPM installation

<a name="0.8.0"></a>

## [0.8.0](https://github.com/dotansimha/graphql-codegen/compare/0.5.5...0.8.0) (2017-07-17)

* Refactor everything :)

<a name="0.5.5"></a>

## [0.5.5](https://github.com/dotansimha/graphql-codegen/compare/0.5.4...0.5.5) (2017-07-13)

* fixed peer dependencies issue
* fixed error with template resolution [PR #110](https://github.com/dotansimha/graphql-code-generator/pull/110)
* update depndencies
* Prevent primitives from being output like other models [PR #116](https://github.com/dotansimha/graphql-code-generator/pull/116)

<a name="0.5.4"></a>

## [0.5.4](https://github.com/dotansimha/graphql-codegen/compare/0.5.2...0.5.4) (2017-06-24)

* updated all dependencies

<a name="0.5.2"></a>

## [0.5.2](https://github.com/dotansimha/graphql-codegen/compare/0.5.1...v0.5.2) (2017-05-03)

## Bug fixes

* Added support for Anonymous operations (closes [#82](https://github.com/dotansimha/graphql-code-generator/issues/82))
* Fixed a bug with missing root types (closes [#83](https://github.com/dotansimha/graphql-code-generator/issues/83))
* Fixed a bug with multiple extends for TypeScript generator [#81](https://github.com/dotansimha/graphql-code-generator/pull/81) - Thanks @Anthonyzou
* Fixed a issue with generated TypeScript file and TSLint warnings [#81](https://github.com/dotansimha/graphql-code-generator/pull/81) - Thanks @Anthonyzou

### Other

* Updated all dependencies to their latest version.
* **package:** update graphql to version 0.9.1 ([2782925](https://github.com/dotansimha/graphql-codegen/commit/2782925))

<a name="0.5.1"></a>

## [0.5.1](https://github.com/dotansimha/graphql-codegen/compare/0.5.0...v0.5.1) (2017-01-03)

* updated dependecies

<a name="0.5.0"></a>

# [0.5.0](https://github.com/dotansimha/graphql-codegen/compare/0.3.0...v0.5.0) (2016-12-29)

### Features

* **core:** add support for loading GraphQL schema from js export file ([1587ef7](https://github.com/dotansimha/graphql-codegen/commit/1587ef7))

<a name="0.4.0"></a>

# [0.4.0](https://github.com/dotansimha/graphql-codegen/compare/0.3.0...v0.4.0) (2016-12-28)

### Bug Fixes

* **package:** update [@types](https://github.com/types)/request to version 0.0.37 ([4fcdc32](https://github.com/dotansimha/graphql-codegen/commit/4fcdc32))

### Features

* **libify:** added lib exports ([7175e11](https://github.com/dotansimha/graphql-codegen/commit/7175e11))
* **core:** added support for server side schema arguments

<a name="0.3.0"></a>

# [0.3.0](https://github.com/dotansimha/graphql-codegen/compare/0.2.5...v0.3.0) (2016-12-26)

### Bug Fixes

* **generators:** fixes for ts generators ([2f72d44](https://github.com/dotansimha/graphql-codegen/commit/2f72d44))

### Features

* **generators:** generated ts/swift result examples ([e43f289](https://github.com/dotansimha/graphql-codegen/commit/e43f289))
* **generators:** swift with Apollo iOS generator ([cee08c8](https://github.com/dotansimha/graphql-codegen/commit/cee08c8))
* **generators:** add support for fragments spread for swift generator ([f95fa72](https://github.com/dotansimha/graphql-codegen/commit/f95fa72))
* **generators:** More fixes for swift generator ([487a249](https://github.com/dotansimha/graphql-codegen/commit/487a249))

<a name="0.2.5"></a>

## [0.2.5](https://github.com/dotansimha/graphql-codegen/compare/0.2.4...v0.2.5) (2016-12-24)

### Bug Fixes

* **generators:** fixed a small bug with typescript generator after code modifications ([33a4b83](https://github.com/dotansimha/graphql-codegen/commit/33a4b83))

### Features

* **generators:** WIP: added swift generator support for inline fragments ([3c087b4](https://github.com/dotansimha/graphql-codegen/commit/3c087b4))
* **generators:** WIP: some more fixes and template code for swift generator ([3b0d0f9](https://github.com/dotansimha/graphql-codegen/commit/3b0d0f9))
* **generators:** WIP: swift generator and some bug fixes ([f5b0b92](https://github.com/dotansimha/graphql-codegen/commit/f5b0b92))

<a name="0.2.4"></a>

## [0.2.4](https://github.com/dotansimha/graphql-codegen/compare/0.2.3...v0.2.4) (2016-12-24)

### Features

* **cli:** add support for --no-documents and --no-schema flags ([1a6a692](https://github.com/dotansimha/graphql-codegen/commit/1a6a692))

<a name="0.2.3"></a>

## [0.2.3](https://github.com/dotansimha/graphql-codegen/compare/0.2.2...v0.2.3) (2016-12-24)

### Features

* **documents-finder:** add support for finding GraphQL documents inside code files ([1d11980](https://github.com/dotansimha/graphql-codegen/commit/1d11980))

<a name="0.2.2"></a>

## [0.2.2](https://github.com/dotansimha/graphql-codegen/compare/0.2.1...v0.2.2) (2016-12-23)

### Bug Fixes

* **fragments:** added rootType to fragments ([af9b932](https://github.com/dotansimha/graphql-codegen/commit/af9b932))

<a name="0.2.1"></a>

## [0.2.1](https://github.com/dotansimha/graphql-codegen/compare/0.2.0...v0.2.1) (2016-12-23)

### Features

* **flatten, partials:** add support for non-flatten innerTypes ([1f6d001](https://github.com/dotansimha/graphql-codegen/commit/1f6d001))

<a name="0.2.0"></a>

# [0.2.0](https://github.com/dotansimha/graphql-codegen/compare/0.1.9...v0.2.0) (2016-12-14)

### Features

* **core:** added custom headers for remote GraphQL endpoint ([d3b2cf9](https://github.com/dotansimha/graphql-codegen/commit/d3b2cf9))

<a name="0.1.9"></a>

## [0.1.9](https://github.com/dotansimha/graphql-codegen/compare/0.1.8...v0.1.9) (2016-12-14)

### Features

* **cli:** added package version to cli ([df698d8](https://github.com/dotansimha/graphql-codegen/commit/df698d8))
* **core:** added support for custom scalar types ([6ce7aa9](https://github.com/dotansimha/graphql-codegen/commit/6ce7aa9))

<a name="0.1.8"></a>

## 0.1.8 (2016-12-14)

### Bug Fixes

* **core:** fixes for cli and template path resolve ([b7a3540](https://github.com/dotansimha/graphql-codegen/commit/b7a3540))
* **typescript:** fixed enum template ([c05acd6](https://github.com/dotansimha/graphql-codegen/commit/c05acd6))

### Features

* **cli:** added basic cli support ([12b4458](https://github.com/dotansimha/graphql-codegen/commit/12b4458))
* **cli:** added support for introspection from URL, and updated README ([cc15899](https://github.com/dotansimha/graphql-codegen/commit/cc15899))
* **core:** added document content, added basic Swift generated content ([2d144ff](https://github.com/dotansimha/graphql-codegen/commit/2d144ff))
* **core:** added generated root result object to the generated innertypes ([086d019](https://github.com/dotansimha/graphql-codegen/commit/086d019))
* **core:** added handlebars helpers and added more swift support ([657c9f6](https://github.com/dotansimha/graphql-codegen/commit/657c9f6))
* **core:** added inner types resolution and basic typescript template ([c173fc3](https://github.com/dotansimha/graphql-codegen/commit/c173fc3))
* **core:** added more template helpers and added variables generation ([6da0d88](https://github.com/dotansimha/graphql-codegen/commit/6da0d88))
* **core:** added primitives map, fixes for typescript generators ([ebc117b](https://github.com/dotansimha/graphql-codegen/commit/ebc117b))
* **core:** added support for generated fragments and it's use inside documents ([fbd268c](https://github.com/dotansimha/graphql-codegen/commit/fbd268c))
* **core:** added support for generated type as array based on server-side schema ([a37c849](https://github.com/dotansimha/graphql-codegen/commit/a37c849))
* **core:** added support for index file for multiple-files generators ([7519de0](https://github.com/dotansimha/graphql-codegen/commit/7519de0))
* **core:** added support for inline fragments ([f432ecd](https://github.com/dotansimha/graphql-codegen/commit/f432ecd))
* **core:** added support for multiple-files generation, added typescript-multiple generator, added ([0af3cd0](https://github.com/dotansimha/graphql-codegen/commit/0af3cd0))
* **core:** added support for operations variables generation ([a9bf28f](https://github.com/dotansimha/graphql-codegen/commit/a9bf28f))
* **core:** added support for schema interfaces, and update typescript generator ([22d3ad0](https://github.com/dotansimha/graphql-codegen/commit/22d3ad0))
* **core:** added support for server side types generation only ([2bec16f](https://github.com/dotansimha/graphql-codegen/commit/2bec16f))
* **core:** added support for spread fragment when used in client side query ([8e9b093](https://github.com/dotansimha/graphql-codegen/commit/8e9b093))
* **core:** added support for union types, updated typescript templates ([0172461](https://github.com/dotansimha/graphql-codegen/commit/0172461))
* **core:** fixes for generated array types ([e2fb340](https://github.com/dotansimha/graphql-codegen/commit/e2fb340))
* **core:** handle multiple inner types with the same name ([614ea3a](https://github.com/dotansimha/graphql-codegen/commit/614ea3a))
* **core:** minor fixes and some changes in swift generator ([8d30bad](https://github.com/dotansimha/graphql-codegen/commit/8d30bad))
* **core:** minor name fix ([5509b1d](https://github.com/dotansimha/graphql-codegen/commit/5509b1d))
* **core:** remove swift ([85f1956](https://github.com/dotansimha/graphql-codegen/commit/85f1956))
* **core:** some fixes ([60d4494](https://github.com/dotansimha/graphql-codegen/commit/60d4494))
* **core, cli:** added cli and more core features ([b858693](https://github.com/dotansimha/graphql-codegen/commit/b858693))
* **flow:** add flow generator template ([af72bbb](https://github.com/dotansimha/graphql-codegen/commit/af72bbb))
* **generator:** added code generator for scheme basic types ([f04b3a0](https://github.com/dotansimha/graphql-codegen/commit/f04b3a0))
* **generator:** added typescript basic template ([00739db](https://github.com/dotansimha/graphql-codegen/commit/00739db))
* **generator:** fixes for type handling and added support for lists and nullable types ([8c4c498](https://github.com/dotansimha/graphql-codegen/commit/8c4c498))
* **generator:** minor fixes for code generation for schema ([f69f375](https://github.com/dotansimha/graphql-codegen/commit/f69f375))
* **generator:** refactor some code of the generator, added stub for operation handler ([156d710](https://github.com/dotansimha/graphql-codegen/commit/156d710))
* **loader:** added basic schema loader and validator from JSON introspection file ([13b3dec](https://github.com/dotansimha/graphql-codegen/commit/13b3dec))
* **parser:** added basic parser for documents and added some basic interfaces ([8ecaf4e](https://github.com/dotansimha/graphql-codegen/commit/8ecaf4e))
* **typescript:** fixed issue with fragment name ([e3799da](https://github.com/dotansimha/graphql-codegen/commit/e3799da))
