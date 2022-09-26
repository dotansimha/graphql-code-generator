import chalk from 'chalk';
import { resolve, relative } from 'path';
import { writeFileSync, readFileSync } from 'fs';
import { Types } from '@graphql-codegen/plugin-helpers';
import detectIndent from 'detect-indent';
import { Answers } from './types.js';
import { getLatestVersion } from '../utils/get-latest-version.js';
import template from '@babel/template';
import generate from '@babel/generator';
import * as t from '@babel/types';

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

  await Promise.all(
    (answers.plugins || []).map(async plugin => {
      pkg.devDependencies[plugin.package] = await getLatestVersion(plugin.package);
    })
  );

  if (answers.introspection) {
    pkg.devDependencies['@graphql-codegen/introspection'] = await getLatestVersion('@graphql-codegen/introspection');
  }

  pkg.devDependencies['@graphql-codegen/cli'] = await getLatestVersion('@graphql-codegen/cli');

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
