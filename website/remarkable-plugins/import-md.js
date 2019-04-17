const { Plugin } = require('remarkable-embed');
const { readFileSync, existsSync } = require('fs');
const { resolve } = require('path');

module.exports = function() {
  return function(md, options) {
    const embed = new Plugin();

    function handleImport(arg) {
      const [path, ...vars] = arg.split('|');
      const fullPath = resolve(process.cwd(), path);

      if (!existsSync(fullPath)) {
        console.warn(`File ${fullPath} does not exists!`);

        return '';
      }

      let fileContent = readFileSync(fullPath, 'utf-8');

      (vars || []).forEach((value, key) => {
        const rgx = new RegExp('\\$' + (key + 1), 'g');
        fileContent = fileContent.replace(rgx, value);
      });

      return md.render(fileContent);
    }

    embed.register('import', handleImport);

    const plugin = {
      render: md.render.bind(md),
      hook: embed.hook(md, options),
    };

    return plugin.hook;
  };
};
