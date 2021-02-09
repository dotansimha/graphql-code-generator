/* eslint-disable no-console */
import * as TJS from 'typescript-json-schema';
import { writeFile } from 'fs-extra';
import { generateDocs } from './docs';
import { sync as mkdirp } from 'mkdirp';
import { pluginsConfigurations, presetsConfigurations } from './plugins';
import { join } from 'path';
import { apply } from 'jsonpath';

const tsConfig = require('../../../../tsconfig.json');

const ROOT_FILE = '../plugins-helpers/src/types.ts';
const ROOT_IDENTIFIER = 'Types.Config';
const baseDir = process.argv[2] || process.cwd();
const docsOutDir = process.argv[3] ? join(baseDir, process.argv[3]) : './docs/generated-config/';
const schemaOutDir = process.argv[4] ? join(baseDir, process.argv[4]) : baseDir;
const MARKDOWN_JSDOC_KEY = 'exampleMarkdown';
const DEFAULT_JSDOC_KEY = 'default';

async function generate() {
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

  const schema = generator.getSchemaForSymbols(
    [ROOT_IDENTIFIER, ...pluginsConfigurations.map(f => f.identifier), ...presetsConfigurations.map(f => f.identifier)],
    true
  );

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
        oneOf: pluginsConfigurations.reduce((prev, p) => {
          const description = `${
            (schema.definitions[p.identifier] as TJS.Definition).description || ''
          }\n\nFor more details and documentation: https://graphql-code-generator.com/docs/plugins/${
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

  const outputRecord = schema.definitions['Types.ConfiguredOutput'] as TJS.Definition;

  outputRecord.properties.config = {
    additionalProperties: true,
  };

  outputRecord.allOf = pluginsConfigurations.map(p => {
    return {
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
    };
  });

  // Point the root schema to the config root
  schema.$ref = `#/definitions/${ROOT_IDENTIFIER}`;

  const docsMarkdown = generateDocs(schema, [...pluginsConfigurations, ...presetsConfigurations]);

  mkdirp(docsOutDir);
  await Promise.all(
    Object.keys(docsMarkdown).map(identifier =>
      writeFile(join(docsOutDir, `./${identifier}.md`), docsMarkdown[identifier])
    )
  );

  // Remove non-standard keys
  apply(schema, `$..${MARKDOWN_JSDOC_KEY}`, () => undefined);

  // Remvoe default to avoid annoying auto-complete
  apply(schema, `$..*`, v => {
    if (v && typeof v === 'object' && typeof v[DEFAULT_JSDOC_KEY] !== 'undefined') {
      if (!v.description) {
        v.description = '';
      }

      v.description += `\nDefault value: "${String(v.default)}"`;
      delete v.default;
    }

    return v;
  });
  mkdirp(schemaOutDir);
  await writeFile(join(schemaOutDir, './config.schema.json'), JSON.stringify(schema, null, 2));
}

generate()
  .then(() => {
    console.log('Done!');
  })
  .catch(e => {
    console.error(e);
  });
