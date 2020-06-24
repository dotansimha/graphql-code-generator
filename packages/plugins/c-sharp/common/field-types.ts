export interface Field {
  baseType: string;
  isScalar: boolean;
  required: boolean;
  nullableValueType: boolean;
  listType?: string;
}

export class FieldType implements Field {
  baseType: string;
  isScalar: boolean;
  required: boolean;
  nullableValueType: boolean;
  listType?: string;

  constructor(fieldType: Field) {
    Object.assign(this, fieldType);
  }

  get innerTypeName(): string {
    const nullable = this.nullableValueType ? '?' : '';
    return `${this.baseType}${nullable}`;
  }

  get fullTypeName(): string {
    const innerType = this.innerTypeName;
    return this.listType ? `${this.listType}<${innerType}>` : innerType;
  }
}
