import {
  ConvertNameFn,
  NormalizedAvoidOptionalsConfig,
  NormalizedScalarsMap,
  OperationVariablesToObject,
  ParsedDirectiveArgumentAndInputFieldMappings,
  ParsedEnumValuesMap,
} from '@graphql-codegen/visitor-plugin-common';
import { Kind, TypeNode } from 'graphql';

export class TypeScriptOperationVariablesToObject extends OperationVariablesToObject {
  constructor(
    _scalars: NormalizedScalarsMap,
    _convertName: ConvertNameFn,
    private _avoidOptionals: NormalizedAvoidOptionalsConfig,
    private _immutableTypes: boolean,
    _namespacedImportName: string | null = null,
    _enumNames: string[] = [],
    _enumPrefix = true,
    _enumSuffix = true,
    _enumValues: ParsedEnumValuesMap = {},
    _applyCoercion: boolean = false,
    _directiveArgumentAndInputFieldMappings: ParsedDirectiveArgumentAndInputFieldMappings = {},
    private _maybeType = 'Maybe'
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
      _directiveArgumentAndInputFieldMappings
    );
  }

  private clearOptional(str: string): string {
    const prefix = this._namespacedImportName ? `${this._namespacedImportName}.` : '';
    const rgx = new RegExp(`^${this.wrapMaybe(`(.*?)`)}$`, 'i');

    if (str.startsWith(`${prefix}${this._maybeType}`)) {
      return str.replace(rgx, '$1');
    }

    return str;
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
        `${this._immutableTypes ? 'ReadonlyArray' : 'Array'}<${innerType}>${listInputCoercionExtension}`
      );
    }
    return this.wrapMaybe(baseType);
  }

  protected formatFieldString(fieldName: string, isNonNullType: boolean, hasDefaultValue: boolean): string {
    return `${fieldName}${this.getAvoidOption(isNonNullType, hasDefaultValue) ? '?' : ''}`;
  }

  protected formatTypeString(fieldType: string, isNonNullType: boolean, hasDefaultValue: boolean): string {
    if (!hasDefaultValue && isNonNullType) {
      return this.clearOptional(fieldType);
    }

    return fieldType;
  }

  protected wrapMaybe(type?: string) {
    const prefix = this._namespacedImportName ? `${this._namespacedImportName}.` : '';
    return `${prefix}${this._maybeType}${type ? `<${type}>` : ''}`;
  }

  protected getAvoidOption(isNonNullType: boolean, hasDefaultValue: boolean) {
    const options = this._avoidOptionals;
    return ((options.object || !options.defaultValue) && hasDefaultValue) || (!options.object && !isNonNullType);
  }

  protected getPunctuation(): string {
    return ';';
  }
}
