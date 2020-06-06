import {
  ParsedEnumValuesMap,
  OperationVariablesToObject,
  NormalizedScalarsMap,
  ConvertNameFn,
} from '@graphql-codegen/visitor-plugin-common';
import { TypeNode, Kind } from 'graphql';

export class PythonOperationVariablesToObject extends OperationVariablesToObject {
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
    // const prefix = this._namespacedImportName ? `${this._namespacedImportName}.` : "";
    const rgx = new RegExp(`^Optional\\[(.*?)\\]$`, 'i');

    if (str.startsWith(`${this._namespacedImportName ? `${this._namespacedImportName}.` : ''}Optional`)) {
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

      return `${prefix}Optional[List[${innerType}]]`;
    } else {
      return `${prefix}Optional[${baseType}]`;
    }
  }

  protected formatFieldString(fieldName: string, isNonNullType: boolean, hasDefaultValue: boolean): string {
    return fieldName;
  }

  protected formatTypeString(fieldType: string, isNonNullType: boolean, hasDefaultValue: boolean): string {
    if (!hasDefaultValue && isNonNullType) {
      return this.clearOptional(fieldType);
    }

    return fieldType;
  }

  protected getPunctuation(): string {
    return '';
  }
}
