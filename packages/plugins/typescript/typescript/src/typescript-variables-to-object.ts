import { ParsedEnumValuesMap, OperationVariablesToObject, NormalizedScalarsMap, ConvertNameFn } from '@graphql-codegen/visitor-plugin-common';
import { TypeNode, Kind } from 'graphql';

export class TypeScriptOperationVariablesToObject extends OperationVariablesToObject {
  constructor(
    _scalars: NormalizedScalarsMap,
    _convertName: ConvertNameFn,
    private _avoidOptionals: boolean,
    private _immutableTypes: boolean,
    _namespacedImportName: string | null = null,
    _enumNames: string[] = [],
    _enumPrefix = true,
    _enumValues: ParsedEnumValuesMap = {}
  ) {
    super(_scalars, _convertName, _namespacedImportName, _enumNames, _enumPrefix, _enumValues);
  }

  private clearOptional(str: string): string {
    const prefix = this._namespacedImportName ? `${this._namespacedImportName}.` : '';
    const rgx = new RegExp(`^${prefix}Maybe<(.*?)>$`, 'i');

    if (str.startsWith(`${this._namespacedImportName ? `${this._namespacedImportName}.` : ''}Maybe`)) {
      return str.replace(rgx, '$1');
    }

    return str;
  }

  public wrapAstTypeWithModifiers(baseType: string, typeNode: TypeNode): string {
    const prefix = this._namespacedImportName ? `${this._namespacedImportName}.` : '';

    if (typeNode.kind === Kind.NON_NULL_TYPE) {
      const type = this.wrapAstTypeWithModifiers(baseType, typeNode.type);

      return this.clearOptional(type);
    } else if (typeNode.kind === Kind.LIST_TYPE) {
      const innerType = this.wrapAstTypeWithModifiers(baseType, typeNode.type);

      return `${prefix}Maybe<${this._immutableTypes ? 'ReadonlyArray' : 'Array'}<${innerType}>>`;
    } else {
      return `${prefix}Maybe<${baseType}>`;
    }
  }

  protected formatFieldString(fieldName: string, isNonNullType: boolean, hasDefaultValue: boolean): string {
    if (!hasDefaultValue && (this._avoidOptionals || isNonNullType)) {
      return fieldName;
    }
    return `${fieldName}?`;
  }

  protected formatTypeString(fieldType: string, isNonNullType: boolean, hasDefaultValue: boolean): string {
    if (!hasDefaultValue && isNonNullType) {
      return this.clearOptional(fieldType);
    }

    return fieldType;
  }

  protected getPunctuation(): string {
    return ';';
  }
}
