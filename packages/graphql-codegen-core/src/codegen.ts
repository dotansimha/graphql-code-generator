import { DetailedError, Types, isComplexPluginOutput, federationSpec } from '@graphql-codegen/plugin-helpers';
import { visit, parse, DefinitionNode, Kind, print } from 'graphql';
import { executePlugin } from './execute-plugin';
import { checkValidationErrors, validateGraphQlDocuments, printSchemaWithDirectives } from '@graphql-toolkit/common';

import { mergeSchemas } from '@graphql-toolkit/schema-merging';

export async function codegen(options: Types.GenerateOptions): Promise<string> {
  const documents = options.documents || [];

  if (documents.length > 0 && !options.skipDocumentsValidation) {
    validateDuplicateDocuments(documents);
  }

  const pluginPackages = Object.keys(options.pluginMap).map(key => options.pluginMap[key]);

  if (!options.schemaAst) {
    options.schemaAst = mergeSchemas({
      schemas: [],
      typeDefs: [options.schema],
      convertExtensions: true,
      assumeValid: true,
      assumeValidSDL: true,
      ...options.config,
    });
  }

  // merged schema with parts added by plugins
  let schemaChanged = false;
  let schemaAst = pluginPackages.reduce((schemaAst, plugin) => {
    const addToSchema = typeof plugin.addToSchema === 'function' ? plugin.addToSchema(options.config) : plugin.addToSchema;

    if (!addToSchema) {
      return schemaAst;
    }

    return mergeSchemas({
      schemas: [schemaAst],
      typeDefs: [addToSchema],
    });
  }, options.schemaAst);

  const federationInConfig = pickFlag('federation', options.config);
  const isFederation = prioritize(federationInConfig, false);

  if (isFederation && !schemaAst.getDirective('external') && !schemaAst.getDirective('requires') && !schemaAst.getDirective('provides') && !schemaAst.getDirective('key')) {
    schemaChanged = true;
    schemaAst = mergeSchemas({
      schemas: [schemaAst],
      typeDefs: [federationSpec],
      convertExtensions: true,
      assumeValid: true,
      assumeValidSDL: true,
    });
  }

  if (schemaChanged) {
    options.schema = parse(printSchemaWithDirectives(schemaAst));
  }

  const skipDocumentValidation = typeof options.config === 'object' && !Array.isArray(options.config) && options.config.skipDocumentsValidation;

  if (options.schemaAst && documents.length > 0 && !skipDocumentValidation) {
    const extraFragments: { importFrom: string; node: DefinitionNode }[] = options.config && (options.config as any).externalFragments ? (options.config as any).externalFragments : [];
    const errors = await validateGraphQlDocuments(options.schemaAst, [...documents, ...extraFragments.map(f => ({ location: f.importFrom, document: { kind: Kind.DOCUMENT, definitions: [f.node] } }))]);
    checkValidationErrors(errors);
  }

  const prepend: Set<string> = new Set<string>();
  const append: Set<string> = new Set<string>();

  const output = await Promise.all(
    options.plugins.map(async plugin => {
      const name = Object.keys(plugin)[0];
      const pluginPackage = options.pluginMap[name];
      const pluginConfig = plugin[name] || {};

      const execConfig =
        typeof pluginConfig !== 'object'
          ? pluginConfig
          : {
              ...options.config,
              ...pluginConfig,
            };

      const result = await executePlugin(
        {
          name,
          config: execConfig,
          parentConfig: options.config,
          schema: options.schema,
          schemaAst,
          documents: options.documents,
          outputFilename: options.filename,
          allPlugins: options.plugins,
          skipDocumentsValidation: options.skipDocumentsValidation,
        },
        pluginPackage
      );

      if (typeof result === 'string') {
        return result || '';
      } else if (isComplexPluginOutput(result)) {
        if (result.append && result.append.length > 0) {
          for (const item of result.append) {
            append.add(item);
          }
        }

        if (result.prepend && result.prepend.length > 0) {
          for (const item of result.prepend) {
            prepend.add(item);
          }
        }
        return result.content || '';
      }

      return '';
    })
  );

  return [...sortPrependValues(Array.from(prepend.values())), ...output, ...append.values()].join('\n');
}

function resolveCompareValue(a: string) {
  if (a.startsWith('/*') || a.startsWith('//') || a.startsWith(' *') || a.startsWith(' */') || a.startsWith('*/')) {
    return 0;
  } else if (a.startsWith('package')) {
    return 1;
  } else if (a.startsWith('import')) {
    return 2;
  } else {
    return 3;
  }
}

export function sortPrependValues(values: string[]): string[] {
  return values.sort((a: string, b: string) => {
    const aV = resolveCompareValue(a);
    const bV = resolveCompareValue(b);

    if (aV < bV) {
      return -1;
    }
    if (aV > bV) {
      return 1;
    }

    return 0;
  });
}

function validateDuplicateDocuments(files: Types.DocumentFile[]) {
  // duplicated names
  const operationMap: {
    [name: string]: {
      paths: Set<string>;
      contents: Set<string>;
    };
  } = {};

  files.forEach(file => {
    visit(file.document, {
      OperationDefinition(node) {
        if (typeof node.name !== 'undefined') {
          if (!operationMap[node.name.value]) {
            operationMap[node.name.value] = {
              paths: new Set(),
              contents: new Set(),
            };
          }

          operationMap[node.name.value].paths.add(file.location);
          operationMap[node.name.value].contents.add(print(node));
        }
      },
    });
  });

  const names = Object.keys(operationMap);

  if (names.length) {
    const duplicated = names.filter(name => operationMap[name].contents.size > 1);

    if (!duplicated.length) {
      return;
    }

    const list = duplicated
      .map(name =>
        `
      * ${name} found in:
        ${[...operationMap[name].paths]
          .map(filepath => {
            return `
            - ${filepath}
          `.trimRight();
          })
          .join('')}
  `.trimRight()
      )
      .join('');
    throw new DetailedError(
      `Not all operations have an unique name: ${duplicated.join(', ')}`,
      `
        Not all operations have an unique name
        ${list}
      `
    );
  }
}

function isObjectMap(obj: any): obj is Types.ObjectMap<any> {
  return obj && typeof obj === 'object' && !Array.isArray(obj);
}

function prioritize<T>(...values: T[]): T {
  const picked = values.find(val => typeof val === 'boolean');

  if (typeof picked !== 'boolean') {
    return values[values.length - 1];
  }

  return picked;
}

function pickFlag(flag: string, config: Types.PluginConfig): boolean | undefined {
  return isObjectMap(config) ? (config as any)[flag] : undefined;
}
