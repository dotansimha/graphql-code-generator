const { resolve, join } = require('path');
const rollup = require('rollup');
const generatePackageJson = require('rollup-plugin-generate-package-json');
const autoExternal = require('rollup-plugin-auto-external');
const resolveNode = require('@rollup/plugin-node-resolve');
const globby = require('globby');
const pLimit = require('p-limit');
const fs = require('fs-extra');

async function build(packagePath) {
  const cwd = packagePath.replace('/package.json', '');
  const pkg = await readPackageJson(cwd);
  const name = pkg.name.replace('@graphql-codegen/', '');

  const distProjectDir = cwd.replace('packages', 'dist');
  const distProjectSrcDir = resolve(distProjectDir, 'src');

  const bobDir = resolve(process.cwd(), 'bob');
  const bobProjectDir = resolve(bobDir, name);

  // remove bob/<project-name>
  await fs.remove(bobProjectDir);

  const inputFile = resolve(distProjectSrcDir, 'index.js');

  const inputOptions = {
    input: inputFile,
    plugins: [
      resolveNode(),
      autoExternal({ packagePath, builtins: true, dependencies: true, peerDependencies: true }),
      generatePackageJson({
        baseContents: rewritePackageJson({
          pkg,
          preserved: [],
        }),
        additionalDependencies: Object.keys(pkg.dependencies || {}),
      }),
    ],
    inlineDynamicImports: true,
  };

  // create a bundle
  const bundle = await rollup.rollup(inputOptions);

  // generates

  const commonOutputOptions = {
    preferConst: true,
    sourcemap: true,
  };

  const generates = [
    {
      ...commonOutputOptions,
      file: join(bobProjectDir, 'index.cjs.js'),
      format: 'cjs',
    },
    {
      ...commonOutputOptions,
      file: join(bobProjectDir, 'index.esm.js'),
      format: 'esm',
    },
  ];

  const declarations = await globby('*.d.ts', {
    cwd: distProjectSrcDir,
    ignore: ['**/node_modules/**'],
  });

  const limit = pLimit(200);

  await Promise.all(
    generates.map(async outputOptions => {
      await bundle.write(outputOptions);
    })
  );

  await Promise.all(
    declarations.map(file => limit(() => fs.copy(join(distProjectSrcDir, file), join(bobProjectDir, file))))
  );

  if (pkg.buildOptions.bin) {
    await Promise.all(
      Object.keys(pkg.buildOptions.bin).map(async alias => {
        const options = pkg.buildOptions.bin[alias];
        const binPath = resolve(distProjectSrcDir, options.input.replace('src/', '').replace('.ts', '.js'));
        const inputOptions = {
          input: binPath,
          plugins: [
            resolveNode(),
            autoExternal({ packagePath, builtins: true, dependencies: true, peerDependencies: true }),
          ],
          inlineDynamicImports: true,
        };

        const bundle = await rollup.rollup(inputOptions);

        await bundle.write({
          banner: `#!/usr/bin/env node`,
          preferConst: true,
          sourcemap: options.sourcemap,
          file: join(bobProjectDir, pkg.bin[alias].replace('dist/', '')),
          format: 'cjs',
        });
      })
    );
  }

  // remove <project>/dist
  await fs.remove(join(cwd, 'dist'));
  // move bob/<project-name> to <project>/dist
  await fs.move(bobProjectDir, join(cwd, 'dist'));
}

async function main() {
  const limit = pLimit(4);
  const packages = await globby('packages/**/package.json', {
    cwd: process.cwd(),
    absolute: true,
    ignore: ['**/node_modules/**', '**/dist/**'],
  });

  await Promise.all(packages.map(package => limit(() => build(package))));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

//

async function readPackageJson(baseDir) {
  return JSON.parse(
    await fs.readFile(resolve(baseDir, 'package.json'), {
      encoding: 'utf-8',
    })
  );
}

function rewritePackageJson({ pkg, preserved }) {
  const newPkg = {};
  const fields = [
    'name',
    'version',
    'description',
    'sideEffects',
    'peerDependencies',
    'repository',
    'homepage',
    'keywords',
    'author',
    'license',
    'engines',
  ];

  if (preserved) {
    fields.push(...preserved);
  }

  fields.forEach(field => {
    if (pkg[field]) {
      newPkg[field] = pkg[field];
    }
  });

  newPkg.main = 'index.cjs.js';
  newPkg.module = 'index.esm.js';
  newPkg.typings = 'index.d.ts';
  newPkg.typescript = {
    definition: newPkg.typings,
  };

  if (pkg.bin) {
    newPkg.bin = {};

    for (const alias in pkg.bin) {
      newPkg.bin[alias] = pkg.bin[alias].replace('src/', '');
    }
  }

  return newPkg;
}
