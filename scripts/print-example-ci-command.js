/* eslint-disable import/no-extraneous-dependencies, no-console */
const fs = require('fs-extra');
const fg = require('fast-glob');

const packageJSON = fg.sync(['examples/**/package.json'], { ignore: ['**/node_modules/**'] });

const ignoredPackages = ['example-react-nextjs-swr'];

const result = packageJSON.reduce(
  (res, packageJSONPath) => {
    const { name } = fs.readJSONSync(packageJSONPath);

    if (ignoredPackages.includes(name)) {
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
