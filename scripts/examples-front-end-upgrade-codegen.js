/* eslint-disable no-console */
const { writeFileSync } = require('fs');
const { resolve } = require('path');
const { argv, cwd } = require('process');
const { exec } = require('child_process');

// Usage: node ./scripts/examples-front-end-upgrade-codegen.js 2.12.0-alpha-20220830143058-6693f3074 1.0.1-alpha-20220830093424-2a4853976

(async function () {
  // eslint-disable-next-line import/no-extraneous-dependencies
  const { globby } = await import('globby');

  const codegenCLIversion = argv[2];
  const clientPresetVersion = argv[3];

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
              exec(
                `yarn add @graphql-codegen/cli@${codegenCLIversion} @graphql-codegen/client-preset@${clientPresetVersion}; yarn codegen`,
                { cwd },
                (err, stdout) => {
                  if (err) {
                    reject(`${cwd}: ${err}`);
                  } else {
                    console.log(`${cwd}: Finished \n${stdout}`);
                    resolve();
                  }
                }
              );
            })
        )
      );
    })
    .then(null, errors => errors.map(console.error));
})();
