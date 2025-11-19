import {
  ASTNode,
  DocumentNode,
  FieldNode,
  FragmentDefinitionNode,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLSchema,
  InlineFragmentNode,
  InputValueDefinitionNode,
  isListType,
  isNonNullType,
  isObjectType,
  Kind,
  OperationDefinitionNode,
  SelectionSetNode,
  VariableDefinitionNode,
  visit,
} from 'graphql';
import { Types } from './types.js';
import { getBaseType } from './utils.js';

export function isOutputConfigArray(type: any): type is Types.OutputConfig[] {
  return Array.isArray(type);
}

export function isConfiguredOutput(type: any): type is Types.ConfiguredOutput {
  return typeof type === 'object';
}

export function normalizeOutputParam(
  config: Types.OutputConfig | Types.ConfiguredPlugin[] | Types.ConfiguredOutput
): Types.ConfiguredOutput {
  // In case of direct array with a list of plugins
  if (isOutputConfigArray(config)) {
    return {
      documents: [],
      schema: [],
      plugins: isConfiguredOutput(config) ? config.plugins : config,
    };
  }
  if (isConfiguredOutput(config)) {
    return config;
  }
  throw new Error(`Invalid "generates" config!`);
}

export function normalizeInstanceOrArray<T>(type: T | T[]): T[] {
  if (Array.isArray(type)) {
    return type;
  }
  if (!type) {
    return [];
  }

  return [type];
}

export function normalizeConfig(config: Types.OutputConfig | Types.OutputConfig[]): Types.ConfiguredPlugin[] {
  if (typeof config === 'string') {
    return [{ [config]: {} }];
  }
  if (Array.isArray(config)) {
    return config.map(plugin => (typeof plugin === 'string' ? { [plugin]: {} } : plugin));
  }
  if (typeof config === 'object') {
    return Object.keys(config).reduce((prev, pluginName) => [...prev, { [pluginName]: config[pluginName] }], []);
  }
  return [];
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
  const typesStack: GraphQLObjectType[] = [];

  visit(document, {
    SelectionSet: {
      enter(
        node: SelectionSetNode,
        key,
        parent: InlineFragmentNode | FragmentDefinitionNode | FieldNode | OperationDefinitionNode,
        anscestors
      ) {
        const insideIgnoredFragment = (anscestors as any).find(
          (f: ASTNode) => f.kind && f.kind === 'FragmentDefinition' && externalFragments.includes(f.name.value)
        );

        if (insideIgnoredFragment) {
          return;
        }

        const selections = node.selections || [];

        if (schema && selections.length > 0) {
          const nextTypeName = (() => {
            if (parent.kind === Kind.FRAGMENT_DEFINITION) {
              return parent.typeCondition.name.value;
            }
            if (parent.kind === Kind.FIELD) {
              const lastType = typesStack[typesStack.length - 1];

              if (!lastType) {
                throw new Error(`Unable to find parent type! Please make sure you operation passes validation`);
              }
              const field = lastType.getFields()[parent.name.value];

              if (!field) {
                throw new Error(`Unable to find field "${parent.name.value}" on type "${lastType}"!`);
              }

              return getBaseType(field.type).name;
            }
            if (parent.kind === Kind.OPERATION_DEFINITION) {
              if (parent.operation === 'query') {
                return schema.getQueryType().name;
              }
              if (parent.operation === 'mutation') {
                return schema.getMutationType().name;
              }
              if (parent.operation === 'subscription') {
                return schema.getSubscriptionType().name;
              }
            } else if (parent.kind === Kind.INLINE_FRAGMENT) {
              if (parent.typeCondition) {
                return parent.typeCondition.name.value;
              }
              return typesStack[typesStack.length - 1].name;
            }

            return null;
          })();

          typesStack.push(schema.getType(nextTypeName) as any);
        }
      },
      leave(node: SelectionSetNode) {
        const selections = node.selections || [];

        if (schema && selections.length > 0) {
          typesStack.pop();
        }
      },
    },
    Field: {
      enter: (node: FieldNode, key, parent, path, anscestors) => {
        if (node.name.value.startsWith('__')) {
          return;
        }

        const insideIgnoredFragment = (anscestors as any).find(
          (f: ASTNode) => f.kind && f.kind === 'FragmentDefinition' && externalFragments.includes(f.name.value)
        );

        if (insideIgnoredFragment) {
          return;
        }

        const selections = node.selectionSet ? node.selectionSet.selections || [] : [];
        const relevantFragmentSpreads = selections.filter(
          s => s.kind === Kind.FRAGMENT_SPREAD && !externalFragments.includes(s.name.value)
        );

        if (selections.length === 0 || relevantFragmentSpreads.length > 0) {
          foundFields++;
        }

        if (schema) {
          const lastType = typesStack[typesStack.length - 1];

          if (lastType && isObjectType(lastType)) {
            const field = lastType.getFields()[node.name.value];

            if (!field) {
              throw new Error(`Unable to find field "${node.name.value}" on type "${lastType}"!`);
            }

            const currentType = field.type;

            // To handle `Maybe` usage
            if (hasNullableTypeRecursively(currentType)) {
              foundFields++;
            }
          }
        }
      },
    },
    VariableDefinition: {
      enter: (node: VariableDefinitionNode, key, parent, path, anscestors) => {
        const insideIgnoredFragment = (anscestors as any).find(
          (f: ASTNode) => f.kind && f.kind === 'FragmentDefinition' && externalFragments.includes(f.name.value)
        );

        if (insideIgnoredFragment) {
          return;
        }
        foundFields++;
      },
    },
    InputValueDefinition: {
      enter: (node: InputValueDefinitionNode, key, parent, path, anscestors) => {
        const insideIgnoredFragment = (anscestors as any).find(
          (f: ASTNode) => f.kind && f.kind === 'FragmentDefinition' && externalFragments.includes(f.name.value)
        );

        if (insideIgnoredFragment) {
          return;
        }
        foundFields++;
      },
    },
  });

  return foundFields > 0;
}

export function normalizeImportExtension({
  emitLegacyCommonJSImports,
  importExtension,
}: {
  emitLegacyCommonJSImports: boolean | undefined;
  importExtension: '' | `.${string}` | undefined;
}): '' | `.${string}` {
  if (importExtension !== undefined) {
    return importExtension;
  }

  if (emitLegacyCommonJSImports === undefined || emitLegacyCommonJSImports === true) {
    return '';
  }

  return '.js';
}
