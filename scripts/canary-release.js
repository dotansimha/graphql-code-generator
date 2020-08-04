/* eslint-disable no-console */
const { argv } = require('yargs');
const { writeJSON, readJSON, existsSync } = require('fs-extra');
const { join } = require('path');
const semver = require('semver');
const cp = require('child_process');
const npm = require('npm');

const { read: readConfig } = require("@changesets/config");
const readChangesets = require("@changesets/read").default;
const assembleReleasePlan = require("@changesets/assemble-release-plan").default;
const applyReleasePlan = require("@changesets/apply-release-plan").default;
const { getPackages } = require("@manypkg/get-packages");

function getNewVersion(version, type) {
  const gitHash = cp.spawnSync('git', ['rev-parse', '--short', 'HEAD']).stdout.toString().trim();
  
  if (type === 'major' || type === 'minor') {
    version = semver.inc(version, type);
  }

  return semver.inc(version, 'prerelease', true, 'alpha-' + gitHash);
}

async function release() {
  const cwd = process.cwd();
  const packages = await getPackages(cwd);
  const config = await readConfig(cwd, packages);
  const changesets = await readChangesets(cwd);

  if (changesets.length === 0) {
    console.warn(`Unable to find any relevant package for canary publishing. Please make sure changesets exists!`);
  } else {
    const releasePlan = assembleReleasePlan(changesets, packages, config, [], false);
    
    if (releasePlan.releases.length === 0) {
      console.warn(`Unable to find any relevant package for canary releasing. Please make sure changesets exists!`);
    } else {
      for (const release of releasePlan.releases) {
        if (release.type !== 'none') {
          release.newVersion = getNewVersion(release.oldVersion, release.type);

        }
      }

      await applyReleasePlan(
        releasePlan,
        packages,
        {
          ...config,
          commit: false,
        },
        false,
        true
      );
    }
  }
  process.exit();

  // const version = await getNewVersion();
  // const workspaceInfo = readWorkspaceInfo();
  // const packages = new Map();

  // // Get all package.json content from dist/
  // await Promise.all(
  //   Object.keys(workspaceInfo).map(async packageName => {
  //     const distPath = join(workspaceInfo[packageName].location, `./dist/`);
  //     const packagePath = existsSync(distPath) ? distPath : workspaceInfo[packageName].location;
  //     const packageContent = await readPackage(packagePath);

  //     if (!packageContent.private) {

  //       if (packages.has(packageName)) {
  //         throw new Error(`Package ${packageName} seems to be duplicated! Locations: ${[
  //           packages.get(packageName).path,
  //           packagePath,
  //         ].join('\n')}`)
  //       }

  //       packages.set(packageName, {
  //         path: packagePath,
  //         content: packageContent,
  //       });
  //     }
  //   })
  // );

  // // Bump all package.json files and publish
  // const availableSiblings = Array.from(packages.keys());
  // await Promise.all(
  //   Array.from(packages.entries()).map(([packageName, { path, content }]) => limit(async () => {
  //     console.info(`Updating and publishing package: ${packageName} from package; ${path}`)
  //     content.version = version;
  //     content.publishConfig = { access: 'public', tag: content.version.includes('alpha') ? 'alpha' : 'latest' };

  //     bumpDependencies(availableSiblings, version, content.dependencies);

  //     if (content.devDependencies) {
  //       delete content.devDependencies;
  //     }

  //     await writePackage(path, content);
  //     await publishDirectory(path);
  //   }))
  // );

  // return version;
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
