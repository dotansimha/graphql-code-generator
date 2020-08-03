export interface BaseTypeField {
  type: string;
  valueType: boolean;
  required: boolean;
}

export interface ListTypeField {
  required: boolean;
  type: ListTypeField;
}

export interface CSharpField {
  baseType: BaseTypeField;
  listType?: ListTypeField;
}

export class CSharpFieldType implements CSharpField {
  baseType: BaseTypeField;
  listType?: ListTypeField;

  constructor(fieldType: CSharpField) {
    Object.assign(this, fieldType);
  }

  get innerTypeName(): string {
    const nullable = this.baseType.valueType && !this.baseType.required ? '?' : '';
    return `${this.baseType.type}${nullable}`;
  }

  get isOuterTypeRequired(): boolean {
    return this.listType ? this.listType.required : this.baseType.required;
  }
}
