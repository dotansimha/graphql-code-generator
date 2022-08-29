/* eslint-disable no-console */
const { writeFileSync } = require('fs');
const { resolve } = require('path');
const { argv, cwd } = require('process');
const { exec } = require('child_process');

// Usage: node ./scripts/examples-front-end-upgrade-codegen.js 3.0.0-v3rfc-20220829075600-d966c407d

(async function () {
  // eslint-disable-next-line import/no-extraneous-dependencies
  const { globby } = await import('globby');

  const codegenCLIversion = argv[2];

  globby('./examples/front-end/**/package.json', {
    ignore: ['./examples/front-end/**/node_modules/**', './examples/front-end/**/dist/**'],
  })
    .then(files => {
      return Promise.all(
        files.map(
          filePath =>
            new Promise((resolve, reject) => {
              const cwd = filePath.replace('/package.json', '');

              console.log(`${cwd}: Started`);
              exec(`yarn add @graphql-codegen/cli@${codegenCLIversion}; yarn codegen`, { cwd }, (err, stdout) => {
                if (err) {
                  reject(`${cwd}: ${err}`);
                } else {
                  console.log(`${cwd}: Finished \n${stdout}`);
                  resolve();
                }
              });
            })
        )
      );
    })
    .then(null, errors => errors.map(console.error));
})();
