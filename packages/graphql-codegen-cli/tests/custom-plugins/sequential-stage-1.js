/**
 * PoC fixture for https://github.com/dotansimha/graphql-code-generator/issues/10943
 * ("Option 1: Sequential Stages"). Stands in for a plugin like `typescript`: it produces
 * `content` for the file, plus `meta` describing something a later stage's plugin might
 * want to build on (here, the list of type names it "generated").
 */
module.exports = {
  plugin(_schema, _documents, _config) {
    return {
      content: '// Stage 1 (typescript-like): generated types Foo, Bar\n',
      meta: {
        typeNames: ['Foo', 'Bar'],
      },
    };
  },
};
