import { readFileSync, writeFileSync } from 'fs';
import { relative, resolve } from 'path';
import generate from '@babel/generator';
import template from '@babel/template';
import * as t from '@babel/types';
import { Types } from '@graphql-codegen/plugin-helpers';
import chalk from 'chalk';
import detectIndent from 'detect-indent';
import { getLatestVersion } from '../utils/get-latest-version.js';
import { Answers, Tags } from './types.js';

function jsObjectToBabelObjectExpression<T extends object>(obj: T): ReturnType<typeof t.objectExpression> {
  const objExp = t.objectExpression([]);

  Object.entries(obj).forEach(([key, val]) => {
    if (Array.isArray(val)) {
      objExp.properties.push(
        t.objectProperty(
          /^[a-zA-Z0-9]+$/.test(key) ? t.identifier(key) : t.stringLiteral(key),
          t.arrayExpression(
            val.map(v => (typeof v === 'object' ? jsObjectToBabelObjectExpression(v as object) : t.valueToNode(v)))
          )
        )
      );
    } else {
      objExp.properties.push(
        t.objectProperty(
          /^[a-zA-Z0-9]+$/.test(key) ? t.identifier(key) : t.stringLiteral(key),
          typeof val === 'object' ? jsObjectToBabelObjectExpression(val as unknown as object) : t.valueToNode(val)
        )
      );
    }
  });

  return objExp;
}

// Parses config and writes it to a file
export async function writeConfig(answers: Answers, config: Types.Config) {
  const YAML = await import('json-to-pretty-yaml').then(m => ('default' in m ? m.default : m));
  const ext = answers.config.toLocaleLowerCase().split('.')[1];
  const fullPath = resolve(process.cwd(), answers.config);
  const relativePath = relative(process.cwd(), answers.config);
  let content: string;

  if (ext === 'ts') {
    const buildRequire = template.statement(`%%config%%`);

    const ast = buildRequire({
      config: jsObjectToBabelObjectExpression(config),
    });

    content = `
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = ${generate(ast).code.replace(/\(|\)/g, '')}

export default config;
`;
  } else {
    content = ext === 'json' ? JSON.stringify(config) : YAML.stringify(config);
  }
  writeFileSync(fullPath, content, 'utf8');

  return {
    relativePath,
    fullPath,
  };
}

// Updates package.json (script and plugins as dependencies)
export async function writePackage(answers: Answers, configLocation: string) {
  // script
  const pkgPath = resolve(process.cwd(), 'package.json');
  const pkgContent = readFileSync(pkgPath, 'utf8');
  const pkg = JSON.parse(pkgContent);
  const { indent } = detectIndent(pkgContent);

  pkg.scripts ||= {};

  pkg.scripts[answers.script] = `graphql-codegen --config ${configLocation}`;

  // plugin
  pkg.devDependencies ||= {};

  await Promise.all(
    (answers.plugins || []).map(async plugin => {
      pkg.devDependencies[plugin.package] = await getLatestVersion(plugin.package);
    })
  );

  if (answers.introspection) {
    pkg.devDependencies['@graphql-codegen/introspection'] = await getLatestVersion('@graphql-codegen/introspection');
  }

  pkg.devDependencies['@graphql-codegen/cli'] = await getLatestVersion('@graphql-codegen/cli');
  if (answers.targets.includes(Tags.client)) {
    pkg.devDependencies['@graphql-codegen/client-preset'] = await getLatestVersion('@graphql-codegen/client-preset');
  }

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
