/* eslint-disable import/no-extraneous-dependencies, no-console */
// @ts-check
const fs = require('fs-extra');
const fg = require('fast-glob');

const packageJSON = fg.sync(['examples/**/package.json'], { ignore: ['**/node_modules/**'] });

console.log(
  packageJSON
    .map(packageJSONPath => {
      const { name } = fs.readJSONSync(packageJSONPath);
      return `pnpm --filter=${name} run ${process.argv[2]}`;
    })
    .join(' && ')
);
