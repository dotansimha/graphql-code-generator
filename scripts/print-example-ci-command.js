/* eslint-disable import/no-extraneous-dependencies, no-console */
const fs = require('fs-extra');
const fg = require('fast-glob');

const packageJSON = fg.sync(['examples/**/package.json'], { ignore: ['**/node_modules/**'] });

const ignoredPackages = [];

const exampleTypeMap = {
  all: 'all',
  swc: 'swc',
  normal: 'normal',
};
const exampleType = exampleTypeMap[process.env.EXAMPLE_TYPE] || 'all';

const result = packageJSON.reduce(
  (res, packageJSONPath) => {
    const { name, devDependencies } = fs.readJSONSync(packageJSONPath);

    if (ignoredPackages.includes(name)) {
      res.ignored.push(name);
      return res;
    }

    if (
      (exampleType === 'swc' && !devDependencies['@graphql-codegen/client-preset-swc-plugin']) ||
      (exampleType === 'normal' && devDependencies['@graphql-codegen/client-preset-swc-plugin'])
    ) {
      res.ignored.push(name);
      return res;
    }

    res.commands.push(`yarn workspace ${name} run ${process.argv[2]}`);
    return res;
  },
  { ignored: [], commands: [] }
);

if (result.ignored.length > 0) {
  result.commands.push(`echo "Ignored packages: ${result.ignored.join(',')}"`);
}

console.log(result.commands.join(' && '));
