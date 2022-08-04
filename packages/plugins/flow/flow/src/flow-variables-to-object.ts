import { OperationVariablesToObject } from '@graphql-codegen/visitor-plugin-common';
import { TypeNode, Kind } from 'graphql';

export class FlowOperationVariablesToObject extends OperationVariablesToObject {
  private clearOptional(str: string): string {
    if (str.startsWith('?')) {
      return str.replace(/^\?(.*?)$/i, '$1');
    }

    return str;
  }

  protected getScalar(name: string): string {
    const prefix = this._namespacedImportName ? `${this._namespacedImportName}.` : '';

    return `$ElementType<${prefix}Scalars, '${name}'>`;
  }

  public wrapAstTypeWithModifiers(baseType: string, typeNode: TypeNode, applyCoercion = false): string {
    if (typeNode.kind === Kind.NON_NULL_TYPE) {
      const type = this.wrapAstTypeWithModifiers(baseType, typeNode.type, applyCoercion);

      return this.clearOptional(type);
    }
    if (typeNode.kind === Kind.LIST_TYPE) {
      const innerType = this.wrapAstTypeWithModifiers(baseType, typeNode.type, applyCoercion);
      const listInputCoercionExtension = applyCoercion ? ` | ${innerType}` : '';

      return `?Array<${innerType}>${listInputCoercionExtension}`;
    }
    return `?${baseType}`;
  }

  protected formatFieldString(fieldName: string, isNonNullType: boolean, hasDefaultValue: boolean): string {
    if (hasDefaultValue || isNonNullType) {
      return fieldName;
    }
    return `${fieldName}?`;
  }

  protected formatTypeString(fieldType: string, isNonNullType: boolean, hasDefaultValue: boolean): string {
    if (hasDefaultValue && !isNonNullType) {
      return this.clearOptional(fieldType);
    }

    return fieldType;
  }
}
