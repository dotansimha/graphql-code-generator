import { Types } from './types';
import {
  FragmentDefinitionNode,
  visit,
  DocumentNode,
  isListType,
  isInterfaceType,
  VariableDefinitionNode,
  isObjectType,
  FieldNode,
  Kind,
  InputValueDefinitionNode,
  GraphQLSchema,
  OperationDefinitionNode,
  GraphQLNamedType,
  isNonNullType,
  GraphQLOutputType,
  ASTNode,
  isUnionType,
} from 'graphql';
import { getBaseType } from './utils';
import { InlineFragmentNode } from 'graphql';

export function isOutputConfigArray(type: any): type is Types.OutputConfig[] {
  return Array.isArray(type);
}

export function isConfiguredOutput(type: any): type is Types.ConfiguredOutput {
  return typeof type === 'object' && type['plugins'];
}

export function normalizeOutputParam(config: Types.OutputConfig | Types.ConfiguredOutput): Types.ConfiguredOutput {
  // In case of direct array with a list of plugins
  if (isOutputConfigArray(config)) {
    return {
      documents: [],
      schema: [],
      plugins: config,
    };
  } else if (isConfiguredOutput(config)) {
    return config;
  } else {
    throw new Error(`Invalid "generates" config!`);
  }
}

export function normalizeInstanceOrArray<T>(type: T | T[]): T[] {
  if (Array.isArray(type)) {
    return type;
  } else if (!type) {
    return [];
  }

  return [type];
}

export function normalizeConfig(config: Types.OutputConfig): Types.ConfiguredPlugin[] {
  if (typeof config === 'string') {
    return [{ [config]: {} }];
  } else if (Array.isArray(config)) {
    return config.map(plugin => (typeof plugin === 'string' ? { [plugin]: {} } : plugin));
  } else if (typeof config === 'object') {
    return Object.keys(config).reduce((prev, pluginName) => [...prev, { [pluginName]: config[pluginName] }], []);
  } else {
    return [];
  }
}

export function hasNullableTypeRecursively(type: GraphQLOutputType): boolean {
  if (!isNonNullType(type)) {
    return true;
  }

  if (isListType(type) || isNonNullType(type)) {
    return hasNullableTypeRecursively(type.ofType);
  }

  return false;
}

export function isUsingTypes(document: DocumentNode, externalFragments: string[], schema?: GraphQLSchema): boolean {
  let foundFields = 0;
  let typesStack: GraphQLNamedType[] = [];

  visit(document, {
    InlineFragment: {
      enter: (node: InlineFragmentNode) => {
        if (node.typeCondition && schema) {
          typesStack.push(schema.getType(node.typeCondition.name.value));
        }
      },
      leave: (node: InlineFragmentNode) => {
        if (node.typeCondition && schema) {
          typesStack.pop();
        }
      },
    },
    Field: {
      enter: (node: FieldNode, key, parent, path, anscestors) => {
        const insideIgnoredFragment = (anscestors as any).find((f: ASTNode) => f.kind && f.kind === 'FragmentDefinition' && externalFragments.includes(f.name.value));

        if (insideIgnoredFragment) {
          return;
        }

        if (schema) {
          const lastType = typesStack[typesStack.length - 1];

          if (lastType) {
            if (isObjectType(lastType)) {
              const field = lastType.getFields()[node.name.value];

              if (!field) {
                throw new Error(`Unable to find field "${node.name.value}" on type "${lastType}"!`);
              }
              const currentType = field.type;

              // To handle `Maybe` usage
              if (hasNullableTypeRecursively(currentType)) {
                foundFields++;
              }

              typesStack.push(getBaseType(currentType));
            } else if (isInterfaceType(lastType) || isUnionType(lastType)) {
            }
          }
        }

        const selections = node.selectionSet ? node.selectionSet.selections || [] : [];
        const relevantFragmentSpreads = selections.filter(s => s.kind === Kind.FRAGMENT_SPREAD && !externalFragments.includes(s.name.value));

        if (selections.length === 0 || relevantFragmentSpreads.length > 0) {
          foundFields++;
        }
      },
      leave: (node: FieldNode, key, parent, path, anscestors) => {
        const insideIgnoredFragment = (anscestors as any).find((f: ASTNode) => f.kind && f.kind === 'FragmentDefinition' && externalFragments.includes(f.name.value));

        if (insideIgnoredFragment) {
          return;
        }

        if (schema) {
          const currentType = typesStack[typesStack.length - 1];
          if (currentType && isObjectType(currentType)) {
            typesStack.pop();
          }
        }
      },
    },
    FragmentDefinition: {
      enter: (node: FragmentDefinitionNode) => {
        if (schema) {
          typesStack.push(schema.getType(node.typeCondition.name.value));
        }
      },
      leave: () => {
        if (schema) {
          typesStack.pop();
        }
      },
    },
    OperationDefinition: {
      enter: (node: OperationDefinitionNode) => {
        if (schema) {
          if (node.operation === 'query') {
            typesStack.push(schema.getQueryType());
          } else if (node.operation === 'mutation') {
            typesStack.push(schema.getMutationType());
          } else if (node.operation === 'subscription') {
            typesStack.push(schema.getSubscriptionType());
          }
        }
      },
      leave: () => {
        if (schema) {
          typesStack.pop();
        }
      },
    },
    enter: {
      VariableDefinition: (node: VariableDefinitionNode, key, parent, path, anscestors) => {
        const insideIgnoredFragment = (anscestors as any).find((f: ASTNode) => f.kind && f.kind === 'FragmentDefinition' && externalFragments.includes(f.name.value));

        if (insideIgnoredFragment) {
          return;
        }
        foundFields++;
      },
      InputValueDefinition: (node: InputValueDefinitionNode, key, parent, path, anscestors) => {
        const insideIgnoredFragment = (anscestors as any).find((f: ASTNode) => f.kind && f.kind === 'FragmentDefinition' && externalFragments.includes(f.name.value));

        if (insideIgnoredFragment) {
          return;
        }
        foundFields++;
      },
    },
  });

  return foundFields > 0;
}
