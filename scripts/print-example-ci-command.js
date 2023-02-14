// @ts-check
const fs = require('fs-extra');
const fg = require('fast-glob');

const packageJSON = fg.sync(['examples/**/package.json'], { ignore: ['**/node_modules/**'] });

for (const packageJSONPath of packageJSON) {
  const { name } = fs.readJSONSync(packageJSONPath);
  console.log(`yarn workspace ${name} run codegen;`);
}
