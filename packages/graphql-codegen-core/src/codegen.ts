import { Types, isComplexPluginOutput } from '@graphql-codegen/plugin-helpers';
import { DocumentNode, visit } from 'graphql';
import { mergeSchemas } from './merge-schemas';
import { executePlugin } from './execute-plugin';
import { DetailedError } from './errors';

export async function codegen(options: Types.GenerateOptions): Promise<string> {
  let output = '';

  validateDocuments(options.schema, options.documents);

  const pluginPackages = Object.keys(options.pluginMap).map(key => options.pluginMap[key]);

  // merged schema with parts added by plugins
  const schema = pluginPackages.reduce((schema, plugin) => {
    return !plugin.addToSchema ? schema : mergeSchemas([schema, plugin.addToSchema]);
  }, options.schema);

  const prepend: Set<string> = new Set<string>();
  const append: Set<string> = new Set<string>();

  for (const plugin of options.plugins) {
    const name = Object.keys(plugin)[0];
    const pluginPackage = options.pluginMap[name];
    const pluginConfig = plugin[name];

    const result = await executePlugin(
      {
        name,
        config:
          typeof pluginConfig !== 'object'
            ? pluginConfig
            : {
                ...options.config,
                ...(pluginConfig as object),
              },
        schema,
        documents: options.documents,
        outputFilename: options.filename,
        allPlugins: options.plugins,
      },
      pluginPackage
    );

    if (typeof result === 'string') {
      output += result;
    } else if (isComplexPluginOutput(result)) {
      output += result.content;

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
    }
  }

  return [...prepend.values(), output, ...append.values()].join('\n');
}

function validateDocuments(schema: DocumentNode, files: Types.DocumentFile[]) {
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
