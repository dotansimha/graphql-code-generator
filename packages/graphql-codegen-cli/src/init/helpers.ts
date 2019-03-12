import chalk from 'chalk';
import { resolve, relative } from 'path';
import { writeFileSync, readFileSync } from 'fs';
import { Types } from 'graphql-codegen-plugin-helpers';
import * as YAML from 'json-to-pretty-yaml';
import * as detectIndent from 'detect-indent';
import { Answers } from './types';

// Parses config and writes it to a file
export function writeConfig(answers: Answers, config: Types.Config) {
  const ext = answers.config.toLocaleLowerCase().endsWith('.json') ? 'json' : 'yml';
  const content = ext === 'json' ? JSON.stringify(config) : YAML.stringify(config);
  const fullPath = resolve(process.cwd(), answers.config);
  const relativePath = relative(process.cwd(), answers.config);

  writeFileSync(fullPath, content, {
    encoding: 'utf-8'
  });

  return {
    relativePath,
    fullPath
  };
}

// Updates package.json (script and plugins as dependencies)
export function writePackage(answers: Answers, configLocation: string) {
  // script
  const pkgPath = resolve(process.cwd(), 'package.json');
  const pkgContent = readFileSync(pkgPath, {
    encoding: 'utf-8'
  });
  const pkg = JSON.parse(pkgContent);
  const { indent } = detectIndent(pkgContent);

  if (!pkg.scripts) {
    pkg.scripts = {};
  }

  pkg.scripts[answers.script] = `gql-gen --config ${configLocation}`;

  // plugin
  if (!pkg.devDependencies) {
    pkg.devDependencies = {};
  }

  // read codegen's version
  const { version } = JSON.parse(
    readFileSync(resolve(__dirname, '../../package.json'), {
      encoding: 'utf-8'
    })
  );

  answers.plugins.forEach(plugin => {
    pkg.devDependencies[plugin.package] = version;
  });

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
