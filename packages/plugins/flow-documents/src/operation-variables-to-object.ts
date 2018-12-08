import { GraphQLSchema, VariableDefinitionNode, Kind, TypeNode } from 'graphql';
import { ScalarsMap, indent } from 'graphql-codegen-flow';
import { getBaseTypeNode } from './utils';

export class OperationVariablesToObject {
  constructor(
    private _scalarsMap: ScalarsMap,
    private _schema: GraphQLSchema,
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
        const typeValue = this._scalarsMap[typeName] ? this._scalarsMap[typeName] : baseType.name.value;

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
