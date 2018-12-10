import { Kind, TypeNode, VariableNode, NameNode } from 'graphql';
import { indent, getBaseTypeNode, wrapAstTypeWithModifiers } from './utils';
import { BasicFlowVisitor } from './visitor';

export class OperationVariablesToObject<
  Visitor extends BasicFlowVisitor,
  DefinitionType extends { name?: NameNode; variable?: VariableNode; type: TypeNode }
> {
  constructor(private _visitorInstance: Visitor, private _variablesNode: ReadonlyArray<DefinitionType>) {}

  getName(node: DefinitionType): string {
    if (node.name) {
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
        const baseType = getBaseTypeNode(variable.type);
        const typeName = baseType.name.value;
        const typeValue = this._visitorInstance.scalars[typeName]
          ? this._visitorInstance.scalars[typeName]
          : baseType.name.value;

        return indent(
          `${this.getName(variable)}${variable.type.kind === Kind.NON_NULL_TYPE ? '' : '?'}: ${wrapAstTypeWithModifiers(
            typeValue,
            variable.type
          )}`
        );
      })
      .join(',\n');

    return '';
  }
}
