/* eslint-disable import/no-extraneous-dependencies, no-console */
const fs = require('fs-extra');
const fg = require('fast-glob');

const packageJSON = fg.sync(['examples/**/package.json'], { ignore: ['**/node_modules/**'] });

const ignoredPackages = [];

const command = process.argv[2];
const currentGroup = process.env.RUN_GROUP || 1;
const totalGroups = process.env.RUN_GROUP_TOTAL | 1;

const result = packageJSON.reduce(
  (res, packageJSONPath) => {
    const { name } = fs.readJSONSync(packageJSONPath);

    if (ignoredPackages.includes(name)) {
      res.ignored.push(name);
      return res;
    }

    res.commands.push(`yarn workspace ${name} run ${command}`);
    return res;
  },
  { ignored: [], commands: [] }
);

if (result.ignored.length > 0) {
  result.commands.push(`echo "Ignored packages: ${result.ignored.join(',')}"`);
}

function splitArray(array, partCount = 1) {
  if (partCount <= 0) {
    throw new Error('partCount must be greater than 0');
  }

  const result = [];
  const totalLength = array.length;
  const avgSize = Math.floor(totalLength / partCount);
  const extra = totalLength % partCount;

  let start = 0;
  for (let i = 0; i < partCount; i++) {
    const end = start + avgSize + (i + 1 === partCount ? extra : 0); // If it's the last part, add the extra to the size to ensure partCount is always met
    result.push(array.slice(start, end));
    start = end;
  }

  return result;
}

const commands = splitArray(result.commands, totalGroups)[currentGroup - 1] || [];

console.log(commands.join(' && '));
