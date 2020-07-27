/* eslint-disable no-console */
const { argv } = require('yargs');
const { writeJSON, readJSON, existsSync } = require('fs-extra');
const { join } = require('path');
const semver = require('semver');
const cp = require('child_process');
const npm = require('npm');
const limit = require('p-limit')(5);

function readWorkspaceInfo() {
  const rawOutput = cp.execSync(`yarn workspaces info`).toString();
  const lines = rawOutput.split('\n');
  lines.shift();
  lines.pop();
  lines.pop();

  return JSON.parse(lines.join('\n'));
}

async function readPackage(path) {
  const packagePath = join(path, './package.json');

  return readJSON(packagePath);
}

async function writePackage(path, content) {
  if (argv.dryrun) {
    return;
  }

  const packagePath = join(path, './package.json');
  await writeJSON(packagePath, content, { spaces: 2, replacer: null });
}

async function getNewVersion() {
  let version = argv._[0] || process.env.RELEASE_VERSION || await getMostRecentStable();

  if (version.startsWith('v')) {
    version = version.replace('v', '')
  }

  if (argv.canary) {
    const gitHash = cp.spawnSync('git', ['rev-parse', '--short', 'HEAD']).stdout.toString().trim();
    version = semver.inc(version, 'prerelease', true, 'alpha-' + gitHash);
  }

  return version;
}

async function getMostRecentStable() {
  return new Promise((resolve, reject) => {
    npm.view(`@graphql-codegen/cli`, 'version', (err, res) => {
      if (err) {
        return reject(err)
      } else {
        resolve(Object.keys(res)[0]);
      }
    })
  })
}

async function bumpDependencies(availableSiblings, newVersion, dependencies = {}) {
  return Promise.all(Object.keys(dependencies).map(async dependency => {
    if (availableSiblings.includes(dependency)) {
      dependencies[dependency] = newVersion;
    }
  }));
}

async function publishDirectory(directory) {
  if (argv.dryrun) {
    return;
  }

  return new Promise((resolve, reject) => {
    npm.publish(directory, (err, result) => {
      if (err) {
        if (err.toString().includes('You cannot publish over the previously published versions')) {
          resolve({});
        } else {
          reject(err);
        }
      } else {
        resolve(result);
      }
    })
  });
}

async function release() {
  const version = await getNewVersion();
  const workspaceInfo = readWorkspaceInfo();
  const packages = new Map();

  // Get all package.json content from dist/
  await Promise.all(
    Object.keys(workspaceInfo).map(async packageName => {
      const distPath = join(workspaceInfo[packageName].location, `./dist/`);
      const packagePath = existsSync(distPath) ? distPath : workspaceInfo[packageName].location;
      const packageContent = await readPackage(packagePath);

      if (!packageContent.private) {

        if (packages.has(packageName)) {
          throw new Error(`Package ${packageName} seems to be duplicated! Locations: ${[
            packages.get(packageName).path,
            packagePath,
          ].join('\n')}`)
        }

        packages.set(packageName, {
          path: packagePath,
          content: packageContent,
        });
      }
    })
  );

  // Bump all package.json files and publish
  const availableSiblings = Array.from(packages.keys());
  await Promise.all(
    Array.from(packages.entries()).map(([packageName, { path, content }]) => limit(async () => {
      console.info(`Updating and publishing package: ${packageName} from package; ${path}`)
      content.version = version;
      content.publishConfig = { access: 'public', tag: content.version.includes('alpha') ? 'alpha' : 'latest' };

      bumpDependencies(availableSiblings, version, content.dependencies);

      if (content.devDependencies) {
        delete content.devDependencies;
      }

      await writePackage(path, content);
      await publishDirectory(path);
    }))
  );

  return version;
}

const initNpm = new Promise((resolve, reject) => {
  npm.load({}, err => {
    if (err) {
      reject(err);
    } else {
      resolve();
    }
  })
});

initNpm.then(() => release()).then(version => {
  console.info(`Published => ${version}`)
}).catch(err => {
  console.error(err);
  process.exit(1);
});
