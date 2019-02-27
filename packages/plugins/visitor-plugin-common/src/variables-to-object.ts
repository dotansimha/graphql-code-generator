import { Kind, TypeNode, VariableNode, NameNode, ValueNode } from 'graphql';
import { indent, getBaseTypeNode } from './utils';
import { ScalarsMap, ConvertNameFn } from './types';
import * as autoBind from 'auto-bind';

export interface InterfaceOrVariable {
  name?: NameNode;
  variable?: VariableNode;
  type: TypeNode;
  defaultValue?: ValueNode;
}

export class OperationVariablesToObject {
  constructor(protected _scalars: ScalarsMap, protected _convertName: ConvertNameFn) {
    autoBind(this);
  }

  getName<TDefinitionType extends InterfaceOrVariable>(node: TDefinitionType): string {
    if (node.name) {
      if (typeof node.name === 'string') {
        return node.name;
      }

      return node.name.value;
    } else if (node.variable) {
      return node.variable.name.value;
    }

    return null;
  }

  transform<TDefinitionType extends InterfaceOrVariable>(variablesNode: ReadonlyArray<TDefinitionType>): string {
    if (!variablesNode || variablesNode.length === 0) {
      return null;
    }

    return variablesNode.map(variable => indent(this.transformVariable(variable))).join(',\n');
  }

  protected transformVariable<TDefinitionType extends InterfaceOrVariable>(variable: TDefinitionType): string {
    const baseType = typeof variable.type === 'string' ? variable.type : getBaseTypeNode(variable.type);
    const typeName = typeof baseType === 'string' ? baseType : baseType.name.value;
    const typeValue = this._scalars[typeName] ? this._scalars[typeName] : this._convertName(typeName, true);

    const fieldName = this.getName(variable);
    const fieldType = this.wrapAstTypeWithModifiers(typeValue, variable.type);

    const hasDefaultValue = variable.defaultValue != null && typeof variable.defaultValue !== 'undefined';
    const isNonNullType = variable.type.kind === Kind.NON_NULL_TYPE;

    const formattedFieldString = this.formatFieldString(fieldName, isNonNullType, hasDefaultValue);
    const formattedTypeString = this.formatTypeString(fieldType, isNonNullType, hasDefaultValue);

    return `${formattedFieldString}: ${formattedTypeString}`;
  }

  public wrapAstTypeWithModifiers(baseType: string, typeNode: TypeNode): string {
    throw new Error(`You must override "wrapAstTypeWithModifiers" of OperationVariablesToObject!`);
  }

  protected formatFieldString(fieldName: string, isNonNullType: boolean, hasDefaultValue: boolean): string {
    return fieldName;
  }

  protected formatTypeString(fieldType: string, isNonNullType: boolean, hasDefaultValue: boolean): string {
    return fieldType;
  }
}
