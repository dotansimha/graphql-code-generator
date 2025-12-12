import { writeFileSync } from 'node:fs';
import semver from 'semver';
import { PACKAGES } from '../plugins/packages.js';

interface PackageInfo {
  readme: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  weeklyNPMDownloads: number;
}

const fetchPackageInfo = async (packageName: string): Promise<PackageInfo> => {
  const NO_NPM_README_PLACEHOLDER = 'ERROR: No README data found!';

  const encodedName = encodeURIComponent(packageName);
  console.debug(`Loading NPM package info: ${packageName}`);
  const [packageInfo, { downloads }] = await Promise.all([
    fetch(`https://registry.npmjs.org/${encodedName}`).then(response => response.json()),
    fetch(`https://api.npmjs.org/downloads/point/last-week/${encodedName}`).then(response => response.json()),
  ]);
  const { readme, time, description } = packageInfo;
  const latestVersion = packageInfo['dist-tags'].latest;

  return {
    readme:
      (readme !== NO_NPM_README_PLACEHOLDER && readme) || // for some reason top level "readme" can be empty string, so we get the latest version readme
      Object.values(packageInfo.versions as { readme?: string; version: string }[])
        .reverse()
        .find(curr => {
          const isReadmeExist = curr.readme && curr.readme !== NO_NPM_README_PLACEHOLDER;
          if (isReadmeExist) {
            return semver.lte(curr.version, latestVersion);
          }
        })?.readme ||
      '',
    createdAt: time.created,
    updatedAt: time.modified,
    description,
    weeklyNPMDownloads: downloads,
  };
};

const result: Record<string, PackageInfo> = {};
for (let [identifier, pkg] of Object.entries(PACKAGES)) {
  const packageInfo = await fetchPackageInfo(pkg.npmPackage);
  result[identifier] = packageInfo;
}

writeFileSync('./src/lib/npm/packages-info.generated.ts', `export const packagesInfo= ${JSON.stringify(result)}`, {
  encoding: 'utf8',
});
