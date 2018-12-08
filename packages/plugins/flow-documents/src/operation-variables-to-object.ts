import { VariableDefinitionNode, Kind, TypeNode } from 'graphql';
import { indent } from 'graphql-codegen-flow';
import { getBaseTypeNode } from './utils';
import { FlowDocumentsVisitor } from './visitor';

export class OperationVariablesToObject {
  constructor(
    private _visitorInstance: FlowDocumentsVisitor,
    private _variablesNode: ReadonlyArray<VariableDefinitionNode>
  ) {}

  private wrapType(baseType: string, typeNode: TypeNode): string {
    if (typeNode.kind === Kind.NON_NULL_TYPE) {
      return this.wrapType(baseType, typeNode.type).substr(1);
    } else if (typeNode.kind === Kind.LIST_TYPE) {
      const innerType = this.wrapType(baseType, typeNode.type);

      return `?Array<${innerType}>`;
    } else {
      return `?${baseType}`;
    }
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
          `${variable.variable.name.value}${variable.type.kind === Kind.NON_NULL_TYPE ? '' : '?'}: ${this.wrapType(
            typeValue,
            variable.type
          )}`
        );
      })
      .join(',\n');

    return '';
  }
}
