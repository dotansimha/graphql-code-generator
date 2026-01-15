import {
  OperationVariablesToObject,
  ConvertNameFn,
  NormalizedAvoidOptionalsConfig,
  NormalizedScalarsMap,
  ParsedEnumValuesMap,
} from '@graphql-codegen/visitor-plugin-common';
import { Kind, TypeNode } from 'graphql';

export const SCALARS = {
  ID: 'string | number',
  String: 'string',
  Int: 'number',
  Float: 'number',
  Boolean: 'boolean',
};

export class TypeScriptOperationVariablesToObject extends OperationVariablesToObject {
  private _config: {
    avoidOptionals: NormalizedAvoidOptionalsConfig;
    immutableTypes: boolean;
    inputMaybeValue: string;
    inputMaybeValueSuffix: string;
  };
  constructor(
    rawConfig: {
      avoidOptionals: NormalizedAvoidOptionalsConfig;
      immutableTypes: boolean;
      inputMaybeValue: string;
    },
    _scalars: NormalizedScalarsMap,
    _convertName: ConvertNameFn,
    _namespacedImportName: string | null,
    _enumNames: string[],
    _enumPrefix: boolean,
    _enumSuffix: boolean,
    _enumValues: ParsedEnumValuesMap,
    _applyCoercion: boolean
  ) {
    super(
      _scalars,
      _convertName,
      _namespacedImportName,
      _enumNames,
      _enumPrefix,
      _enumSuffix,
      _enumValues,
      _applyCoercion,
      {}
    );

    this._config = {
      avoidOptionals: rawConfig.avoidOptionals,
      immutableTypes: rawConfig.immutableTypes,
      inputMaybeValue: rawConfig.inputMaybeValue,
      inputMaybeValueSuffix: this._config.inputMaybeValue.replace('T', ''), // e.g. turns `T | null | undefined` to `| null | undefined`
    };
  }

  protected formatFieldString(fieldName: string, isNonNullType: boolean, hasDefaultValue: boolean): string {
    return `${fieldName}${this.getAvoidOption(isNonNullType, hasDefaultValue) ? '?' : ''}`;
  }

  protected formatTypeString(fieldType: string, _isNonNullType: boolean, _hasDefaultValue: boolean): string {
    return fieldType;
  }

  protected clearOptional(str: string): string {
    const maybeSuffix = this._config.inputMaybeValueSuffix;

    if (str.endsWith(maybeSuffix)) {
      return (str = str.substring(0, str.length - maybeSuffix.length));
    }

    return str;
  }

  protected getAvoidOption(isNonNullType: boolean, hasDefaultValue: boolean): boolean {
    const options = this._config.avoidOptionals;
    return ((options.object || !options.defaultValue) && hasDefaultValue) || (!options.object && !isNonNullType);
  }

  protected getScalar(name: string): string {
    return this._scalars[name]?.input ?? SCALARS[name] ?? 'unknown';
  }

  protected getPunctuation(): string {
    return ';';
  }

  public wrapAstTypeWithModifiers(baseType: string, typeNode: TypeNode, applyCoercion = false): string {
    if (typeNode.kind === Kind.NON_NULL_TYPE) {
      const type = this.wrapAstTypeWithModifiers(baseType, typeNode.type, applyCoercion);

      return this.clearOptional(type);
    }
    if (typeNode.kind === Kind.LIST_TYPE) {
      const innerType = this.wrapAstTypeWithModifiers(baseType, typeNode.type, applyCoercion);
      const listInputCoercionExtension = applyCoercion ? ` | ${innerType}` : '';

      return this.wrapMaybe(
        `${this._config.immutableTypes ? 'ReadonlyArray' : 'Array'}<${innerType}>${listInputCoercionExtension}`
      );
    }
    return this.wrapMaybe(baseType);
  }

  protected wrapMaybe(type: string): string {
    const maybeSuffix = this._config.inputMaybeValueSuffix;

    return type.endsWith(maybeSuffix) ? type : `${type}${maybeSuffix}`;
  }
}
