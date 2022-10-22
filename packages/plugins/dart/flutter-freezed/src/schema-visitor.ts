import {
  EnumTypeDefinitionNode,
  GraphQLSchema,
  InputObjectTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  UnionTypeDefinitionNode,
} from 'graphql';
import { FlutterFreezedPluginConfig } from './config';
import { FreezedFactoryBlockRepository, transformDefinition } from './utils';

export const schemaVisitor = (_schema: GraphQLSchema, config: FlutterFreezedPluginConfig) => {
  const freezedFactoryBlockRepository = new FreezedFactoryBlockRepository();
  return {
    freezedFactoryBlockRepository,

    EnumTypeDefinition: (node: EnumTypeDefinitionNode) =>
      transformDefinition(config, freezedFactoryBlockRepository, node),

    UnionTypeDefinition: (node: UnionTypeDefinitionNode) =>
      transformDefinition(config, freezedFactoryBlockRepository, node),

    ObjectTypeDefinition: (node: ObjectTypeDefinitionNode) =>
      transformDefinition(config, freezedFactoryBlockRepository, node),

    InputObjectTypeDefinition: (node: InputObjectTypeDefinitionNode) =>
      transformDefinition(config, freezedFactoryBlockRepository, node),
  };
};
