import {
  GraphQLSchema,
  InputObjectTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  UnionTypeDefinitionNode,
} from 'graphql';
import { FreezedPluginConfig } from './config';
import { FreezedFactoryBlockRepository, FreezedDeclarationBlock } from './freezed-declaration-block';

export const schemaVisitor = (schema: GraphQLSchema, config: FreezedPluginConfig) => {
  const freezedFactoryBlockRepository = new FreezedFactoryBlockRepository();
  return {
    freezedFactoryBlockRepository,

    UnionTypeDefinition: (node: UnionTypeDefinitionNode) =>
      isIgnoreType(config, node.name.value)
        ? ''
        : new FreezedDeclarationBlock(config, freezedFactoryBlockRepository, node),

    ObjectTypeDefinition: (node: ObjectTypeDefinitionNode) =>
      isIgnoreType(config, node.name.value)
        ? ''
        : new FreezedDeclarationBlock(config, freezedFactoryBlockRepository, node),

    InputObjectTypeDefinition: (node: InputObjectTypeDefinitionNode) =>
      isIgnoreType(config, node.name.value)
        ? ''
        : new FreezedDeclarationBlock(config, freezedFactoryBlockRepository, node),
  };
};

function isIgnoreType(config: FreezedPluginConfig, nodeName: string) {
  // don't generate freezed classes for these types
  return ['Query', 'Mutation', 'Subscription', ...(config.ignoreTypes ?? [])].includes(nodeName);
}
