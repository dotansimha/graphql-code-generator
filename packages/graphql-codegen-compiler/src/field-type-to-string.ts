import { Argument, Field } from 'graphql-codegen-core';

export function getFieldTypeAsString(field: Field | Argument): string {
  if (field.isEnum) {
    return 'enum';
  } else if (field.isType) {
    return 'type';
  } else if (field.isInputType) {
    return 'input-type';
  } else if (field.isScalar) {
    return 'scalar';
  } else if (field.isInterface) {
    return 'interface';
  } else if (field.isUnion) {
    return 'union';
  } else {
    return '';
  }
}
