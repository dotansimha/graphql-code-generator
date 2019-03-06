import { ScalarsMap, NamingConvention, ConvertFn, ConvertOptions } from './types';
import { DeclarationBlockConfig } from './utils';
import autoBind from 'auto-bind';
import { DEFAULT_SCALARS } from './scalars';
import { convertFactory } from './naming';
import { ASTNode } from 'graphql';

export interface BaseVisitorConvertOptions {
  useTypesPrefix?: boolean;
}

export interface ParsedConfig {
  scalars: ScalarsMap;
  convert: ConvertFn;
  typesPrefix: string;
}

export interface RawConfig {
  scalars?: ScalarsMap;
  namingConvention?: NamingConvention;
  typesPrefix?: string;
}

export class BaseVisitor<TRawConfig extends RawConfig = RawConfig, TPluginConfig extends ParsedConfig = ParsedConfig> {
  protected _parsedConfig: TPluginConfig;
  protected _declarationBlockConfig: DeclarationBlockConfig = {};

  constructor(rawConfig: TRawConfig, additionalConfig: TPluginConfig, defaultScalars: ScalarsMap = DEFAULT_SCALARS) {
    this._parsedConfig = {
      scalars: { ...(defaultScalars || DEFAULT_SCALARS), ...(rawConfig.scalars || {}) },
      convert: convertFactory(rawConfig),
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

  convertName(node: ASTNode | string, options?: BaseVisitorConvertOptions & ConvertOptions): string {
    const useTypesPrefix = typeof (options && options.useTypesPrefix) === 'boolean' ? options.useTypesPrefix : true;
    return (useTypesPrefix ? this.config.typesPrefix : '') + this.config.convert(node, options);
  }
}
