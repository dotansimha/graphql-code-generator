import { BaseVisitor } from '@graphql-codegen/visitor-plugin-common';
import { InterfaceTypeDefinitionNode, NamedTypeNode, NameNode, UnionTypeDefinitionNode } from 'graphql';

export interface UnionTypesAndInterfacesData {
  unionTypeToImplementationsMap: UnionTypeMap;

  unionTypesAndInterfaces: Set<string>;
}

export type UnionTypeMap = Map<string, string[]>;

export type AllMapingForUnionType = ConcreteTypeToUnionName[];

export interface ConcreteTypeToUnionName {
  unionName: string;
  concreteType: string;
}

/// This visitor returns a set of definition containing a map between unionTypes
/// And their concrete implementations, plus an array of classes which are interfaces
export class UnionTypeVisitor extends BaseVisitor {
  constructor() {
    super({}, {});
  }

  public getUnionTypeDataFromDefinitions(definitions: AllMapingForUnionType[]): UnionTypesAndInterfacesData {
    const unionTypes = new Set<string>();

    const unionTypeMap = definitions.reduce(
      (previousDefinitions: Map<string, string[]>, definitions: ConcreteTypeToUnionName[]) => {
        definitions.forEach(definition => {
          if (definition.concreteType) {
            const previousUnionTypeForConcreteImplementation = previousDefinitions.get(definition.concreteType) || [];
            previousDefinitions.set(definition.concreteType, [
              ...previousUnionTypeForConcreteImplementation,
              definition.unionName,
            ]);
          }
          unionTypes.add(definition.unionName);
        });
        return previousDefinitions;
      },
      new Map<string, string[]>()
    );

    return {
      unionTypeToImplementationsMap: unionTypeMap,
      unionTypesAndInterfaces: unionTypes,
    };
  }

  protected addRecordForUnionType(
    nameNode: NameNode,
    unionValues: ReadonlyArray<NamedTypeNode>
  ): ConcreteTypeToUnionName[] {
    const mappings = unionValues.map(value => {
      return {
        concreteType: value.name.value,
        unionName: nameNode.value,
      };
    });

    return mappings;
  }

  protected UnionTypeDefinition(node: UnionTypeDefinitionNode): AllMapingForUnionType {
    const mappings = this.addRecordForUnionType(node.name, node.types || []);

    return mappings;
  }

  public InterfaceTypeDefinition(node: InterfaceTypeDefinitionNode): AllMapingForUnionType {
    return [
      {
        unionName: node.name.value,
        concreteType: null,
      },
    ];
  }
}
