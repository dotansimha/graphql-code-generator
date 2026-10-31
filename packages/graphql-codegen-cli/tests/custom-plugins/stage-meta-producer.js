module.exports = {
  plugin: (_schema, _documents, config) => ({
    content: config.content,
    prepend: config.prepend,
    append: config.append,
    meta: config.meta,
  }),
};
