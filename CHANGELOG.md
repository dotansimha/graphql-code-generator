<a name="0.2.2"></a>
## [0.2.2](https://github.com/dotansimha/graphql-codegen/compare/0.2.0...v0.2.2) (2016-12-23)


### Bug Fixes

* **fragments:** added rootType to fragments ([af9b932](https://github.com/dotansimha/graphql-codegen/commit/af9b932))


### Features

* **flatten, partials:** add support for non-flatten innerTypes ([1f6d001](https://github.com/dotansimha/graphql-codegen/commit/1f6d001))



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



