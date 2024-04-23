/* eslint-disable import/no-extraneous-dependencies, no-console */
const fs = require('fs-extra');
const fg = require('fast-glob');

const packageJSON = fg.sync(['examples/**/package.json'], { ignore: ['**/node_modules/**'] });

console.log(
  packageJSON
    .reduce((res, packageJSONPath) => {
      const { name } = fs.readJSONSync(packageJSONPath);

      res.push(`yarn workspace ${name} run ${process.argv[2]}`);

      return res;
    }, [])
    .join(' && ')
);
