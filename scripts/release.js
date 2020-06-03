/* eslint-disable no-console */
const { argv } = require('yargs');
const { sync: glob } = require('globby');
const { writeFile, readJSON, writeJSON } = require('fs-extra');
const { resolve, dirname, join } = require('path');
const semver = require('semver');
const cp = require('child_process');
const { cwd } = require('process');

const pLimit = require('p-limit');
 
const limit = pLimit(5);

async function release() {

    const rootPackageJson = await readJSON(join(__dirname, '../package.json'));

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

    const workspacePackageGlobs = Array.isArray(rootPackageJson.workspaces) ? rootPackageJson.workspaces : rootPackageJson.workspaces.packages;
    
    const workspacePackageJsonGlobs = workspacePackageGlobs.map(workspace => workspace + '/package.json');

    // Deduplicate using set
    const packageJsonPaths = glob(workspacePackageJsonGlobs).map(packageJsonPath => resolve(cwd(), packageJsonPath));
    
    const packageNames = new Set();
    const arr = [];
    const packageJsons = await Promise.all(packageJsonPaths.map(async packageJsonPath => {
        const json = await readJSON(packageJsonPath);
        if(packageNames.has(json.name)) {
            throw new Error(`You have ${json.name} package more then once!`)
        }
        packageNames.add(json.name);
        arr.push(json.name)
        return {
            path: packageJsonPath,
            content: json,
        };
    }));

    rootPackageJson.version = version;
    await writeFile(resolve(__dirname, '../package.json'), JSON.stringify(rootPackageJson, null, 2));

    async function handleDependencies(dependencies = {}) {
        return Promise.all(Object.keys(dependencies).map(async dependency => {
            if (packageNames.has(dependency)) {
                dependencies[dependency] = version;
            }
        }));
    }

    await Promise.all(packageJsons.map(({ path: packageJsonPath, content: packageJson }) => limit(async () => {
        packageJson.version = version;
        await Promise.all([
            handleDependencies(packageJson.dependencies),
            handleDependencies(packageJson.devDependencies),
        ]);
        await writeJSON(packageJsonPath, packageJson, {
            spaces: 2,
        });
        if (!packageJson.private) {
            const distDirName = (packageJson.publishConfig && packageJson.publishConfig.directory) || 'dist';
            const distPath = join(dirname(packageJsonPath), distDirName);

            // Fix package.json in dist directory
            const distPackageJsonPath = join(distPath, 'package.json');
            const distPackageJson = await readJSON(distPackageJsonPath);
            distPackageJson.name = packageJson.name;
            distPackageJson.version = packageJson.version;
            distPackageJson.dependencies = packageJson.dependencies;
            distPackageJson.devDependencies = packageJson.devDependencies;
            distPackageJson.publishConfig = {
                access: (packageJson.publishConfig && packageJson.publishConfig.access) || 'public'
            }
            await writeJSON(distPackageJsonPath, distPackageJson, {
                spaces: 2,
            });
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
    })));
    console.info(`Released successfully!`);
    console.info(`${tag} => ${version}`);
}

release().catch(err => {
    console.error(err);
    process.exit(1);
});
