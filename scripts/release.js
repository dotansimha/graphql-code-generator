const { argv } = require('yargs');
const { sync: glob } = require('globby');
const { writeFile } = require('fs-extra');
const { resolve, dirname, join } = require('path');
const semver = require('semver');
const cp = require('child_process');
const rootPackageJson = require('../package.json');
const { cwd } = require('process');

async function release() {

    let version = process.env.RELEASE_VERSION || rootPackageJson.version;
    if(version.startsWith('v')) {
        version = version.replace('v', '')
    }
    let tag = argv.tag || 'latest';
    if (argv.canary) {
        const gitHash = cp.spawnSync('git', ['rev-parse', '--short', 'HEAD']).stdout.toString().trim();
        version = semver.inc(version, 'prerelease', true, 'alpha-' + gitHash);
        tag = 'canary';
    }

    console.info(`Version: ${version}`);
    console.info(`Tag: ${tag}`);

    const workspaceGlobs = rootPackageJson.workspaces.map(workspace => workspace + '/package.json');

    const packageJsonPaths = glob(workspaceGlobs).map(packageJsonPath => resolve(cwd(), packageJsonPath));

    const packageNames = packageJsonPaths.map(packageJsonPath => require(packageJsonPath).name);

    rootPackageJson.version = version;
    await writeFile(resolve(__dirname, '../package.json'), JSON.stringify(rootPackageJson, null, 2));
    await Promise.all(packageJsonPaths.map(async packageJsonPath => {
        const packageJson = require(packageJsonPath);
        packageJson.version = version;
        for (const dependency in packageJson.dependencies) {
            if (packageNames.includes(dependency)) {
                packageJson.dependencies[dependency] = version;
            }
        }
        for (const dependency in packageJson.devDependencies) {
            if (packageNames.includes(dependency)) {
                packageJson.devDependencies[dependency] = version;
            }
        }
        await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
        if (!packageJson.private) {
            const distDirName = (packageJson.publishConfig && packageJson.publishConfig.directory) || '';
            const distPath = join(dirname(packageJsonPath), distDirName);

            //Fix package.json in dist directory
            const distPackageJsonPath = join(distPath, 'package.json');
            const distPackageJson = require(distPackageJsonPath);
            distPackageJson.name = packageJson.name;
            distPackageJson.version = packageJson.version;
            distPackageJson.dependencies = packageJson.dependencies;
            distPackageJson.devDependencies = packageJson.devDependencies;
            distPackageJson.publishConfig = {
                access: (packageJson.publishConfig && packageJson.publishConfig.access) || 'public'
            }
            await writeFile(distPackageJsonPath, JSON.stringify(distPackageJson, null, 2));
            return new Promise((resolve, reject) => {
                const publishSpawn = cp.spawn('npm', ['publish', distPath, '--tag', tag, '--access', distPackageJson.publishConfig.access]);
                publishSpawn.stdout.on('data', (data) => {
                    console.info(data.toString('utf8'));
                })
                publishSpawn.stderr.on('data', function(message) {
                    console.error(message.toString('utf8'));
                })
                publishSpawn.on("exit", function(code, signal) {
                    if (code !== 0) {
                        reject(new Error(`npm publish exited with code: ${code} and signal: ${signal}`));
                    } else {
                        resolve();
                    }
                });
            });
        }
    }))
    console.info(`Released successfully!`);
    console.info(`${tag} => ${version}`);
}

release().catch(err => {
    console.error(err);
    process.exit(1);
});
