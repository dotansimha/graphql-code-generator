import {
  ASTNode,
  DocumentNode,
  FieldNode,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLSchema,
  InputValueDefinitionNode,
  isListType,
  isNonNullType,
  isObjectType,
  Kind,
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
  config: Types.OutputConfig | Types.ConfiguredPlugin[] | Types.ConfiguredOutput,
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

export function normalizeInstanceOrArray<T>(type: T | T[] | null | undefined): T[] {
  if (Array.isArray(type)) {
    return type;
  }
  if (!type) {
    return [];
  }

  return [type];
}

export function normalizeConfig(
  config: Types.OutputConfig | Types.OutputConfig[] | null | undefined,
): Types.ConfiguredPlugin[] {
  if (typeof config === 'string') {
    return [{ [config]: {} }];
  }
  if (Array.isArray(config)) {
    return config.map(plugin => (typeof plugin === 'string' ? { [plugin]: {} } : plugin));
  }
  if (config && typeof config === 'object') {
    return Object.keys(config).reduce<Types.ConfiguredPlugin[]>(
      (prev, pluginName) => [...prev, { [pluginName]: config[pluginName] }],
      [],
    );
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

export function isUsingTypes(
  document: DocumentNode,
  externalFragments: string[],
  schema?: GraphQLSchema,
): boolean {
  let foundFields = 0;
  const typesStack: GraphQLObjectType[] = [];

  visit(document, {
    SelectionSet: {
      enter(node, key, parent, anscestors) {
        const insideIgnoredFragment = (anscestors as any).find(
          (f: ASTNode) =>
            f.kind && f.kind === 'FragmentDefinition' && externalFragments.includes(f.name.value),
        );

        if (insideIgnoredFragment) {
          return node;
        }

        const selections = node.selections || [];

        if (
          schema &&
          selections.length > 0 &&
          parent &&
          !Array.isArray(parent) &&
          'kind' in parent
        ) {
          const nextTypeName = (() => {
            if (parent.kind === Kind.FRAGMENT_DEFINITION) {
              return parent.typeCondition.name.value;
            }
            if (parent.kind === Kind.FIELD) {
              const lastType = typesStack[typesStack.length - 1];

              if (!lastType) {
                throw new Error(
                  `Unable to find parent type! Please make sure you operation passes validation`,
                );
              }
              const field = lastType.getFields()[parent.name.value];

              if (!field) {
                throw new Error(
                  `Unable to find field "${parent.name.value}" on type "${lastType}"!`,
                );
              }

              return getBaseType(field.type).name;
            }
            if (parent.kind === Kind.OPERATION_DEFINITION) {
              if (parent.operation === 'query') {
                const queryType = schema.getQueryType();
                if (!queryType) {
                  throw new Error(`Unable to find Query type in schema for "query" operation!`);
                }
                return queryType.name;
              }
              if (parent.operation === 'mutation') {
                const mutationType = schema.getMutationType();
                if (!mutationType) {
                  throw new Error(
                    `Unable to find Mutation type in schema for "mutation" operation!`,
                  );
                }
                return mutationType.name;
              }
              if (parent.operation === 'subscription') {
                const subscriptionType = schema.getSubscriptionType();
                if (!subscriptionType) {
                  throw new Error(
                    `Unable to find Subscription type in schema for "subscription" operation!`,
                  );
                }
                return subscriptionType.name;
              }
            } else if (parent.kind === Kind.INLINE_FRAGMENT) {
              if (parent.typeCondition) {
                return parent.typeCondition.name.value;
              }
              return typesStack[typesStack.length - 1].name;
            }

            return null;
          })();

          // `as any` is needed because `typesStack` is typed `GraphQLObjectType[]`, but `schema.getType()`
          // returns `GraphQLNamedType | undefined`. Removing it is a small follow-up:
          // type `typesStack` as `Array<GraphQLNamedType | undefined>`, then
          // 1. in the `Kind.FIELD` branch, guard `lastType` with `isObjectType`/`isInterfaceType` before `getFields()`
          // 2. in the `Kind.INLINE_FRAGMENT` branch, return `typesStack[typesStack.length - 1]?.name || null`
          typesStack.push((nextTypeName ? schema.getType(nextTypeName) : undefined) as any);

          return node;
        }

        return undefined;
      },
      leave(node: SelectionSetNode) {
        const selections = node.selections || [];

        if (schema && selections.length > 0) {
          typesStack.pop();
        }

        return node;
      },
    },
    Field: {
      enter: (node: FieldNode, key, parent, path, anscestors) => {
        if (node.name.value.startsWith('__')) {
          return node;
        }

        const insideIgnoredFragment = (anscestors as any).find(
          (f: ASTNode) =>
            f.kind && f.kind === 'FragmentDefinition' && externalFragments.includes(f.name.value),
        );

        if (insideIgnoredFragment) {
          return node;
        }

        const selections = node.selectionSet ? node.selectionSet.selections || [] : [];
        const relevantFragmentSpreads = selections.filter(
          s => s.kind === Kind.FRAGMENT_SPREAD && !externalFragments.includes(s.name.value),
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

        return undefined;
      },
    },
    VariableDefinition: {
      enter: (node: VariableDefinitionNode, key, parent, path, anscestors) => {
        const insideIgnoredFragment = (anscestors as any).find(
          (f: ASTNode) =>
            f.kind && f.kind === 'FragmentDefinition' && externalFragments.includes(f.name.value),
        );

        if (insideIgnoredFragment) {
          return node;
        }
        foundFields++;

        return undefined;
      },
    },
    InputValueDefinition: {
      enter: (node: InputValueDefinitionNode, key, parent, path, anscestors) => {
        const insideIgnoredFragment = (anscestors as any).find(
          (f: ASTNode) =>
            f.kind && f.kind === 'FragmentDefinition' && externalFragments.includes(f.name.value),
        );

        if (insideIgnoredFragment) {
          return node;
        }
        foundFields++;

        return node;
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
