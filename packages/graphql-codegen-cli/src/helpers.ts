import { Types } from 'graphql-codegen-core';

export function isOutputConfigArray(type: any): type is Types.OutputConfig[] {
  return Array.isArray(type);
}

export function isConfiguredOutput(type: any): type is Types.ConfiguredOutput {
  return typeof type === 'object' && type['plugins'];
}

export function normalizeOutputParam(config: Types.OutputConfig | Types.ConfiguredOutput): Types.ConfiguredOutput {
  if (isOutputConfigArray(config)) {
    return {
      documents: [],
      schema: [],
      plugins: config
    };
  } else if (isConfiguredOutput(config)) {
    return config;
  } else {
    throw new Error(`Invalid "generates" config!`);
  }
}

export function normalizeInstanceOrArray<T>(type: T | T[]): T[] {
  if (Array.isArray(type)) {
    return type;
  } else if (!type) {
    return [];
  }

  return [type];
}

export function normalizeConfig(config: Types.OutputConfig): Types.ConfiguredPlugin[] {
  if (typeof config === 'string') {
    return [{ [config]: {} }];
  } else if (Array.isArray(config)) {
    return config.map(plugin => (typeof plugin === 'string' ? { [plugin]: {} } : plugin));
  } else {
    return [];
  }
}
