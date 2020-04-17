import React from 'react';
import { normalizeConfig } from './utils';
import { pluginLoaderMap, presetLoaderMap } from './plugins';

export async function generate(config, schema, documents) {
  try {
    const outputs = [];
    const [{ safeLoad }, { codegen }, { parse }] = await Promise.all([
      import('js-yaml').then(m => ('default' in m ? m.default : m)),
      import('@graphql-codegen/core').then(m => ('default' in m ? m.default : m)),
      import('graphql').then(m => ('default' in m ? m.default : m)),
    ]);

    const cleanTabs = config.replace(/\t/g, '  ');
    const { generates, ...otherFields } = safeLoad(cleanTabs);
    const rootConfig = otherFields.config || {};
    const filename = Object.keys(generates)[0];
    const hasPreset = !!generates[filename].preset;
    const plugins = normalizeConfig(generates[filename].plugins || generates[filename]);
    const outputConfig = generates[filename].config;
    const pluginMap = {};

    await Promise.all(
      plugins.map(async pluginElement => {
        const pluginName = Object.keys(pluginElement)[0];
        pluginMap[pluginName] = await pluginLoaderMap[pluginName]();
      })
    );

    const mergedConfig = {
      ...rootConfig,
      ...outputConfig,
    };

    const runConfigurations = [];

    if (!hasPreset) {
      runConfigurations.push({
        filename,
        plugins,
        schema: parse(schema),
        documents: documents
          ? [
              {
                location: 'document.graphql',
                document: parse(documents),
              },
            ]
          : [],
        config: mergedConfig,
        pluginMap,
      });
    } else {
      const presetExport = await presetLoaderMap[generates[filename].preset]();
      const presetFn = typeof presetExport === 'function' ? presetExport : presetExport.preset;

      runConfigurations.push(
        ...(await presetFn.buildGeneratesSection({
          baseOutputDir: filename,
          presetConfig: generates[filename].presetConfig || {},
          plugins,
          schema: parse(schema),
          documents: documents
            ? [
                {
                  location: 'document.graphql',
                  document: parse(documents),
                },
              ]
            : [],
          config: mergedConfig,
          pluginMap,
        }))
      );
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
