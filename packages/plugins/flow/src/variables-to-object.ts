import { Kind, TypeNode, VariableNode, NameNode, ValueNode } from 'graphql';
import { indent, getBaseTypeNode, wrapAstTypeWithModifiers } from './utils';
import { BasicFlowVisitor } from './visitor';

export class OperationVariablesToObject<
  Visitor extends BasicFlowVisitor,
  DefinitionType extends {
    name?: NameNode;
    variable?: VariableNode;
    type: TypeNode;
    defaultValue?: ValueNode;
  }
> {
  constructor(private _visitorInstance: Visitor, private _variablesNode: ReadonlyArray<DefinitionType>) {}

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
        const typeValue = this._visitorInstance.scalars[typeName]
          ? this._visitorInstance.scalars[typeName]
          : this._visitorInstance.convertName(typeName, true);

        const fieldName = this.getName(variable);
        const fieldType = wrapAstTypeWithModifiers(typeValue, variable.type);

        const hasDefaultValue = !!variable.defaultValue;
        const isNonNullType = variable.type.kind === Kind.NON_NULL_TYPE;

        const formattedFieldString = hasDefaultValue || isNonNullType ? fieldName : `${fieldName}?`;
        const formattedTypeString = hasDefaultValue && !isNonNullType ? fieldType.substring(1) : fieldType;

        return indent(`${formattedFieldString}: ${formattedTypeString}`);
      })
      .join(',\n');

    return '';
  }
}
