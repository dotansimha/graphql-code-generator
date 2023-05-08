import { codegen } from '@graphql-codegen/core';
import { GraphQLError, parse } from 'graphql';
import { load } from 'js-yaml';
import { pluginLoaderMap, presetLoaderMap } from './plugins';
import { normalizeConfig } from './utils';
import { Config } from './formatter';

if (typeof window !== 'undefined') {
  // @ts-ignore
  process.hrtime = () => [0, 0]; // Fix error - TypeError: process.hrtime is not a function
  window.global = window; // type-graphql error - global is not defined
}

export async function generate(config: string, schema: string, documents?: string) {
  try {
    const outputs = [];
    const cleanTabs = config.replace(/\t/g, '  ');
    const { generates, ...otherFields } = load(cleanTabs) as Record<string, Config>;
    const runConfigurations = [];

    for (const [filename, outputOptions] of Object.entries(generates)) {
      const plugins = normalizeConfig(outputOptions.plugins || (outputOptions.preset ? [] : outputOptions));
      const outputConfig = outputOptions.config;
      const pluginMap: Record<string, any> = {};

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

      if (!outputOptions.preset) {
        await Promise.all(
          plugins?.map(async pluginElement => {
            const [pluginName] = Object.keys(pluginElement);
            try {
              pluginMap[pluginName] = await pluginLoaderMap[pluginName as keyof typeof pluginLoaderMap]();
            } catch (e) {
              console.error(e);
            }
          })
        );

        runConfigurations.push({
          filename,
          ...props,
        });
      } else {
        const presetExport = await presetLoaderMap[outputOptions.preset as unknown as keyof typeof presetLoaderMap]();
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
  } catch (error: any) {
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
          (subError: any) => `${subError.message}:
${subError.details}`
        )
        .join('\n');
    }

    return error.message;
  }
}
