import { safeLoad } from 'js-yaml';
import { normalizeConfig } from './utils';
import { pluginLoaderMap } from './plugins';

export async function generate(config: string, schema: string, documents?: string): Promise<string> {
  try {
    const cleanTabs = config.replace(/\t/g, '  ');
    const { generates, ...rootConfig } = safeLoad(cleanTabs);
    const filename = Object.keys(generates)[0];
    const plugins = normalizeConfig(generates[filename].plugins || generates[filename]);
    const { codegen } = await import('@graphql-codegen/core');
    const { parse } = await import('graphql');
    const pluginMap: any = {};

    for (const pluginElement of plugins) {
      const pluginName = Object.keys(pluginElement)[0];
      pluginMap[pluginName] = await pluginLoaderMap[pluginName]();
    }

    return await codegen({
      filename,
      plugins,
      schema: parse(schema),
      documents: documents
        ? [
            {
              filePath: '',
              content: parse(documents),
            },
          ]
        : [],
      config: {
        ...rootConfig,
      },
      pluginMap,
    });
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
          (subError: any) => `${subError.message}: 
${subError.details}`
        )
        .join('\n');
    } else {
      return e.message;
    }
  }
}
