/* eslint-disable no-console */
const semver = require('semver');
const cp = require('child_process');

const { read: readConfig } = require("@changesets/config");
const readChangesets = require("@changesets/read").default;
const assembleReleasePlan = require("@changesets/assemble-release-plan").default;
const applyReleasePlan = require("@changesets/apply-release-plan").default;
const { getPackages } = require("@manypkg/get-packages");

function getNewVersion(version, type) {
  const gitHash = cp.spawnSync('git', ['rev-parse', '--short', 'HEAD']).stdout.toString().trim();
  
  return semver.inc(version, `pre${type}`, true, 'alpha-' + gitHash);
}

async function updateVersions() {
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
}

updateVersions().then(() => {
  console.info(`Done!`)
}).catch(err => {
  console.error(err);
  process.exit(1);
});
