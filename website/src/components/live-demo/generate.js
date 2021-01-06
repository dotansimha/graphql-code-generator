import React from 'react';
import { normalizeConfig } from './utils';
import { pluginLoaderMap, presetLoaderMap } from './plugins';

export async function generate(config, schema, documents) {
  try {
    const outputs = [];
    const [{ load }, { codegen }, { parse }] = await Promise.all([
      import('js-yaml').then(m => ('default' in m ? m.default : m)),
      import('@graphql-codegen/core').then(m => ('default' in m ? m.default : m)),
      import('graphql').then(m => ('default' in m ? m.default : m)),
    ]);

    const cleanTabs = config.replace(/\t/g, '  ');
    const { generates, ...otherFields } = load(cleanTabs);
    const rootConfig = otherFields.config || {};
    const runConfigurations = [];

    for (const [filename, outputOptions] of Object.entries(generates)) {
      const hasPreset = !!outputOptions.preset;
      const plugins = normalizeConfig(outputOptions.plugins || outputOptions);
      const outputConfig = outputOptions.config;
      const pluginMap = {};
  
      await Promise.all(
        plugins.map(async pluginElement => {
          const pluginName = Object.keys(pluginElement)[0];
          try {
            pluginMap[pluginName] = await pluginLoaderMap[pluginName]();
          } catch (e) {
            console.error(`Unable to find codegen plugin named "${pluginName}"...`)
          }
        })
      );
  
      const mergedConfig = {
        ...rootConfig,
        ...outputConfig,
      };
    
      if (!hasPreset) {
        runConfigurations.push({
          filename,
          plugins,
          schema: parse(schema),
          documents: documents
            ? [
                {
                  location: 'operation.graphql',
                  document: parse(documents),
                },
              ]
            : [],
          config: mergedConfig,
          pluginMap,
        });
      } else {
        const presetExport = await presetLoaderMap[outputOptions.preset]();
        const presetFn = typeof presetExport === 'function' ? presetExport : presetExport.preset;
  
        runConfigurations.push(
          ...(await presetFn.buildGeneratesSection({
            baseOutputDir: filename,
            presetConfig: outputOptions.presetConfig || {},
            plugins,
            schema: parse(schema),
            documents: documents
              ? [
                  {
                    location: 'operation.graphql',
                    document: parse(documents),
                  },
                ]
              : [],
            config: mergedConfig,
            pluginMap,
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
  } catch (e) {
    // tslint:disable-next-line: no-console
    console.error(e);
    if (e.details) {
      return `
      ${e.message}:
      
      ${e.details}
      `;
    } else if (e.errors) {
      return e.errors
        .map(
          subError => `${subError.message}: 
${subError.details}`
        )
        .join('\n');
    } else {
      return e.message;
    }
  }
}
