import { Types, isComplexPluginOutput, turnExtensionsIntoObjectTypes, federationSpec } from '@graphql-codegen/plugin-helpers';
import { visit, buildASTSchema } from 'graphql';
import { mergeSchemas } from './merge-schemas';
import { executePlugin } from './execute-plugin';
import { DetailedError } from './errors';
import { checkValidationErrors, validateGraphQlDocuments } from '@graphql-toolkit/common';
import { Kind } from 'graphql';

export async function codegen(options: Types.GenerateOptions): Promise<string> {
  const documents = options.documents || [];

  if (documents.length > 0 && !options.skipDocumentsValidation) {
    validateDuplicateDocuments(documents);
  }

  const pluginPackages = Object.keys(options.pluginMap).map(key => options.pluginMap[key]);

  // merged schema with parts added by plugins
  let schemaChanged = false;
  let schema = pluginPackages.reduce((schema, plugin) => {
    const addToSchema = typeof plugin.addToSchema === 'function' ? plugin.addToSchema(options.config) : plugin.addToSchema;

    if (!addToSchema) {
      return schema;
    }

    schemaChanged = true;

    return mergeSchemas([schema, addToSchema]);
  }, options.schema);

  const federationInConfig = pickFlag('federation', options.config);
  const isFederation = prioritize(federationInConfig, false);

  if (isFederation) {
    schemaChanged = true;
    if (!schema.definitions.find(definition => definition.kind === 'DirectiveDefinition' && (definition.name.value === 'external' || definition.name.value === 'requires' || definition.name.value === 'provides' || definition.name.value === 'key'))) {
      schema = turnExtensionsIntoObjectTypes(mergeSchemas([schema, federationSpec]));
    }
  }

  if (schemaChanged) {
    options.schemaAst = buildASTSchema(schema, {
      assumeValidSDL: isFederation,
    });
  }

  const skipDocumentValidation = typeof options.config === 'object' && !Array.isArray(options.config) && options.config.skipDocumentsValidation;

  if (options.schemaAst && documents.length > 0 && !skipDocumentValidation) {
    const extraFragments = options.config && (options.config as any)['externalFragments'] ? (options.config as any)['externalFragments'] : [];
    const errors = await validateGraphQlDocuments(options.schemaAst, [
      ...documents.map(({ filePath, content }) => ({ location: filePath, document: content })),
      ...extraFragments.map((f: any) => ({ location: f.importFrom, document: { kind: Kind.DOCUMENT, definitions: [f.node] } })),
    ]);
    checkValidationErrors(errors);
  }

  const prepend: Set<string> = new Set<string>();
  const append: Set<string> = new Set<string>();

  const output$ = Promise.all(
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
          schema,
          schemaAst: options.schemaAst,
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

  const output = await output$;

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
    [name: string]: string[];
  } = {};

  files.forEach(file => {
    visit(file.content, {
      OperationDefinition(node) {
        if (typeof node.name !== 'undefined') {
          if (!operationMap[node.name.value]) {
            operationMap[node.name.value] = [];
          }

          operationMap[node.name.value].push(file.filePath);
        }
      },
    });
  });

  const names = Object.keys(operationMap);

  if (names.length) {
    const duplicated = names.filter(name => operationMap[name].length > 1);

    if (!duplicated.length) {
      return;
    }

    const list = duplicated
      .map(name =>
        `
      * ${name} found in:
        ${operationMap[name]
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
