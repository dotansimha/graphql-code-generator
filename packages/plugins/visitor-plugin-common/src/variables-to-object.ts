import { Kind, TypeNode, VariableNode, NameNode, ValueNode } from 'graphql';
import { wrapAstTypeWithModifiers } from './utils';
import { indent, getBaseTypeNode } from './utils';
import { ScalarsMap, ConvertNameFn } from './types';

export class OperationVariablesToObject<
  DefinitionType extends {
    name?: NameNode;
    variable?: VariableNode;
    type: TypeNode;
    defaultValue?: ValueNode;
  }
> {
  constructor(
    private _scalars: ScalarsMap,
    private _convertName: ConvertNameFn,
    private _variablesNode: ReadonlyArray<DefinitionType>,
    private _wrapAstTypeWithModifiers: Function
  ) {}

  getName(node: DefinitionType): string {
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

  get string(): string {
    if (!this._variablesNode || this._variablesNode.length === 0) {
      return null;
    }

    return this._variablesNode
      .map(variable => {
        const baseType = typeof variable.type === 'string' ? variable.type : getBaseTypeNode(variable.type);
        const typeName = typeof baseType === 'string' ? baseType : baseType.name.value;
        const typeValue = this._scalars[typeName] ? this._scalars[typeName] : this._convertName(typeName, true);

        const fieldName = this.getName(variable);
        const fieldType = this._wrapAstTypeWithModifiers(typeValue, variable.type);

        const hasDefaultValue = variable.defaultValue != null && typeof variable.defaultValue !== 'undefined';
        const isNonNullType = variable.type.kind === Kind.NON_NULL_TYPE;

        const formattedFieldString = hasDefaultValue || isNonNullType ? fieldName : `${fieldName}?`;
        const formattedTypeString = hasDefaultValue && !isNonNullType ? fieldType.substring(1) : fieldType;

        return indent(`${formattedFieldString}: ${formattedTypeString}`);
      })
      .join(',\n');
  }
}
