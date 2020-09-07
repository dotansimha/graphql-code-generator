import chalk from 'chalk';
import { resolve, relative } from 'path';
import { writeFileSync, readFileSync } from 'fs';
import { Types } from '@graphql-codegen/plugin-helpers';
import detectIndent from 'detect-indent';
import { Answers } from './types';

// Parses config and writes it to a file
export async function writeConfig(answers: Answers, config: Types.Config) {
  const YAML = await import('json-to-pretty-yaml').then(m => ('default' in m ? m.default : m));
  const ext = answers.config.toLocaleLowerCase().endsWith('.json') ? 'json' : 'yml';
  const content = ext === 'json' ? JSON.stringify(config) : YAML.stringify(config);
  const fullPath = resolve(process.cwd(), answers.config);
  const relativePath = relative(process.cwd(), answers.config);

  writeFileSync(fullPath, content, {
    encoding: 'utf-8',
  });

  return {
    relativePath,
    fullPath,
  };
}

// Updates package.json (script and plugins as dependencies)
export async function writePackage(answers: Answers, configLocation: string) {
  // script
  const pkgPath = resolve(process.cwd(), 'package.json');
  const pkgContent = readFileSync(pkgPath, {
    encoding: 'utf-8',
  });
  const pkg = JSON.parse(pkgContent);
  const { indent } = detectIndent(pkgContent);

  if (!pkg.scripts) {
    pkg.scripts = {};
  }

  pkg.scripts[answers.script] = `graphql-codegen --config ${configLocation}`;

  // plugin
  if (!pkg.devDependencies) {
    pkg.devDependencies = {};
  }

  // read codegen's version
  let version: string;

  const dynamicImport = (m: string) => import(m).then(m => ('default' in m ? m.default : m));
  try {
    // Works in tests
    const packageJson = await dynamicImport('../../package.json');
    version = packageJson.version;
  } catch (e) {
    // Works in production (package dist is flat, everything is in the same folder)
    const packageJson = await dynamicImport('./package.json');
    version = packageJson.version;
  }

  answers.plugins.forEach(plugin => {
    pkg.devDependencies[plugin.package] = version;
  });

  if (answers.introspection) {
    pkg.devDependencies['@graphql-codegen/introspection'] = version;
  }

  // If cli haven't installed yet
  pkg.devDependencies['@graphql-codegen/cli'] = version;

  writeFileSync(pkgPath, JSON.stringify(pkg, null, indent));
}

export function bold(str: string) {
  return chalk.bold(str);
}

export function grey(str: string) {
  return chalk.grey(str);
}

export function italic(str: string) {
  return chalk.italic(str);
}
