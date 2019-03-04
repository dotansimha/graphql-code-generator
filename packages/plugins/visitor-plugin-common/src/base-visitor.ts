import { ScalarsMap } from './types';
import { toPascalCase, DeclarationBlockConfig } from './utils';
import { resolveExternalModuleAndFn } from 'graphql-codegen-plugin-helpers';
import * as autoBind from 'auto-bind';
import { DEFAULT_SCALARS } from './scalars';

export interface ParsedConfig {
  scalars: ScalarsMap;
  convert: (str: string) => string;
  typesPrefix: string;
}

export interface RawConfig {
  scalars?: ScalarsMap;
  namingConvention?: string;
  typesPrefix?: string;
}

export class BaseVisitor<TRawConfig extends RawConfig = RawConfig, TPluginConfig extends ParsedConfig = ParsedConfig> {
  protected _parsedConfig: TPluginConfig;
  protected _declarationBlockConfig: DeclarationBlockConfig = {};

  constructor(rawConfig: TRawConfig, additionalConfig: TPluginConfig, defaultScalars: ScalarsMap = DEFAULT_SCALARS) {
    this._parsedConfig = {
      scalars: { ...(defaultScalars || DEFAULT_SCALARS), ...(rawConfig.scalars || {}) },
      convert: rawConfig.namingConvention ? resolveExternalModuleAndFn(rawConfig.namingConvention) : toPascalCase,
      typesPrefix: rawConfig.typesPrefix || '',
      ...((additionalConfig || {}) as any)
    };

    autoBind(this);
  }

  get config(): TPluginConfig {
    return this._parsedConfig;
  }

  get scalars(): ScalarsMap {
    return this.config.scalars;
  }

  convertName(name: any, addPrefix = true): string {
    return (addPrefix ? this.config.typesPrefix : '') + this.config.convert(name);
  }
}
