import { TypeScriptOperationVariablesToObject as TSOperationVariablesToObject } from '@graphql-codegen/typescript';

export class TypeScriptOperationVariablesToObject extends TSOperationVariablesToObject {
  protected formatTypeString(fieldType: string, isNonNullType: boolean, _hasDefaultValue: boolean): string {
    return fieldType;
  }
}
