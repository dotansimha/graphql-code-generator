import { BaseVisitor } from '@graphql-codegen/visitor-plugin-common';
import { InterfaceTypeDefinitionNode, NamedTypeNode, NameNode, UnionTypeDefinitionNode } from 'graphql';

export interface CompositionTypesData {
  compositionTypeToImplementationsMap: CompositionTypesMap;

  compositionTypeNames: Set<string>;
}

export type CompositionTypesMap = Map<string, string[]>;

export type AllMappingForCompositionType = ConcreteToCompositionName[];

export interface ConcreteToCompositionName {
  compositionName: string;
  concreteType: string;
}

/// This visitor returns a set of definition containing a map between unionTypes
/// and their concrete implementations, plus an array of classes which are interfaces
export class CompositionTypeVisitor extends BaseVisitor {
  constructor() {
    super({}, {});
  }

  public getCompositionTypeDataFromDefinitions(definitions: AllMappingForCompositionType[]): CompositionTypesData {
    const compositionTypes = new Set<string>();

    const compositionTypesMap = definitions.reduce(
      (previousDefinitions: Map<string, string[]>, definitions: ConcreteToCompositionName[]) => {
        definitions.forEach(definition => {
          if (definition.concreteType) {
            const previousCompositionTypeForConcreteImplementation =
              previousDefinitions.get(definition.concreteType) || [];
            previousDefinitions.set(definition.concreteType, [
              ...previousCompositionTypeForConcreteImplementation,
              definition.compositionName,
            ]);
          }
          compositionTypes.add(definition.compositionName);
        });
        return previousDefinitions;
      },
      new Map<string, string[]>()
    );

    return {
      compositionTypeToImplementationsMap: compositionTypesMap,
      compositionTypeNames: compositionTypes,
    };
  }

  protected addRecordForUnionType(
    nameNode: NameNode,
    unionValues: ReadonlyArray<NamedTypeNode>
  ): ConcreteToCompositionName[] {
    const mappings = unionValues.map(value => {
      return {
        concreteType: value.name.value,
        compositionName: nameNode.value,
      };
    });

    return mappings;
  }

  protected UnionTypeDefinition(node: UnionTypeDefinitionNode): AllMappingForCompositionType {
    const mappings = this.addRecordForUnionType(node.name, node.types || []);

    return mappings;
  }

  public InterfaceTypeDefinition(node: InterfaceTypeDefinitionNode): AllMappingForCompositionType {
    return [
      {
        compositionName: node.name.value,
        concreteType: null,
      },
    ];
  }
}
