import { codegen } from '@graphql-codegen/core';
import { parse } from 'graphql';
import { load } from 'js-yaml';
import { canUseDOM } from '@/utils';
import { pluginLoaderMap, presetLoaderMap } from './plugins';
import { normalizeConfig } from './utils';

if (canUseDOM) {
  process.hrtime = () => [0, 0]; // Fix error - TypeError: process.hrtime is not a function
  window.global = window; // type-graphql error - global is not defined
}

export async function generate(config: string, schema: string, documents?: string) {
  try {
    const outputs = [];
    const cleanTabs = config.replace(/\t/g, '  ');
    const { generates, ...otherFields } = load(cleanTabs);
    const runConfigurations = [];

    for (const [filename, outputOptions] of Object.entries(generates)) {
      const hasPreset = !!outputOptions.preset;
      const plugins = normalizeConfig(outputOptions.plugins || outputOptions);
      const outputConfig = outputOptions.config;
      const pluginMap = {};

      await Promise.all(
        plugins.map(async pluginElement => {
          const [pluginName] = Object.keys(pluginElement);
          try {
            pluginMap[pluginName] = await pluginLoaderMap[pluginName]();
          } catch (e) {
            console.error(e);
          }
        })
      );

      const props = {
        plugins,
        pluginMap,
        schema: parse(schema),
        documents: documents
          ? [
              {
                location: 'operation.graphql',
                document: parse(documents),
              },
            ]
          : [],
        config: {
          ...otherFields.config,
          ...outputConfig,
        },
      };

      if (!hasPreset) {
        runConfigurations.push({
          filename,
          ...props,
        });
      } else {
        const presetExport = await presetLoaderMap[outputOptions.preset]();
        const presetFn = typeof presetExport === 'function' ? presetExport : presetExport.preset;

        runConfigurations.push(
          ...(await presetFn.buildGeneratesSection({
            baseOutputDir: filename,
            presetConfig: outputOptions.presetConfig || {},
            ...props,
          }))
        );
      }
    }

    for (const execConfig of runConfigurations) {
      outputs.push({
        filename: execConfig.filename,
        content: await codegen(execConfig),
      });
    }

    return outputs;
  } catch (error: GraphQLError) {
    console.error(error);

    if (error.details) {
      return `
      ${error.message}:

      ${error.details}
      `;
    }

    if (error.errors) {
      return error.errors
        .map(
          subError => `${subError.message}:
${subError.details}`
        )
        .join('\n');
    }

    return error.message;
  }
}
