import { readFileSync } from 'node:fs';
import path from 'node:path';
import * as TJS from 'typescript-json-schema';
import { generateDocs } from './docs-generator';
import { pluginsConfigurations, presetsConfigurations } from './plugins-docs';

const tsConfig = JSON.parse(readFileSync(path.join(process.cwd(), 'tsconfig.json'), 'utf8'));

const ROOT_FILE = '../packages/utils/plugins-helpers/src/types.ts';
const ROOT_IDENTIFIER = 'Types.Config';
const MARKDOWN_JSDOC_KEY = 'exampleMarkdown';

export function transformDocs() {
  const program = TJS.getProgramFromFiles(
    [ROOT_FILE, ...[...pluginsConfigurations, ...presetsConfigurations].map(f => f.file)],
    {
      esModuleInterop: true,
      baseUrl: '../../../',
      paths: tsConfig.compilerOptions.paths,
      module: 'esnext',
      target: 'es2018',
      skipLibCheck: true,
      allowSyntheticDefaultImports: true,
      importHelpers: true,
      resolveJsonModule: true,
      moduleResolution: 'node',
      experimentalDecorators: true,
      lib: ['es6', 'esnext', 'es2015', 'dom'],
    }
  );

  const generator = TJS.buildGenerator(program, {
    topRef: true,
    aliasRef: true,
    validationKeywords: [MARKDOWN_JSDOC_KEY],
  });

  if (!generator) {
    throw new Error(`Config-transform: failed to build TS generator...`);
  }

  const schema = generator.getSchemaForSymbols(
    [ROOT_IDENTIFIER, ...pluginsConfigurations.map(f => f.identifier), ...presetsConfigurations.map(f => f.identifier)],
    true
  );

  if (!schema.definitions) {
    throw new Error('Config-transform: "schema.definitions" is not defined');
  }

  // This will make sure to add a nice auto complete for all built-in plugins and their configuration mapped
  schema.definitions.GeneratedPluginsMap = {
    anyOf: [
      {
        type: 'object',
        additionalProperties: true,
        properties: pluginsConfigurations.reduce((prev, plugin) => {
          const refObj = {
            additionalProperties: false,
            $ref: `#/definitions/${plugin.identifier}`,
          };

          return {
            ...prev,
            [plugin.name]: refObj,
            [`@graphql-codegen/${plugin.name}`]: refObj,
          };
        }, {}),
      },
      {
        type: 'string',
        oneOf: pluginsConfigurations.reduce<TJS.DefinitionOrBoolean[]>((prev, p) => {
          const description = `${
            (schema.definitions![p.identifier] as TJS.Definition).description || ''
          }\n\nFor more details and documentation: https://the-guild.dev/graphql/codegen/docs/plugins/${
            p.name
          }\n\n=> Make sure to include "@graphql-codegen/${
            p.name
          }" in your package.json file and install your dependencies.\n\n`;

          return [
            ...prev,
            {
              const: p.name,
              description,
            },
            {
              const: `@graphql-codegen/${p.name}`,
              description,
            },
          ];
        }, []),
      },
      {
        type: 'string',
        description: `Point to a custom plugin loaded from your file-system.`,
        pattern: `(\\\\?([^\\/]*[\\/])*)([^\\/]+)$`,
      },
      {
        type: 'string',
        description: `You can point to any third-party module from node_modules that matches the requirements of a GraphQL Codegen plugin.`,
      },
    ],
  };

  const configuredOutput = schema.definitions['Types.ConfiguredOutput'] as TJS.Definition;
  const configuredPlugin = schema.definitions['Types.ConfiguredPlugin'] as TJS.Definition;

  configuredPlugin.properties = Object.fromEntries(
    pluginsConfigurations.map(pluginConfig => [pluginConfig.name, { $ref: `#/definitions/${pluginConfig.identifier}` }])
  );

  configuredOutput.properties!.config = {
    additionalProperties: true,
  };

  configuredOutput.allOf = pluginsConfigurations.map(p => ({
    if: {
      properties: {
        plugins: {
          contains: {
            type: 'string',
            const: p.name,
          },
        },
      },
    },
    then: {
      properties: {
        config: { $ref: `#/definitions/${p.identifier}` },
      },
    },
  }));

  // Point the root schema to the config root
  schema.$ref = `#/definitions/${ROOT_IDENTIFIER}`;

  const docsMarkdown = generateDocs(schema, [...pluginsConfigurations, ...presetsConfigurations]);

  return {
    docs: docsMarkdown,
    schema,
  };
}
