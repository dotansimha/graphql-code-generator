import { OperationVariablesToObject, ScalarsMap, ConvertNameFn } from '@graphql-codegen/visitor-plugin-common';
import { TypeNode, Kind } from 'graphql';

export class TypeScriptOperationVariablesToObject extends OperationVariablesToObject {
  constructor(_scalars: ScalarsMap, _convertName: ConvertNameFn, private _avoidOptionals: boolean, private _immutableTypes: boolean, _namespacedImportName: string | null = null) {
    super(_scalars, _convertName, _namespacedImportName);
  }

  private clearOptional(str: string): string {
    if (str.startsWith('Maybe')) {
      return str.replace(/^Maybe<(.*?)>$/i, '$1');
    }

    return str;
  }

  public wrapAstTypeWithModifiers(baseType: string, typeNode: TypeNode): string {
    if (typeNode.kind === Kind.NON_NULL_TYPE) {
      const type = this.wrapAstTypeWithModifiers(baseType, typeNode.type);

      return this.clearOptional(type);
    } else if (typeNode.kind === Kind.LIST_TYPE) {
      const innerType = this.wrapAstTypeWithModifiers(baseType, typeNode.type);

      return `Maybe<${this._immutableTypes ? 'ReadonlyArray' : 'Array'}<${innerType}>>`;
    } else {
      return `Maybe<${baseType}>`;
    }
  }

  protected formatFieldString(fieldName: string, isNonNullType: boolean, hasDefaultValue: boolean): string {
    if (hasDefaultValue || isNonNullType || this._avoidOptionals) {
      return fieldName;
    } else {
      return `${fieldName}?`;
    }
  }

  protected formatTypeString(fieldType: string, isNonNullType: boolean, hasDefaultValue: boolean): string {
    if (hasDefaultValue) {
      return this.clearOptional(fieldType);
    }

    return fieldType;
  }
}
