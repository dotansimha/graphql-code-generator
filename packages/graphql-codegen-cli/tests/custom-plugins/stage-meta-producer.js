module.exports = {
  plugin: schema => {
    const typeNames = Object.keys(schema.getTypeMap()).filter(name => !name.startsWith('__'));
    return {
      content: '// STAGE_ONE',
      meta: { typeNames },
    };
  },
};
