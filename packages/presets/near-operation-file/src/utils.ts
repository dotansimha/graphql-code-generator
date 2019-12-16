import { parse, dirname, relative, join, isAbsolute } from 'path';
import { DocumentNode, visit, FragmentSpreadNode, FragmentDefinitionNode } from 'graphql';
import { FragmentRegistry } from './fragment-resolver';

export function defineFilepathSubfolder(baseFilePath: string, folder: string) {
  const parsedPath = parse(baseFilePath);
  return join(parsedPath.dir, folder, parsedPath.base).replace(/\\/g, '/');
}

export function appendExtensionToFilePath(baseFilePath: string, extension: string) {
  const parsedPath = parse(baseFilePath);

  return join(parsedPath.dir, parsedPath.name + extension).replace(/\\/g, '/');
}

export function clearExtension(path: string): string {
  const parsedPath = parse(path);

  return join(parsedPath.dir, parsedPath.name).replace(/\\/g, '/');
}

// todo move to fragment-resolver
export function extractExternalFragmentsInUse(
  documentNode: DocumentNode | FragmentDefinitionNode,
  fragmentNameToFile: FragmentRegistry,
  result: { [fragmentName: string]: number } = {},
  ignoreList: Set<string> = new Set(),
  level = 0
): { [fragmentName: string]: number } {
  // First, take all fragments definition from the current file, and mark them as ignored
  visit(documentNode, {
    enter: {
      FragmentDefinition: (node: FragmentDefinitionNode) => {
        ignoreList.add(node.name.value);
      },
    },
  });

  // Then, look for all used fragments in this document
  visit(documentNode, {
    enter: {
      FragmentSpread: (node: FragmentSpreadNode) => {
        if (!ignoreList.has(node.name.value)) {
          result[node.name.value] = level;

          if (fragmentNameToFile[node.name.value]) {
            extractExternalFragmentsInUse(fragmentNameToFile[node.name.value].node, fragmentNameToFile, result, ignoreList, level + 1);
          }
        }
      },
    },
  });

  return result;
}

export function fixLocalFile(path: string): string {
  if (!path.startsWith('..')) {
    return `./${path}`;
  }

  return path;
}

export function resolveRelativeImport(from: string, to: string): string {
  if (!isAbsolute(from)) {
    throw new Error(`Argument 'from' must be an absolute path, '${from}' given.`);
  }
  if (!isAbsolute(to)) {
    throw new Error(`Argument 'to' must be an absolute path, '${to}' given.`);
  }
  return fixLocalFile(clearExtension(relative(dirname(from), to)));
}

/* mini template parser helpers */

const INTEROPLATE_TEMPLATE_PATTERN = /{{\s*([^}]*)\s*}}/g;

const SINGLE_QUOTE = "'";
const DOUBLE_QUOTE = '"';

function normalize(value: string) {
  if (value.startsWith(SINGLE_QUOTE) && value.endsWith(SINGLE_QUOTE)) {
    const raw = value.slice(1, value.length - 1);
    return DOUBLE_QUOTE + raw.replace(/\\*"/g, '\\"') + DOUBLE_QUOTE;
  }
  return value;
}

function parseVar(expression: string, params: { [vars: string]: any }) {
  let value = params[expression];
  if (value !== undefined) {
    return value;
  }
  try {
    return JSON.parse(normalize(expression));
  } catch (e) {
    // invalid literal expression with no param
    return undefined;
  }
}

function parseExpression(expression: string, resolve: (param: string) => any) {
  let [condition, blocks] = expression.split(/\s*\?\s*/, 2);
  if (!blocks) {
    return resolve(expression);
  }

  let [ifBlock, elseBlock] = blocks.split(/\s*\:\s*/, 2);
  elseBlock = elseBlock.trim(); // other whitespace trimmed by regex

  return resolve(condition) ? resolve(ifBlock) : resolve(elseBlock);
}
/**
 * interpolate a simple template string with the given params
 *
 * ```js
 * interpolate(
 *   "{{foo}}, {{bar}}, {{biz ? bar : 'bang'}}, {{123}}",
 *   { foo: "f1", bar: "b2", biz: false }
 * )
 * // => "f1, b2, bang, 123"
 * ```
 */
export function interpolate(template: string, params: { [vars: string]: any }) {
  const resolve = (expression: string) => parseVar(expression, params);
  return template.replace(INTEROPLATE_TEMPLATE_PATTERN, (matchedSubstring, expression) => parseExpression(expression, resolve));
}
