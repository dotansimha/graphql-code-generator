/**
 * Generates config.schema.json: the JSON Schema for codegen.ts / codegen.yml,
 * assembled from Types.Config and every plugin and preset config type listed
 * in plugin-configs.json. Editors use it for autocomplete, and
 * the-guild.dev/graphql/codegen renders each plugin's Config API Reference
 * from it.
 *
 *   pnpm --filter website generate-config-schema
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import jsonPath from 'jsonpath';
import prettier from 'prettier';
import * as TJS from 'typescript-json-schema';

interface ConfigType {
  /** Path to the file declaring the config type, relative to this folder. */
  file: string;
  /** Exported type name. */
  identifier: string;
  /** Plugin or preset name as used in codegen config. */
  name: string;
}

const CWD = process.cwd();
const REPO_ROOT = join(CWD, '..');
const ROOT_FILE = '../packages/utils/plugins-helpers/src/types.ts';
const ROOT_IDENTIFIER = 'Types.Config';
const MARKDOWN_JSDOC_KEY = 'exampleMarkdown';
const DEFAULT_JSDOC_KEY = 'default';
const OUT_PATH = join(CWD, 'config.schema.json');

const { plugins, presets } = JSON.parse(readFileSync(join(CWD, 'plugin-configs.json'), 'utf8')) as {
  plugins: ConfigType[];
  presets: ConfigType[];
};

function buildSchema(): TJS.Definition {
  const all = [...plugins, ...presets];
  // Workspace packages resolve to their sources through the root tsconfig's
  // path aliases, so the generator does not need the packages built first.
  const rootTsconfig = JSON.parse(readFileSync(join(REPO_ROOT, 'tsconfig.json'), 'utf8')) as {
    compilerOptions: { paths: Record<string, string[]> };
  };
  const program = TJS.getProgramFromFiles([ROOT_FILE, ...all.map(f => f.file)], {
    baseUrl: REPO_ROOT,
    paths: rootTsconfig.compilerOptions.paths,
    // JSON-form options: the library converts them with convertCompilerOptionsFromJson.
    target: 'es2022',
    module: 'esnext',
    moduleResolution: 'node',
    skipLibCheck: true,
    allowSyntheticDefaultImports: true,
    types: ['node'],
    noImplicitAny: false,
    strictNullChecks: false,
  });
  const generator = TJS.buildGenerator(program, {
    aliasRef: true,
    validationKeywords: [MARKDOWN_JSDOC_KEY],
  });
  if (!generator) throw new Error('Failed to build the TypeScript JSON Schema generator');

  const schema = generator.getSchemaForSymbols([ROOT_IDENTIFIER, ...all.map(f => f.identifier)]);
  if (!schema.definitions) throw new Error('"schema.definitions" is not defined');

  // Autocomplete for every plugin name (bare and scoped) and its config.
  schema.definitions.GeneratedPluginsMap = {
    anyOf: [
      {
        type: 'object',
        additionalProperties: true,
        properties: Object.fromEntries(
          plugins.flatMap(plugin => {
            const ref = { additionalProperties: false, $ref: `#/definitions/${plugin.identifier}` };
            return [
              [plugin.name, ref],
              [`@graphql-codegen/${plugin.name}`, ref],
            ];
          }),
        ),
      },
      {
        type: 'string',
        oneOf: plugins.flatMap(plugin => {
          const description = `${
            (schema.definitions![plugin.identifier] as TJS.Definition).description || ''
          }\n\nFor more details and documentation: https://the-guild.dev/graphql/codegen/docs/plugins/${
            plugin.name
          }\n\n=> Make sure to include "@graphql-codegen/${
            plugin.name
          }" in your package.json file and install your dependencies.\n\n`;
          return [
            { const: plugin.name, description },
            { const: `@graphql-codegen/${plugin.name}`, description },
          ];
        }),
      },
      {
        type: 'string',
        description: 'Point to a custom plugin loaded from your file-system.',
        pattern: '(\\\\?([^\\/]*[\\/])*)([^\\/]+)$',
      },
      {
        type: 'string',
        description:
          'You can point to any third-party module from node_modules that matches the requirements of a GraphQL Codegen plugin.',
      },
    ],
  };

  const configuredOutput = schema.definitions['Types.ConfiguredOutput'] as TJS.Definition;
  const configuredPlugin = schema.definitions['Types.ConfiguredPlugin'] as TJS.Definition;
  configuredPlugin.properties = Object.fromEntries(
    plugins.map(plugin => [plugin.name, { $ref: `#/definitions/${plugin.identifier}` }]),
  );
  configuredOutput.properties!.config = { additionalProperties: true };
  configuredOutput.allOf = plugins.map(plugin => ({
    if: { properties: { plugins: { contains: { type: 'string', const: plugin.name } } } },
    then: { properties: { config: { $ref: `#/definitions/${plugin.identifier}` } } },
  }));

  schema.$ref = `#/definitions/${ROOT_IDENTIFIER}`;
  return schema;
}

const schema = buildSchema();
// Usage examples are documentation, not schema.
jsonPath.apply(schema, `$..${MARKDOWN_JSDOC_KEY}`, () => undefined);
// Defaults would be auto-completed as literal values; mention them instead.
jsonPath.apply(schema, '$..*', value => {
  if (value && typeof value === 'object' && value[DEFAULT_JSDOC_KEY] !== undefined) {
    value.description = `${value.description ?? ''}\nDefault value: "${value.default}"`;
    delete value.default;
  }
  return value;
});

const prettierOptions = await prettier.resolveConfig(CWD);
writeFileSync(
  OUT_PATH,
  await prettier.format(JSON.stringify(schema), { ...prettierOptions, parser: 'json' }),
);
