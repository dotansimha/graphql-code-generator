import { normalizeConfig } from './utils';
import { pluginLoaderMap } from './plugins';

export async function generate(config, schema, documents) {
  try {
    const [{ safeLoad }, { codegen }, { parse }] = await Promise.all([
      import('js-yaml').then(m => ('default' in m ? m.default : m)),
      import('@graphql-codegen/core').then(m => ('default' in m ? m.default : m)),
      import('graphql').then(m => ('default' in m ? m.default : m)),
    ]);

    const cleanTabs = config.replace(/\t/g, '  ');
    const { generates, ...otherFields } = safeLoad(cleanTabs);
    const rootConfig = otherFields.config || {};
    const filename = Object.keys(generates)[0];
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

    const result = await codegen({
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

    return result;
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
          (subError) => `${subError.message}: 
${subError.details}`
        )
        .join('\n');
    } else {
      return e.message;
    }
  }
}
