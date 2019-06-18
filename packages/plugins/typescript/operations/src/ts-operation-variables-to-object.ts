import { TypeScriptOperationVariablesToObject as TSOperationVariablesToObject } from '@graphql-codegen/typescript';

export class TypeScriptOperationVariablesToObject extends TSOperationVariablesToObject {
  protected formatFieldString(fieldName: string, isNonNullType: boolean, hasDefaultValue: boolean): string {
    if (hasDefaultValue) {
      return `${fieldName}?`;
    }

    return super.formatFieldString(fieldName, isNonNullType, hasDefaultValue);
  }
  protected formatTypeString(fieldType: string, isNonNullType: boolean, hasDefaultValue: boolean): string {
    return fieldType;
  }
}
