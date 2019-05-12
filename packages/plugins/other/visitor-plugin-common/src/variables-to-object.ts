import { Kind, TypeNode, VariableNode, NameNode, ValueNode } from 'graphql';
import { indent, getBaseTypeNode } from './utils';
import { ScalarsMap, ConvertNameFn } from './types';
import { BaseVisitorConvertOptions } from './base-visitor';
import * as autoBind from 'auto-bind';

export interface InterfaceOrVariable {
  name?: NameNode;
  variable?: VariableNode;
  type: TypeNode;
  defaultValue?: ValueNode;
}

export class OperationVariablesToObject {
  constructor(protected _scalars: ScalarsMap, protected _convertName: ConvertNameFn<BaseVisitorConvertOptions>, protected _namespacedImportName: string | null = null) {
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

  protected getScalar(name: string): string {
    const prefix = this._namespacedImportName ? `${this._namespacedImportName}.` : '';

    return `${prefix}Scalars['${name}']`;
  }

  protected transformVariable<TDefinitionType extends InterfaceOrVariable>(variable: TDefinitionType): string {
    let typeValue = null;

    if (typeof variable.type === 'string') {
      typeValue = variable.type;
    } else {
      const baseType = getBaseTypeNode(variable.type);
      const typeName = baseType.name.value;
      typeValue = this._scalars[typeName]
        ? this.getScalar(typeName)
        : this._convertName(baseType, {
            useTypesPrefix: true,
          });
    }

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
    if (hasDefaultValue) {
      return `Maybe<${fieldType}>`;
    }

    return fieldType;
  }
}
