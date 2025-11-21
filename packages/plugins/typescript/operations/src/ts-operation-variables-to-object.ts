import { TypeScriptOperationVariablesToObject as TSOperationVariablesToObject } from '@graphql-codegen/typescript';

const SCALARS = {
  ID: 'string | number',
  String: 'string',
  Int: 'number',
  Float: 'number',
  Boolean: 'boolean',
};

const MAYBE_SUFFIX = ' | null';

export class TypeScriptOperationVariablesToObject extends TSOperationVariablesToObject {
  protected formatTypeString(fieldType: string, _isNonNullType: boolean, _hasDefaultValue: boolean): string {
    return fieldType;
  }

  protected clearOptional(str: string): string {
    if (str?.endsWith(MAYBE_SUFFIX)) {
      return (str = str.substring(0, str.length - MAYBE_SUFFIX.length));
    }

    return str;
  }

  protected wrapMaybe(type: string): string {
    return type?.endsWith(MAYBE_SUFFIX) ? type : `${type}${MAYBE_SUFFIX}`;
  }

  protected getScalar(name: string): string {
    return this._scalars?.[name]?.input ?? SCALARS[name] ?? 'any';
  }
}
